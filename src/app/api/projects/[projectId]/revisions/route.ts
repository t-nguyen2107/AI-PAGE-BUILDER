import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function successResponse<T>(data: T, status = 200) {
  return Response.json({
    success: true,
    data,
    meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
  }, { status });
}

function errorResponse(code: string, message: string, status = 400) {
  return Response.json({
    success: false,
    error: { code, message },
    meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
  }, { status });
}

// ---------------------------------------------------------------------------
// GET /api/projects/:projectId/revisions — list revisions for a page
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');

    if (!pageId) {
      return errorResponse('VALIDATION_ERROR', 'pageId query parameter is required', 422);
    }

    // Verify the page belongs to this project
    const page = await prisma.page.findFirst({
      where: { id: pageId, projectId },
    });

    if (!page) {
      return errorResponse('NOT_FOUND', `Page not found: ${pageId}`, 404);
    }

    const revisions = await prisma.revision.findMany({
      where: { pageId },
      orderBy: { createdAt: 'desc' },
    });

    // Parse snapshot JSON strings back to objects
    const parsed = revisions.map((revision) => ({
      ...revision,
      snapshot: JSON.parse(revision.snapshot),
    }));

    return successResponse(parsed);
  } catch (err) {
    console.error('Failed to fetch revisions:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch revisions', 500);
  }
}

// ---------------------------------------------------------------------------
// POST /api/projects/:projectId/revisions — create a revision snapshot
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const { pageId, label } = body as { pageId: string; label?: string };

    if (!pageId) {
      return errorResponse('VALIDATION_ERROR', 'pageId is required', 422);
    }

    // Fetch the page's current treeData
    const page = await prisma.page.findFirst({
      where: { id: pageId, projectId },
    });

    if (!page) {
      return errorResponse('NOT_FOUND', `Page not found: ${pageId}`, 404);
    }

    // Create a revision with the current treeData as the snapshot
    const revision = await prisma.revision.create({
      data: {
        pageId,
        snapshot: page.treeData, // already a JSON string in the DB
        label: label ?? null,
      },
    });

    return successResponse(
      {
        ...revision,
        snapshot: JSON.parse(revision.snapshot),
      },
      201,
    );
  } catch (err) {
    console.error('Failed to create revision:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to create revision', 500);
  }
}
