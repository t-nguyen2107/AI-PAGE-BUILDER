import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Relevance scoring
// ---------------------------------------------------------------------------

/**
 * Compute a simple relevance score for a library item against a query.
 * Higher score = more relevant.
 *
 * Scoring:
 *  - Exact match on name:            +100
 *  - Case-insensitive exact on name:  +80
 *  - Partial match on name:           +50
 *  - Exact match on a tag:            +30
 *  - Partial match on a tag:          +15
 *  - Partial match on description:    +10
 */
function computeRelevance(
  item: { name: string; description: string | null; tags: string },
  query: string,
): number {
  const q = query.toLowerCase().trim();
  const nameLower = item.name.toLowerCase();
  const tagsArray = item.tags
    ? item.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
    : [];
  const descLower = (item.description ?? '').toLowerCase();

  let score = 0;

  // Name scoring
  if (item.name === query) {
    score += 100;
  } else if (nameLower === q) {
    score += 80;
  } else if (nameLower.includes(q)) {
    score += 50;
  }

  // Tag scoring
  for (const tag of tagsArray) {
    if (tag === q) {
      score += 30;
    } else if (tag.includes(q)) {
      score += 15;
    }
  }

  // Description scoring
  if (descLower.includes(q)) {
    score += 10;
  }

  return score;
}

// ---------------------------------------------------------------------------
// POST /api/ai/search — text-based library component search
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body as { query: string };

    if (!query || typeof query !== 'string') {
      return errorResponse('VALIDATION_ERROR', '"query" is required and must be a non-empty string', 422);
    }

    const trimmed = query.trim();

    // Use Prisma contains filter which translates to SQL LIKE '%query%' on
    // name, description, and tags columns.
    const items = await prisma.userLibrary.findMany({
      where: {
        OR: [
          { name: { contains: trimmed } },
          { description: { contains: trimmed } },
          { tags: { contains: trimmed } },
        ],
      },
    });

    // Score, sort by relevance (descending), and parse JSON fields
    const scored = items
      .map((item) => ({
        item,
        score: computeRelevance(item, trimmed),
      }))
      .sort((a, b) => b.score - a.score);

    const results = scored.map(({ item, score }) => {
      let parsedNodeData: unknown;
      try {
        parsedNodeData = JSON.parse(item.nodeData);
      } catch {
        parsedNodeData = null;
      }

      return {
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        thumbnailUrl: item.thumbnailUrl,
        nodeData: parsedNodeData,
        tags: item.tags ? item.tags.split(',').filter(Boolean) : [],
        isPublic: item.isPublic,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        relevanceScore: score,
      };
    });

    return successResponse(results);
  } catch (err) {
    console.error('Library search failed:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to search library items', 500);
  }
}
