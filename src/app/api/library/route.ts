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
// GET /api/library — list library items
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where = category ? { category } : {};

    const items = await prisma.userLibrary.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Parse nodeData JSON strings and split tags into arrays
    const parsed = items.map((item) => ({
      ...item,
      nodeData: JSON.parse(item.nodeData),
      tags: item.tags ? item.tags.split(',').filter(Boolean) : [],
    }));

    return successResponse(parsed);
  } catch (err) {
    console.error('Failed to fetch library items:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch library items', 500);
  }
}

// ---------------------------------------------------------------------------
// POST /api/library — save item to library
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      category,
      nodeData,
      tags,
      isPublic,
    } = body as {
      name: string;
      description?: string;
      category: string;
      nodeData: unknown;
      tags: string[];
      isPublic?: boolean;
    };

    if (!name || !category || !nodeData || !Array.isArray(tags)) {
      return errorResponse(
        'VALIDATION_ERROR',
        'name, category, nodeData, and tags (array) are required',
        422,
      );
    }

    const item = await prisma.userLibrary.create({
      data: {
        name,
        description: description ?? null,
        category,
        nodeData: JSON.stringify(nodeData),
        tags: tags.join(','),
        isPublic: isPublic ?? false,
      },
    });

    return successResponse(
      {
        ...item,
        nodeData: JSON.parse(item.nodeData),
        tags: item.tags ? item.tags.split(',').filter(Boolean) : [],
      },
      201,
    );
  } catch (err) {
    console.error('Failed to create library item:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to create library item', 500);
  }
}
