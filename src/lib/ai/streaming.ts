import type { BaseMessage } from '@langchain/core/messages';
import { createModelBundle, createFastModelBundle } from './provider';
import { buildChainPrompt } from './prompts/system-prompt';
import { buildTemplatePrompt } from './prompts/template-prompt';
import { validateOutput } from './output';
import { validateTemplateResponse } from './prompts/template-schema';
import { sanitizeAIResponse } from './output-sanitizer';
import { convertAIResponseNodes, orderPuckComponents } from './puck-adapter';
import { generateId } from '@/lib/id';
import type { AIGenerationResponse } from '@/types/ai';
import { AIAction } from '@/types/enums';
import type { ComponentData } from '@puckeditor/core';
import type { ComponentTierPlan } from './prompts/prompt-optimizer';

interface StreamOptions {
  styleguideData?: { colors?: string; typography?: string };
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
}

export interface SSEEvent {
  type: 'chunk' | 'done' | 'error' | 'status';
  content?: string;
  result?: AIGenerationResponse;
  message?: string;
  step?: string;
  label?: string;
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
            })
          : buildChainPrompt({
              styleguideData: options.styleguideData,
              miniContext: options.miniContext,
              treeSummary: options.treeSummary,
              projectProfile: options.projectProfile,
              componentTiers: options.componentTiers,
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

          const result: AIGenerationResponse = {
            action: AIAction.FULL_PAGE,
            components: ordered,
            message: `Generated page with ${ordered.length} components`,
          };
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
