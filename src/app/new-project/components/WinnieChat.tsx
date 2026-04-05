"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { WizardChatMessage, WinnieResponse, WizardProjectInfo } from "@/types/wizard";
import { ImportPlaceholders } from "./ImportPlaceholders";

interface WinnieChatProps {
  onComplete: (info: WizardProjectInfo) => void;
  onSkip: () => void;
}

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  status?: "streaming" | "done";
}

const SUGGESTION_CHIPS = [
  { icon: "local_cafe", text: "A modern coffee shop website" },
  { icon: "cloud", text: "SaaS landing page with pricing" },
  { icon: "photo_camera", text: "Portfolio for a photographer" },
  { icon: "restaurant", text: "Restaurant with menu showcase" },
];

export function WinnieChat({ onComplete, onSkip }: WinnieChatProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi there! I'm Winnie, your AI website design consultant. I'll help you plan your perfect website.\n\nWhat kind of website would you like to build? Tell me your project name and your idea!",
      timestamp: Date.now(),
      status: "done",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [collectedInfo, setCollectedInfo] = useState<Partial<WizardProjectInfo> | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [completeMessageId, setCompleteMessageId] = useState<string | null>(null);

  const chatHistory = useRef<WizardChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const handleSend = useCallback(
    async (messageText?: string) => {
      const text = (messageText ?? input).trim();
      if (!text || isStreaming) return;

      setInput("");
      setIsStreaming(true);

      const msgId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: `user-${msgId}`, role: "user", content: text, timestamp: Date.now(), status: "done" },
      ]);

      const assistantMsgId = `assistant-${msgId}`;
      setMessages((prev) => [
        ...prev,
        { id: assistantMsgId, role: "assistant", content: "", timestamp: Date.now(), status: "streaming" },
      ]);

      chatHistory.current.push({ role: "user", content: text });

      try {
        const controller = new AbortController();
        abortRef.current = controller;

        const res = await fetch("/api/ai/wizard/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: chatHistory.current.slice(-10),
            userMessage: text,
            collectedSoFar: collectedInfo,
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) throw new Error(`Chat failed (${res.status})`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const match = line.match(/^data: ([\s\S]+)$/);
            if (!match) continue;

            try {
              const event = JSON.parse(match[1]);

              if (event.type === "chunk" && event.content) {
                fullText += event.content;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantMsgId ? { ...m, content: fullText } : m)),
                );
              } else if (event.type === "done" && event.extractedInfo) {
                const info = event.extractedInfo as WinnieResponse;
                chatHistory.current.push({ role: "assistant", content: info.reply });
                if (info.collectedInfo) setCollectedInfo((prev) => ({ ...prev, ...info.collectedInfo }));
                if (info.isComplete) {
                  setIsComplete(true);
                  setCompleteMessageId(assistantMsgId);
                }
              } else if (event.type === "error") {
                throw new Error(event.message ?? "Chat error");
              }
            } catch (parseErr) {
              if (parseErr instanceof Error && parseErr.message !== "Chat error") {
                /* skip malformed */
              } else throw parseErr;
            }
          }
        }

        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, status: "done" as const } : m)),
        );
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: "Sorry, something went wrong. Please try again.", status: "done" }
                : m,
            ),
          );
        }
      } finally {
        setIsStreaming(false);
        inputRef.current?.focus();
      }
    },
    [input, isStreaming, collectedInfo],
  );

  const handleNext = () => {
    if (collectedInfo) {
      const fullInfo: WizardProjectInfo = {
        name: collectedInfo.name ?? "My Project",
        idea: collectedInfo.idea ?? "",
        style: collectedInfo.style ?? "modern",
        targetAudience: collectedInfo.targetAudience ?? "general",
        tone: collectedInfo.tone ?? "professional",
        language: collectedInfo.language ?? "en",
        pages: collectedInfo.pages ?? [{ title: "Home", slug: "home", description: "Homepage" }],
      };
      onComplete(fullInfo);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Messages ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
            {/* Avatar */}
            {msg.role === "assistant" && (
              <div className="shrink-0 relative">
                <div
                  className="w-9 h-9 rounded-2xl bg-linear-to-br from-primary via-primary-container to-tertiary flex items-center justify-center shadow-lg shadow-primary/25"
                  style={{ animation: "winnie-breathe 3s ease-in-out infinite" }}
                >
                  <span className="material-symbols-outlined text-base text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    smart_toy
                  </span>
                </div>
                <div className="absolute -inset-1.5 rounded-3xl bg-primary/15 blur-lg -z-10" style={{ animation: "winnie-glow 2s ease-in-out infinite" }} />
              </div>
            )}

            {/* Bubble */}
            <div
              className={cn(
                "max-w-[80%] text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-primary text-on-primary px-4 py-3 rounded-2xl rounded-tr-lg shadow-md shadow-primary/10"
                  : "bg-surface-container-lowest text-on-surface px-4 py-3 rounded-2xl rounded-tl-lg border border-outline-variant/10 shadow-sm",
              )}
            >
              {msg.content ? (
                <>
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                  {msg.status === "streaming" && (
                    <span className="inline-block w-0.5 h-4 bg-primary/70 ml-0.5 align-middle animate-pulse" />
                  )}
                  {msg.role === "assistant" && msg.id === completeMessageId && msg.status === "done" && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="mt-3.5 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25"
                    >
                      Continue to Customize
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </button>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-1.5 py-1 px-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Import placeholders (only at start) */}
        {messages.length <= 2 && (
          <div className="pt-2">
            <ImportPlaceholders />
          </div>
        )}
      </div>

      {/* ── Suggestion chips ── */}
      {messages.length <= 2 && !isStreaming && (
        <div className="px-4 pb-3">
          <p className="text-[10px] text-on-surface-outline/70 uppercase tracking-widest font-semibold mb-2">Quick start</p>
          <div className="grid grid-cols-2 gap-2">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip.text}
                type="button"
                onClick={() => handleSend(chip.text)}
                disabled={isStreaming}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left group border border-outline-variant/15 bg-surface-container-lowest/60 hover:bg-surface-container hover:border-primary/20 transition-all duration-200 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base text-on-surface-outline group-hover:text-primary transition-colors">
                  {chip.icon}
                </span>
                <span className="text-xs text-on-surface-variant group-hover:text-on-surface transition-colors leading-snug">
                  {chip.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input area ── */}
      <div className="px-4 pb-4 pt-2">
        <div className="relative flex items-end gap-2 bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-2 focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200 shadow-sm">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your website idea..."
            disabled={isStreaming}
            rows={1}
            className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 px-3 resize-none max-h-28 min-h-9 leading-relaxed placeholder:text-on-surface-outline/60 outline-none"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className="w-9 h-9 flex items-center justify-center bg-primary text-on-primary rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-20 shrink-0"
          >
            <span className="material-symbols-outlined text-lg">arrow_upward</span>
          </button>
        </div>

        {/* Actions row */}
        <div className="flex items-center justify-between mt-2.5 px-1">
          <button
            type="button"
            onClick={onSkip}
            className="text-[11px] text-on-surface-outline/60 hover:text-on-surface-variant transition-colors"
          >
            Skip to blank project
          </button>

          {isComplete && (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-on-primary shadow-md shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Next Step
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          )}
        </div>
      </div>

      {/* CSS keyframes for Winnie avatar */}
      <style>{`
        @keyframes winnie-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes winnie-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
