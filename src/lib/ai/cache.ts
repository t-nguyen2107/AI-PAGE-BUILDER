/**
 * AI Pipeline Caches — reduce repeated computation across requests.
 *
 * Three cache types:
 * 1. AIConfigCache — singleton for resolveConfig/resolveFastConfig (5min TTL)
 * 2. EmbeddingLRUCache — LRU for embedding results (200 entries, 60min TTL)
 * 3. ProfileTextCache — TTL cache for project profile text (10min TTL)
 */

import { createHash } from 'crypto';

// ─── Generic TTL Cache ──────────────────────────────────────────────────────

class TTLCache<T> {
  private cache = new Map<string, { value: T; expiry: number }>();
  private readonly ttlMs: number;
  private readonly maxEntries: number;

  constructor(opts: { ttlMs: number; maxEntries?: number }) {
    this.ttlMs = opts.ttlMs;
    this.maxEntries = opts.maxEntries ?? 500;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    // Move to end (LRU refresh)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.cache.size >= this.maxEntries) {
      // Evict oldest (first in Map)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
    this.cache.set(key, { value, expiry: Date.now() + this.ttlMs });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

// ─── Hash helper ─────────────────────────────────────────────────────────────

function hashText(text: string): string {
  return createHash('sha256').update(text).digest('hex').substring(0, 16);
}

// ─── 1. AI Config Cache ─────────────────────────────────────────────────────

import type { AIConfig, AIFastConfig } from './config';

const CONFIG_TTL = 5 * 60 * 1000; // 5 minutes
let cachedConfig: AIConfig | null = null;
let cachedConfigExpiry = 0;
let cachedFastConfig: AIFastConfig | null = null;
let cachedFastConfigExpiry = 0;

export function getCachedAIConfig(): AIConfig | null {
  if (cachedConfig && Date.now() < cachedConfigExpiry) return cachedConfig;
  return null;
}

export function setCachedAIConfig(config: AIConfig): void {
  cachedConfig = config;
  cachedConfigExpiry = Date.now() + CONFIG_TTL;
}

export function getCachedFastConfig(): AIFastConfig | null {
  if (cachedFastConfig && Date.now() < cachedFastConfigExpiry) return cachedFastConfig;
  return null;
}

export function setCachedFastConfig(config: AIFastConfig): void {
  cachedFastConfig = config;
  cachedFastConfigExpiry = Date.now() + CONFIG_TTL;
}

export function resetConfigCache(): void {
  cachedConfig = null;
  cachedConfigExpiry = 0;
  cachedFastConfig = null;
  cachedFastConfigExpiry = 0;
}

// ─── 2. Embedding LRU Cache ─────────────────────────────────────────────────

const embeddingCache = new TTLCache<Float32Array>({ ttlMs: 60 * 60 * 1000, maxEntries: 200 });

export function getEmbeddingCache(text: string): Float32Array | undefined {
  return embeddingCache.get(hashText(text));
}

export function setEmbeddingCache(text: string, embedding: Float32Array): void {
  embeddingCache.set(hashText(text), embedding);
}

export function clearEmbeddingCache(): void {
  embeddingCache.clear();
}

// ─── 3. Profile Text Cache ──────────────────────────────────────────────────

const profileCache = new TTLCache<string>({ ttlMs: 10 * 60 * 1000, maxEntries: 50 });

export function getProfileCache(projectId: string): string | undefined {
  return profileCache.get(projectId);
}

export function setProfileCache(projectId: string, text: string): void {
  profileCache.set(projectId, text);
}

export function invalidateProfileCache(projectId: string): void {
  profileCache.delete(projectId);
}

export function clearProfileCache(): void {
  profileCache.clear();
}
