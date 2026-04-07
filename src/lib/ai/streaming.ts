import type { BaseMessage } from '@langchain/core/messages';
import { createModelBundle, createFastModelBundle } from './provider';
import { buildChainPrompt } from './prompts/system-prompt';
import { buildTemplatePrompt } from './prompts/template-prompt';
import { buildSectionPrompt } from './prompts/section-prompt';
import { validateOutput } from './output';
import { validateTemplateResponse, validateSingleComponent } from './prompts/template-schema';
import { sanitizeAIResponse } from './output-sanitizer';
import { convertAIResponseNodes, orderPuckComponents } from './puck-adapter';
import { generateId } from '@/lib/id';
import type { AIGenerationResponse } from '@/types/ai';
import { AIAction } from '@/types/enums';
import type { ComponentData } from '@puckeditor/core';
import type { ComponentTierPlan } from './prompts/prompt-optimizer';
import type { DesignGuidance } from './knowledge/design-knowledge';
import { COMPONENT_CATALOG } from './prompts/component-catalog';

interface StreamOptions {
  styleguideData?: { colors?: string; typography?: string; spacing?: string; cssVariables?: string };
  miniContext?: string;
  history?: BaseMessage[];
  treeSummary?: string;
  /** Serialized project AI profile (<800 chars) for prompt personalization */
  projectProfile?: string;
  /** 'template' = compact prompt, AI picks templates + fills content. 'full' = current full AI pipeline. */
  mode?: 'full' | 'template';
  /** Business type for template assembler (stock image selection) */
  businessType?: string;
  /** AbortSignal to cancel streaming when client disconnects */
  signal?: AbortSignal;
  /** Maximum time to wait for AI response in ms (default: 90_000) */
  timeoutMs?: number;
  /** Pre-computed component tiers for dynamic catalog (reduces prompt size) */
  componentTiers?: ComponentTierPlan;
  /** Resolved design guidance object for dynamic layout resolution */
  designGuidance?: DesignGuidance;
  /** Formatted design context text (RAG knowledge + guidance) for prompt injection */
  designContext?: string;
}

export interface SSEEvent {
  type: 'chunk' | 'done' | 'error' | 'status' | 'component_stream';
  content?: string;
  result?: AIGenerationResponse;
  message?: string;
  step?: string;
  label?: string;
  /** Individual component for progressive rendering (component_stream events) */
  component?: ComponentData;
  /** Running count of streamed components (component_stream events) */
  componentIndex?: number;
  /** Total expected components (component_stream events) */
  componentTotal?: number;
}

/**
 * Emit individual components as component_stream events for progressive rendering.
 * Clients can apply components to the canvas one-by-one before the final done event.
 */
function emitComponentStream(
  send: (event: SSEEvent) => void,
  components: ComponentData[],
): void {
  const total = components.length;
  send({ type: 'status', step: 'rendering', label: `Streaming ${total} components...` });
  for (let i = 0; i < total; i++) {
    send({
      type: 'component_stream',
      component: components[i],
      componentIndex: i,
      componentTotal: total,
    });
  }
}

/**
 * Create a streaming ReadableStream that emits SSE events.
 *
 * Flow:
 * 1. Stream raw text chunks from the model (for "thinking" UX)
 * 2. Accumulate full text
 * 3. Parse + validate with Puck component schema
 * 4. Emit final `done` event with structured result
 */
