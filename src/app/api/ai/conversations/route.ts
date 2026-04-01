import { NextRequest } from 'next/server';
import * as aiMemory from '@/lib/ai/memory';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai/conversations?projectId=X&pageId=Y
 * Fetch conversation history for a page.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const pageId = searchParams.get('pageId');

  if (!projectId || !pageId) {
    return Response.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'projectId and pageId required' } },
      { status: 422 },
    );
  }

  try {
    const session = await aiMemory.getOrCreateSession(projectId, pageId);
    const messages = await prisma.aISessionMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' },
      select: { role: true, content: true, action: true, createdAt: true },
    });

    return Response.json({
      success: true,
      data: {
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
          action: m.action ?? undefined,
        })),
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
 * DELETE /api/ai/conversations?projectId=X&pageId=Y
 * Clear session memory for a page.
 */
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const pageId = searchParams.get('pageId');

  if (!projectId || !pageId) {
    return Response.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'projectId and pageId required' } },
      { status: 422 },
    );
  }

  try {
    const session = await aiMemory.getOrCreateSession(projectId, pageId);
    await aiMemory.clearSession(session.id);
    return Response.json({ success: true, data: { cleared: true } });
  } catch (err) {
    return Response.json(
      { success: false, error: { code: 'DB_ERROR', message: String(err) } },
      { status: 500 },
    );
  }
}
