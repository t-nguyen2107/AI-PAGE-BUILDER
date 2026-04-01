export type AIProvider = 'ollama' | 'openai' | 'anthropic';

export interface AIConfig {
  provider: AIProvider;
  model: string;
  baseUrl: string;
  apiKey?: string;
  temperature: number;
  maxRetries: number;
}

export function resolveConfig(): AIConfig {
  // Backwards compat: old OLLAMA_* vars still work, with deprecation warning
  const provider = (process.env.AI_PROVIDER ?? 'ollama') as AIProvider;
  const model = process.env.AI_MODEL ?? process.env.OLLAMA_MODEL ?? 'qwen3.5';
  const baseUrl = process.env.AI_BASE_URL ?? process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';

  if (process.env.OLLAMA_BASE_URL && !process.env.AI_BASE_URL) {
    console.warn('[ai/config] OLLAMA_BASE_URL is deprecated — use AI_BASE_URL instead');
  }
  if (process.env.OLLAMA_MODEL && !process.env.AI_MODEL) {
    console.warn('[ai/config] OLLAMA_MODEL is deprecated — use AI_MODEL instead');
  }

  return {
    provider,
    model,
    baseUrl,
    apiKey: process.env.AI_API_KEY,
    temperature: parseFloat(process.env.AI_TEMPERATURE ?? '0.7'),
    maxRetries: parseInt(process.env.AI_MAX_RETRIES ?? '2', 10),
  };
}
