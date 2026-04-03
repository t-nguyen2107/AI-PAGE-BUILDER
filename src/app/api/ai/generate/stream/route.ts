import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAIStream } from '@/lib/ai/streaming';
import { buildTreeSummary } from '@/lib/ai/prompts/system-prompt';
import { optimizePrompt, resolveNameToId } from '@/lib/ai/prompts/prompt-optimizer';
import * as aiMemory from '@/lib/ai/memory';
import { parsePrompt } from '@/features/ai/prompt-parser';
import { generatePuckComponent } from '@/features/ai/component-generator';
import type { AIGenerationResponse } from '@/types/ai';
import type { BaseMessage } from '@langchain/core/messages';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    prompt,
    projectId,
    pageId,
    styleguideId,
  } = body as {
    prompt: string;
    projectId: string;
    pageId: string;
    styleguideId?: string;
  };

  if (!prompt || !projectId || !pageId) {
    return Response.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } },
      { status: 422 },
    );
  }

  const encoder = new TextEncoder();

  // --- Create pipeline stream ---
  const pipelineStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      let finalResult: AIGenerationResponse | null = null;
      let capturedSessionId = '';

      try {
        // STEP 1: Load context
        send({ type: 'status', step: 'loading_context', label: 'Loading page context...' });

        let styleguideData: { colors?: string; typography?: string } | undefined;
        if (styleguideId) {
          try {
            const sg = await prisma.styleguide.findUnique({ where: { id: styleguideId } });
            if (sg) styleguideData = { colors: sg.colors, typography: sg.typography };
          } catch { /* non-fatal */ }
        }

        let treeSummary: string | undefined;
        try {
          const page = await prisma.page.findUnique({ where: { id: pageId } });
          if (page?.treeData) {
            treeSummary = buildTreeSummary(page.treeData);
          }
        } catch { /* non-fatal */ }

        let miniContext = '';
        let history: BaseMessage[] = [];
        try {
          const session = await aiMemory.getOrCreateSession(projectId, pageId);
          capturedSessionId = session.id;
          miniContext = await aiMemory.getMiniContext(session.id);
          history = await aiMemory.getSessionHistory(session.id);
        } catch { /* non-fatal */ }

        // STEP 2: Optimize prompt
        send({ type: 'status', step: 'optimizing', label: 'Optimizing prompt...' });
        const { enrichedPrompt, nameRefs, intent, businessType } = optimizePrompt(prompt);

        // Route: create_page → template mode, everything else → full AI mode
        const useTemplateMode = intent === 'create_page';

        // STEP 3-6: Create AI stream
        let aiStream: ReadableStream<Uint8Array>;
        try {
          aiStream = createAIStream(enrichedPrompt, {
            styleguideData,
            miniContext: miniContext || undefined,
            treeSummary,
            history,
            mode: useTemplateMode ? 'template' : 'full',
            businessType: businessType ?? undefined,
          });
        } catch (streamError) {
          // Fallback to template-based generation
          console.error('Stream creation failed, using template fallback:', streamError);

          const parsedIntent = parsePrompt(prompt);
          const components = parsedIntent.componentCategory
            ? [generatePuckComponent(parsedIntent.componentCategory as never, parsedIntent.properties)]
            : [];

          const fallbackResponse: AIGenerationResponse = {
            action: parsedIntent.action,
            components,
            message: 'Generated from template fallback.',
          };

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', result: fallbackResponse })}\n\n`));
          finalResult = fallbackResponse;
          controller.close();
          return;
        }

        // Pipe AI stream events, capture final result
        const reader = aiStream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = new TextDecoder().decode(value);
            const match = text.match(/^data: ([\s\S]+)\n\n$/);
            if (match) {
              try {
                const event = JSON.parse(match[1]);
                if (event.type === 'done') {
                  finalResult = event.result;
                }
              } catch { /* ignore parse errors on intermediate chunks */ }
            }

            controller.enqueue(value);
          }
        } finally {
          reader.releaseLock();
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown pipeline error';
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: msg })}\n\n`));
      } finally {
        // Persist messages after stream completes
        if (capturedSessionId && finalResult) {
          try {
            await aiMemory.appendUserMessage(capturedSessionId, prompt);

            const actionStr = finalResult.action as string;
            const assistantContent = finalResult.message
              ?? `${actionStr.replace(/_/g, ' ')} applied successfully`;
            await aiMemory.appendAssistantMessage(capturedSessionId, assistantContent, actionStr);
            if (actionStr !== 'clarify') {
              await aiMemory.appendMiniContext(capturedSessionId, actionStr, prompt);
            }
          } catch (err) {
            console.error('Failed to persist session after stream:', err);
          }

          try {
            await prisma.aIPromptLog.create({
              data: {
                projectId,
                pageId,
                prompt,
                action: finalResult.action as string,
                response: JSON.stringify(finalResult),
                success: true,
              },
            });
          } catch { /* non-fatal */ }
        }

        controller.close();
      }
    },
  });

  return new Response(pipelineStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
