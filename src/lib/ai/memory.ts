import { HumanMessage, AIMessage, type BaseMessage } from '@langchain/core/messages';
import { prisma } from '@/lib/prisma';

const MAX_HISTORY_MESSAGES = 20;

// ---------------------------------------------------------------------------
// Session management
// ---------------------------------------------------------------------------

export async function getOrCreateSession(projectId: string, pageId: string) {
  const existing = await prisma.aISession.findUnique({
    where: { projectId_pageId: { projectId, pageId } },
  });

  if (existing) return existing;

  return prisma.aISession.create({
    data: { projectId, pageId, miniContext: '' },
  });
}

// ---------------------------------------------------------------------------
// History — load messages as LangChain BaseMessage[]
// ---------------------------------------------------------------------------

export async function getSessionHistory(sessionId: string): Promise<BaseMessage[]> {
  const messages = await prisma.aISessionMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
    take: MAX_HISTORY_MESSAGES,
  });

  return messages.map((msg) => {
    if (msg.role === 'user') return new HumanMessage(msg.content);
    return new AIMessage(msg.content);
  });
}

// ---------------------------------------------------------------------------
// Persist messages
// ---------------------------------------------------------------------------

export async function appendUserMessage(sessionId: string, content: string) {
  await prisma.aISessionMessage.create({
    data: { sessionId, role: 'user', content },
  });
}

export async function appendAssistantMessage(
  sessionId: string,
  content: string,
  action?: string,
) {
  await prisma.aISessionMessage.create({
    data: { sessionId, role: 'assistant', content, action },
  });
}

// ---------------------------------------------------------------------------
// Mini context — running summary of what user has done in this session
// ---------------------------------------------------------------------------

export async function getMiniContext(sessionId: string): Promise<string> {
  const session = await prisma.aISession.findUnique({
    where: { id: sessionId },
    select: { miniContext: true },
  });
  return session?.miniContext ?? '';
}

export async function appendMiniContext(
  sessionId: string,
  action: string,
  description: string,
) {
  const current = await getMiniContext(sessionId);
  const entry = `[${action}] ${description}`;
  const updated = current ? `${current}\n${entry}` : entry;

  // Keep mini context under ~2000 chars (trim oldest entries)
  const trimmed = updated.length > 2000 ? updated.slice(updated.indexOf('\n', updated.length - 2000) + 1) : updated;

  await prisma.aISession.update({
    where: { id: sessionId },
    data: { miniContext: trimmed },
  });
}

// ---------------------------------------------------------------------------
// Clear session
// ---------------------------------------------------------------------------

export async function clearSession(sessionId: string) {
  await prisma.aISessionMessage.deleteMany({ where: { sessionId } });
  await prisma.aISession.update({
    where: { id: sessionId },
    data: { miniContext: '' },
  });
}
