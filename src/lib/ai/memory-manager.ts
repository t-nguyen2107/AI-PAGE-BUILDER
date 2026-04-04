/**
 * Memory Manager — high-level memory operations combining
 * structured profile + vector similarity search.
 *
 * This is the main entry point for the AI memory system.
 */

import { prisma } from '@/lib/prisma';
import { searchVectors, storeVector, type VectorSearchResult } from './vector-store';
import { serializeProfileForPrompt, type ProjectContext } from './profile-serializer';
import { safeJsonParse } from './utils';

export interface Insight {
  category: 'preference' | 'correction' | 'pattern' | 'fact' | 'instruction';
  content: string;
  confidence: number; // 0-1
  source: 'session_analysis' | 'user_edit' | 'explicit';
  sessionId?: string;
}

export interface ProjectProfileData {
  businessType?: string;
  businessName?: string;
  industry?: string;
  targetAudience?: string;
  tone?: string;
  preferredStyle?: string;
  language?: string;
  contentThemes?: string;   // JSON string array
  componentPrefs?: string;  // JSON object
}

// ─── Profile Retrieval ────────────────────────────────────────────────────────

/**
 * Get project profile and relevant memories for prompt injection.
 */
export async function getProjectContext(projectId: string, userQuery?: string): Promise<ProjectContext> {
  const [profile, relevantMemories] = await Promise.all([
    prisma.projectAIProfile.findUnique({ where: { projectId } }),
    userQuery
      ? searchVectors(userQuery, {
          scopes: ['project'],
          projectId,
          topK: 5,
          minScore: 0.5,
        })
      : getRecentMemories(projectId),
  ]);

  return {
    profile: profile
      ? {
          businessType: profile.businessType || undefined,
          businessName: profile.businessName || undefined,
          industry: profile.industry || undefined,
          targetAudience: profile.targetAudience || undefined,
          tone: profile.tone || undefined,
          preferredStyle: profile.preferredStyle || undefined,
          language: profile.language || undefined,
          contentThemes: profile.contentThemes || undefined,
          componentPrefs: profile.componentPrefs || undefined,
          memoryNotes: profile.memoryNotes || undefined,
        }
      : null,
    relevantMemories: relevantMemories.map(memoryToItem),
  };
}

/**
 * Get serialized project context for AI prompt injection.
 * Returns compact text (<800 chars) or empty string.
 */
export async function getProjectProfileText(projectId: string, userQuery?: string): Promise<string> {
  const ctx = await getProjectContext(projectId, userQuery);
  return serializeProfileForPrompt(ctx);
}

// ─── Memory Storage ───────────────────────────────────────────────────────────

/**
 * Store an insight as a vector memory entry.
 */
export async function storeProjectInsight(
  projectId: string,
  insight: Insight,
): Promise<string> {
  return storeVector({
    projectId,
    scope: 'project',
    category: insight.category,
    content: insight.content,
    metadata: {
      confidence: insight.confidence,
      source: insight.source,
    },
    sessionId: insight.sessionId,
  });
}

// ─── Profile CRUD ─────────────────────────────────────────────────────────────

/**
 * Get or create a project AI profile.
 */
export async function getOrCreateProfile(projectId: string) {
  return prisma.projectAIProfile.upsert({
    where: { projectId },
    update: {},
    create: { projectId },
  });
}

/**
 * Update project profile fields.
 */
export async function updateProfile(
  projectId: string,
  data: Partial<ProjectProfileData>,
) {
  return prisma.projectAIProfile.upsert({
    where: { projectId },
    update: { ...data },
    create: { projectId, ...data },
  });
}

/**
 * Reset project profile to defaults.
 */
export async function resetProfile(projectId: string) {
  await prisma.projectAIProfile.deleteMany({ where: { projectId } });
}

/**
 * Get recent memories for a project (fallback when no query for semantic search).
 */
async function getRecentMemories(projectId: string): Promise<VectorSearchResult[]> {
  const entries = await prisma.vectorEmbedding.findMany({
    where: { projectId, scope: 'project' },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return entries.map((e) => ({
    id: e.id,
    content: e.content,
    metadata: safeJsonParse(e.metadata),
    score: 1,
    scope: e.scope,
    category: e.category,
    createdAt: e.createdAt,
  }));
}

function memoryToItem(m: VectorSearchResult): { content: string; category: string; score: number } {
  return {
    content: m.content,
    category: m.category,
    score: m.score,
  };
}
