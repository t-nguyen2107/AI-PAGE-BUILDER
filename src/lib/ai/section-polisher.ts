import { COMPONENT_CATALOG } from './prompts/component-catalog';
import { buildSectionPrompt } from './prompts/section-prompt';
import { createModelBundle } from './provider';
import { extractJSON } from './streaming';
import { validateSingleComponent } from './prompts/template-schema';
import type { DesignGuidance } from './knowledge/design-knowledge';
import type { MinimalStyleguideTokens } from './prompts/prompt-utils';

export interface PolishContext {
  userPrompt: string;
  businessType?: string;
  designGuidance?: DesignGuidance;
  styleguideData?: MinimalStyleguideTokens;
  designContext?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
  isMakeup?: boolean;
}

export interface PolishResult {
  type: string;
  props: Record<string, unknown>;
}

/**
 * Polish a single section using the main LLM.
 */
export async function polishSection(
  component: { type: string; props: Record<string, unknown> },
  index: number,
  total: number,
  ctx: PolishContext,
): Promise<PolishResult> {
  const catalogEntry = COMPONENT_CATALOG[component.type];
  if (!catalogEntry) {
    console.warn(`[section-polisher] Unknown component type "${component.type}", returning as-is.`);
    return { type: component.type, props: component.props };
  }

  try {
    const sectionPrompt = buildSectionPrompt(component.type, catalogEntry, {
      userPrompt: ctx.userPrompt,
      businessType: ctx.businessType ?? 'general',
      designGuidance: ctx.designGuidance,
      styleguideData: ctx.styleguideData,
      designContext: ctx.designContext,
      position: { index, total },
      isMakeup: ctx.isMakeup,
    });

    const { model: sectionModel, jsonCallOptions: sectionOpts } = createModelBundle({ maxTokens: 4096 });
    const sectionMessages = await sectionPrompt.formatMessages({ input: ctx.userPrompt });
    const { response_format: _rf2, ...sectionInvokeOpts } = sectionOpts;

    // Propagate parent signal or use default 60s timeout per section
    const sectionSignal = ctx.signal
      ? AbortSignal.any([ctx.signal, AbortSignal.timeout(ctx.timeoutMs ?? 60_000)])
      : AbortSignal.timeout(ctx.timeoutMs ?? 60_000);

    const sectionResponse = await sectionModel.invoke(sectionMessages, {
      ...sectionInvokeOpts,
      signal: sectionSignal,
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
    const { data: sectionData, error: sectionError } = validateSingleComponent(sectionParsed);

    if (sectionError || !sectionData) {
      console.warn(`[section-polisher] Validation failed for "${component.type}": ${sectionError}`);
      return { type: component.type, props: component.props }; // Fallback
    }

    // Merge plan props with polished props
    const rawProps = component.props || {};
    const polishedProps = sectionData.props || {};

    return {
      type: component.type,
      props: {
        ...rawProps, // Keep ID
        ...polishedProps,
      },
    };
  } catch (err) {
    if ((err as Error).name === 'AbortError' || (err as Error).name === 'TimeoutError') {
      console.warn(`[section-polisher] Timeout/Abort generating "${component.type}"`);
    } else {
      console.error(`[section-polisher] Error generating "${component.type}":`, err);
    }
    return { type: component.type, props: component.props }; // Fallback
  }
}

/**
 * Polish multiple sections in parallel with a concurrency limit.
 */
export async function polishSections(
  components: Array<{ type: string; props: Record<string, unknown> }>,
  ctx: PolishContext,
  onSectionDone?: (index: number, total: number, result: PolishResult) => void,
): Promise<PolishResult[]> {
  const total = components.length;
  const maxConcurrent = 3;
  
  const results: PromiseSettledResult<PolishResult>[] = new Array(total);
  
  // Implementation of a simple worker pool for concurrency
  let currentIndex = 0;
  
  const worker = async () => {
    while (currentIndex < total) {
      const index = currentIndex++;
      const comp = components[index];
      
      try {
        const result = await polishSection(comp, index, total, ctx);
        onSectionDone?.(index, total, result);
        results[index] = { status: 'fulfilled', value: result };
      } catch (error) {
        results[index] = { status: 'rejected', reason: error };
      }
    }
  };

  // Start maxConcurrent workers
  const workers = Array.from(
    { length: Math.min(total, maxConcurrent) },
    () => worker()
  );
  
  await Promise.all(workers);

  return results.map((res, i) => {
    if (res && res.status === 'fulfilled') {
      return res.value;
    }
    // Fallback if rejected
    return { type: components[i].type, props: components[i].props };
  });
}
