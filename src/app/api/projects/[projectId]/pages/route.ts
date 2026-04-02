import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { successResponse, errorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Default empty treeData for a new page
// ---------------------------------------------------------------------------

function buildDefaultTree(title: string, slug: string): string {
  const now = new Date().toISOString();
  const id = () => nanoid(10);

  const tree = {
    id: `page_${id()}`,
    type: 'page',
    tag: 'main',
    children: [],
    meta: { title, slug, createdAt: now, updatedAt: now },
  };

  return JSON.stringify(tree);
}

// ---------------------------------------------------------------------------
// GET /api/projects/:projectId/pages — list pages (optional ?pageId= filter)
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
    const { searchParams } = request.nextUrl;
    const pageId = searchParams.get('pageId') ?? undefined;

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return errorResponse('NOT_FOUND', `Project not found: ${projectId}`, 404);
    }

    if (pageId) {
      // Return single page matching the filter
      const page = await prisma.page.findFirst({
        where: { id: pageId, projectId },
        orderBy: { order: 'asc' },
      });

      if (!page) {
        return errorResponse('NOT_FOUND', `Page not found: ${pageId}`, 404);
      }

      return successResponse([page]);
    }

    // Return all pages ordered by order
    const pages = await prisma.page.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });

    // Parse treeData JSON strings to objects (like the single-page GET does)
    const parsed = pages.map((p) => ({
      ...p,
      treeData: typeof p.treeData === 'string' ? JSON.parse(p.treeData) : p.treeData,
    }));

    return successResponse(parsed);
  } catch (err) {
    console.error('Failed to list pages:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch pages', 500);
  }
}

// ---------------------------------------------------------------------------
// POST /api/projects/:projectId/pages — create a new page
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const { title, slug, isHomePage, treeData } = body as {
      title?: string;
      slug?: string;
      isHomePage?: boolean;
      treeData?: unknown;
    };

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return errorResponse('VALIDATION_ERROR', 'Page title is required', 422);
    }
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      return errorResponse('VALIDATION_ERROR', 'Page slug is required', 422);
    }

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return errorResponse('NOT_FOUND', `Project not found: ${projectId}`, 404);
    }

    const setHomePage = isHomePage === true;

    // Determine the order — place after the last existing page
    const lastPage = await prisma.page.findFirst({
      where: { projectId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const nextOrder = (lastPage?.order ?? -1) + 1;

    // Build treeData: use provided value or generate default
    const resolvedTreeData = treeData !== undefined
      ? JSON.stringify(treeData)
      : buildDefaultTree(title.trim(), slug.trim());

    const page = await prisma.$transaction(async (tx) => {
      // If this page is the home page, unset all others
      if (setHomePage) {
        await tx.page.updateMany({
          where: { projectId, isHomePage: true },
          data: { isHomePage: false },
        });
      }

      return tx.page.create({
        data: {
          projectId,
          title: title.trim(),
          slug: slug.trim(),
          isHomePage: setHomePage,
          order: nextOrder,
          treeData: resolvedTreeData,
        },
      });
    });

    return successResponse(page, 201);
  } catch (err: unknown) {
    // Unique constraint violation (duplicate slug)
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      return errorResponse('CONFLICT', 'A page with this slug already exists in this project', 409);
    }

    console.error('Failed to create page:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to create page', 500);
  }
}
