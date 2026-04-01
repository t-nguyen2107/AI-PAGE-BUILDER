import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAIStream } from '@/lib/ai/streaming';
import * as aiMemory from '@/lib/ai/memory';
import { parsePrompt } from '@/features/ai/prompt-parser';
import { generateSection } from '@/features/ai/component-generator';
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

  // Fetch styleguide
  let styleguideData: { colors?: string; typography?: string } | undefined;
  if (styleguideId) {
    try {
      const sg = await prisma.styleguide.findUnique({ where: { id: styleguideId } });
      if (sg) styleguideData = { colors: sg.colors, typography: sg.typography };
    } catch { /* non-fatal */ }
  }

  // Load session
  let miniContext = '';
  let sessionId = '';
  let history: BaseMessage[] = [];

  try {
    const session = await aiMemory.getOrCreateSession(projectId, pageId);
    sessionId = session.id;
    miniContext = await aiMemory.getMiniContext(session.id);
    history = await aiMemory.getSessionHistory(session.id);
  } catch { /* non-fatal */ }

  const capturedSessionId = sessionId;

  let stream: ReadableStream<Uint8Array>;

  try {
    stream = createAIStream(prompt, {
      styleguideData,
      miniContext: miniContext || undefined,
      history,
    });
  } catch (streamError) {
    // Fallback to template-based generation
    console.error('Stream creation failed, using template fallback:', streamError);

    const intent = parsePrompt(prompt);
    const nodes = intent.componentCategory
      ? [generateSection(intent.componentCategory as any, intent.properties)]
      : [];

    const fallbackResponse: AIGenerationResponse = {
      action: intent.action,
      nodes,
      targetNodeId: undefined,
      position: 0,
    };

    // Create a synthetic stream that immediately emits the fallback result
    const encoder = new TextEncoder();
    stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', result: fallbackResponse })}\n\n`));
        controller.close();
      },
    });
  }

  // Wrap stream to persist messages after completion
  const reader = stream.getReader();
  const encoder = new TextEncoder();

  const wrappedStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let finalResult: AIGenerationResponse | null = null;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Parse SSE to capture the final result
          const text = new TextDecoder().decode(value);
          const match = text.match(/^data: ([\s\S]+)\n\n$/);
          if (match) {
            try {
              const event = JSON.parse(match[1]);
              if (event.type === 'done') finalResult = event.result;
            } catch { /* ignore parse errors on intermediate chunks */ }
          }

          controller.enqueue(value);
        }
      } finally {
        // Persist messages after stream completes
        if (capturedSessionId && finalResult) {
          try {
            await aiMemory.appendUserMessage(capturedSessionId, prompt);

            const actionStr = finalResult.action as string;
            // For clarify: persist human-readable message text, not JSON
            const assistantContent = actionStr === 'clarify'
              ? (finalResult.message ?? '')
              : JSON.stringify(finalResult);
            await aiMemory.appendAssistantMessage(
              capturedSessionId,
              assistantContent,
              actionStr,
            );
            // Only update mini-context for generation actions, not clarify
            if (actionStr !== 'clarify') {
              await aiMemory.appendMiniContext(capturedSessionId, actionStr, prompt);
            }
          } catch (err) {
            console.error('Failed to persist session after stream:', err);
          }

          // Log to AIPromptLog
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

  return new Response(wrappedStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
