"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { createUsePuck } from "@puckeditor/core";
import type { Data, PuckAction } from "@puckeditor/core";
import { apiClient } from "@/lib/api-client";
import type { AIGenerationResponse } from "@/types/ai";
import { AIAction } from "@/types/enums";
import { generateId } from "@/lib/id";
import { AIProfileSummary } from "./components/AIProfileSummary";
import { AIProfileEditor } from "./components/AIProfileEditor";

// ─── Typed Puck selector (module-level to avoid re-creating per render) ──
const usePuckSelector = createUsePuck();

// ─── Types ──────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: "success" | "error" | "pending";
  action?: string;
  createdAt: number;
}

interface AIChatPanelProps {
  projectId: string;
  pageId: string;
  styleguideId?: string;
}

// ─── Slash commands ─────────────────────────────────────────────────────

const SLASH_COMMANDS = [
  { label: "/OPTIMIZE", icon: "auto_fix_high", prompt: "Optimize the current layout for better visual hierarchy and spacing" },
  { label: "/LAYOUT", icon: "view_quilt", prompt: "Generate a new section layout" },
  { label: "/COLORS", icon: "palette", prompt: "Suggest a color scheme update for the current page" },
];

// ─── ThinkingDots ───────────────────────────────────────────────────────

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary"
          style={{ animation: `thinkingBounce 1.4s ease-in-out ${i * 0.16}s infinite` }}
        />
      ))}
    </div>
  );
}

// ─── Apply AI response to Puck ──────────────────────────────────────────

function applyResponseToPuck(
  res: AIGenerationResponse,
  dispatch: (action: PuckAction) => void,
) {
  const action = res.action;
  const components = res.components;

  if (!components || components.length === 0) return;

  dispatch({
    type: "setData",
    data: (prev: Data) => {
      const content = [...(prev.content || [])];

      switch (action) {
        case AIAction.FULL_PAGE:
          return { ...prev, content: components };

        case AIAction.INSERT_COMPONENT: {
          const pos = res.position ?? content.length;
          content.splice(pos, 0, ...components);
          return { ...prev, content };
        }

        case AIAction.MODIFY_NODE: {
          const targetId = res.targetComponentId;
          if (!targetId) return prev;
          return {
            ...prev,
            content: content.map((c) => {
              const cProps = (c.props ?? {}) as Record<string, unknown>;
              if (cProps.id === targetId && components[0]) {
                const newProps = (components[0].props ?? {}) as Record<string, unknown>;
                return { ...c, props: { ...c.props, ...newProps } };
              }
              return c;
            }),
          };
        }

        case AIAction.REPLACE_NODE: {
          const targetId = res.targetComponentId;
          if (!targetId) return prev;
          return {
            ...prev,
            content: content.map((c) => {
              const cProps = (c.props ?? {}) as Record<string, unknown>;
              if (cProps.id === targetId && components[0]) {
                return components[0];
              }
              return c;
            }),
          };
        }

        case AIAction.DELETE_NODE: {
          const targetId = res.targetComponentId;
          if (!targetId) return prev;
          return {
            ...prev,
            content: content.filter((c) => {
              const cProps = (c.props ?? {}) as Record<string, unknown>;
              return cProps.id !== targetId;
            }),
          };
        }

        default:
          return prev;
      }
    },
  });
}

// ─── Live Render: apply components one by one ────────────────────────────

function liveRenderToPuck(
  res: AIGenerationResponse,
  dispatch: (action: PuckAction) => void,
  onProgress: (applied: number, total: number) => void,
): number[] {
  const { action, components } = res;
  if (!components || components.length === 0) return [];

  const timers: number[] = [];
  const DELAY = 120;

  switch (action) {
    case AIAction.FULL_PAGE: {
      dispatch({
        type: "setData",
        data: () => ({
          root: { props: { title: "Untitled" } },
          content: [components[0]],
        }),
      });
      onProgress(1, components.length);

      for (let i = 1; i < components.length; i++) {
        const idx = i;
        timers.push(window.setTimeout(() => {
          dispatch({
            type: "setData",
            data: (prev: Data) => ({
              ...prev,
              content: [...(prev.content || []), components[idx]],
            }),
          });
          onProgress(idx + 1, components.length);
        }, i * DELAY));
      }
      break;
    }

    case AIAction.INSERT_COMPONENT: {
      for (let i = 0; i < components.length; i++) {
        const idx = i;
        timers.push(window.setTimeout(() => {
          dispatch({
            type: "setData",
            data: (prev: Data) => {
              const content = [...(prev.content || [])];
              const pos = res.position ?? content.length;
              content.splice(pos + idx, 0, components[idx]);
              return { ...prev, content };
            },
          });
          onProgress(idx + 1, components.length);
        }, i * DELAY));
      }
      break;
    }

    default:
      applyResponseToPuck(res, dispatch);
      onProgress(components.length, components.length);
      break;
  }

  return timers;
}

