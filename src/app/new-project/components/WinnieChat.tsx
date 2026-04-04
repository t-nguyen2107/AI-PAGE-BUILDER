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
  "A modern coffee shop website",
  "SaaS landing page with pricing",
  "Portfolio for a photographer",
  "Restaurant with menu showcase",
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

  const chatHistory = useRef<WizardChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Cleanup: abort in-flight chat request on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleSend = useCallback(
    async (messageText?: string) => {
      const text = (messageText ?? input).trim();
      if (!text || isStreaming) return;

      setInput("");
      setIsStreaming(true);

      const userMsg: DisplayMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: Date.now(),
        status: "done",
      };
      setMessages((prev) => [...prev, userMsg]);

      const assistantMsgId = `assistant-${Date.now()}`;
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

        if (!res.ok || !res.body) {
          throw new Error(`Chat failed (${res.status})`);
        }

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
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: fullText } : m,
                  ),
                );
              } else if (event.type === "done" && event.extractedInfo) {
                const info = event.extractedInfo as WinnieResponse;
                chatHistory.current.push({ role: "assistant", content: info.reply });

                if (info.collectedInfo) {
                  setCollectedInfo((prev) => ({ ...prev, ...info.collectedInfo }));
                }
                if (info.isComplete) {
                  setIsComplete(true);
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
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, status: "done" as const } : m,
          ),
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
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-outline-variant/30">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-xl text-primary">auto_awesome</span>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-on-surface">Winnie</h2>
          <p className="text-[11px] text-on-surface-outline">AI Website Design Consultant</p>
        </div>
      </div>

      {/* Import Placeholders */}
      <div className="px-6 py-3 border-b border-outline-variant/20 bg-surface-container/30">
        <ImportPlaceholders />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] px-4 py-2.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-primary text-on-primary rounded-2xl rounded-br-md"
                  : "bg-surface-container/80 text-on-surface rounded-2xl rounded-bl-md border border-outline-variant/20",
              )}
            >
              {msg.content ? (
                <span className="whitespace-pre-wrap">
                  {msg.content}
                  {msg.status === "streaming" && (
                    <span className="inline-block w-0.5 h-3.5 bg-primary ml-0.5 align-middle animate-ai-pulse" />
                  )}
                </span>
              ) : (
                <div className="flex items-center gap-1.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestion Chips (show when few messages) */}
      {messages.length <= 2 && (
        <div className="px-6 pb-2 flex flex-wrap gap-2">
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleSend(chip)}
              disabled={isStreaming}
              className="px-3 py-1.5 text-xs rounded-full border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t border-outline-variant/30">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your website idea..."
            disabled={isStreaming}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-outline-variant/40 bg-surface-container/50 px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 disabled:opacity-50 transition-colors"
            style={{ maxHeight: "120px" }}
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className="p-2.5 rounded-xl bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <span className="material-symbols-outlined text-lg">send</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-3">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-on-surface-outline hover:text-on-surface transition-colors"
          >
            Skip & create blank project
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!isComplete}
            className={cn(
              "px-5 py-2 rounded-lg text-xs font-medium transition-all",
              isComplete
                ? "bg-primary text-on-primary shadow-md shadow-primary/20 hover:opacity-90 active:scale-[0.98]"
                : "bg-surface-container text-on-surface-outline cursor-not-allowed",
            )}
          >
            Next: Customize
            <span className="material-symbols-outlined text-sm align-middle ml-1">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
