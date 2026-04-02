'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useBuilderStore } from '@/store';
import type { ChatMessage } from '@/store/builder-store';
import { apiClient } from '@/lib/api-client';
import type { AIGenerationResponse, AIDiff, DOMNode } from '@/types';
import { NodeType, SemanticTag } from '@/types/enums';

// ============================================================
// Collect named nodes from tree for @ autocomplete
// ============================================================
interface NamedNodeRef {
  name: string;
  tag: string;
}

function collectNamedNodes(node: unknown, results: NamedNodeRef[] = []): NamedNodeRef[] {
  if (!node || typeof node !== 'object') return results;
  const n = node as Record<string, unknown>;
  if (typeof n.name === 'string' && n.name && typeof n.id === 'string') {
    results.push({ name: n.name, tag: String(n.tag ?? '') });
  }
  if (Array.isArray(n.children)) {
    for (const child of n.children) {
      collectNamedNodes(child, results);
    }
  }
  return results;
}

// ============================================================
// Quick action slash commands — Stitch style
// ============================================================
const SLASH_COMMANDS = [
  { label: '/OPTIMIZE', icon: 'auto_fix_high', prompt: 'Optimize the current layout for better visual hierarchy and spacing' },
  { label: '/LAYOUT', icon: 'view_quilt', prompt: 'Generate a new section layout' },
  { label: '/COLORS', icon: 'palette', prompt: 'Suggest a color scheme update for the current page' },
];

