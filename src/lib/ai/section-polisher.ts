import { buildBatchSectionPrompt } from './prompts/section-prompt';
import { createModelBundle, createFastModelBundle } from './provider';
import { extractJSON } from './streaming';
import { validateSingleComponent } from './prompts/template-schema';
import type { DesignGuidance } from './knowledge/design-knowledge';
import type { MinimalStyleguideTokens } from './prompts/prompt-utils';

export interface PolishContext {
  userPrompt: string;
  businessType?: string;
  businessName?: string;
  designGuidance?: DesignGuidance;
  styleguideData?: MinimalStyleguideTokens;
  designContext?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
  isMakeup?: boolean;
  /** Use fast/lightweight model instead of premium — sufficient for visual-only polish */
  useFastModel?: boolean;
}

export interface PolishResult {
  type: string;
  props: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// JSON Brace+Bracket Depth Streaming Parser
// ---------------------------------------------------------------------------

/**
 * Parse complete JSON objects from a streaming JSON array buffer.
 *
 * Tracks BOTH brace `{}` AND bracket `[]` depth to correctly handle
 * nested arrays (e.g. `links: [{...}]`, `features: [{...}]`).
 * Handles string escapes by skipping the next character.
 */
export function parseStreamingComponents(
  buffer: string,
  alreadyParsed: number,
  scanFrom: number = 0,
): { complete: Array<{ index: number; data: unknown }>; scanTo: number } {
  const complete: Array<{ index: number; data: unknown }> = [];

  const arrayStart = buffer.indexOf('[');
  if (arrayStart === -1) return { complete, scanTo: scanFrom };

  const inner = buffer.slice(arrayStart + 1);
  let braceDepth = 0;
  let bracketDepth = 0;
  let inString = false;
  let objStart = -1;
  let componentIndex = alreadyParsed;
  let skipNext = false;
  let lastObjEnd = scanFrom;

  for (let i = scanFrom; i < inner.length; i++) {
    const ch = inner[i];

    // Skip character after backslash (handles \", \\, \uXXXX, etc.)
    if (skipNext) {
      skipNext = false;
      continue;
    }

    // Inside a string: only look for escape or closing quote
    if (inString) {
      if (ch === '\\') {
        skipNext = true;
        continue;
      }
      if (ch === '"') {
        inString = false;
      }
      continue;
    }

    // Not inside a string
    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === '{') {
      if (braceDepth === 0 && bracketDepth === 0) objStart = i;
      braceDepth++;
    } else if (ch === '}') {
      braceDepth--;
      if (braceDepth === 0 && bracketDepth === 0 && objStart !== -1) {
        const objStr = inner.slice(objStart, i + 1);
        try {
          const parsed = JSON.parse(objStr);
          complete.push({ index: componentIndex, data: parsed });
          componentIndex++;
          lastObjEnd = i + 1;
        } catch {
          // Incomplete/malformed JSON — expected during streaming
        }
        objStart = -1;
      }
    } else if (ch === '[') {
      bracketDepth++;
    } else if (ch === ']') {
      bracketDepth--;
    }
  }

  return { complete, scanTo: lastObjEnd };
}

// ---------------------------------------------------------------------------
// Single-Request Streaming Batch Polish
// ---------------------------------------------------------------------------

/**
 * Polish ALL sections in a single streaming request.
 *
 * As the model streams the JSON array, we detect each complete element
 * via brace+bracket depth parsing and emit callbacks for progressive rendering.
 *
 * Falls back to full JSON parse if streaming parser misses components.
 */
