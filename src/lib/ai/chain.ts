import type { BaseMessage } from '@langchain/core/messages';
import { createModel } from './provider';
import { buildChainPrompt } from './prompts/system-prompt';
import { createStructuredModel, validateOutput } from './output';
import { sanitizeAIResponse } from './output-sanitizer';
import type { AIGenerationResponse } from '@/types/ai';

interface ChainOptions {
  styleguideData?: { colors?: string; typography?: string };
  miniContext?: string;
  history?: BaseMessage[];
  treeSummary?: string;
}

/**
 * Create and invoke the AI generation chain.
 *
 * Flow: ChatPromptTemplate → BaseChatModel → withStructuredOutput → Zod 4 post-validate
 */
export async function invokeAIChain(
  input: string,
  options: ChainOptions = {},
): Promise<{ data: AIGenerationResponse | null; error: string | null; raw: unknown }> {
  const model = createModel();
  const structuredModel = createStructuredModel(model);
  const prompt = buildChainPrompt({
    styleguideData: options.styleguideData,
    miniContext: options.miniContext,
    treeSummary: options.treeSummary,
  });

  const chain = prompt.pipe(structuredModel);

  const raw = await chain.invoke({
    input,
    history: options.history ?? [],
  });

  // Sanitize: fix hierarchy, strip emojis, auto-generate names
  const sanitized = sanitizeAIResponse(raw as Record<string, unknown>);

  const { data, error } = validateOutput(sanitized);
  return { data, error, raw };
}
