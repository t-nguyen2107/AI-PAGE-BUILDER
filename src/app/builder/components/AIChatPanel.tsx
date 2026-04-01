'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useBuilderStore } from '@/store';
import type { ChatMessage } from '@/store/builder-store';
import { apiClient } from '@/lib/api-client';
import type { AIGenerationResponse, DOMNode } from '@/types';
import { NodeType, SemanticTag } from '@/types/enums';

// ============================================================
// Quick action slash commands — Stitch style
// ============================================================
const SLASH_COMMANDS = [
  { label: '/OPTIMIZE', icon: 'auto_fix_high', prompt: 'Optimize the current layout for better visual hierarchy and spacing' },
  { label: '/LAYOUT', icon: 'view_quilt', prompt: 'Generate a new section layout' },
  { label: '/COLORS', icon: 'palette', prompt: 'Suggest a color scheme update for the current page' },
];

// ============================================================
// ThinkingStep — animated step indicator for AI processing
// ============================================================
function ThinkingStep({ label, delay }: { label: string; delay: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  if (!visible) return null;
  return (
    <div className="flex items-center gap-2 animate-[fadeIn_0.3s_ease-in]">
      <span className="w-1 h-1 rounded-full bg-on-surface-variant/40" />
      <span className="text-[11px] text-on-surface-outline">{label}</span>
    </div>
  );
}

// ============================================================
// AIChatPanel — Full Stitch-style chat interface with streaming
// ============================================================
export function AIChatPanel({ projectId }: { projectId: string }) {
  const chatMessages = useBuilderStore((s) => s.chatMessages);
  const addChatMessage = useBuilderStore((s) => s.addChatMessage);
  const updateChatMessage = useBuilderStore((s) => s.updateChatMessage);
  const currentPageId = useBuilderStore((s) => s.currentPageId);
  const tree = useBuilderStore((s) => s.tree);
  const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
  const applyAIDiff = useBuilderStore((s) => s.applyAIDiff);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const accumulatedRef = useRef('');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, streamingText]);

  useEffect(() => {
    if (!currentPageId) return;
    (async () => {
      try {
        const res = await apiClient.getConversationHistory(projectId, currentPageId);
        if (res.success && res.data && res.data.messages) {
          if (chatMessages.length === 0) {
            for (const msg of res.data.messages) {
              addChatMessage({
                role: msg.role as ChatMessage['role'],
                content: msg.content,
                status: 'success',
                action: msg.action,
              });
            }
          }
        }
      } catch { /* non-fatal */ }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageId]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const applyResponse = useCallback(
    (res: AIGenerationResponse) => {
      if (res.action === 'full_page' && res.nodes.length > 0 && res.nodes[0].type !== NodeType.PAGE) {
        const pageNode = {
          id: tree?.id ?? `page_${Date.now()}`,
          type: NodeType.PAGE,
          tag: SemanticTag.MAIN,
          className: '',
          children: res.nodes,
          meta: tree?.meta ?? {
            title: 'Untitled Page',
            slug: 'untitled',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          styleguideId: tree?.styleguideId ?? '',
          globalSectionIds: tree?.globalSectionIds ?? [],
        };
        applyAIDiff({
          action: res.action,
          targetNodeId: tree?.id ?? '',
          payload: pageNode as DOMNode,
          position: res.position,
        });
      } else {
        applyAIDiff({
          action: res.action,
          targetNodeId: res.targetNodeId ?? (selectedNodeId ?? tree?.id ?? ''),
          payload: res.nodes.length === 1 ? res.nodes[0] : res.nodes,
          position: res.position,
        });
      }
    },
    [selectedNodeId, tree, applyAIDiff],
  );

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    setStreamingText('');

    // Update the last assistant message with whatever was accumulated
    const messages = useBuilderStore.getState().chatMessages;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.status === 'pending') {
      updateChatMessage(lastMsg.id, {
        content: accumulatedRef.current || 'Generation cancelled.',
        status: 'error',
      });
    }
  }, [updateChatMessage]);

  const handleSend = useCallback(
    async (promptText?: string) => {
      const trimmed = (promptText ?? input).trim();
      if (!trimmed || !currentPageId || loading) return;

      addChatMessage({ role: 'user', content: trimmed, status: 'success' });
      setInput('');
      setLoading(true);
      setStreamingText('');
      accumulatedRef.current = '';

      addChatMessage({ role: 'assistant', content: '', status: 'pending' });
      const messages = useBuilderStore.getState().chatMessages;
      const assistantMsgId = messages[messages.length - 1].id;

      // Capture temporal state length before AI action for undo tracking
      const pastLenBefore = useBuilderStore.temporal.getState().pastStates.length;

      const controller = new AbortController();
      abortRef.current = controller;

      apiClient.generateFromPromptStream(
        {
          prompt: trimmed,
          projectId,
          pageId: currentPageId,
          targetNodeId: selectedNodeId ?? undefined,
          styleguideId: tree?.styleguideId ?? '',
        },
        // onChunk — accumulate streaming text
        (text) => {
          accumulatedRef.current += text;
          setStreamingText(accumulatedRef.current);
        },
        // onDone — apply result to canvas
        (result) => {
          setLoading(false);
          setStreamingText('');
          abortRef.current = null;

          if (result.action === 'clarify') {
            updateChatMessage(assistantMsgId, {
              content: result.message ?? 'I need more information to proceed.',
              status: 'success',
              action: 'clarify',
            });
          } else {
            applyResponse(result);
            // Calculate how many temporal steps the AI action created
            const pastLenAfter = useBuilderStore.temporal.getState().pastStates.length;
            const undoSteps = pastLenAfter - pastLenBefore;
            updateChatMessage(assistantMsgId, {
              content: result.message ?? `Applied: ${formatAction(result.action)}`,
              status: 'success',
              action: result.action,
              undoSteps: undoSteps > 0 ? undoSteps : undefined,
            });
          }
        },
        // onError
        (error) => {
          setLoading(false);
          setStreamingText('');
          abortRef.current = null;
          updateChatMessage(assistantMsgId, {
            content: `Error: ${error}`,
            status: 'error',
          });
        },
      );
    },
    [input, projectId, currentPageId, selectedNodeId, tree, loading, addChatMessage, updateChatMessage, applyResponse],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
            </div>
            <p className="text-sm font-semibold text-on-surface mb-1">AI Editorial Assistant</p>
            <p className="text-xs text-on-surface-outline">Describe what you want to build</p>
          </div>
        )}

        {chatMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Streaming / Thinking indicator */}
        {loading && (
          <div className="flex gap-3 mr-8">
            <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-sm animate-ai-pulse">auto_awesome</span>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-2xl rounded-tl-none border border-outline-variant/10 shadow-sm max-w-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-ai-pulse" />
                <span className="text-xs font-semibold text-primary">AI is thinking...</span>
              </div>
              <div className="space-y-1.5">
                <ThinkingStep label="Analyzing your request" delay={0} />
                <ThinkingStep label="Designing layout structure" delay={800} />
                <ThinkingStep label="Generating components" delay={1600} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slash commands — pill chips */}
      <div className="px-4 py-2 border-t border-outline-variant/10">
        <div className="flex items-center gap-2 mb-2 overflow-x-auto">
          {SLASH_COMMANDS.map((cmd) => (
            <button
              key={cmd.label}
              onClick={() => handleSend(cmd.prompt)}
              disabled={loading}
              className="bg-secondary-fixed-dim text-on-secondary-fixed text-[10px] font-bold px-3 py-1.5 rounded-full hover:bg-secondary-container transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-sm">{cmd.icon}</span>
              {cmd.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-outline-variant/10">
        <div className="flex items-end gap-2 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the component or update..."
            rows={1}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 resize-none max-h-30 min-h-9 leading-relaxed placeholder:text-slate-400"
            disabled={loading}
          />
          {loading ? (
            <button
              onClick={handleCancel}
              className="w-10 h-10 flex items-center justify-center bg-error text-on-error rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">stop</span>
            </button>
          ) : (
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || !currentPageId}
              className="w-10 h-10 flex items-center justify-center bg-primary text-on-primary rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
            </button>
          )}
        </div>
        <p className="text-[9px] text-center text-slate-400 mt-2 tracking-wider uppercase font-bold">
          Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Message Bubble — Stitch-style
// ============================================================
function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end ml-8">
        <div className="bg-primary text-on-primary px-5 py-3 rounded-2xl rounded-tr-none shadow-sm max-w-sm">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.role === 'assistant') {
    if (message.status === 'error') {
      return (
        <div className="flex gap-3 mr-8">
          <div className="w-8 h-8 rounded-full bg-error-container/40 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-error text-sm">error</span>
          </div>
          <div className="bg-error-container/20 text-error px-4 py-3 rounded-2xl rounded-tl-none text-sm">
            {message.content}
          </div>
        </div>
      );
    }

    return (
      <div className="flex gap-3 mr-8">
        <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
        </div>
        <div className="flex-1 space-y-2">
          <div className="bg-surface-container-lowest p-4 rounded-2xl rounded-tl-none border border-outline-variant/10 shadow-sm">
            <p className="text-sm leading-relaxed text-on-surface">{message.content}</p>
            {message.action && message.status === 'success' && (
              <div className="flex items-center gap-2 mt-3">
                <button className="bg-primary text-on-primary text-[10px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:opacity-90 transition-all">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Applied
                </button>
                {message.undoSteps && message.undoSteps > 0 && (
                  <button
                    onClick={() => useBuilderStore.temporal.getState().undo(message.undoSteps!)}
                    className="bg-surface-container text-on-surface-variant text-[10px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-surface-container-high hover:text-on-surface transition-all"
                  >
                    <span className="material-symbols-outlined text-[14px]">undo</span>
                    Undo
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // System messages
  return (
    <div className="flex justify-center">
      <span className="text-[10px] text-on-surface-outline">{message.content}</span>
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================
function formatAction(action: string): string {
  return action
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