export async function polishSectionsStream(
  components: Array<{ type: string; props: Record<string, unknown> }>,
  ctx: PolishContext,
  onSectionDone?: (index: number, total: number, result: PolishResult) => void,
): Promise<PolishResult[]> {
  const total = components.length;
  const results: PolishResult[] = components.map((c) => ({ type: c.type, props: c.props }));

  if (total === 0) return results;

  // Build single batch prompt
  const batchPrompt = buildBatchSectionPrompt(components, {
    userPrompt: ctx.userPrompt,
    businessType: ctx.businessType ?? 'general',
    businessName: ctx.businessName,
    designGuidance: ctx.designGuidance,
    styleguideData: ctx.styleguideData,
    designContext: ctx.designContext,
    isMakeup: ctx.isMakeup,
  });

  const { model, jsonCallOptions } = ctx.useFastModel
    ? createFastModelBundle({ maxTokens: 10240 })
    : createModelBundle({ maxTokens: 16384 });
  const messages = await batchPrompt.formatMessages({ input: ctx.userPrompt });
  const { response_format: _rf, ...streamCallOpts } = jsonCallOptions;

  const timeoutMs = ctx.timeoutMs ?? 180_000;
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const combinedSignal = ctx.signal
    ? AbortSignal.any([ctx.signal, timeoutSignal])
    : timeoutSignal;

  let accumulated = '';
  let alreadyParsed = 0;
  let scanFrom = 0;
  let streamFailed = false;

  // Temporary unhandledRejection guard — Google GenAI SDK can emit late
  // internal promise rejections after the for-await catch block runs.
  const googleRejectionHandler = (reason: unknown) => {
    if (reason instanceof Error && (
      reason.message?.includes('GoogleGenerativeAI') ||
      reason.message?.includes('Failed to parse stream')
    )) {
      // Already logged in the catch block below — suppress duplicate crash
      return;
    }
    // Re-throw any non-Google rejections so they're not silently swallowed
    throw reason;
  };
  process.on('unhandledRejection', googleRejectionHandler);

  try {
    const stream = await model.stream(messages, { ...streamCallOpts, signal: combinedSignal });

    for await (const chunk of stream) {
      let text = '';
      if (typeof chunk.content === 'string') {
        text = chunk.content;
      } else if (Array.isArray(chunk.content)) {
        text = chunk.content
          .filter((c: unknown): c is { type: string; text: string } =>
            typeof c === 'object' && c !== null && 'type' in (c as Record<string, unknown>) && (c as { type: string }).type === 'text')
          .map((c) => c.text)
          .join('');
      }
      if (text) accumulated += text;

      // Parse complete components from the stream buffer (only new data)
      const { complete, scanTo } = parseStreamingComponents(accumulated, alreadyParsed, scanFrom);

      for (const { index, data } of complete) {
        // Bounds check: skip hallucinated extra components
        if (index >= components.length) {
          console.warn(`[section-polisher] Skipping extra component ${index} (expected ${total} total)`);
          continue;
        }
        const parsed = data as Record<string, unknown>;
        const compType = typeof parsed.type === 'string' ? parsed.type : components[index].type;
        if (!compType) {
          console.warn(`[section-polisher] Missing type at index ${index}, skipping`);
          continue;
        }
        const compProps = (parsed.props as Record<string, unknown>) ?? {};

        // Validate the single component
        const { data: validated, error } = validateSingleComponent(parsed);
        if (!error && validated) {
          const rawProps = components[index]?.props || {};
          results[index] = {
            type: compType,
            props: { ...rawProps, ...(validated.props as Record<string, unknown>) },
          };
        } else {
          const rawProps = components[index]?.props || {};
          results[index] = { type: compType, props: { ...rawProps, ...compProps } };
        }

        alreadyParsed = index + 1;
        onSectionDone?.(index, total, results[index]);
      }

      // Advance scan position past last parsed object
      scanFrom = scanTo;
    }
  } catch (streamError) {
    const msg = streamError instanceof Error ? streamError.message : 'Unknown stream error';
    console.error(`[section-polisher] Stream error (${alreadyParsed}/${total} parsed):`, msg);
    streamFailed = true;
  } finally {
    // Always remove the temporary rejection guard
    process.off('unhandledRejection', googleRejectionHandler);
  }

  // Final fallback: if streaming parser didn't capture everything, try full JSON parse
  if (alreadyParsed < total && accumulated.trim()) {
    const fullParsed = extractJSON(accumulated);
    if (fullParsed) {
      const arr = (fullParsed as Record<string, unknown>)?.components;
      if (Array.isArray(arr)) {
        for (let i = 0; i < Math.min(arr.length, total); i++) {
          // Only fill gaps — don't overwrite streaming results
          if (alreadyParsed <= i) {
            const item = arr[i] as Record<string, unknown>;
            const compType = typeof item.type === 'string' ? item.type : components[i]?.type;
            if (!compType) continue;

            const { data: validated, error } = validateSingleComponent(item);
            const rawProps = components[i]?.props || {};
            if (!error && validated) {
              results[i] = {
                type: validated.type ?? compType,
                props: { ...rawProps, ...(validated.props as Record<string, unknown>) },
              };
            } else {
              const compProps = (item.props as Record<string, unknown>) ?? {};
              results[i] = { type: compType, props: { ...rawProps, ...compProps } };
            }
            onSectionDone?.(i, total, results[i]);
            alreadyParsed = i + 1;
          }
        }
      }
    }

    if (streamFailed) {
      console.warn(`[section-polisher] Stream failed — ${alreadyParsed}/${total} parsed from stream, attempted full parse fallback`);
    }
  }

  return results;
}