// ─── AIChatPanel Component ─────────────────────────────────────────────

export function AIChatPanel({ projectId, pageId, styleguideId }: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState<
    Array<{ step: string; label: string; status: "active" | "done" | "error" }>
  >([]);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const liveRenderTimersRef = useRef<number[]>([]);
  const lastPromptRef = useRef<string>("");
  const progressiveComponentsRef = useRef<import("@puckeditor/core").ComponentData[]>([]);

  const dispatch = usePuckSelector((s) => s.dispatch);
  const componentCount = usePuckSelector(
    (s) => (s.appState?.data as Data | undefined)?.content?.length ?? 0,
  );

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  // Cleanup live render timers + abort on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      for (const t of liveRenderTimersRef.current) clearTimeout(t);
    };
  }, []);

  const handleSend = useCallback(
    (promptText?: string) => {
      const prompt = (promptText ?? input).trim();
      if (!prompt || loading) return;

      setInput("");
      setLoading(true);
      setPipelineSteps([]);
      liveRenderTimersRef.current = [];
      progressiveComponentsRef.current = [];
      lastPromptRef.current = prompt;

      const now = Date.now();
      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: prompt,
        status: "success",
        createdAt: now,
      };
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "",
        status: "pending",
        createdAt: now + 1,
      };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      const controller = apiClient.generateFromPromptStream(
        {
          prompt,
          projectId,
          pageId,
          styleguideId: styleguideId ?? "",
        },
        // onChunk — keep pipeline active
        () => {},
        // onDone — finalize result
        (result: AIGenerationResponse) => {
          const total = result.components?.length ?? 0;
          setLoading(false);
          setPipelineSteps((prev) =>
            prev.map((s) => ({ ...s, status: "done" as const })),
          );
          abortRef.current = null;

          if (total === 0 || !result.components) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id
                  ? {
                      ...m,
                      content: result.message || "No components generated",
                      status: "success",
                    }
                  : m,
              ),
            );
            return;
          }

          const typeList = result.components
            .map((c) => c.type)
            .filter((v, i, a) => a.indexOf(v) === i)
            .join(", ");

          // If components were already applied progressively via onComponent,
          // just update the message — skip liveRenderToPuck
          const alreadyApplied = progressiveComponentsRef.current.length;
          if (alreadyApplied >= total) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id
                  ? {
                      ...m,
                      content: `Đã tạo xong ${total} thành phần (${typeList}). Bạn có thể chỉnh sửa trực tiếp trên canvas!`,
                      status: "success",
                      action: result.action as string,
                    }
                  : m,
              ),
            );
            return;
          }

          // Show plan message
          const planMsg = result.message || `Đang tạo ${total} thành phần...`;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? {
                    ...m,
                    content: planMsg,
                    status: "success",
                    action: result.action as string,
                  }
                : m,
            ),
          );

          // Live render remaining components not yet applied
          const remaining = { ...result, components: result.components.slice(alreadyApplied) };
          const timers = liveRenderToPuck(
            remaining,
            dispatch,
            (applied: number, remTotal: number) => {
              if (applied >= remTotal) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id
                      ? {
                          ...m,
                          content: `Đã tạo xong ${total} thành phần (${typeList}). Bạn có thể chỉnh sửa trực tiếp trên canvas!`,
                          status: "success",
                          action: result.action as string,
                        }
                      : m,
                  ),
                );
              }
            },
          );
          liveRenderTimersRef.current = timers;

          if (timers.length === 0) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id
                  ? {
                      ...m,
                      content: `Đã tạo xong ${total} thành phần (${typeList}). Bạn có thể chỉnh sửa trực tiếp trên canvas!`,
                      status: "success",
                      action: result.action as string,
                    }
                  : m,
              ),
            );
          }
        },
        // onError
        (error: string) => {
          setLoading(false);
          setPipelineSteps((prev) =>
            prev.map((s) =>
              s.status === "active" ? { ...s, status: "error" as const } : s,
            ),
          );
          abortRef.current = null;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: `Error: ${error}`, status: "error" }
                : m,
            ),
          );
        },
        // onStatus — pipeline step tracking
        (_step: string, label: string) => {
          setPipelineSteps((prev) => {
            const updated = prev.map((s) =>
              s.status === "active" ? { ...s, status: "done" as const } : s,
            );
            return [
              ...updated,
              { step: _step, label, status: "active" as const },
            ];
          });
        },
        // onComponent — progressive component rendering
        (component, index, total) => {
          const puckComponent = component as import("@puckeditor/core").ComponentData;
          progressiveComponentsRef.current.push(puckComponent);
          // Apply immediately to canvas
          dispatch({
            type: "setData",
            data: (prev: Data) => {
              const content = [...(prev.content || [])];
              if (index === 0 && total > 1) {
                // First component of a full-page: reset canvas
                return {
                  root: { props: { title: "Untitled" } },
                  content: [puckComponent],
                };
              }
              content.push(puckComponent);
              return { ...prev, content };
            },
          });
        },
      );

      abortRef.current = controller;
    },
    [input, loading, projectId, pageId, styleguideId, dispatch],
  );

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (liveRenderTimersRef.current.length > 0) {
      for (const t of liveRenderTimersRef.current) clearTimeout(t);
      liveRenderTimersRef.current = [];
    }
    setLoading(false);
    setPipelineSteps([]);
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.status === "pending") {
        return prev.map((m) =>
          m.id === last.id
            ? { ...m, content: "Generation cancelled.", status: "error" }
            : m,
        );
      }
      return prev;
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleRetry = useCallback(() => {
    if (lastPromptRef.current) {
      handleSend(lastPromptRef.current);
    }
  }, [handleSend]);

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-outline-variant/50">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-on-primary text-[14px]">
            auto_awesome
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-on-surface">
            AI Assistant
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-on-surface-outline">
              {componentCount} component{componentCount !== 1 ? "s" : ""}
            </span>
            <AIProfileSummary
              projectId={projectId}
              onOpenEditor={() => setShowProfileEditor(true)}
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4">
            {/* Animated gradient orb */}
            <div className="relative mb-6">
              <div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-container to-primary flex items-center justify-center shadow-lg"
                style={{ animation: "float 3s ease-in-out infinite" }}
              >
                <span
                  className="material-symbols-outlined text-on-primary-container text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
              </div>
              <div
                className="absolute -inset-2 rounded-3xl bg-primary-container/20 blur-xl -z-10"
                style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
              />
            </div>
            <p className="text-sm font-semibold text-on-surface mb-1">
              AI Design Assistant
            </p>
            <p className="text-xs text-on-surface-outline mb-6 max-w-[250px] leading-relaxed">
              Describe what you want to build and I&apos;ll create it for you
            </p>
            {/* Suggestion chips */}
            <div className="flex flex-col gap-2 w-full max-w-[240px]">
              {[
                { icon: "web", text: "Create a hero section" },
                { icon: "palette", text: "Design a pricing table" },
                { icon: "view_quilt", text: "Build a feature grid" },
              ].map((suggestion) => (
                <button
                  key={suggestion.text}
                  onClick={() => handleSend(suggestion.text)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/15 hover:border-primary-container/40 hover:bg-surface-container text-left group transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[16px] text-on-surface-outline group-hover:text-primary transition-colors">
                    {suggestion.icon}
                  </span>
                  <span className="text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">
                    {suggestion.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onRetry={handleRetry} />
        ))}

        {/* Pipeline indicator */}
        {loading && (
          <div className="flex gap-3 mr-8">
            <div className="w-8 h-8 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0 relative">
              <span
                className="material-symbols-outlined text-primary text-sm"
                style={{ animation: "aiSpin 2s linear infinite" }}
              >
                auto_awesome
              </span>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-2xl rounded-tl-sm border border-outline-variant/10 shadow-sm max-w-sm">
              <div className="flex items-center gap-2 mb-3">
                <ThinkingDots />
                <span className="text-xs font-semibold text-primary">
                  Processing
                </span>
              </div>
              <div className="space-y-1.5">
                {pipelineSteps.length === 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    <span className="text-[11px] text-on-surface-outline">
                      Connecting...
                    </span>
                  </div>
                ) : (
                  pipelineSteps.map((s) => (
                    <div key={s.step} className="flex items-center gap-2">
                      {s.status === "done" ? (
                        <span
                          className="material-symbols-outlined text-[14px] text-primary"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                      ) : s.status === "error" ? (
                        <span className="material-symbols-outlined text-[14px] text-error">
                          error
                        </span>
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                      )}
                      <span
                        className={`text-[11px] ${
                          s.status === "active"
                            ? "text-primary font-medium"
                            : s.status === "done"
                              ? "text-on-surface-outline"
                              : "text-error"
                        }`}
                      >
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
              <span className="material-symbols-outlined text-[14px]">
                {cmd.icon}
              </span>
              {cmd.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="px-3 pb-3">
        <div className="relative flex items-end gap-2 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-2 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              loading
                ? "Generating..."
                : "Describe what you want to build..."
            }
            rows={1}
            className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 px-2 resize-none max-h-[120px] min-h-[36px] leading-relaxed placeholder:text-on-surface-outline outline-none"
            disabled={loading}
          />
          {loading ? (
            <button
              onClick={handleCancel}
              className="w-10 h-10 flex items-center justify-center bg-error text-on-error rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">
                stop
              </span>
            </button>
          ) : (
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="w-10 h-10 flex items-center justify-center bg-primary text-on-primary rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_upward
              </span>
            </button>
          )}
        </div>
        <p className="text-[9px] text-center text-on-surface-outline/60 mt-1.5 tracking-wide">
          Shift + Enter for new line
        </p>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes thinkingBounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes aiSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Profile Editor Overlay */}
      {showProfileEditor && (
        <div className="absolute inset-0 z-50 bg-surface">
          <AIProfileEditor
            projectId={projectId}
            onClose={() => setShowProfileEditor(false)}
          />
        </div>
      )}
    </div>
  );
}

// ─── Relative time ──────────────────────────────────────────────────────

function relativeTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

// ─── MessageBubble ──────────────────────────────────────────────────────

function MessageBubble({ message, onRetry }: { message: ChatMessage; onRetry?: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  }, [message.content]);

  // Skip rendering pending assistant messages — pipeline UI handles loading state
  if (message.role === "assistant" && message.status === "pending") return null;

  const time = relativeTime(message.createdAt);

  if (message.role === "user") {
    return (
      <div className="flex justify-end ml-8">
        <div className="max-w-sm">
          <div className="bg-primary text-on-primary px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-sm">
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>
          <p className="text-[9px] text-on-surface-outline/50 text-right mt-1 mr-1">{time}</p>
        </div>
      </div>
    );
  }

  if (message.role === "assistant") {
    if (message.status === "error") {
      return (
        <div className="flex gap-3 mr-8">
          <div className="w-8 h-8 rounded-xl bg-error-container/40 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-error text-sm">
              error
            </span>
          </div>
          <div className="flex-1 space-y-1">
            <div className="bg-error-container/20 text-error px-4 py-3 rounded-2xl rounded-tl-sm text-sm border border-error/10">
              {message.content}
            </div>
            <div className="flex items-center gap-2 ml-1">
              <span className="text-[9px] text-on-surface-outline/50">{time}</span>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex items-center gap-1 text-[10px] text-primary font-medium hover:underline"
                >
                  <span className="material-symbols-outlined text-[12px]">refresh</span>
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex gap-3 mr-8">
        <div className="w-8 h-8 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0">
          <span
            className="material-symbols-outlined text-primary text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
        </div>
        <div className="flex-1 space-y-1">
          <div className="bg-surface-container-lowest p-4 rounded-2xl rounded-tl-sm border border-outline-variant/10 shadow-sm">
            <p className="text-sm leading-relaxed text-on-surface">
              {message.content}
            </p>
            {message.action &&
              message.status === "success" &&
              message.action !== "clarify" && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-outline-variant/10">
                  <span className="inline-flex items-center gap-1.5 bg-primary-container/20 text-on-primary-container text-[10px] font-semibold px-2.5 py-1 rounded-lg">
                    <span className="material-symbols-outlined text-[14px]">
                      check_circle
                    </span>
                    {formatAction(message.action)}
                  </span>
                </div>
              )}
          </div>
          <div className="flex items-center gap-2 ml-1">
            <span className="text-[9px] text-on-surface-outline/50">{time}</span>
            {message.content && message.status === "success" && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-0.5 text-[10px] text-on-surface-outline/60 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[12px]">
                  {copied ? "check" : "content_copy"}
                </span>
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Helpers ────────────────────────────────────────────────────────────

function formatAction(action: string): string {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
