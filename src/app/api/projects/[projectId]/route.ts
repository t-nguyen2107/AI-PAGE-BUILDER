import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// GET /api/projects/:projectId — single project with pages list
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        pages: { orderBy: { order: 'asc' } },
        styleguide: true,
      },
    });

    if (!project) {
      return errorResponse('NOT_FOUND', `Project not found: ${projectId}`, 404);
    }

    return successResponse(project);
  } catch (err) {
    console.error('Failed to fetch project:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch project', 500);
  }
}

// ---------------------------------------------------------------------------
// PUT /api/projects/:projectId — update project name / description
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  try {
    const body = await request.json();
    const {
      name, description,
      siteName, companyName, logo, favicon,
      gaCode, headScripts, bodyScripts,
    } = body as {
      name?: string;
      description?: string;
      siteName?: string;
      companyName?: string;
      logo?: string;
      favicon?: string;
      gaCode?: string;
      headScripts?: string;
      bodyScripts?: string;
    };

    // Ensure at least one updatable field is provided
    const hasUpdate = [name, description, siteName, companyName, logo, favicon, gaCode, headScripts, bodyScripts]
      .some((v) => v !== undefined);
    if (!hasUpdate) {
      return errorResponse(
        'VALIDATION_ERROR',
        'Provide at least one field to update',
        422,
      );
    }

    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return errorResponse('VALIDATION_ERROR', 'Project name must be a non-empty string', 422);
    }

    // Build update payload — only include fields that were provided
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name.trim();
    if (description !== undefined) data.description = description?.trim() ?? null;
    if (siteName !== undefined) data.siteName = siteName?.trim() || null;
    if (companyName !== undefined) data.companyName = companyName?.trim() || null;
    if (logo !== undefined) data.logo = logo?.trim() || null;
    if (favicon !== undefined) data.favicon = favicon?.trim() || null;
    if (gaCode !== undefined) data.gaCode = gaCode?.trim() || null;
    if (headScripts !== undefined) data.headScripts = headScripts || null;
    if (bodyScripts !== undefined) data.bodyScripts = bodyScripts || null;

    const updated = await prisma.project.update({
      where: { id: projectId },
      data,
      include: {
        pages: { orderBy: { order: 'asc' } },
        styleguide: true,
      },
    });

    return successResponse(updated);
  } catch (err: unknown) {
    // Prisma "Record not found" error code
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2025'
    ) {
      return errorResponse('NOT_FOUND', `Project not found: ${projectId}`, 404);
    }

    console.error('Failed to update project:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to update project', 500);
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/projects/:projectId — delete project (cascade deletes pages,
//   revisions, etc.)
// ---------------------------------------------------------------------------

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  try {

    await prisma.project.delete({ where: { id: projectId } });

    return successResponse({ deleted: true });
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2025'
    ) {
      return errorResponse('NOT_FOUND', `Project not found: ${projectId}`, 404);
    }

    console.error('Failed to delete project:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to delete project', 500);
  }
}
