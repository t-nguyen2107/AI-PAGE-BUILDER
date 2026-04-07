import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildTreeSummary } from '@/lib/ai/prompts/system-prompt';
import { optimizePrompt } from '@/lib/ai/prompts/prompt-optimizer';
import * as aiMemory from '@/lib/ai/memory';
import { getProjectProfileText } from '@/lib/ai/memory-manager';
import { analyzeAndUpdateProfile } from '@/lib/ai/profile-updater';
import { searchDesignKnowledge } from '@/lib/ai/knowledge/knowledge-search';
import { autoUpdateStyleguide } from '@/lib/ai/knowledge/auto-styleguide';
import { createAIStream, createTwoPassStream } from '@/lib/ai/streaming';
import { errorResponse } from '@/lib/api-response';
import type { BaseMessage } from '@langchain/core/messages';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// POST /api/ai/stream — SSE streaming AI generation (single-pass or two-pass)
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    prompt,
    projectId,
    pageId,
    styleguideId,
    mode = 'template',
  } = body as {
    prompt: string;
    projectId: string;
    pageId: string;
    styleguideId?: string;
    /** 'template' (single-pass) | 'two-pass' (plan + per-section) | 'full' (full AI pipeline) */
    mode?: 'template' | 'two-pass' | 'full';
  };

  // --- Validate required fields ---
  if (!prompt || typeof prompt !== 'string') {
    return errorResponse('VALIDATION_ERROR', '"prompt" is required and must be a string', 422);
  }
  if (prompt.length > 5000) {
    return errorResponse('VALIDATION_ERROR', 'Prompt too long (max 5000 characters)', 422);
  }
  if (!projectId || typeof projectId !== 'string') {
    return errorResponse('VALIDATION_ERROR', '"projectId" is required', 422);
  }
  if (!pageId || typeof pageId !== 'string') {
    return errorResponse('VALIDATION_ERROR', '"pageId" is required', 422);
  }

  // --- Load context in parallel ---
  let styleguideData: { colors?: string; typography?: string; spacing?: string; cssVariables?: string } | undefined;
  let miniContext = '';
  let sessionId = '';
  let history: BaseMessage[] = [];
  let treeSummary: string | undefined;
  let projectProfile = '';

  await Promise.allSettled([
    (async () => {
      if (styleguideId) {
        const styleguide = await prisma.styleguide.findUnique({ where: { id: styleguideId } });
        if (styleguide) {
          styleguideData = { colors: styleguide.colors, typography: styleguide.typography, spacing: styleguide.spacing, cssVariables: styleguide.cssVariables };
        }
      }
    })(),
    (async () => {
      const session = await aiMemory.getOrCreateSession(projectId, pageId);
      sessionId = session.id;
      miniContext = await aiMemory.getMiniContext(session.id);
      history = await aiMemory.getSessionHistory(session.id);
    })(),
    (async () => {
      const page = await prisma.page.findUnique({ where: { id: pageId } });
      if (page?.treeData) {
        treeSummary = buildTreeSummary(page.treeData);
      }
    })(),
    getProjectProfileText(projectId, prompt).then((t) => { projectProfile = t ?? ''; }),
  ]);

  // --- Optimize prompt ---
  const { enrichedPrompt, businessType, designContext, designGuidance } = optimizePrompt(prompt);

  // --- RAG: vector knowledge lookup (non-fatal) ---
  let ragContext = '';
  try {
    const ragResult = await searchDesignKnowledge({ query: prompt, businessType: businessType ?? undefined });
    ragContext = ragResult.contextText;
  } catch (e) {
    console.warn('[ai-stream] RAG lookup failed (non-fatal):', e);
  }

  const mergedDesignContext = [designContext, ragContext].filter(Boolean).join('\n') || undefined;

  // --- Persist user message (fire-and-forget) ---
  if (sessionId) {
    aiMemory.appendUserMessage(sessionId, prompt).catch((err) => {
      console.error('[ai-stream] Failed to persist user message:', err);
    });
  }

  // --- Create the appropriate stream ---
  const signal = request.signal;

  const stream = mode === 'two-pass'
    ? createTwoPassStream(enrichedPrompt, {
        styleguideData,
        businessType: businessType ?? undefined,
        designContext: mergedDesignContext ?? undefined,
        designGuidance: designGuidance ?? undefined,
        signal,
        timeoutMs: 120_000,
      })
    : createAIStream(enrichedPrompt, {
        styleguideData,
        miniContext,
        history,
        treeSummary,
        projectProfile,
        mode: mode === 'full' ? 'full' : 'template',
        businessType: businessType ?? undefined,
        signal,
        designGuidance: designGuidance ?? undefined,
        timeoutMs: mode === 'full' ? 180_000 : 120_000,
      });

  // --- Fire-and-forget background tasks ---
  if (businessType) {
    autoUpdateStyleguide(projectId, businessType).catch((err) => {
      console.error('[ai-stream] Background styleguide update failed:', err);
    });
  }

  // Background profile analysis — attach a reader to capture the final result
  if (sessionId) {
    // We cannot await the stream here; fire-and-forget profile update
    analyzeAndUpdateProfile(projectId, sessionId).catch((err) => {
      console.error('[ai-stream] Background analysis failed:', err);
    });
  }

  // --- Return SSE response ---
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
