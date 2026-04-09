import { NextRequest } from 'next/server';
import { createAIStream, createMakeupStream } from '@/lib/ai/streaming';
import { optimizePrompt, selectRelevantComponents } from '@/lib/ai/prompts/prompt-optimizer';
import { buildTreeSummary } from '@/lib/ai/prompts/system-prompt';
import { searchDesignKnowledge } from '@/lib/ai/knowledge/knowledge-search';
import * as aiMemory from '@/lib/ai/memory';
import { getProjectProfileText } from '@/lib/ai/memory-manager';
import { analyzeAndUpdateProfile } from '@/lib/ai/profile-updater';
import { parsePrompt } from '@/features/ai/prompt-parser';
import { generatePuckComponent } from '@/features/ai/component-generator';
import { prisma } from '@/lib/prisma';
import type { AIGenerationResponse } from '@/types/ai';
import type { BaseMessage } from '@langchain/core/messages';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for AI generation

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    prompt,
    projectId,
    pageId,
    styleguideId,
    isAutoPolish,
  } = body as {
    prompt: string;
    projectId: string;
    pageId: string;
    styleguideId?: string;
    isAutoPolish?: boolean;
  };

  if (!prompt || !projectId || !pageId) {
    return Response.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } },
      { status: 422 },
    );
  }

  if (typeof prompt === 'string' && prompt.length > 5000) {
    return Response.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Prompt too long (max 5000 characters)' } },
      { status: 422 },
    );
  }

  const encoder = new TextEncoder();

  // --- Create pipeline stream ---
  const pipelineStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (event: Record<string, unknown>) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      const close = () => {
        if (closed) return;
        closed = true;
        try { controller.close(); } catch { /* already closed */ }
      };

      let finalResult: AIGenerationResponse | null = null;
      let capturedSessionId = '';

      try {
        // STEP 1: Load context
        send({ type: 'status', step: 'loading_context', label: 'Loading page context...' });

        let styleguideData: { colors?: string; typography?: string; spacing?: string; cssVariables?: string } | undefined;
        let treeSummary: string | undefined;
        let treeDataRaw: unknown;
        let miniContext = '';
        let history: BaseMessage[] = [];
        let projectProfile = '';

        const [, , , profileResult] = await Promise.allSettled([
          (async () => {
            const page = await prisma.page.findUnique({ where: { id: pageId } });
            if (page?.treeData) {
              treeSummary = buildTreeSummary(page.treeData);
              treeDataRaw = page.treeData;
              
              // TODO: Update generationStatus once DB column exists
              // if (isAutoPolish && page.generationStatus === 'pending') {
              //   await prisma.page.update({ where: { id: pageId }, data: { generationStatus: 'polishing' } });
              // }
            }
          })(),
          (async () => {
            const session = await aiMemory.getOrCreateSession(projectId, pageId);
            capturedSessionId = session.id;

            // Seed session from wizard/project context (idempotent — checks internally for existing messages)
            try {
              const profile = await prisma.projectAIProfile.findUnique({
                where: { projectId },
                select: {
                  businessName: true,
                  businessType: true,
                  preferredStyle: true,
                  targetAudience: true,
                  tone: true,
                },
              });

              if (profile) {
                await aiMemory.seedSessionFromWizard(session.id, {
                  name: profile.businessName || undefined,
                  idea: profile.businessType || undefined,
                  style: profile.preferredStyle || undefined,
                  targetAudience: profile.targetAudience || undefined,
                  tone: profile.tone || undefined,
                });
              } else {
                // Fallback: seed from basic project info when no AI profile exists
                const project = await prisma.project.findUnique({
                  where: { id: projectId },
                  select: { name: true, description: true },
                });
                if (project) {
                  await aiMemory.seedSessionFromWizard(session.id, {
                    name: project.name || undefined,
                    idea: project.description || undefined,
                  });
                }
              }
            } catch (seedErr) {
              console.warn('[ai-stream] Wizard seed failed (non-critical):', seedErr);
            }

            miniContext = await aiMemory.getMiniContext(session.id);
            history = await aiMemory.getSessionHistory(session.id);
          })(),
          (async () => {
            if (styleguideId) {
              const sg = await prisma.styleguide.findUnique({ where: { id: styleguideId } });
              if (sg) styleguideData = { colors: sg.colors, typography: sg.typography, spacing: sg.spacing, cssVariables: sg.cssVariables };
            }
          })(),
          getProjectProfileText(projectId, prompt).then((t) => { projectProfile = t ?? ''; }),
        ]);

        if (profileResult.status === 'rejected') {
          console.error('[ai-profile] Failed to load project profile:', profileResult.reason);
        }

        // STEP 2: Optimize prompt
        send({ type: 'status', step: 'optimizing', label: 'Optimizing prompt...' });
        
        let enrichedPrompt = prompt;
        // The Intent type was previously used from @/features/ai/prompt-parser, let's use string to avoid issues
        let intent = 'unknown';
        let businessType: string | null = null;
        let designContext: string | null = null;
        let designGuidance: any = null;
        
        if (isAutoPolish) {
          // Auto polish does not need prompt optimization, we just want to polish the skeletons
          intent = 'modify';
        } else {
          const opt = optimizePrompt(prompt);
          enrichedPrompt = opt.enrichedPrompt;
          intent = opt.intent;
          businessType = opt.businessType;
          designContext = opt.designContext;
          designGuidance = opt.designGuidance;
        }

        // Select component catalog tiers based on intent + business type
        const componentTiers = selectRelevantComponents(intent as any, businessType, treeSummary);

        // Route: create_page OR isAutoPolish → makeup mode (structure + parallel polish), everything else → full AI mode
        const useMakeupMode = intent === 'create_page' || isAutoPolish;

          // RAG: vector knowledge lookup (non-fatal)
          let ragContext = '';
          try {
            const ragResult = await searchDesignKnowledge({ query: prompt, businessType: businessType ?? undefined });
            ragContext = ragResult.contextText;
          } catch (e) {
            console.warn('[ai-stream] RAG lookup failed (non-fatal):', e);
          }

          // Merge static design context with RAG knowledge
          const mergedDesignContext = [designContext, ragContext].filter(Boolean).join('\n') || undefined;

          // STEP 3-6: Create AI stream
          let aiStream: ReadableStream<Uint8Array>;
          try {
            if (useMakeupMode) {
              // Makeup mode: structure resolver + parallel per-section polish
              // treeData is stored as JSON string in DB — parse before validating
              const parsed = treeDataRaw
                ? (typeof treeDataRaw === 'string' ? JSON.parse(treeDataRaw) : treeDataRaw)
                : null;
              const validTreeData = parsed && typeof parsed === 'object' && 'content' in (parsed as Record<string, unknown>)
                ? parsed
                : undefined;
                
              aiStream = createMakeupStream(enrichedPrompt, {
                styleguideData,
                businessType: businessType ?? undefined,
                designContext: mergedDesignContext,
                designGuidance: designGuidance ?? undefined,
                signal: request.signal,
                existingTreeData: validTreeData,
                intent: isAutoPolish ? 'modify' : intent,
              });
          } else {
            // Full mode: single AI call with conversation history
            aiStream = createAIStream(enrichedPrompt, {
              styleguideData,
              miniContext: miniContext || undefined,
              treeSummary,
              history,
              projectProfile: projectProfile || undefined,
              mode: 'full',
              businessType: businessType ?? undefined,
              componentTiers,
              designGuidance: designGuidance ?? undefined,
              designContext: mergedDesignContext,
              signal: request.signal,
            });
          }
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

          send({ type: 'done', result: fallbackResponse });
          finalResult = fallbackResponse;
          return; // finally will close
        }

        // Pipe AI stream events, capture final result
        // Buffer-based SSE parsing: handles events split across reads or merged in one read
        const reader = aiStream.getReader();
        const decoder = new TextDecoder();
        let sseBuffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            controller.enqueue(value);

            // Parse SSE events from buffer
            sseBuffer += decoder.decode(value, { stream: true });
            const parts = sseBuffer.split('\n\n');
            // Keep last (potentially incomplete) part in buffer
            sseBuffer = parts.pop() ?? '';
            for (const part of parts) {
              const line = part.trim();
              if (!line.startsWith('data: ')) continue;
              try {
                const event = JSON.parse(line.slice(6));
                if (event.type === 'done') {
                  finalResult = event.result;
                }
              } catch { /* ignore parse errors on intermediate chunks */ }
            }
          }
        } finally {
          reader.releaseLock();
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown pipeline error';
        send({ type: 'error', message: msg });
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

          // Fire-and-forget: analyze session and update project AI profile
          if (capturedSessionId) {
            analyzeAndUpdateProfile(projectId, capturedSessionId).catch((err) => {
              console.error('[ai-profile] Background analysis failed:', err);
            });
          }
        }

        close();
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
