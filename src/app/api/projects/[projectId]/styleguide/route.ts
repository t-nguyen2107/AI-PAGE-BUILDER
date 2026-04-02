import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// GET /api/projects/:projectId/styleguide — get styleguide with parsed JSON fields
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;

    const styleguide = await prisma.styleguide.findUnique({
      where: { projectId },
    });

    if (!styleguide) {
      return errorResponse('NOT_FOUND', `Styleguide not found for project: ${projectId}`, 404);
    }

    // Parse all JSON string fields back to objects
    const parsed = {
      ...styleguide,
      colors: JSON.parse(styleguide.colors),
      typography: JSON.parse(styleguide.typography),
      spacing: JSON.parse(styleguide.spacing),
      componentVariants: JSON.parse(styleguide.componentVariants),
      cssVariables: JSON.parse(styleguide.cssVariables),
    };

    return successResponse(parsed);
  } catch (err) {
    console.error('Failed to fetch styleguide:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch styleguide', 500);
  }
}

// ---------------------------------------------------------------------------
// PUT /api/projects/:projectId/styleguide — update styleguide
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  try {
    const body = await request.json();
    const {
      name,
      colors,
      typography,
      spacing,
      componentVariants,
      cssVariables,
    } = body as {
      name?: string;
      colors?: unknown;
      typography?: unknown;
      spacing?: unknown;
      componentVariants?: unknown;
      cssVariables?: unknown;
    };

    // Verify styleguide exists
    const existing = await prisma.styleguide.findUnique({
      where: { projectId },
    });
    if (!existing) {
      return errorResponse('NOT_FOUND', `Styleguide not found for project: ${projectId}`, 404);
    }

    // Build update payload — only include provided fields, stringify objects
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (colors !== undefined) data.colors = JSON.stringify(colors);
    if (typography !== undefined) data.typography = JSON.stringify(typography);
    if (spacing !== undefined) data.spacing = JSON.stringify(spacing);
    if (componentVariants !== undefined) data.componentVariants = JSON.stringify(componentVariants);
    if (cssVariables !== undefined) data.cssVariables = JSON.stringify(cssVariables);

    if (Object.keys(data).length === 0) {
      return errorResponse('VALIDATION_ERROR', 'Provide at least one field to update', 422);
    }

    const updated = await prisma.styleguide.update({
      where: { projectId },
      data,
    });

    // Parse JSON fields back to objects for the response
    const parsed = {
      ...updated,
      colors: JSON.parse(updated.colors),
      typography: JSON.parse(updated.typography),
      spacing: JSON.parse(updated.spacing),
      componentVariants: JSON.parse(updated.componentVariants),
      cssVariables: JSON.parse(updated.cssVariables),
    };

    return successResponse(parsed);
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2025'
    ) {
      return errorResponse('NOT_FOUND', `Styleguide not found for project: ${projectId}`, 404);
    }

    console.error('Failed to update styleguide:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to update styleguide', 500);
  }
}
