import type { BaseMessage } from '@langchain/core/messages';
import { createModel } from './provider';
import { buildChainPrompt } from './prompts/system-prompt';
import { validateOutput } from './output';
import type { AIGenerationResponse } from '@/types/ai';

interface StreamOptions {
  styleguideData?: { colors?: string; typography?: string };
  miniContext?: string;
  history?: BaseMessage[];
}

export interface SSEEvent {
  type: 'chunk' | 'done' | 'error';
  content?: string;
  result?: AIGenerationResponse;
  message?: string;
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

      try {
        const model = createModel();
        const prompt = buildChainPrompt({
          styleguideData: options.styleguideData,
          miniContext: options.miniContext,
        });

        // Build messages manually for streaming (no withStructuredOutput)
        const messages = await prompt.formatMessages({
          input,
          history: options.history ?? [],
        });

        let accumulated = '';
        const stream = await model.stream(messages);

        for await (const chunk of stream) {
          const text = typeof chunk.content === 'string' ? chunk.content : '';
          if (text) {
            accumulated += text;
            send({ type: 'chunk', content: text });
          }
        }

        // Parse accumulated text
        const parsed = extractJSON(accumulated);
        if (!parsed) {
          send({ type: 'error', message: 'AI response could not be parsed as valid JSON' });
          controller.close();
          return;
        }

        const { data, error } = validateOutput(parsed);
        if (error || !data) {
          send({ type: 'error', message: error ?? 'AI response failed validation' });
          controller.close();
          return;
        }

        send({ type: 'done', result: data });
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
function extractJSON(text: string): unknown {
  // Strip <think/> tags (some models like qwen emit these)
  const cleaned = text.replace(/<think[\s\S]*?<\/think>/gi, '').trim();

  try { return JSON.parse(cleaned); } catch { /* continue */ }

  const codeBlock = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlock) {
    try { return JSON.parse(codeBlock[1]); } catch { /* continue */ }
  }

  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first !== -1 && last > first) {
    try { return JSON.parse(cleaned.slice(first, last + 1)); } catch { /* continue */ }
  }

  return null;
}
