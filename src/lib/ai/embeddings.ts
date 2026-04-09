/**
 * Embedding Service — provider-agnostic embedding generation.
 *
 * Supports Gemini, Ollama (nomic-embed-text) and OpenAI (text-embedding-3-small).
 * Reuses the same env var pattern as the main AI provider.
 */

export interface EmbeddingConfig {
  provider: 'ollama' | 'openai' | 'gemini';
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
const isAiGemini = aiProvider === 'gemini';

function inferEmbeddingProvider(): EmbeddingConfig['provider'] {
  if (process.env.EMBEDDING_PROVIDER) return process.env.EMBEDDING_PROVIDER as EmbeddingConfig['provider'];
  if (isAiGemini) return 'gemini';
  if (isAiOpenAi) return 'openai';
  return 'ollama';
}

const DEFAULT_CONFIG: EmbeddingConfig = {
  provider: inferEmbeddingProvider(),
  model: process.env.EMBEDDING_MODEL ?? (isAiGemini ? 'text-embedding-004' : isAiOpenAi ? 'text-embedding-3-small' : 'nomic-embed-text'),
  dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS ?? (isAiGemini ? '3072' : isAiOpenAi ? '1536' : '768'), 10),
  baseUrl: process.env.EMBEDDING_BASE_URL ?? process.env.AI_BASE_URL ?? (isAiGemini ? 'https://generativelanguage.googleapis.com/v1beta' : 'http://localhost:11434'),
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
  // Check LRU cache first
  const cached = getEmbeddingCache(text);
  if (cached) return cached;

  const cfg = config ?? resolveEmbeddingConfig();

  if (cfg.provider === 'ollama') return embedOllama(text, cfg);
  if (cfg.provider === 'gemini') return embedGemini(text, cfg);
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
  if (cfg.provider === 'gemini') return embedBatchGemini(texts, cfg);
  return embedBatchOpenAI(texts, cfg);
}

/**
 * Convert Float32Array to PostgreSQL vector string format.
 * e.g. "[0.1,0.2,0.3,...]"
 */
export function vectorToPg(vec: Float32Array): string {
  return `[${Array.from(vec).join(',')}]`;
}

import { getEmbeddingCache, setEmbeddingCache } from './cache';

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

// ─── Gemini ──────────────────────────────────────────────────────────────────

async function embedGemini(text: string, cfg: EmbeddingConfig): Promise<Float32Array> {
  const model = cfg.model || 'text-embedding-004';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': cfg.apiKey ?? '',
    },
    body: JSON.stringify({
      model: `models/${model}`,
      content: { parts: [{ text }] },
      ...(cfg.dimensions ? { outputDimensionality: cfg.dimensions } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini embed failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json() as { embedding: { values: number[] } };
  const values = data.embedding?.values;
  if (!values) throw new Error('Gemini embed returned no embedding');

  return new Float32Array(values);
}

async function embedBatchGemini(texts: string[], cfg: EmbeddingConfig): Promise<Float32Array[]> {
  const model = cfg.model || 'text-embedding-004';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:batchEmbedContents`;

  const dimOpts = cfg.dimensions ? { outputDimensionality: cfg.dimensions } : {};
  const requests = texts.map((text) => ({
    model: `models/${model}`,
    content: { parts: [{ text }] },
    ...dimOpts,
  }));

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': cfg.apiKey ?? '',
    },
    body: JSON.stringify({ requests }),
  });

  if (!res.ok) {
    throw new Error(`Gemini batch embed failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json() as { embeddings: Array<{ values: number[] }> };
  if (!data.embeddings?.length) throw new Error('Gemini batch embed returned no embeddings');

  return data.embeddings.map((e) => new Float32Array(e.values));
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
