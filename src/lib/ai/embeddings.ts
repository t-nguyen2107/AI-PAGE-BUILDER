/**
 * Embedding Service — provider-agnostic embedding generation.
 *
 * Supports Ollama (nomic-embed-text) and OpenAI (text-embedding-3-small).
 * Reuses the same env var pattern as the main AI provider.
 */

export interface EmbeddingConfig {
  provider: 'ollama' | 'openai';
  model: string;
  dimensions: number;
  baseUrl?: string;
  apiKey?: string;
}

export interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  score: number; // cosine similarity 0-1
}

// Derive smart defaults from AI_PROVIDER when EMBEDDING_* vars aren't set
const aiProvider = process.env.AI_PROVIDER ?? 'ollama';
const isAiOpenAi = aiProvider === 'openai';

const DEFAULT_CONFIG: EmbeddingConfig = {
  provider: (process.env.EMBEDDING_PROVIDER as EmbeddingConfig['provider']) ?? (isAiOpenAi ? 'openai' : 'ollama'),
  model: process.env.EMBEDDING_MODEL ?? (isAiOpenAi ? 'text-embedding-3-small' : 'nomic-embed-text'),
  dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS ?? (isAiOpenAi ? '1536' : '768'), 10),
  baseUrl: process.env.EMBEDDING_BASE_URL ?? process.env.AI_BASE_URL ?? 'http://localhost:11434',
  apiKey: process.env.EMBEDDING_API_KEY ?? process.env.AI_API_KEY ?? undefined,
};

let cachedConfig: EmbeddingConfig | null = null;

export function resolveEmbeddingConfig(): EmbeddingConfig {
  if (cachedConfig) return cachedConfig;
  cachedConfig = { ...DEFAULT_CONFIG };
  return cachedConfig;
}

/** Reset cached config — useful for testing or env var hot-reload. */
export function resetEmbeddingConfig(): void {
  cachedConfig = null;
}

/**
 * Generate embedding for a single text string.
 * Returns a Float32Array of the configured dimension.
 */
export async function embed(text: string, config?: EmbeddingConfig): Promise<Float32Array> {
  const cfg = config ?? resolveEmbeddingConfig();

  if (cfg.provider === 'ollama') {
    return embedOllama(text, cfg);
  }
  return embedOpenAI(text, cfg);
}

/**
 * Generate embeddings for multiple texts in one call.
 */
export async function embedBatch(texts: string[], config?: EmbeddingConfig): Promise<Float32Array[]> {
  if (texts.length === 0) return [];

  const cfg = config ?? resolveEmbeddingConfig();

  if (cfg.provider === 'ollama') {
    // Ollama doesn't have batch endpoint, run in parallel
    return Promise.all(texts.map((t) => embedOllama(t, cfg)));
  }
  return embedBatchOpenAI(texts, cfg);
}

/**
 * Convert Float32Array to PostgreSQL vector string format.
 * e.g. "[0.1,0.2,0.3,...]"
 */
export function vectorToPg(vec: Float32Array): string {
  return `[${Array.from(vec).join(',')}]`;
}

// ─── Ollama ──────────────────────────────────────────────────────────────────

async function embedOllama(text: string, cfg: EmbeddingConfig): Promise<Float32Array> {
  const url = `${cfg.baseUrl ?? 'http://localhost:11434'}/api/embed`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
    },
    body: JSON.stringify({ model: cfg.model, input: text }),
  });

  if (!res.ok) {
    throw new Error(`Ollama embed failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json() as { embeddings: number[][] };
  const embedding = data.embeddings?.[0];
  if (!embedding) throw new Error('Ollama embed returned no embeddings');

  return new Float32Array(embedding);
}

// ─── OpenAI-compatible ────────────────────────────────────────────────────────

async function embedOpenAI(text: string, cfg: EmbeddingConfig): Promise<Float32Array> {
  const url = `${cfg.baseUrl ?? 'https://api.openai.com/v1'}/embeddings`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: cfg.model,
      input: text,
      dimensions: cfg.dimensions,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI embed failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json() as { data: Array<{ embedding: number[] }> };
  const embedding = data.data?.[0]?.embedding;
  if (!embedding) throw new Error('OpenAI embed returned no embeddings');

  return new Float32Array(embedding);
}

async function embedBatchOpenAI(texts: string[], cfg: EmbeddingConfig): Promise<Float32Array[]> {
  const url = `${cfg.baseUrl ?? 'https://api.openai.com/v1'}/embeddings`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: cfg.model,
      input: texts,
      dimensions: cfg.dimensions,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI batch embed failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json() as { data: Array<{ embedding: number[] }> };
  return data.data.map((d) => new Float32Array(d.embedding));
}
