import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { invokeAIChain } from '@/lib/ai/chain';
import { buildTreeSummary } from '@/lib/ai/prompts/system-prompt';
import { optimizePrompt, resolveNameToId } from '@/lib/ai/prompts/prompt-optimizer';
import * as aiMemory from '@/lib/ai/memory';
import { parsePrompt } from '@/features/ai/prompt-parser';
import { generateSection, generatePuckComponent } from '@/features/ai/component-generator';
import { successResponse, errorResponse } from '@/lib/api-response';
import { validateTemplateResponse } from '@/lib/ai/prompts/template-schema';
import { buildTemplatePrompt } from '@/lib/ai/prompts/template-prompt';
import { createModel } from '@/lib/ai/provider';
import { extractJSON } from '@/lib/ai/streaming';
import { orderPuckComponents } from '@/lib/ai/puck-adapter';
import { generateId } from '@/lib/id';
import type { ComponentData } from '@puckeditor/core';
import { AIAction } from '@/types/enums';

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
  if (!projectId || typeof projectId !== 'string') {
    return errorResponse('VALIDATION_ERROR', '"projectId" is required', 422);
  }
  if (!pageId || typeof pageId !== 'string') {
    return errorResponse('VALIDATION_ERROR', '"pageId" is required', 422);
  }

  // --- Fetch styleguide data if provided ---
  let styleguideData: { colors?: string; typography?: string } | undefined;

  if (styleguideId) {
    try {
      const styleguide = await prisma.styleguide.findUnique({
        where: { id: styleguideId },
      });
      if (styleguide) {
        styleguideData = {
          colors: styleguide.colors,
          typography: styleguide.typography,
        };
      }
    } catch (err) {
      console.error('Failed to fetch styleguide:', err);
    }
  }

  // --- Load session memory ---
  let miniContext = '';
  let sessionId = '';

  try {
    const session = await aiMemory.getOrCreateSession(projectId, pageId);
    sessionId = session.id;
    miniContext = await aiMemory.getMiniContext(session.id);
  } catch (err) {
    console.error('Failed to load session memory:', err);
    // Non-fatal — continue without memory
  }

  // --- Load conversation history ---
  let history: import('@langchain/core/messages').BaseMessage[] = [];
  if (sessionId) {
    try {
      history = await aiMemory.getSessionHistory(sessionId);
    } catch (err) {
      console.error('Failed to load session history:', err);
    }
  }

  // --- Build tree context from current page ---
  let treeSummary: string | undefined;
  try {
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (page?.treeData) {
      treeSummary = buildTreeSummary(page.treeData);
    }
  } catch (err) {
    console.error('Failed to build tree context:', err);
  }

  // --- Optimize prompt with context ---
  const { enrichedPrompt, nameRefs, intent, businessType } = optimizePrompt(prompt);

  // --- Resolve @name references to targetNodeId ---
  let resolvedTargetNodeId = targetNodeId;
  if (!resolvedTargetNodeId && nameRefs.length > 0) {
    try {
      const page = await prisma.page.findUnique({ where: { id: pageId } });
      if (page?.treeData) {
        resolvedTargetNodeId = resolveNameToId(page.treeData, nameRefs);
      }
    } catch { /* non-fatal */ }
  }

  // --- Template mode for full-page generation ---
  if (intent === 'create_page') {
    try {
      const model = createModel();
      const tmplPrompt = buildTemplatePrompt({ businessType: businessType ?? undefined, styleguideData });
      const messages = await tmplPrompt.formatMessages({ input: enrichedPrompt });
      const response = await model.invoke(messages);

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
  let chainResult: { data: import('@/types/ai').AIGenerationResponse | null; error: string | null; raw: unknown };
  let chainError: string | null = null;

  try {
    chainResult = await invokeAIChain(enrichedPrompt, {
      styleguideData,
      miniContext: miniContext || undefined,
      history,
      treeSummary,
    });
  } catch (err) {
    chainError = err instanceof Error ? err.message : 'Unknown error from AI chain';

    // Fallback to template-based generation
    try {
      const intent = parsePrompt(prompt);
      const components = intent.componentCategory
        ? [generatePuckComponent(intent.componentCategory as any, intent.properties)]
        : [];

      if (components.length > 0) {
        const fallbackResponse: import('@/types/ai').AIGenerationResponse = {
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
