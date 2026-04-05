import { HumanMessage, AIMessage, type BaseMessage } from '@langchain/core/messages';
import { prisma } from '@/lib/prisma';

const MAX_HISTORY_MESSAGES = 20;
const MAX_STORED_MESSAGES = 60; // Keep db from growing unbounded

// ---------------------------------------------------------------------------
// Trim old messages to prevent unbounded growth
// ---------------------------------------------------------------------------

async function trimSessionMessages(sessionId: string) {
  const count = await prisma.aISessionMessage.count({ where: { sessionId } });
  if (count > MAX_STORED_MESSAGES) {
    const oldest = await prisma.aISessionMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: count - MAX_STORED_MESSAGES,
      select: { id: true },
    });
    if (oldest.length > 0) {
      await prisma.aISessionMessage.deleteMany({
        where: { id: { in: oldest.map((m) => m.id) } },
      });
    }
  }
}

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
  await trimSessionMessages(sessionId);
}

export async function appendAssistantMessage(
  sessionId: string,
  content: string,
  action?: string,
) {
  await prisma.aISessionMessage.create({
    data: { sessionId, role: 'assistant', content, action },
  });
  await trimSessionMessages(sessionId);
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
// Seed session from wizard context (called once when builder first opens)
// ---------------------------------------------------------------------------

export async function seedSessionFromWizard(
  sessionId: string,
  projectInfo: { name?: string; idea?: string; style?: string; targetAudience?: string; tone?: string; pages?: Array<{ title: string }> },
): Promise<void> {
  // Check if session already has messages (don't re-seed)
  const existing = await prisma.aISessionMessage.count({ where: { sessionId } });
  if (existing > 0) return;

  const parts: string[] = ['[Project Setup Context]'];
  if (projectInfo.name) parts.push(`Project: ${projectInfo.name}`);
  if (projectInfo.idea) parts.push(`Business: ${projectInfo.idea}`);
  if (projectInfo.style) parts.push(`Style: ${projectInfo.style}`);
  if (projectInfo.targetAudience) parts.push(`Audience: ${projectInfo.targetAudience}`);
  if (projectInfo.tone) parts.push(`Tone: ${projectInfo.tone}`);
  if (projectInfo.pages?.length) parts.push(`Pages: ${projectInfo.pages.map(p => p.title).join(', ')}`);

  const summary = parts.join('. ');

  await appendAssistantMessage(sessionId, summary, 'wizard_context');
  await appendMiniContext(sessionId, 'wizard_context', `Project created via wizard: ${projectInfo.name || 'Untitled'}`);
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
