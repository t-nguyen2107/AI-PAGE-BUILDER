import type { BaseMessage } from '@langchain/core/messages';
import { createModel } from './provider';
import { buildChainPrompt } from './prompts/system-prompt';
import { createStructuredModel, validateOutput } from './output';
import { sanitizeAIResponse } from './output-sanitizer';
import type { AIGenerationResponse } from '@/types/ai';
import type { DesignGuidance } from './knowledge/design-knowledge';
import type { ComponentTierPlan } from './prompts/prompt-optimizer';

interface ChainOptions {
  styleguideData?: { colors?: string; typography?: string; spacing?: string; cssVariables?: string };
  miniContext?: string;
  history?: BaseMessage[];
  treeSummary?: string;
  projectProfile?: string;
  designContext?: string;
  /** Resolved design guidance object for dynamic layout resolution */
  designGuidance?: DesignGuidance;
  /** Pre-computed component tiers for dynamic catalog */
  componentTiers?: ComponentTierPlan;
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
  const model = createModel({ maxTokens: 8192 }); // Component-level generation needs less than default 16384
  const structuredModel = createStructuredModel(model);
  const prompt = buildChainPrompt({
    styleguideData: options.styleguideData,
    miniContext: options.miniContext,
    treeSummary: options.treeSummary,
    projectProfile: options.projectProfile,
    designContext: options.designContext,
    designGuidance: options.designGuidance,
    componentTiers: options.componentTiers,
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
