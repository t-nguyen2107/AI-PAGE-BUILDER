"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { createUsePuck } from "@puckeditor/core";
import type { Data, PuckAction } from "@puckeditor/core";
import { apiClient } from "@/lib/api-client";
import type { AIGenerationResponse } from "@/types/ai";
import { AIAction } from "@/types/enums";

// ─── Typed Puck selector (module-level to avoid re-creating per render) ──
const usePuckSelector = createUsePuck();

// ─── Types ──────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AIChatPanelProps {
  projectId: string;
  pageId: string;
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

export function AIChatPanel({ projectId, pageId }: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const liveRenderTimersRef = useRef<number[]>([]);

  const dispatch = usePuckSelector((s) => s.dispatch);
  const componentCount = usePuckSelector((s) => (s.appState?.data as Data | undefined)?.content?.length ?? 0);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  const handleSend = useCallback(() => {
    const prompt = input.trim();
    if (!prompt || isGenerating) return;

    setInput("");
    setIsGenerating(true);
    setStatus("Sending...");

    setMessages((prev) => [...prev, { role: "user", content: prompt }]);

    const controller = apiClient.generateFromPromptStream(
      {
        prompt,
        projectId,
        pageId,
        styleguideId: "",
      },
      // onChunk — don't show raw text, just keep status as "Generating..."
      () => {
        setStatus("Generating...");
      },
      // onDone — 3-step flow: plan message → render progress → confirm message
      (result: AIGenerationResponse) => {
        const total = result.components?.length ?? 0;

        if (total === 0 || !result.components) {
          setIsGenerating(false);
          const msg = result.message || "No components generated";
          setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
          setStatus(null);
          return;
        }

        // Step 1: Show plan/explanation message immediately
        const planMsg =
          result.message ||
          `Tôi sẽ tạo ${total} thành phần cho bạn. Đang xử lý...`;
        setMessages((prev) => [...prev, { role: "assistant", content: planMsg }]);

        // Step 2: Show render progress
        setStatus(`Đang render 0/${total} thành phần...`);

        const timers = liveRenderToPuck(
          result,
          dispatch,
          (applied: number, total: number) => {
            if (applied < total) {
              setStatus(`Đang render ${applied}/${total} thành phần...`);
            } else {
              // Step 3: Confirm finished
              setIsGenerating(false);
              setStatus(null);
              const typeList = result.components
                .map((c) => c.type)
                .filter((v, i, a) => a.indexOf(v) === i)
                .join(", ");
              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: `Đã tạo xong ${total} thành phần (${typeList}). Bạn có thể chỉnh sửa trực tiếp trên canvas!`,
                },
              ]);
            }
          },
        );
        liveRenderTimersRef.current = timers;

        if (timers.length === 0) {
          setIsGenerating(false);
          setStatus(null);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Đã tạo xong ${total} thành phần. Bạn có thể chỉnh sửa trực tiếp trên canvas!`,
            },
          ]);
        }
      },
      // onError
      (error: string) => {
        setIsGenerating(false);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${error}` },
        ]);
        setStatus(null);
      },
      // onStatus — show pipeline steps in Vietnamese
      (_step: string, label: string) => {
        setStatus(label);
      },
    );

    abortRef.current = controller;
  }, [input, isGenerating, projectId, pageId, dispatch]);

  const handleCancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (liveRenderTimersRef.current.length > 0) {
      for (const t of liveRenderTimersRef.current) clearTimeout(t);
      liveRenderTimersRef.current = [];
    }
    setIsGenerating(false);
    setStatus(null);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "Generation cancelled." },
    ]);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 18,
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: 6,
            color: "#fff",
          }}
        >
          AI
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1f2937" }}>
            AI Assistant
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>
            {componentCount} component{componentCount !== 1 ? "s" : ""} on page
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {messages.length === 0 && !status && (
          <div style={{ textAlign: "center", padding: "32px 16px" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                style={{ display: "inline-block", verticalAlign: "middle" }}
              >
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="#a78bfa"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
              Describe what you want to build.
              <br />
              <span style={{ fontSize: 11, color: "#9ca3af" }}>
                Try: &quot;Create a landing page for a coffee shop&quot;
              </span>
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: 13,
              lineHeight: 1.5,
              maxWidth: "90%",
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              background: msg.role === "user" ? "#6366f1" : "#f3f4f6",
              color: msg.role === "user" ? "#fff" : "#1f2937",
            }}
          >
            {msg.content}
          </div>
        ))}

        {/* Status indicator only — no raw JSON */}
        {status && (
          <div
            style={{
              padding: "6px 12px",
              fontSize: 12,
              color: "#8b5cf6",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                border: "2px solid #8b5cf6",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                display: "inline-block",
              }}
            />
            {status}
          </div>
        )}
      </div>

      {/* Input area */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          gap: 8,
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isGenerating ? "Generating..." : "Describe what you want..."
          }
          disabled={isGenerating}
          rows={2}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            fontSize: 13,
            resize: "none",
            outline: "none",
            fontFamily: "inherit",
            background: isGenerating ? "#f9fafb" : "#fff",
          }}
        />
        {isGenerating ? (
          <button
            onClick={handleCancel}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid #ef4444",
              background: "#fef2f2",
              color: "#ef4444",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              background: input.trim() ? "#6366f1" : "#e5e7eb",
              color: input.trim() ? "#fff" : "#9ca3af",
              cursor: input.trim() ? "pointer" : "default",
              fontSize: 12,
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            Send
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