export function createAIStream(input: string, options: StreamOptions = {}): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (event: SSEEvent) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      const close = () => {
        if (closed) return;
        closed = true;
        try { controller.close(); } catch { /* already closed */ }
      };

      const isTemplateMode = options.mode === 'template';

      try {
        // Status: generating
        send({ type: 'status', step: 'generating', label: isTemplateMode ? 'Selecting templates...' : 'Generating with AI...' });

        const { model, jsonCallOptions } = isTemplateMode
          ? createFastModelBundle({ maxTokens: 16384 })
          : createModelBundle({ maxTokens: 16384 });

        // Always apply timeout; combine with external signal if provided
        // Template mode: 120s (fast model), Full mode: 180s (heavy model)
        const timeoutMs = options.timeoutMs ?? (isTemplateMode ? 120_000 : 180_000);
        const timeoutSignal = AbortSignal.timeout(timeoutMs);
        const combinedSignal = options.signal
          ? AbortSignal.any([options.signal, timeoutSignal])
          : timeoutSignal;

        // Use compact template prompt or full system prompt based on mode
        const prompt = isTemplateMode
          ? buildTemplatePrompt({
              businessType: options.businessType,
              styleguideData: options.styleguideData,
              designContext: options.designContext,
            })
          : buildChainPrompt({
              styleguideData: options.styleguideData,
              miniContext: options.miniContext,
              treeSummary: options.treeSummary,
              projectProfile: options.projectProfile,
              componentTiers: options.componentTiers,
              designGuidance: options.designGuidance,
            });

        // Build messages manually for streaming (no withStructuredOutput)
        const messages = await prompt.formatMessages({
          input,
          history: options.history ?? [],
        });

        let accumulated = '';
        const MAX_ACCUMULATED = 100_000;
        // Strip response_format for streaming — we parse JSON ourselves via extractJSON.
        // Some providers (z.ai, Ollama) don't support response_format in streaming mode
        // and may return empty content when it's set.
        const { response_format: _rf, ...streamCallOpts } = jsonCallOptions;
        const streamOpts = { ...streamCallOpts, signal: combinedSignal };
        const stream = await model.stream(messages, streamOpts);

        for await (const chunk of stream) {
          // Handle both string and array content (Gemini returns array of content parts)
          let text = '';
          if (typeof chunk.content === 'string') {
            text = chunk.content;
          } else if (Array.isArray(chunk.content)) {
            text = chunk.content
              .filter((c: unknown): c is { type: string; text: string } => typeof c === 'object' && c !== null && 'type' in (c as Record<string, unknown>) && (c as { type: string }).type === 'text')
              .map((c) => c.text)
              .join('');
          }
          if (text) {
            accumulated += text;
            // Don't send raw chunks — model outputs JSON which looks ugly in UI.
            // Status events ("Generating...", "Parsing...") provide better feedback.
          }
          if (accumulated.length > MAX_ACCUMULATED) {
            send({ type: 'error', message: 'Output exceeded maximum length — try a shorter prompt or fewer sections' });
            return; // finally will close
          }
        }

        // Parse accumulated text
        send({ type: 'status', step: 'parsing', label: isTemplateMode ? 'Assembling page...' : 'Parsing response...' });
        let parsed = extractJSON(accumulated);

        // Fallback: if model returned plain text instead of JSON, emit clarify directly
        if (!parsed && accumulated.trim()) {
          const cleanText = cleanAIOutput(accumulated);
          if (cleanText) {
            console.warn('[streaming] Non-JSON response, falling back to clarify:', cleanText.substring(0, 200));
            send({
              type: 'done',
              result: {
                action: AIAction.CLARIFY,
                message: cleanText.substring(0, 500),
                components: [],
              },
            });
            return; // finally will close
          }
        }

        if (!parsed) {
          send({ type: 'error', message: 'AI response could not be parsed as valid JSON' });
          return; // finally will close
        }

        if (isTemplateMode) {
          // Template mode: validate Puck ComponentData response
          send({ type: 'status', step: 'validating', label: 'Validating components...' });
          const { data: plan, error: planError } = validateTemplateResponse(parsed);
          if (planError || !plan) {
            send({ type: 'error', message: planError ?? 'Component validation failed' });
            return; // finally will close
          }

          // Build ComponentData with auto-generated IDs, then order by section priority
          const components: ComponentData[] = plan.components.map((c) => ({
            type: c.type,
            props: {
              id: generateId(),
              ...c.props,
            },
          }));
          const ordered = orderPuckComponents(components);

          // Progressive: emit each component individually before done
          const result: AIGenerationResponse = {
            action: AIAction.FULL_PAGE,
            components: ordered,
            message: `Generated page with ${ordered.length} components`,
          };
          emitComponentStream(send, ordered);
          send({ type: 'done', result });
        } else {
          // Full mode: sanitize + validate Puck component response
          const sanitized = sanitizeAIResponse(parsed as Record<string, unknown>);

          // Check if legacy "nodes" format — convert via adapter
          if (sanitized._legacyNodes) {
            const legacyNodes = sanitized.nodes as unknown[];
            const components = convertAIResponseNodes(legacyNodes);
            delete sanitized._legacyNodes;
            delete sanitized.nodes;
            sanitized.components = components;
          }

          send({ type: 'status', step: 'validating', label: 'Validating output...' });
          const { data, error } = validateOutput(sanitized);
          if (error || !data) {
            send({ type: 'error', message: error ?? 'AI response failed validation' });
            return; // finally will close
          }

          // Progressive: emit each component individually before done
          if (data.components?.length) {
            emitComponentStream(send, data.components);
          }
          send({ type: 'done', result: data });
        }
      } catch (err) {
        send({
          type: 'error',
          message: err instanceof Error ? err.message : 'Unknown streaming error',
        });
      } finally {
        close();
      }
    },
  });
}

