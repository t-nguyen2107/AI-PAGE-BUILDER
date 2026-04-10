import type { BaseMessage } from '@langchain/core/messages';
import { createModelBundle, createFastModelBundle } from './provider';
import { buildChainPrompt } from './prompts/system-prompt';
import { buildTemplatePrompt } from './prompts/template-prompt';
import { validateOutput } from './output';
import { applyComponentDefaults } from './defaults-engine';
import { validateTemplateResponse } from './prompts/template-schema';
import { sanitizeAIResponse } from './output-sanitizer';
import { polishSectionsStream } from './section-polisher';
import { convertAIResponseNodes, orderPuckComponents } from './puck-adapter';
import { generateId } from '@/lib/id';
import type { AIGenerationResponse } from '@/types/ai';
import { AIAction } from '@/types/enums';
import type { ComponentData } from '@puckeditor/core';
import type { ComponentTierPlan } from './prompts/prompt-optimizer';
import type { DesignGuidance } from './knowledge/design-knowledge';

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
  type: 'chunk' | 'done' | 'error' | 'status' | 'component_stream' | 'plan';
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
  /** Plan event: component types in order (for skeleton rendering) */
  plan?: { type: string; skeletonId: string }[];
  /** ID of skeleton component this replaces (progressive reveal) */
  replacesSkelId?: string;
}

/**
 * Emit individual components as component_stream events for progressive rendering.
 * Clients can apply components to the canvas one-by-one before the final done event.
 */