// ============================================================
// ThinkingDots — animated bouncing dots for AI processing
// ============================================================
function ThinkingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary"
          style={{
            animation: `thinkingBounce 1.4s ease-in-out ${i * 0.16}s infinite`,
          }}
        />
      ))}
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
  const previewAIDiff = useBuilderStore((s) => s.previewAIDiff);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [pipelineSteps, setPipelineSteps] = useState<Array<{ step: string; label: string; status: 'active' | 'done' | 'error' }>>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const accumulatedRef = useRef('');

  // @ autocomplete state
  const [acVisible, setAcVisible] = useState(false);
  const [acQuery, setAcQuery] = useState('');
  const [acIndex, setAcIndex] = useState(0);
  const acStartRef = useRef(-1); // cursor position where @ was typed

  // Collect named nodes from current tree
  const namedNodes = useMemo(() => collectNamedNodes(tree), [tree]);

  const acResults = useMemo(() => {
    if (!acVisible || !acQuery) return namedNodes.slice(0, 8);
    const q = acQuery.toLowerCase();
    return namedNodes.filter((n) => n.name.toLowerCase().includes(q)).slice(0, 8);
  }, [acVisible, acQuery, namedNodes]);

  // Insert selected @name into input
  const handleAcSelect = useCallback(
    (name: string) => {
      const before = input.slice(0, acStartRef.current);
      const after = input.slice(textareaRef.current?.selectionStart ?? input.length);
      const newText = `${before}@${name} ${after}`;
      setInput(newText);
      setAcVisible(false);
      setAcQuery('');
      acStartRef.current = -1;
      // Move cursor after inserted name
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          const pos = before.length + name.length + 2; // +2 for @ and space
          textareaRef.current.selectionStart = pos;
          textareaRef.current.selectionEnd = pos;
          textareaRef.current.focus();
        }
      });
    },
    [input],
  );

  // Detect @ trigger in input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setInput(val);

      const cursorPos = e.target.selectionStart ?? val.length;
      // Look backwards from cursor for an unbroken @ prefix
      let atPos = -1;
      for (let i = cursorPos - 1; i >= 0; i--) {
        const ch = val[i];
        if (ch === '@') {
          atPos = i;
          break;
        }
        if (ch === ' ' || ch === '\n') break; // stop at whitespace
      }

      if (atPos >= 0 && namedNodes.length > 0) {
        const query = val.slice(atPos + 1, cursorPos);
        // Only show if query has no spaces (still typing the name)
        if (!query.includes(' ') && query.length < 30) {
          acStartRef.current = atPos;
          setAcQuery(query);
          setAcVisible(true);
          setAcIndex(0);
          return;
        }
      }

      setAcVisible(false);
    },
    [namedNodes],
  );

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

  const buildDiff = useCallback(
    (res: AIGenerationResponse): AIDiff => {
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
        return {
          action: res.action,
          targetNodeId: tree?.id ?? '',
          payload: pageNode as AIDiff['payload'],
          position: res.position,
        };
      }
      return {
        action: res.action,
        targetNodeId: res.targetNodeId ?? (selectedNodeId ?? tree?.id ?? ''),
        payload: res.nodes.length === 1 ? res.nodes[0] : res.nodes,
        position: res.position,
      };
    },
    [selectedNodeId, tree],
  );

  const previewResponse = useCallback(
    (res: AIGenerationResponse) => {
      const diff = buildDiff(res);
      previewAIDiff(diff);
    },
    [buildDiff, previewAIDiff],
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
      setPipelineSteps([]);
      accumulatedRef.current = '';

      addChatMessage({ role: 'assistant', content: '', status: 'pending' });
      const messages = useBuilderStore.getState().chatMessages;
      const assistantMsgId = messages[messages.length - 1].id;

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
          setPipelineSteps((prev) => prev.map((s) => ({ ...s, status: 'done' as const })));
          abortRef.current = null;
          accumulatedRef.current = '';

          if (result.action === 'clarify') {
            updateChatMessage(assistantMsgId, {
              content: result.message ?? 'I need more information to proceed.',
              status: 'success',
              action: 'clarify',
            });
          } else {
            previewResponse(result);
            updateChatMessage(assistantMsgId, {
              content: result.message ?? `Preview ready: ${formatAction(result.action)}`,
              status: 'success',
              action: result.action,
            });
          }
        },
        // onError
        (error) => {
          setLoading(false);
          setStreamingText('');
          setPipelineSteps((prev) => prev.map((s) => s.status === 'active' ? { ...s, status: 'error' as const } : s));
          abortRef.current = null;
          updateChatMessage(assistantMsgId, {
            content: `Error: ${error}`,
            status: 'error',
          });
        },
        // onStatus — real pipeline step tracking
        (step, label) => {
          setPipelineSteps((prev) => {
            // Mark previous active step as done
            const updated = prev.map((s) =>
              s.status === 'active' ? { ...s, status: 'done' as const } : s,
            );
            return [...updated, { step, label, status: 'active' as const }];
          });
        },
      );
    },
    [input, projectId, currentPageId, selectedNodeId, tree, loading, addChatMessage, updateChatMessage, previewResponse],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Autocomplete navigation
      if (acVisible && acResults.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setAcIndex((i) => (i + 1) % acResults.length);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setAcIndex((i) => (i - 1 + acResults.length) % acResults.length);
          return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          handleAcSelect(acResults[acIndex].name);
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setAcVisible(false);
          return;
        }
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend, acVisible, acResults, acIndex, handleAcSelect],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4">
            {/* Animated gradient orb */}
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary-container to-primary flex items-center justify-center shadow-lg" style={{ animation: 'float 3s ease-in-out infinite' }}>
                <span className="material-symbols-outlined text-on-primary-container text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div className="absolute -inset-2 rounded-3xl bg-primary-container/20 blur-xl -z-10" style={{ animation: 'pulse-glow 2s ease-in-out infinite' }} />
            </div>
            <p className="text-sm font-semibold text-on-surface mb-1">AI Design Assistant</p>
            <p className="text-xs text-on-surface-outline mb-6 max-w-50 leading-relaxed">
              Describe what you want to build and I&apos;ll create it for you
            </p>
            {/* Suggestion chips */}
            <div className="flex flex-col gap-2 w-full max-w-60">
              {[
                { icon: 'web', text: 'Create a hero section' },
                { icon: 'palette', text: 'Design a pricing table' },
                { icon: 'view_quilt', text: 'Build a feature grid' },
              ].map((suggestion) => (
                <button
                  key={suggestion.text}
                  onClick={() => handleSend(suggestion.text)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/15 hover:border-primary-container/40 hover:bg-surface-container text-left group transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[16px] text-on-surface-outline group-hover:text-primary transition-colors">{suggestion.icon}</span>
                  <span className="text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">{suggestion.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Streaming / Pipeline indicator */}
        {loading && (
          <div className="flex gap-3 mr-8">
            <div className="w-8 h-8 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0 relative">
              <span className="material-symbols-outlined text-primary text-sm" style={{ animation: 'aiSpin 2s linear infinite' }}>auto_awesome</span>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-2xl rounded-tl-sm border border-outline-variant/10 shadow-sm max-w-sm">
              <div className="flex items-center gap-2 mb-3">
                <ThinkingDots />
                <span className="text-xs font-semibold text-primary">Processing</span>
              </div>
              <div className="space-y-1.5">
                {pipelineSteps.length === 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    <span className="text-[11px] text-on-surface-outline">Connecting...</span>
                  </div>
                ) : (
                  pipelineSteps.map((s) => (
                    <div key={s.step} className="flex items-center gap-2">
                      {s.status === 'done' ? (
                        <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      ) : s.status === 'error' ? (
                        <span className="material-symbols-outlined text-[14px] text-error">error</span>
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                      )}
                      <span className={`text-[11px] ${s.status === 'active' ? 'text-primary font-medium' : s.status === 'done' ? 'text-on-surface-outline' : 'text-error'}`}>
                        {s.label}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slash commands — pill chips */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {SLASH_COMMANDS.map((cmd) => (
            <button
              key={cmd.label}
              onClick={() => handleSend(cmd.prompt)}
              disabled={loading}
              className="bg-surface-container/80 text-on-surface-variant text-[10px] font-semibold px-3 py-1.5 rounded-full hover:bg-primary-container/20 hover:text-on-primary-container transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-40 border border-outline-variant/15"
            >
              <span className="material-symbols-outlined text-[14px]">{cmd.icon}</span>
              {cmd.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="px-3 pb-3">
        <div className="relative flex items-end gap-2 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-2 focus-within:border-primary-container/60 focus-within:shadow-[0_0_0_3px_var(--primary-container)/15] transition-all duration-200">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to build..."
              rows={1}
              className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 px-2 resize-none max-h-30 min-h-9 leading-relaxed placeholder:text-on-surface-outline"
              disabled={loading}
            />
            {/* @ autocomplete dropdown */}
            {acVisible && acResults.length > 0 && (
              <div className="absolute bottom-full left-0 mb-1 w-64 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-lg overflow-hidden z-50">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold text-on-surface-outline border-b border-outline-variant/10">
                  Reference node
                </div>
                {acResults.map((node, i) => (
                  <button
                    key={node.name}
                    onClick={() => handleAcSelect(node.name)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                      i === acIndex ? 'bg-primary-container/20 text-on-primary-container' : 'text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px] text-on-surface-outline">
                      {node.tag === 'section' || node.tag === 'header' || node.tag === 'footer' || node.tag === 'nav'
                        ? 'crop_landscape'
                        : node.tag?.startsWith('h') ? 'title' : 'code'}
                    </span>
                    <span className="font-medium">@{node.name}</span>
                    <span className="ml-auto text-[10px] text-on-surface-outline">&lt;{node.tag}&gt;</span>
                  </button>
                ))}
              </div>
            )}
          </div>
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
        <p className="text-[9px] text-center text-on-surface-outline/60 mt-1.5 tracking-wide">
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
  // Skip rendering pending assistant messages — pipeline UI handles loading state
  if (message.role === 'assistant' && message.status === 'pending') return null;

  if (message.role === 'user') {
    return (
      <div className="flex justify-end ml-8">
        <div className="bg-primary text-on-primary px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-sm max-w-sm relative">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.role === 'assistant') {
    if (message.status === 'error') {
      return (
        <div className="flex gap-3 mr-8">
          <div className="w-8 h-8 rounded-xl bg-error-container/40 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-error text-sm">error</span>
          </div>
          <div className="bg-error-container/20 text-error px-4 py-3 rounded-2xl rounded-tl-sm text-sm border border-error/10">
            {message.content}
          </div>
        </div>
      );
    }

    return (
      <div className="flex gap-3 mr-8">
        <div className="w-8 h-8 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
        </div>
        <div className="flex-1 space-y-2">
          <div className="bg-surface-container-lowest p-4 rounded-2xl rounded-tl-sm border border-outline-variant/10 shadow-sm">
            <p className="text-sm leading-relaxed text-on-surface">{message.content}</p>
            {message.action && message.status === 'success' && message.action !== 'clarify' && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-outline-variant/10">
                <button
                  onClick={() => {
                    const el = document.querySelector('[data-canvas-root]');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-[10px] font-semibold px-2.5 py-1 rounded-lg hover:bg-amber-200 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">preview</span>
                  Pending Review — Click to view
                </button>
              </div>
            )}
            {message.action === 'clarify' && message.status === 'success' && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-outline-variant/10">
                <span className="inline-flex items-center gap-1.5 bg-surface-container text-on-surface-variant text-[10px] font-semibold px-2.5 py-1 rounded-lg">
                  <span className="material-symbols-outlined text-[14px]">help</span>
                  Clarification
                </span>
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
      <span className="text-[10px] text-on-surface-outline/60">{message.content}</span>
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
