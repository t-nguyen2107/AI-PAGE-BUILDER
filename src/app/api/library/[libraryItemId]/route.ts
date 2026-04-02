import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// GET /api/library/:libraryItemId — get single library item
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ libraryItemId: string }> },
) {
  try {
    const { libraryItemId } = await params;

    const item = await prisma.userLibrary.findUnique({
      where: { id: libraryItemId },
    });

    if (!item) {
      return errorResponse('NOT_FOUND', `Library item not found: ${libraryItemId}`, 404);
    }

    return successResponse({
      ...item,
      nodeData: JSON.parse(item.nodeData),
      tags: item.tags ? item.tags.split(',').filter(Boolean) : [],
    });
  } catch (err) {
    console.error('Failed to fetch library item:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch library item', 500);
  }
}

// ---------------------------------------------------------------------------
// PUT /api/library/:libraryItemId — update library item
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ libraryItemId: string }> },
) {
  try {
    const { libraryItemId } = await params;
    const body = await request.json();
    const {
      name,
      description,
      category,
      nodeData,
      tags,
      isPublic,
    } = body as {
      name?: string;
      description?: string;
      category?: string;
      nodeData?: unknown;
      tags?: string[];
      isPublic?: boolean;
    };

    // Verify the item exists
    const existing = await prisma.userLibrary.findUnique({
      where: { id: libraryItemId },
    });

    if (!existing) {
      return errorResponse('NOT_FOUND', `Library item not found: ${libraryItemId}`, 404);
    }

    // Build update payload — only include provided fields
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (category !== undefined) data.category = category;
    if (nodeData !== undefined) data.nodeData = JSON.stringify(nodeData);
    if (tags !== undefined) data.tags = Array.isArray(tags) ? tags.join(',') : tags;
    if (isPublic !== undefined) data.isPublic = isPublic;

    if (Object.keys(data).length === 0) {
      return errorResponse('VALIDATION_ERROR', 'Provide at least one field to update', 422);
    }

    const updated = await prisma.userLibrary.update({
      where: { id: libraryItemId },
      data,
    });

    return successResponse({
      ...updated,
      nodeData: JSON.parse(updated.nodeData),
      tags: updated.tags ? updated.tags.split(',').filter(Boolean) : [],
    });
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2025'
    ) {
      return errorResponse('NOT_FOUND', 'Library item not found', 404);
    }

    console.error('Failed to update library item:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to update library item', 500);
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/library/:libraryItemId — delete library item
// ---------------------------------------------------------------------------

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ libraryItemId: string }> },
) {
  try {
    const { libraryItemId } = await params;

    // Verify the item exists before deleting
    const existing = await prisma.userLibrary.findUnique({
      where: { id: libraryItemId },
    });

    if (!existing) {
      return errorResponse('NOT_FOUND', `Library item not found: ${libraryItemId}`, 404);
    }

    await prisma.userLibrary.delete({ where: { id: libraryItemId } });

    return successResponse({ deleted: true });
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2025'
    ) {
      return errorResponse('NOT_FOUND', 'Library item not found', 404);
    }

    console.error('Failed to delete library item:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to delete library item', 500);
  }
}
