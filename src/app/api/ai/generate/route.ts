import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { invokeAIChain } from '@/lib/ai/chain';
import { buildTreeSummary } from '@/lib/ai/prompts/system-prompt';
import { optimizePrompt, resolveNameToId } from '@/lib/ai/prompts/prompt-optimizer';
import * as aiMemory from '@/lib/ai/memory';
import { getProjectProfileText } from '@/lib/ai/memory-manager';
import { analyzeAndUpdateProfile } from '@/lib/ai/profile-updater';
import { searchDesignKnowledge } from '@/lib/ai/knowledge/knowledge-search';
import { autoUpdateStyleguide } from '@/lib/ai/knowledge/auto-styleguide';
import { parsePrompt } from '@/features/ai/prompt-parser';
import { generatePuckComponent } from '@/features/ai/component-generator';
import { successResponse, errorResponse } from '@/lib/api-response';
import { validateTemplateResponse } from '@/lib/ai/prompts/template-schema';
import { buildTemplatePrompt } from '@/lib/ai/prompts/template-prompt';
import { createFastModelBundle } from '@/lib/ai/provider';
import { extractJSON } from '@/lib/ai/streaming';
import { orderPuckComponents } from '@/lib/ai/puck-adapter';
import { generateId } from '@/lib/id';
import type { ComponentData } from '@puckeditor/core';
import { AIAction, ComponentCategory } from '@/types/enums';
import type { AIGenerationResponse } from '@/types/ai';
import type { BaseMessage } from '@langchain/core/messages';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// POST /api/ai/generate — AI prompt-to-JSON generation (LangChain)
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    prompt,
    projectId,
    pageId,
    targetNodeId,
    position,
    styleguideId,
  } = body as {
    prompt: string;
    projectId: string;
    pageId: string;
    targetNodeId?: string;
    position?: number;
    styleguideId?: string;
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
  let ragContext = '';

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

  // --- Optimize prompt with context ---
  const { enrichedPrompt, nameRefs, intent, businessType, designContext, designGuidance } = optimizePrompt(prompt);

  // --- RAG: vector knowledge lookup (non-fatal, runs after businessType is resolved) ---
  try {
    const ragResult = await searchDesignKnowledge({ query: prompt, businessType: businessType ?? undefined });
    ragContext = ragResult.contextText;
  } catch (e) {
    console.warn('[ai-generate] RAG lookup failed (non-fatal):', e);
  }

  // Merge static design context with RAG knowledge (RAG augments static)
  const mergedDesignContext = [designContext, ragContext].filter(Boolean).join('\n') || undefined;

  // --- Resolve @name references to targetNodeId ---
  let resolvedTargetNodeId = targetNodeId;
  if (!resolvedTargetNodeId && nameRefs.length > 0) {
    try {
      const page = await prisma.page.findUnique({ where: { id: pageId } });
      if (page?.treeData) {
        resolvedTargetNodeId = resolveNameToId(page.treeData, nameRefs);
      }
    } catch (resolveErr) {
      console.warn('[generate/route] Name resolution failed (non-fatal):', resolveErr);
    }
  }

  // --- Template mode for full-page generation ---
  if (intent === 'create_page') {
    try {
      // Template mode: use fast model (glm-4-flash) with reduced maxTokens
      const { model, jsonCallOptions } = createFastModelBundle({ maxTokens: 4096 });
      const tmplPrompt = buildTemplatePrompt({ businessType: businessType ?? undefined, styleguideData, designContext: mergedDesignContext ?? undefined });
      const messages = await tmplPrompt.formatMessages({ input: enrichedPrompt });
      const response = await model.invoke(messages, jsonCallOptions);

      const text = typeof response.content === 'string' ? response.content : '';
      const parsed = extractJSON(text);

      if (parsed) {
        const { data: plan, error: planError } = validateTemplateResponse(parsed);
        if (plan && !planError) {
          // Build ComponentData with auto-generated IDs, order by section priority
          const components: ComponentData[] = plan.components.map((c) => ({
            type: c.type,
            props: {
              id: generateId(),
              ...c.props,
            },
          }));
          const ordered = orderPuckComponents(components);

          return successResponse({
            action: AIAction.FULL_PAGE,
            components: ordered,
            targetComponentId: resolvedTargetNodeId ?? null,
            position: position ?? 0,
            message: `Generated page with ${ordered.length} components`,
          });
        }
      }
      // If template mode fails, fall through to full AI chain
      console.warn('[generate/route] Template mode failed, falling back to full AI chain');
    } catch (templateErr) {
      console.warn('[generate/route] Template mode error, falling back:', templateErr);
    }
  }

  // --- Invoke LangChain (full mode or template fallback) ---
  let chainResult: { data: AIGenerationResponse | null; error: string | null; raw: unknown };
  let chainError: string | null = null;

  try {
    chainResult = await invokeAIChain(enrichedPrompt, {
      styleguideData,
      miniContext: miniContext || undefined,
      history,
      treeSummary,
      projectProfile: projectProfile || undefined,
      designContext: mergedDesignContext ?? undefined,
      designGuidance: designGuidance ?? undefined,
    });
  } catch (err) {
    chainError = err instanceof Error ? err.message : 'Unknown error from AI chain';

    // Fallback to template-based generation
    try {
      const intent = parsePrompt(prompt);
      const components = intent.componentCategory
        ? [generatePuckComponent(intent.componentCategory as ComponentCategory, intent.properties)]
        : [];

      if (components.length > 0) {
        const fallbackResponse: AIGenerationResponse = {
          action: intent.action,
          components,
          targetComponentId: targetNodeId ?? undefined,
          position: position ?? 0,
        };

        chainResult = {
          data: fallbackResponse,
          error: null,
          raw: fallbackResponse,
        };
        chainError = null;
      } else {
        chainResult = { data: null, error: chainError, raw: null };
      }
    } catch (fallbackErr) {
      // Fallback also failed, return original error
      chainResult = { data: null, error: chainError, raw: null };
    }
  }

  const { data: responseData, error: validationError } = chainResult;
  const overallSuccess = responseData !== null;

  // --- Build final response ---
  const finalData = responseData
    ? {
        action: responseData.action,
        components: responseData.components,
        targetComponentId: responseData.targetComponentId ?? resolvedTargetNodeId ?? null,
        position: responseData.position ?? position ?? 0,
        message: responseData.message ?? null,
      }
    : null;

  // --- Persist session messages ---
  if (sessionId) {
    try {
      await aiMemory.appendUserMessage(sessionId, prompt);

      if (overallSuccess && finalData) {
        const actionStr = finalData.action as string;
        const assistantContent = finalData.message
          ?? `${actionStr.replace(/_/g, ' ')} applied successfully`;
        await aiMemory.appendAssistantMessage(
          sessionId,
          assistantContent,
          actionStr,
        );
        // Only update mini-context for generation actions, not clarify
        if (actionStr !== 'clarify') {
          await aiMemory.appendMiniContext(sessionId, actionStr, prompt);
        }
      }
    } catch (err) {
      console.error('Failed to persist session messages:', err);
    }
  }

  // --- Log interaction to AIPromptLog ---
  try {
    await prisma.aIPromptLog.create({
      data: {
        projectId,
        pageId,
        prompt,
        action: (finalData?.action as string) ?? 'unknown',
        response: chainResult.raw ? JSON.stringify(chainResult.raw) : '',
        success: overallSuccess,
        errorMessage: chainError ?? validationError ?? null,
      },
    });
  } catch (logErr) {
    console.error('Failed to log AI prompt interaction:', logErr);
  }

  // --- Fire-and-forget: analyze session and update project AI profile ---
  if (sessionId) {
    analyzeAndUpdateProfile(projectId, sessionId).catch((err) => {
      console.error('[ai-profile] Background analysis failed:', err);
    });
  }

  // --- Fire-and-forget: auto-update styleguide if using defaults ---
  if (businessType) {
    autoUpdateStyleguide(projectId, businessType).catch((err) => {
      console.error('[auto-styleguide] Background styleguide update failed:', err);
    });
  }

  // --- Return error or success ---
  if (chainError) {
    return errorResponse('AI_CHAIN_ERROR', chainError, 502);
  }

  if (!overallSuccess || !finalData) {
    return errorResponse(
      'AI_VALIDATION_ERROR',
      validationError ?? 'AI response failed validation',
      422,
    );
  }

  return successResponse(finalData);
}
