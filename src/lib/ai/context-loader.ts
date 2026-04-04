import type { BaseMessage } from '@langchain/core/messages';
import { prisma } from '@/lib/prisma';
import { buildTreeSummary } from './prompts/system-prompt';
import * as aiMemory from './memory';

/** Loaded context shared by both generate and stream routes */
export interface AIContext {
  styleguideData?: { colors?: string; typography?: string };
  treeSummary?: string;
  miniContext: string;
  history: BaseMessage[];
  sessionId: string;
}

/**
 * Load all AI context in parallel: styleguide, page tree, session memory.
 * Non-fatal — returns partial context on individual failures.
 */
export async function loadAIContext(opts: {
  styleguideId?: string;
  projectId: string;
  pageId: string;
}): Promise<AIContext> {
  const { styleguideId, projectId, pageId } = opts;

  const [styleguideResult, pageResult, sessionResult] = await Promise.allSettled([
    styleguideId
      ? prisma.styleguide.findUnique({ where: { id: styleguideId } })
      : Promise.resolve(null),
    prisma.page.findUnique({ where: { id: pageId } }),
    aiMemory.getOrCreateSession(projectId, pageId),
  ]);

  // Styleguide
  let styleguideData: AIContext['styleguideData'];
  if (styleguideResult.status === 'fulfilled' && styleguideResult.value) {
    const sg = styleguideResult.value;
    styleguideData = { colors: sg.colors, typography: sg.typography };
  }

  // Tree summary
  let treeSummary: string | undefined;
  if (pageResult.status === 'fulfilled' && pageResult.value?.treeData) {
    treeSummary = buildTreeSummary(pageResult.value.treeData);
  }

  // Session memory
  let sessionId = '';
  let miniContext = '';
  let history: BaseMessage[] = [];
  if (sessionResult.status === 'fulfilled') {
    const session = sessionResult.value;
    sessionId = session.id;
    try { miniContext = await aiMemory.getMiniContext(session.id); } catch { /* non-fatal */ }
    try { history = await aiMemory.getSessionHistory(session.id); } catch { /* non-fatal */ }
  }

  return { styleguideData, treeSummary, miniContext, history, sessionId };
}