/**
 * Strip thinking tags, code fences, and whitespace from AI text output.
 * Used when model returns plain text instead of JSON.
 */
export function cleanAIOutput(text: string): string {
  return text
    .replace(/<think[\s\S]*?<\/think>/gi, '')
    .replace(/<thinking[\s\S]*?<\/thinking>/gi, '')
    .replace(/```[\s\S]*?```/g, '')
    .trim();
}

/**
 * Extract JSON from AI text output.
 * Tries: direct parse → code fence → brace matching → truncated repair.
 */
export function extractJSON(text: string): unknown {
  // Strip thinking tags (qwen: <think/>, GLM: ...)
  let cleaned = text
    .replace(/<think[\s\S]*?<\/think>/gi, '')
    .replace(/<thinking[\s\S]*?<\/thinking>/gi, '')
    .trim();

  try { return JSON.parse(cleaned); } catch { /* continue */ }

  // Strip markdown code fences
  const codeBlock = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlock) {
    try { return JSON.parse(codeBlock[1].trim()); } catch { /* continue */ }
  }

  // Brace matching — find outermost JSON object
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first !== -1 && last > first) {
    let slice = cleaned.slice(first, last + 1);
    try { return JSON.parse(slice); } catch { /* continue */ }
    // Fix trailing commas (common AI mistake)
    slice = slice.replace(/,\s*([}\]])/g, '$1');
    try { return JSON.parse(slice); } catch { /* continue */ }
  }

  // Truncated JSON repair — output cut mid-stream by maxTokens
  if (first !== -1) {
    let truncated = cleaned.slice(first);
    truncated = truncated.replace(/"[^"\\]*$/, '');
    truncated = truncated.replace(/,\s*$/, '');
    let open = 0;
    for (const ch of truncated) {
      if (ch === '{' || ch === '[') open++;
      else if (ch === '}' || ch === ']') open = Math.max(0, open - 1);
    }
    truncated += '}'.repeat(open);
    truncated = truncated.replace(/,\s*([}\]])/g, '$1');
    try { return JSON.parse(truncated); } catch { /* continue */ }
    console.error('[streaming/extractJSON] Truncated repair failed. Length:', truncated.length);
  }

  console.error('[streaming/extractJSON] Failed to parse. Total length:', cleaned.length, 'First 300 chars:', cleaned.substring(0, 300));
  return null;
}

// ---------------------------------------------------------------------------
// Two-Pass Streaming — Pass 1: component plan, Pass 2: per-section props
// ---------------------------------------------------------------------------

interface TwoPassStreamOptions {
  styleguideData?: { colors?: string; typography?: string; spacing?: string; cssVariables?: string };
  /** Business type for template assembler */
  businessType?: string;
  /** Design context / RAG knowledge text */
  designContext?: string;
  /** Resolved design guidance for per-section prompts */
  designGuidance?: DesignGuidance;
  /** AbortSignal to cancel streaming */
  signal?: AbortSignal;
  /** Max time per pass in ms (default: 90_000) */
  timeoutMs?: number;
}

/**
 * Create a two-pass streaming ReadableStream.
 *
 * Pass 1 (fast model): Get a component plan — which types in what order.
 * Pass 2 (fast model, parallel): For each component type in the plan, generate
 *   richer props using a focused section prompt with design tokens.
 *
 * Emits component_stream events as each section completes in pass 2,
 * giving the UI progressive rendering.
 */
