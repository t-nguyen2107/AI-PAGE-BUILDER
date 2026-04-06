export type AIProvider = 'ollama' | 'openai' | 'anthropic';

export interface AIConfig {
  provider: AIProvider;
  model: string;
  baseUrl: string;
  apiKey?: string;
  temperature: number;
  maxRetries: number;
  maxTokens: number;
}

// ─── Fast model config (lighter model for prompt optimization / language tasks) ──
export interface AIFastConfig {
  model: string;
  baseUrl: string;
  apiKey?: string;
}

export function resolveConfig(): AIConfig {
  const provider = (process.env.AI_PROVIDER ?? 'ollama') as AIProvider;
  const model = process.env.AI_MODEL ?? process.env.OLLAMA_MODEL ?? 'qwen3.5';
  const baseUrl = process.env.AI_BASE_URL ?? process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';

  if (process.env.OLLAMA_BASE_URL && !process.env.AI_BASE_URL) {
    console.warn('[ai/config] OLLAMA_BASE_URL is deprecated — use AI_BASE_URL instead');
  }
  if (process.env.OLLAMA_MODEL && !process.env.AI_MODEL) {
    console.warn('[ai/config] OLLAMA_MODEL is deprecated — use AI_MODEL instead');
  }

  const temperature = parseFloat(process.env.AI_TEMPERATURE ?? '0.7');
  const maxRetries = parseInt(process.env.AI_MAX_RETRIES ?? '2', 10);
  const maxTokens = parseInt(process.env.AI_MAX_TOKENS ?? '16384', 10);

  const safeTemp = Number.isFinite(temperature) && temperature >= 0 && temperature <= 2 ? temperature : 0.7;
  const safeRetries = Number.isFinite(maxRetries) && maxRetries >= 0 && maxRetries <= 10 ? maxRetries : 2;
  const safeTokens = Number.isFinite(maxTokens) && maxTokens > 0 && maxTokens <= 65536 ? maxTokens : 16384;
  if (safeTemp !== temperature) console.warn(`[ai/config] Invalid AI_TEMPERATURE="${process.env.AI_TEMPERATURE}", using ${safeTemp}`);
  if (safeRetries !== maxRetries) console.warn(`[ai/config] Invalid AI_MAX_RETRIES="${process.env.AI_MAX_RETRIES}", using ${safeRetries}`);
  if (safeTokens !== maxTokens) console.warn(`[ai/config] Invalid AI_MAX_TOKENS="${process.env.AI_MAX_TOKENS}", using ${safeTokens}`);
  return {
    provider,
    model,
    baseUrl,
    apiKey: process.env.AI_API_KEY,
    temperature: safeTemp,
    maxRetries: safeRetries,
    maxTokens: safeTokens,
  };
}

export function resolveFastConfig(): AIFastConfig {
  const model = process.env.AI_FAST_MODEL ?? process.env.AI_MODEL ?? 'qwen3.5';
  const baseUrl = process.env.AI_FAST_BASE_URL ?? process.env.AI_BASE_URL ?? 'http://localhost:11434';
  const apiKey = process.env.AI_FAST_API_KEY ?? process.env.AI_API_KEY;
  return { model, baseUrl, apiKey };
}