function emitComponentStream(
  send: (event: SSEEvent) => void,
  components: ComponentData[],
  skeletonIds?: string[],
): void {
  const total = components.length;
  send({ type: 'status', step: 'rendering', label: `Streaming ${total} components...` });
  for (let i = 0; i < total; i++) {
    send({
      type: 'component_stream',
      component: components[i],
      componentIndex: i,
      componentTotal: total,
      replacesSkelId: skeletonIds?.[i],
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

        // Template mode generates a FULL page — use main model for quality.
        // Fast model is too weak to follow detailed prompt instructions (recommendedDefaults, color tokens).
        const { model, jsonCallOptions } = createModelBundle({ maxTokens: 16384 });

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
              designGuidance: options.designGuidance,
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
  /** Business name for defaults engine content fallback */
  businessName?: string;
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
          designGuidance: options.designGuidance,
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

        // ── PASS 2: Streaming batch polish (single request) ──
        const sectionResults = await polishSectionsStream(
          plan.components,
          {
            userPrompt: input,
            businessType: options.businessType ?? 'general',
            businessName: options.businessName,
            designGuidance: options.designGuidance,
            styleguideData: options.styleguideData,
            designContext: options.designContext,
            isMakeup: false,
            signal: options.signal,
            timeoutMs: 90_000,
          }
        );

        // ── Assemble final components ──
        const components: ComponentData[] = sectionResults.map((result) => ({
          type: result.type,
          props: { id: generateId(), ...result.props },
        }));

        // Apply defaults engine — guarantees animations, gradients, images
        const polished = applyComponentDefaults(components, {
          businessType: options.businessType,
          businessName: options.businessName,
          designGuidance: options.designGuidance,
          styleguideColors: options.styleguideData?.colors,
        });

        const ordered = orderPuckComponents(polished);

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

// ---------------------------------------------------------------------------
// Makeup Stream — Structure Resolver + Parallel Per-Section Polish
// ---------------------------------------------------------------------------

export interface MakeupStreamOptions {
  styleguideData?: { colors?: string; typography?: string; spacing?: string; cssVariables?: string };
  businessType?: string;
  businessName?: string;
  designContext?: string;
  designGuidance?: DesignGuidance;
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Existing treeData for modify/restyle — skips AI plan generation */
  existingTreeData?: unknown;
  /** User intent from prompt optimizer */
  intent?: string;
}

/**
 * Extract a component plan from existing Puck treeData.
 * Used when intent is modify/restyle — no AI call needed.
 */
function extractPlanFromTreeData(treeData: unknown): import('./prompts/template-schema').PuckComponentPlanRaw {
  const d = treeData as { content?: Array<{ type: string; props: Record<string, unknown> }> };
  const components = (d.content ?? []).map(c => ({
    type: c.type,
    props: { ...c.props },
  }));
  return { components };
}

/**
 * Create a makeup streaming ReadableStream.
 *
 * Phase 1 (Structure Resolver): Determine component plan.
 *   - create_page/add_section: AI plan via fast model + template prompt
 *   - modify/restyle: Extract from existing treeData
 *
 * Phase 2 (Parallel Makeup): Each section gets polished with animation,
 *   gradients, images, refined text via main model + section prompt.
 *
 * Emits:
 *   1. status(planning) — "Planning page layout..."
 *   2. plan — skeleton plan for frontend
 *   3. status(generating) — "Polishing N sections..."
 *   4. component_stream × N — polished sections with replacesSkelId
 *   5. done — final result
 */
export function createMakeupStream(input: string, options: MakeupStreamOptions = {}): ReadableStream<Uint8Array> {
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
        // ── PHASE 1: Structure Resolver ──
        send({ type: 'status', step: 'planning', label: 'Planning page layout...' });

        const planTimeout = options.timeoutMs ?? 90_000;
        const planSignal = options.signal
          ? AbortSignal.any([options.signal, AbortSignal.timeout(planTimeout)])
          : AbortSignal.timeout(planTimeout);

        let plan: import('./prompts/template-schema').PuckComponentPlanRaw;

        const intent = options.intent ?? 'unknown';
        const isModify = intent === 'modify' || intent === 'delete';

        if (isModify && options.existingTreeData) {
          // Modify/restyle: extract plan from existing treeData (zero AI cost)
          plan = extractPlanFromTreeData(options.existingTreeData);
        } else {
          // Create/add/unknown: AI plan via fast model
          const { model: planModel, jsonCallOptions: planOpts } = createFastModelBundle({ maxTokens: 4096 });
          const planPrompt = buildTemplatePrompt({
            businessType: options.businessType,
            styleguideData: options.styleguideData,
            designContext: options.designContext,
            designGuidance: options.designGuidance,
          });

          const planMessages = await planPrompt.formatMessages({ input });
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
            send({ type: 'error', message: 'Structure planning failed: could not parse component plan' });
            return;
          }

          const { data: validatedPlan, error: planError } = validateTemplateResponse(planParsed);
          if (planError || !validatedPlan) {
            send({ type: 'error', message: planError ?? 'Component plan validation failed' });
            return;
          }
          plan = validatedPlan;
        }

        // ── Emit plan event for skeleton rendering ──
        const skeletonIds = plan.components.map(() => `skel_${generateId()}`);
        const skeletonPlan = plan.components.map((c, i) => ({
          type: c.type,
          skeletonId: skeletonIds[i],
        }));
        console.log('[makeup] Plan:', skeletonPlan.map(s => s.type).join(' → '));
        send({
          type: 'plan',
          plan: skeletonPlan,
        });

        // ── PHASE 2: Streaming Batch Polish (single request) ──
        send({ type: 'status', step: 'generating', label: `Polishing ${plan.components.length} sections...` });

        // Track which sections have been emitted for progressive rendering
        const emittedSections = new Set<number>();

        const sectionResults = await polishSectionsStream(
          plan.components,
          {
            userPrompt: input,
            businessType: options.businessType ?? 'general',
            businessName: options.businessName,
            designGuidance: options.designGuidance,
            styleguideData: options.styleguideData,
            designContext: options.designContext,
            isMakeup: true,
            signal: options.signal,
            timeoutMs: 180_000,
            useFastModel: false, // quality is important for makeup
          },
          // Progressive callback: emit each section as it completes
          (index: number, total: number, result) => {
            if (emittedSections.has(index)) return;
            emittedSections.add(index);
            const skelId = skeletonIds[index];
            const component: ComponentData = {
              type: result.type,
              props: { id: skelId, ...result.props },
            };
            send({
              type: 'component_stream',
              component,
              componentIndex: index,
              componentTotal: total,
              replacesSkelId: skelId,
            });
          }
        );

        // ── Assemble final components ──
        const components: ComponentData[] = sectionResults.map((result: { type: string; props: Record<string, unknown> }, i: number) => {
          const skelId = skeletonIds[i];
          return {
            type: result.type,
            props: { id: skelId, ...result.props },
          };
        });

        // Apply defaults engine — guarantees animations, gradients, images
        const polished = applyComponentDefaults(components, {
          businessType: options.businessType,
          businessName: options.businessName,
          designGuidance: options.designGuidance,
          styleguideColors: options.styleguideData?.colors,
        });

        const ordered = orderPuckComponents(polished);

        const orderedSkeletonIds = ordered.map((c) => {
          const id = (c.props as Record<string, unknown>)?.id;
          return typeof id === 'string' ? id : '';
        });

        // Progressive: only emit components not already sent via streaming callback
        if (emittedSections.size < ordered.length) {
          emitComponentStream(send, ordered, orderedSkeletonIds);
        }

        const finalResult: AIGenerationResponse = {
          action: AIAction.FULL_PAGE,
          components: ordered,
          message: `Generated page with ${ordered.length} components`,
        };

        send({ type: 'done', result: finalResult });
      } catch (err) {
        send({
          type: 'error',
          message: err instanceof Error ? err.message : 'Unknown makeup streaming error',
        });
      } finally {
        close();
      }
    },
  });
}
