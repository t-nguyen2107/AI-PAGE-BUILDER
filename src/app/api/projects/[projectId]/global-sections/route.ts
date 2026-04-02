import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// GET /api/projects/:projectId/global-sections — list all global sections
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return errorResponse('NOT_FOUND', `Project not found: ${projectId}`, 404);
    }

    const sections = await prisma.globalSection.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });

    // Parse treeData JSON strings back to objects
    const parsed = sections.map((section) => ({
      ...section,
      treeData: JSON.parse(section.treeData),
    }));

    return successResponse(parsed);
  } catch (err) {
    console.error('Failed to list global sections:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch global sections', 500);
  }
}

// ---------------------------------------------------------------------------
// POST /api/projects/:projectId/global-sections — create a global section
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const { sectionType, sectionName, treeData } = body as {
      sectionType?: string;
      sectionName?: string;
      treeData?: unknown;
    };

    // Validate required fields
    if (!sectionType || typeof sectionType !== 'string' || sectionType.trim().length === 0) {
      return errorResponse('VALIDATION_ERROR', 'sectionType is required', 422);
    }
    if (!sectionName || typeof sectionName !== 'string' || sectionName.trim().length === 0) {
      return errorResponse('VALIDATION_ERROR', 'sectionName is required', 422);
    }

    const validTypes = ['header', 'footer', 'nav', 'custom'];
    if (!validTypes.includes(sectionType.trim())) {
      return errorResponse('VALIDATION_ERROR', `sectionType must be one of: ${validTypes.join(', ')}`, 422);
    }

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return errorResponse('NOT_FOUND', `Project not found: ${projectId}`, 404);
    }

    // Check if a section with this sectionType already exists for this project
    const existing = await prisma.globalSection.findFirst({
      where: { projectId, sectionType: sectionType.trim() },
    });

    if (existing) {
      return errorResponse(
        'CONFLICT',
        `A global section with type "${sectionType.trim()}" already exists for this project`,
        409,
      );
    }

    // Build treeData: use provided value or default empty object
    const resolvedTreeData = treeData !== undefined
      ? JSON.stringify(treeData)
      : JSON.stringify({});

    const section = await prisma.globalSection.create({
      data: {
        projectId,
        sectionType: sectionType.trim(),
        sectionName: sectionName.trim(),
        treeData: resolvedTreeData,
      },
    });

    // Parse treeData back to object for response
    const parsed = {
      ...section,
      treeData: JSON.parse(section.treeData),
    };

    return successResponse(parsed, 201);
  } catch (err: unknown) {
    // Unique constraint violation (duplicate projectId + sectionType)
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      return errorResponse('CONFLICT', 'A global section with this type already exists in this project', 409);
    }

    console.error('Failed to create global section:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to create global section', 500);
  }
}
