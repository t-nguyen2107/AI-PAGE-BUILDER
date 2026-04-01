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
// GET /api/projects/:projectId/global-sections/:sectionId — single global section
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; sectionId: string }> },
) {
  try {
    const { projectId, sectionId } = await params;

    const section = await prisma.globalSection.findFirst({
      where: { id: sectionId, projectId },
    });

    if (!section) {
      return errorResponse('NOT_FOUND', `Global section not found: ${sectionId}`, 404);
    }

    // Parse treeData JSON string back to object
    const parsed = {
      ...section,
      treeData: JSON.parse(section.treeData),
    };

    return successResponse(parsed);
  } catch (err) {
    console.error('Failed to fetch global section:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch global section', 500);
  }
}

// ---------------------------------------------------------------------------
// PUT /api/projects/:projectId/global-sections/:sectionId — update global section
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; sectionId: string }> },
) {
  try {
    const { projectId, sectionId } = await params;
    const body = await request.json();
    const { sectionName, treeData } = body as {
      sectionName?: string;
      treeData?: unknown;
    };

    // Ensure the section exists in this project
    const existing = await prisma.globalSection.findFirst({
      where: { id: sectionId, projectId },
    });
    if (!existing) {
      return errorResponse('NOT_FOUND', `Global section not found: ${sectionId}`, 404);
    }

    // Build the update payload — only include provided fields
    const data: Record<string, unknown> = {};
    if (sectionName !== undefined) data.sectionName = sectionName.trim();
    if (treeData !== undefined) data.treeData = JSON.stringify(treeData);

    if (Object.keys(data).length === 0) {
      return errorResponse('VALIDATION_ERROR', 'Provide at least one field to update', 422);
    }

    const updated = await prisma.globalSection.update({
      where: { id: sectionId },
      data,
    });

    // Parse treeData back to object for response
    const parsed = {
      ...updated,
      treeData: JSON.parse(updated.treeData),
    };

    return successResponse(parsed);
  } catch (err: unknown) {
    // Prisma record not found
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2025'
    ) {
      return errorResponse('NOT_FOUND', 'Global section not found', 404);
    }

    console.error('Failed to update global section:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to update global section', 500);
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/projects/:projectId/global-sections/:sectionId — delete global section
// ---------------------------------------------------------------------------

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; sectionId: string }> },
) {
  try {
    const { projectId, sectionId } = await params;

    // Verify the section exists in this project before deleting
    const existing = await prisma.globalSection.findFirst({
      where: { id: sectionId, projectId },
    });
    if (!existing) {
      return errorResponse('NOT_FOUND', `Global section not found: ${sectionId}`, 404);
    }

    await prisma.globalSection.delete({ where: { id: sectionId } });

    return successResponse({ deleted: true });
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2025'
    ) {
      return errorResponse('NOT_FOUND', 'Global section not found', 404);
    }

    console.error('Failed to delete global section:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to delete global section', 500);
  }
}
