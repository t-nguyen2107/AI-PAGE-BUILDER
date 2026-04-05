/**
 * Knowledge Search — vector RAG lookup for design knowledge.
 *
 * Given a user prompt and optional business type, searches the vector DB
 * for relevant design guidance (colors, styles, patterns, typography, reasoning).
 * Returns formatted text ready for prompt injection.
 */

import { searchVectors } from '../vector-store';

export interface KnowledgeSearchOpts {
  /** The user's prompt to search against */
  query: string;
  /** Optional business type for category filtering */
  businessType?: string;
  /** Max results to return (default 5) */
  topK?: number;
  /** Minimum cosine similarity score (default 0.4) */
  minScore?: number;
}

export interface KnowledgeSearchResult {
  /** Formatted text for prompt injection */
  contextText: string;
  /** Number of results found */
  hitCount: number;
  /** Source categories that matched */
  categories: string[];
}

/**
 * Search design knowledge via vector similarity.
 * Priority: exact business type match > style keywords > general.
 */
export async function searchDesignKnowledge(
  opts: KnowledgeSearchOpts,
): Promise<KnowledgeSearchResult> {
  const { query, businessType, topK = 5, minScore = 0.4 } = opts;

  try {
    // Prepend business type for more targeted results when available
    const searchQuery = businessType ? `${businessType} ${query}` : query;

    // Search across all global knowledge categories
    const results = await searchVectors(searchQuery, {
      scopes: ['global'],
      topK,
      minScore,
    });

    if (results.length === 0) {
      return { contextText: '', hitCount: 0, categories: [] };
    }

    // Deduplicate by category, keeping highest-scoring entry per category
    const bestByCategory = new Map<string, typeof results[number]>();
    for (const r of results) {
      const existing = bestByCategory.get(r.category);
      if (!existing || r.score > existing.score) {
        bestByCategory.set(r.category, r);
      }
    }

    const categories = [...bestByCategory.keys()];
    const contextParts: string[] = [];

    for (const [, r] of bestByCategory) {
      contextParts.push(`[${r.category}] ${r.content}`);
    }

    const contextText = contextParts.join('\n');

    return { contextText, hitCount: results.length, categories };
  } catch (err) {
    console.warn('[knowledge-search] Vector search failed (non-fatal):', err);
    return { contextText: '', hitCount: 0, categories: [] };
  }
}

/**
 * Quick check if knowledge has been seeded.
 * Returns true if at least one global entry exists.
 */
export async function isKnowledgeSeeded(): Promise<boolean> {
  try {
    const results = await searchVectors('design', {
      scopes: ['global'],
      topK: 1,
      minScore: 0.1,
    });
    return results.length > 0;
  } catch {
    return false;
  }
}
