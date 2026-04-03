import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// GET /api/projects/:projectId/pages/:pageId — single page with parsed treeData
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; pageId: string }> },
) {
  try {
    const { projectId, pageId } = await params;

    const page = await prisma.page.findFirst({
      where: { id: pageId, projectId },
    });

    if (!page) {
      return errorResponse('NOT_FOUND', `Page not found: ${pageId}`, 404);
    }

    // Parse treeData JSON string back to an object
    const pageWithParsedTree = {
      ...page,
      treeData: JSON.parse(page.treeData),
    };

    return successResponse(pageWithParsedTree);
  } catch (err) {
    console.error('Failed to fetch page:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch page', 500);
  }
}

// ---------------------------------------------------------------------------
// PUT /api/projects/:projectId/pages/:pageId — update page
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; pageId: string }> },
) {
  try {
    const { projectId, pageId } = await params;
    const body = await request.json();
    const {
      title,
      slug,
      order,
      seoTitle,
      seoDescription,
      seoKeywords,
      isHomePage,
      treeData,
    } = body as {
      title?: string;
      slug?: string;
      order?: number;
      seoTitle?: string;
      seoDescription?: string;
      seoKeywords?: string;
      isHomePage?: boolean;
      treeData?: unknown;
    };

    // Ensure the page exists in this project
    const existing = await prisma.page.findFirst({
      where: { id: pageId, projectId },
    });
    if (!existing) {
      return errorResponse('NOT_FOUND', `Page not found: ${pageId}`, 404);
    }

    // Build the update payload — only include provided fields
    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title.trim();
    if (slug !== undefined) data.slug = slug.trim();
    if (order !== undefined) data.order = order;
    if (seoTitle !== undefined) data.seoTitle = seoTitle;
    if (seoDescription !== undefined) data.seoDescription = seoDescription;
    if (seoKeywords !== undefined) data.seoKeywords = seoKeywords;
    if (isHomePage !== undefined) data.isHomePage = isHomePage;
    if (treeData !== undefined) data.treeData = JSON.stringify(treeData);

    if (Object.keys(data).length === 0) {
      return errorResponse('VALIDATION_ERROR', 'Provide at least one field to update', 422);
    }

    const updated = await prisma.$transaction(async (tx) => {
      // If setting isHomePage to true, unset all other pages first
      if (isHomePage === true) {
        await tx.page.updateMany({
          where: { projectId, isHomePage: true },
          data: { isHomePage: false },
        });
      }

      return tx.page.update({
        where: { id: pageId },
        data,
      });
    });

    // Bust ISR cache for the preview page
    revalidatePath(`/preview/${projectId}/${pageId}`);

    return successResponse(updated);
  } catch (err: unknown) {
    // Prisma record not found
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2025'
    ) {
      return errorResponse('NOT_FOUND', `Page not found`, 404);
    }

    // Unique constraint violation (duplicate slug)
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      return errorResponse('CONFLICT', 'A page with this slug already exists in this project', 409);
    }

    console.error('Failed to update page:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to update page', 500);
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/projects/:projectId/pages/:pageId — delete page
// ---------------------------------------------------------------------------

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; pageId: string }> },
) {
  try {
    const { projectId, pageId } = await params;

    // Verify the page exists in this project before deleting
    const existing = await prisma.page.findFirst({
      where: { id: pageId, projectId },
    });
    if (!existing) {
      return errorResponse('NOT_FOUND', `Page not found: ${pageId}`, 404);
    }

    await prisma.page.delete({ where: { id: pageId } });

    return successResponse({ deleted: true });
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2025'
    ) {
      return errorResponse('NOT_FOUND', `Page not found`, 404);
    }

    console.error('Failed to delete page:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to delete page', 500);
  }
}
