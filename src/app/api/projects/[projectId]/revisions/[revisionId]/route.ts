import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// GET /api/projects/:projectId/revisions/:revisionId — get single revision
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; revisionId: string }> },
) {
  try {
    const { projectId, revisionId } = await params;

    const revision = await prisma.revision.findUnique({
      where: { id: revisionId },
      include: { page: true },
    });

    if (!revision || revision.page.projectId !== projectId) {
      return errorResponse('NOT_FOUND', `Revision not found: ${revisionId}`, 404);
    }

    // Parse snapshot JSON string back to object
    const parsed = {
      ...revision,
      snapshot: JSON.parse(revision.snapshot),
    };

    return successResponse(parsed);
  } catch (err) {
    console.error('Failed to fetch revision:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch revision', 500);
  }
}

// ---------------------------------------------------------------------------
// POST /api/projects/:projectId/revisions/:revisionId — restore from revision
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; revisionId: string }> },
) {
  try {
    const { projectId, revisionId } = await params;

    // Fetch the revision and verify it belongs to the project
    const revision = await prisma.revision.findUnique({
      where: { id: revisionId },
      include: { page: true },
    });

    if (!revision || revision.page.projectId !== projectId) {
      return errorResponse('NOT_FOUND', `Revision not found: ${revisionId}`, 404);
    }

    // Update the page's treeData to the revision's snapshot
    const updatedPage = await prisma.page.update({
      where: { id: revision.pageId },
      data: {
        treeData: revision.snapshot, // already a JSON string
      },
    });

    return successResponse(updatedPage);
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2025'
    ) {
      return errorResponse('NOT_FOUND', 'Revision or page not found', 404);
    }

    console.error('Failed to restore revision:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to restore revision', 500);
  }
}
