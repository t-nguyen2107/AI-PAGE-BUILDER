/**
 * Profile Updater — merges session insights into ProjectAIProfile + VectorEmbedding.
 *
 * Called fire-and-forget after each AI generation stream completes.
 * Confidence scoring: newer insights override older ones.
 */

import { prisma } from '@/lib/prisma';
import { analyzeSession, type ExtractedInsight } from './session-analyzer';
import { storeProjectInsight } from './memory-manager';

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Analyze a session and update the project's AI profile.
 * Safe to call fire-and-forget — all errors are caught internally.
 */
export async function analyzeAndUpdateProfile(
  projectId: string,
  sessionId: string,
): Promise<void> {
  try {
    const insights = await analyzeSession(projectId, sessionId);
    if (insights.length === 0) return;

    // 1. Store all insights as vector memories (for semantic recall)
    const storePromises = insights
      .filter((i) => i.confidence >= 0.5)
      .map((insight) =>
        storeProjectInsight(projectId, {
          category: insight.category,
          content: insight.content,
          confidence: insight.confidence,
          source: 'session_analysis',
          sessionId,
        }),
      );
    await Promise.allSettled(storePromises);

    // 2. Merge high-confidence insights into structured profile
    const profileUpdates = mergeInsightsToProfile(insights);
    if (Object.keys(profileUpdates).length > 0) {
      await prisma.projectAIProfile.upsert({
        where: { projectId },
        update: {
          ...profileUpdates,
          totalSessions: { increment: 1 },
          lastAnalysisAt: new Date(),
        },
        create: {
          projectId,
          ...profileUpdates,
          totalSessions: 1,
          lastAnalysisAt: new Date(),
        },
      });
    } else {
      // Still increment session count
      await prisma.projectAIProfile.upsert({
        where: { projectId },
        update: { totalSessions: { increment: 1 }, lastAnalysisAt: new Date() },
        create: { projectId, totalSessions: 1, lastAnalysisAt: new Date() },
      });
    }
  } catch (err) {
    console.error('[ai-profile] Analysis failed:', err);
  }
}

// ─── Merge Logic ──────────────────────────────────────────────────────────────

interface ProfileFields {
  businessType?: string;
  businessName?: string;
  industry?: string;
  tone?: string;
  preferredStyle?: string;
  language?: string;
  contentThemes?: string;
}

function mergeInsightsToProfile(insights: ExtractedInsight[]): ProfileFields {
  const updates: ProfileFields = {};
  const highConfidence = insights.filter((i) => i.confidence >= 0.7 && i.profileField);

  for (const insight of highConfidence) {
    const field = insight.profileField;
    const value = insight.profileValue;
    if (field && value) {
      // Only update if not already set (first detection wins for facts)
      // Preferences can be updated if confidence is high enough
      if (insight.category === 'fact' || insight.category === 'instruction') {
        (updates as Record<string, string>)[field] = value;
      }
    }
  }

  return updates;
}
