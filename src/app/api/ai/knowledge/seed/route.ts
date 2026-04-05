import { NextRequest } from 'next/server';
import { seedDesignKnowledge } from '@/lib/ai/knowledge/seed-knowledge';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/knowledge/seed — Admin endpoint to seed design knowledge into vector DB.
 *
 * Seeds all static design data (color palettes, styles, patterns, typography, reasoning)
 * into the VectorEmbedding table with scope='global'.
 *
 * Idempotent: clears existing global entries before reseeding.
 *
 * NOTE: Auth is placeholder — replace with real admin role check before production.
 */
export async function POST(request: NextRequest) {
  // Auth check — placeholder allows all; add admin role check for production
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return errorResponse('UNAUTHORIZED', auth.error ?? 'Authentication required', 401);
  }
  try {
    const result = await seedDesignKnowledge();

    if (result.errors.length > 0 && result.totalSeeded === 0) {
      return errorResponse('SEED_ERROR', `All batches failed: ${result.errors.join('; ')}`, 500);
    }

    return successResponse({
      seeded: result.totalSeeded,
      categories: result.categories,
      warnings: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (err) {
    console.error('[knowledge/seed] Fatal error:', err);
    return errorResponse('SEED_FATAL', err instanceof Error ? err.message : 'Unknown error', 500);
  }
}
