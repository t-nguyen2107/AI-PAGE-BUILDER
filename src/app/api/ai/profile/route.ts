import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateProfile, resetProfile } from '@/lib/ai/memory-manager';

export const dynamic = 'force-dynamic';

/** Verify project exists before operating on its profile. */
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
 * GET /api/ai/profile?projectId=X
 * Return project AI profile + recent memories count.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return Response.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'projectId required' } },
      { status: 422 },
    );
  }

  const notFound = await verifyProject(projectId);
  if (notFound) return notFound;

  try {
    const [profile, memoryCount] = await Promise.all([
      prisma.projectAIProfile.findUnique({ where: { projectId } }),
      prisma.vectorEmbedding.count({ where: { projectId, scope: 'project' } }),
    ]);

    return Response.json({
      success: true,
      data: {
        profile: profile
          ? {
              businessType: profile.businessType || undefined,
              businessName: profile.businessName || undefined,
              industry: profile.industry || undefined,
              targetAudience: profile.targetAudience || undefined,
              tone: profile.tone || undefined,
              preferredStyle: profile.preferredStyle || undefined,
              language: profile.language || 'en',
              contentThemes: profile.contentThemes || undefined,
              totalSessions: profile.totalSessions,
              lastAnalysisAt: profile.lastAnalysisAt?.toISOString() ?? null,
            }
          : null,
        memoryCount,
      },
    });
  } catch (err) {
    // Graceful: return null profile if tables don't exist yet (pre-migration)
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('does not exist') || msg.includes('P2021')) {
      return Response.json({ success: true, data: { profile: null, memoryCount: 0 } });
    }
    return Response.json(
      { success: false, error: { code: 'DB_ERROR', message: msg } },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/ai/profile?projectId=X
 * Update profile fields (user manual edit).
 */
export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return Response.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'projectId required' } },
      { status: 422 },
    );
  }

  const notFound = await verifyProject(projectId);
  if (notFound) return notFound;

  try {
    const body = await request.json() as Record<string, unknown>;

    // Only allow whitelisted fields
    const allowedFields = [
      'businessType', 'businessName', 'industry', 'targetAudience',
      'tone', 'preferredStyle', 'language', 'contentThemes',
    ];

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = String(body[field]);
      }
    }

    const profile = await updateProfile(projectId, data);

    return Response.json({
      success: true,
      data: {
        businessType: profile.businessType || undefined,
        businessName: profile.businessName || undefined,
        industry: profile.industry || undefined,
        targetAudience: profile.targetAudience || undefined,
        tone: profile.tone || undefined,
        preferredStyle: profile.preferredStyle || undefined,
        language: profile.language || 'en',
        contentThemes: profile.contentThemes || undefined,
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
 * DELETE /api/ai/profile?projectId=X
 * Reset project AI profile and delete all memories.
 */
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return Response.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'projectId required' } },
      { status: 422 },
    );
  }

  const notFound = await verifyProject(projectId);
  if (notFound) return notFound;

  try {
    await Promise.all([
      resetProfile(projectId),
      prisma.vectorEmbedding.deleteMany({ where: { projectId, scope: 'project' } }),
    ]);

    return Response.json({ success: true, data: { reset: true } });
  } catch (err) {
    return Response.json(
      { success: false, error: { code: 'DB_ERROR', message: String(err) } },
      { status: 500 },
    );
  }
}
