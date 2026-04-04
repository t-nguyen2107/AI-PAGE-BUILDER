import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** Verify project exists before operating on its memories. */
async function verifyProject(projectId: string): Promise<Response | null> {
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
  if (!project) {
    return Response.json(
      { success: false, error: { code: 'NOT_FOUND', message: `Project not found: ${projectId}` } },
      { status: 404 },
    );
  }
  return null;
}

/**
 * GET /api/ai/profile/memories?projectId=X&category=Y&page=1&limit=20
 * List memories with pagination and optional category filter.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const category = searchParams.get('category');
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '20')));

  if (!projectId) {
    return Response.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'projectId required' } },
      { status: 422 },
    );
  }

  const notFound = await verifyProject(projectId);
  if (notFound) return notFound;

  try {
    const where = {
      projectId,
      scope: 'project' as const,
      ...(category ? { category } : {}),
    };

    const [memories, total] = await Promise.all([
      prisma.vectorEmbedding.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.vectorEmbedding.count({ where }),
    ]);

    return Response.json({
      success: true,
      data: {
        memories: memories.map((m: { id: string; category: string; content: string; metadata: string; sessionId: string | null; timesReferenced: number; createdAt: Date }) => {
          const meta = (() => { try { return JSON.parse(m.metadata || '{}') as Record<string, unknown>; } catch { return {}; } })();
          return {
            id: m.id,
            category: m.category,
            content: m.content,
            metadata: meta,
            confidence: (meta.confidence as number) ?? null,
            sessionId: m.sessionId,
            timesReferenced: m.timesReferenced,
            createdAt: m.createdAt.toISOString(),
          };
        }),
        total,
        page,
        limit,
      },
    });
  } catch (err) {
    return Response.json(
      { success: false, error: { code: 'DB_ERROR', message: String(err) } },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/ai/profile/memories?projectId=X&memoryId=Y
 * Delete a specific memory entry.
 */
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const memoryId = searchParams.get('memoryId');

  if (!projectId || !memoryId) {
    return Response.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'projectId and memoryId required' } },
      { status: 422 },
    );
  }

  const notFound = await verifyProject(projectId);
  if (notFound) return notFound;

  try {
    await prisma.vectorEmbedding.deleteMany({
      where: { id: memoryId, projectId },
    });

    return Response.json({ success: true, data: { deleted: true } });
  } catch (err) {
    return Response.json(
      { success: false, error: { code: 'DB_ERROR', message: String(err) } },
      { status: 500 },
    );
  }
}
