/**
 * VectorStore — low-level vector CRUD + similarity search via Prisma + raw SQL.
 *
 * Uses pgvector's cosine distance operator (`<=>`) for semantic search.
 * Prisma can't manage vector columns natively, so we use $queryRaw for search
 * and standard Prisma CRUD for everything else.
 */

import { prisma } from '@/lib/prisma';
import { embed, vectorToPg, type EmbeddingConfig } from './embeddings';
import { safeJsonParse } from './utils';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Validate that an ID looks like a valid nanoid or cuid (alphanumeric). */
function isValidId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{5,50}$/.test(id);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StoreEntry {
  projectId?: string;
  userId?: string;
  scope: 'user' | 'project' | 'global';
  category: string;
  content: string;
  metadata?: Record<string, unknown>;
  model?: string;
  dimensions?: number;
  sessionId?: string;
}

export interface SearchOpts {
  scopes?: Array<'user' | 'project' | 'global'>;
  projectId?: string;
  userId?: string;
  category?: string;
  topK?: number;
  minScore?: number;
}

export interface VectorSearchResult {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  score: number;
  scope: string;
  category: string;
  createdAt: Date;
}

// ─── Store ────────────────────────────────────────────────────────────────────

/**
 * Store a single entry with its embedding vector.
 */
export async function storeVector(
  entry: StoreEntry,
  embeddingConfig?: EmbeddingConfig,
): Promise<string> {
  const vector = await embed(entry.content, embeddingConfig);
  const dimensions = embeddingConfig?.dimensions ?? vector.length;

  const record = await prisma.vectorEmbedding.create({
    data: {
      projectId: entry.projectId ?? null,
      userId: entry.userId ?? null,
      scope: entry.scope,
      category: entry.category,
      content: entry.content,
      metadata: JSON.stringify(entry.metadata ?? {}),
      embedding: Buffer.from(vector.buffer as ArrayBuffer),
      model: entry.model ?? embeddingConfig?.model ?? 'nomic-embed-text',
      dimensions,
      sessionId: entry.sessionId ?? null,
    },
  });

  // Also update the pgvector column via raw SQL
  if (!isValidId(record.id)) throw new Error('Invalid record ID');
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE vector_embeddings SET embedding_vec = $1::vector WHERE id = $2`,
      vectorToPg(vector),
      record.id,
    );
  } catch (updateErr) {
    // Clean up orphan record if vector update fails
    await prisma.vectorEmbedding.delete({ where: { id: record.id } }).catch(() => {});
    throw updateErr;
  }

  return record.id;
}

/**
 * Store multiple entries. Embeds in batch for efficiency.
 */
export async function storeVectorBatch(
  entries: StoreEntry[],
  embeddingConfig?: EmbeddingConfig,
): Promise<string[]> {
  if (entries.length === 0) return [];

  const texts = entries.map((e) => e.content);
  const vectors = await Promise.all(texts.map((t) => embed(t, embeddingConfig)));
  const model = embeddingConfig?.model ?? 'nomic-embed-text';
  const dimensions = embeddingConfig?.dimensions ?? vectors[0]!.length;

  const ids: string[] = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const vector = vectors[i]!;

    const record = await prisma.vectorEmbedding.create({
      data: {
        projectId: entry.projectId ?? null,
        userId: entry.userId ?? null,
        scope: entry.scope,
        category: entry.category,
        content: entry.content,
        metadata: JSON.stringify(entry.metadata ?? {}),
        embedding: Buffer.from(vector.buffer as ArrayBuffer),
        model,
        dimensions,
        sessionId: entry.sessionId ?? null,
      },
    });

    if (!isValidId(record.id)) throw new Error('Invalid record ID');
    await prisma.$executeRawUnsafe(
      `UPDATE vector_embeddings SET embedding_vec = $1::vector WHERE id = $2`,
      vectorToPg(vector),
      record.id,
    );

    ids.push(record.id);
  }

  return ids;
}

// ─── Search ───────────────────────────────────────────────────────────────────

/**
 * Semantic similarity search using pgvector cosine distance.
 */
export async function searchVectors(
  query: string,
  opts: SearchOpts = {},
  embeddingConfig?: EmbeddingConfig,
): Promise<VectorSearchResult[]> {
  const vector = await embed(query, embeddingConfig);
  const topK = opts.topK ?? 5;
  const minScore = opts.minScore ?? 0.5;
  const scopes = opts.scopes ?? ['project'];
  // Validate scopes against allowlist to prevent injection
  const VALID_SCOPES = new Set(['user', 'project', 'global']);
  const safeScopes = scopes.filter((s) => VALID_SCOPES.has(s));
  if (safeScopes.length === 0) return []; // No valid scopes — return empty
  const scopePlaceholders = safeScopes.map((_, i) => `$${i + 3}`).join(', ');

  const sql = `
    SELECT id, content, metadata, scope, category, "createdAt",
           1 - (embedding_vec <=> $1::vector) AS score
    FROM vector_embeddings
    WHERE embedding_vec IS NOT NULL
      AND scope IN (${scopePlaceholders})
      AND ($${safeScopes.length + 3}::text IS NULL OR "projectId" = $${safeScopes.length + 3})
      AND ($${safeScopes.length + 4}::text IS NULL OR category = $${safeScopes.length + 4})
      AND 1 - (embedding_vec <=> $1::vector) >= $2
    ORDER BY embedding_vec <=> $1::vector
    LIMIT $${safeScopes.length + 5}
  `;

  const params: unknown[] = [
    vectorToPg(vector),  // $1
    minScore,             // $2
    ...safeScopes,        // $3, $4, $5
    opts.projectId ?? null, // project filter
    opts.category ?? null,  // category filter
    topK,                   // limit
  ];

  type RawRow = {
    id: string;
    content: string;
    metadata: string;
    scope: string;
    category: string;
    createdAt: Date;
    score: number;
  };

  const rows = await prisma.$queryRawUnsafe<RawRow[]>(sql, ...params);

  return rows.map((row) => ({
    id: row.id,
    content: row.content,
    metadata: safeJsonParse(row.metadata),
    score: row.score,
    scope: row.scope,
    category: row.category,
    createdAt: row.createdAt,
  }));
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteVector(id: string): Promise<void> {
  await prisma.vectorEmbedding.delete({ where: { id } });
}

export async function deleteVectorsByScope(
  scope: string,
  projectId?: string,
): Promise<void> {
  await prisma.vectorEmbedding.deleteMany({
    where: {
      scope,
      ...(projectId ? { projectId } : {}),
    },
  });
}

// ─── Touch (track usage) ─────────────────────────────────────────────────────

export async function touchVector(id: string): Promise<void> {
  if (!isValidId(id)) return;
  await prisma.$executeRawUnsafe(
    `UPDATE vector_embeddings SET "timesReferenced" = "timesReferenced" + 1, "referencedAt" = NOW() WHERE id = $1`,
    id,
  );
}