export function createTwoPassStream(input: string, options: TwoPassStreamOptions = {}): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (event: SSEEvent) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      const close = () => {
        if (closed) return;
        closed = true;
        try { controller.close(); } catch { /* already closed */ }
      };

      try {
        // ── PASS 1: Component plan via template prompt ──
        send({ type: 'status', step: 'planning', label: 'Planning page layout...' });

        const planTimeout = options.timeoutMs ?? 90_000;
        const planSignal = options.signal
          ? AbortSignal.any([options.signal, AbortSignal.timeout(planTimeout)])
          : AbortSignal.timeout(planTimeout);

        const { model: planModel, jsonCallOptions: planOpts } = createFastModelBundle({ maxTokens: 4096 });
        const planPrompt = buildTemplatePrompt({
          businessType: options.businessType,
          styleguideData: options.styleguideData,
          designContext: options.designContext,
        });

        const planMessages = await planPrompt.formatMessages({ input });
        // Use invoke (not stream) for pass 1 — it is a small structured response
        const { response_format: _rf, ...invokeOpts } = planOpts;
        const planResponse = await planModel.invoke(planMessages, { ...invokeOpts, signal: planSignal });

        const planText = typeof planResponse.content === 'string'
          ? planResponse.content
          : Array.isArray(planResponse.content)
            ? planResponse.content
                .filter((c: unknown): c is { type: string; text: string } =>
                  typeof c === 'object' && c !== null && 'type' in (c as Record<string, unknown>) && (c as { type: string }).type === 'text')
                .map((c) => c.text)
                .join('')
            : '';

        const planParsed = extractJSON(planText);
        if (!planParsed) {
          send({ type: 'error', message: 'Pass 1 failed: could not parse component plan' });
          return;
        }

        const { data: plan, error: planError } = validateTemplateResponse(planParsed);
        if (planError || !plan) {
          send({ type: 'error', message: planError ?? 'Component plan validation failed' });
          return;
        }

        send({ type: 'status', step: 'generating', label: `Generating ${plan.components.length} sections...` });

        // ── PASS 2: Parallel per-section generation ──
        const sectionResults = await Promise.allSettled(
          plan.components.map(async (comp, index) => {
            const catalogEntry = COMPONENT_CATALOG[comp.type];
            if (!catalogEntry) {
              // Unknown type — use pass 1 props as-is
              return { type: comp.type, props: comp.props };
            }

            const sectionPrompt = buildSectionPrompt(comp.type, catalogEntry, {
              userPrompt: input,
              businessType: options.businessType ?? 'general',
              designGuidance: options.designGuidance,
              styleguideData: options.styleguideData,
              position: { index, total: plan.components.length },
            });

            const { model: sectionModel, jsonCallOptions: sectionOpts } = createFastModelBundle({ maxTokens: 4096 });
            const sectionMessages = await sectionPrompt.formatMessages({ input });
            const { response_format: _rf2, ...sectionInvokeOpts } = sectionOpts;
            const sectionResponse = await sectionModel.invoke(sectionMessages, {
              ...sectionInvokeOpts,
              signal: AbortSignal.timeout(60_000),
            });

            const sectionText = typeof sectionResponse.content === 'string'
              ? sectionResponse.content
              : Array.isArray(sectionResponse.content)
                ? sectionResponse.content
                    .filter((c: unknown): c is { type: string; text: string } =>
                      typeof c === 'object' && c !== null && 'type' in (c as Record<string, unknown>) && (c as { type: string }).type === 'text')
                    .map((c) => c.text)
                    .join('')
                : '';

            const sectionParsed = extractJSON(sectionText);
            if (sectionParsed) {
              const { data: validated } = validateSingleComponent(sectionParsed);
              if (validated) {
                return {
                  type: comp.type,
                  props: { ...comp.props, ...validated.props },
                };
              }
            }

            // Fallback: use pass 1 props
            return { type: comp.type, props: comp.props };
          }),
        );

        // ── Assemble final components ──
        const components: ComponentData[] = sectionResults.map((result, i) => {
          const fallback = plan.components[i];
          if (result.status === 'fulfilled' && result.value) {
            return {
              type: result.value.type,
              props: { id: generateId(), ...result.value.props },
            };
          }
          // Fallback to pass 1 data
          return {
            type: fallback.type,
            props: { id: generateId(), ...fallback.props },
          };
        });

        const ordered = orderPuckComponents(components);

        // Progressive: emit each component
        emitComponentStream(send, ordered);

        const finalResult: AIGenerationResponse = {
          action: AIAction.FULL_PAGE,
          components: ordered,
          message: `Generated page with ${ordered.length} components`,
        };

        send({ type: 'done', result: finalResult });
      } catch (err) {
        send({
          type: 'error',
          message: err instanceof Error ? err.message : 'Unknown two-pass streaming error',
        });
      } finally {
        close();
      }
    },
  });
}
