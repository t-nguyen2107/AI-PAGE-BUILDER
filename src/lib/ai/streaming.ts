import type { BaseMessage } from '@langchain/core/messages';
import { createModel } from './provider';
import { buildChainPrompt } from './prompts/system-prompt';
import { buildTemplatePrompt } from './prompts/template-prompt';
import { validateOutput } from './output';
import { validateTemplateResponse } from './prompts/template-schema';
import { sanitizeAIResponse } from './output-sanitizer';
import { assemblePage } from '@/features/ai/template-assembler';
import type { AIGenerationResponse } from '@/types/ai';

interface StreamOptions {
  styleguideData?: { colors?: string; typography?: string };
  miniContext?: string;
  history?: BaseMessage[];
  treeSummary?: string;
  /** 'template' = compact prompt, AI picks templates + fills content. 'full' = current full DOM pipeline. */
  mode?: 'full' | 'template';
  /** Business type for template assembler (stock image selection) */
  businessType?: string;
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
 * 3. Parse + validate with Zod 4
 * 4. Emit final `done` event with structured result
 */
export function createAIStream(input: string, options: StreamOptions = {}): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const send = (event: SSEEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      const isTemplateMode = options.mode === 'template';

      try {
        // Status: generating
        send({ type: 'status', step: 'generating', label: isTemplateMode ? 'Selecting templates...' : 'Generating with AI...' });

        const model = createModel();

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
            });

        // Build messages manually for streaming (no withStructuredOutput)
        // Note: input is already optimized by the route
        const messages = await prompt.formatMessages({
          input,
          history: options.history ?? [],
        });

        let accumulated = '';
        const MAX_ACCUMULATED = 100_000; // ~25k tokens — abort if model runs away
        const stream = await model.stream(messages);

        for await (const chunk of stream) {
          const text = typeof chunk.content === 'string' ? chunk.content : '';
          if (text) {
            accumulated += text;
            send({ type: 'chunk', content: text });
          }
          if (accumulated.length > MAX_ACCUMULATED) {
            send({ type: 'error', message: 'Output exceeded maximum length — try a shorter prompt or fewer sections' });
            controller.close();
            return;
          }
        }

        // Parse accumulated text
        send({ type: 'status', step: 'parsing', label: isTemplateMode ? 'Assembling page...' : 'Parsing response...' });
        const parsed = extractJSON(accumulated);
        if (!parsed) {
          send({ type: 'error', message: 'AI response could not be parsed as valid JSON' });
          controller.close();
          return;
        }

        if (isTemplateMode) {
          // Template mode: validate template selection + assemble page
          send({ type: 'status', step: 'validating', label: 'Assembling page from templates...' });
          const { data: plan, error: planError } = validateTemplateResponse(parsed);
          if (planError || !plan) {
            send({ type: 'error', message: planError ?? 'Template selection validation failed' });
            controller.close();
            return;
          }

          const assembled = assemblePage(plan, options.businessType);
          send({ type: 'done', result: assembled });
        } else {
          // Full mode: sanitize + validate full DOM response
          const sanitized = sanitizeAIResponse(parsed as Record<string, unknown>);

          send({ type: 'status', step: 'validating', label: 'Validating output...' });
          const { data, error } = validateOutput(sanitized);
          if (error || !data) {
            send({ type: 'error', message: error ?? 'AI response failed validation' });
            controller.close();
            return;
          }

          send({ type: 'done', result: data });
        }
      } catch (err) {
        send({
          type: 'error',
          message: err instanceof Error ? err.message : 'Unknown streaming error',
        });
      } finally {
        controller.close();
      }
    },
  });
}

/**
 * Extract JSON from AI text output.
 * Tries: direct parse → code fence → brace matching.
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
    // Remove trailing incomplete string/value
    truncated = truncated.replace(/"[^"\\]*$/, '');
    truncated = truncated.replace(/,\s*$/, '');
    // Count unclosed braces/brackets and close them
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

  // Log what we got for debugging
  console.error('[streaming/extractJSON] Failed to parse. Total length:', cleaned.length, 'First 300 chars:', cleaned.substring(0, 300));
  return null;
}
