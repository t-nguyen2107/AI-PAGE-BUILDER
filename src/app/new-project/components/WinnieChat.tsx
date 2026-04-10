"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { WizardChatMessage, WinnieResponse, WizardProjectInfo } from "@/types/wizard";
import { WinnieAvatar } from "./WinnieAvatar";
import { ImportPlaceholders } from "./ImportPlaceholders";
import {
  StylePalettePicker,
  buildProjectInfoFromPalette,
  type StylePalette,
} from "./StylePalettePicker";

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

// ── Rich suggestion cards with gradient previews ──
const SUGGESTION_CARDS = [
  { icon: "local_cafe", title: "Coffee Shop", prompt: "A modern coffee shop website with menu showcase and online ordering", accent: "#B45309" },
  { icon: "cloud", title: "SaaS Landing", prompt: "A SaaS landing page with features, pricing tiers, and signup flow", accent: "#2563EB" },
  { icon: "photo_camera", title: "Photography", prompt: "A portfolio website for a photographer with gallery and booking", accent: "#64748B" },
  { icon: "restaurant", title: "Restaurant", prompt: "A restaurant website with menu showcase, reservations, and review", accent: "#DC2626" },
];

// ── Ambient floating particles ──
const PARTICLES = [
  { x: "12%", y: "20%", size: 4, delay: 0, duration: 6 },
  { x: "85%", y: "15%", size: 3, delay: 1.2, duration: 7 },
  { x: "25%", y: "70%", size: 5, delay: 0.8, duration: 5.5 },
  { x: "75%", y: "65%", size: 3, delay: 2, duration: 6.5 },
  { x: "50%", y: "40%", size: 4, delay: 0.5, duration: 8 },
  { x: "90%", y: "50%", size: 3, delay: 1.8, duration: 7 },
  { x: "8%", y: "55%", size: 4, delay: 2.5, duration: 5 },
];

// ── Celebration confetti ──
const CONFETTI = [
  { color: "#FFBE0B", x: 30, delay: 0, angle: -15 },
  { color: "#5ec4b8", x: 45, delay: 0.08, angle: 10 },
  { color: "#FF8FAB", x: 55, delay: 0.15, angle: -20 },
  { color: "#E39C37", x: 65, delay: 0.05, angle: 5 },
  { color: "#22746e", x: 35, delay: 0.12, angle: -10 },
  { color: "#FFBE0B", x: 50, delay: 0.2, angle: 15 },
  { color: "#5ec4b8", x: 40, delay: 0.18, angle: -5 },
  { color: "#FF8FAB", x: 60, delay: 0.1, angle: 12 },
];

const CHAT_CONTEXT_LIMIT = 10;

// ── Greeting warm-up: greetings go through the real API to warm the model ──
// (Removed canned response — model warm-up on first interaction improves subsequent latency)

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
  const [showConfetti, setShowConfetti] = useState(false);
  const chatHistory = useRef<WizardChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isStreamingRef = useRef(false);
  const collectedInfoRef = useRef<Partial<WizardProjectInfo> | null>(null);

  // ── Typewriter effect ──
  const typewriterPosRef = useRef(0);
  const typewriterTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [, forceRender] = useState(0);

  // Gradually reveal streaming text (2 chars / 20ms ≈ 100 chars/sec)
  useEffect(() => {
    const hasStreaming = messages.some(m => m.status === "streaming");

    if (!hasStreaming) {
      typewriterPosRef.current = Infinity;
      if (typewriterTimerRef.current) {
        clearInterval(typewriterTimerRef.current);
        typewriterTimerRef.current = null;
      }
      return;
    }

    if (!typewriterTimerRef.current) {
      typewriterTimerRef.current = setInterval(() => {
        typewriterPosRef.current += 2;
        forceRender(n => n + 1);
      }, 20);
    }
  }, [messages]);

  // Cleanup typewriter timer on unmount
  useEffect(() => {
    return () => {
      if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
    };
  }, []);

  // Keep refs in sync with state
  useEffect(() => { isStreamingRef.current = isStreaming; }, [isStreaming]);
  useEffect(() => { collectedInfoRef.current = collectedInfo; }, [collectedInfo]);

  // Trigger confetti on completion
  useEffect(() => {
    if (isComplete) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isComplete]);

  // Auto-scroll on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Cleanup abort on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  // Auto-grow textarea
  const adjustTextareaHeight = useCallback(() => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
    }
  }, []);

  const handleSend = useCallback(
    async (messageText?: string) => {
      const text = (messageText ?? inputRef.current?.value ?? "").trim();
      if (!text || isStreamingRef.current || abortRef.current !== null) return;

      setInput("");
      if (inputRef.current) inputRef.current.style.height = "auto";

      if (isComplete) {
        setIsComplete(false);
      }

      const msgId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: `user-${msgId}`, role: "user", content: text, timestamp: Date.now(), status: "done" },
      ]);

      setIsStreaming(true);

      const assistantMsgId = `assistant-${msgId}`;
      typewriterPosRef.current = 0;
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
            messages: chatHistory.current.slice(-CHAT_CONTEXT_LIMIT),
            userMessage: text,
            collectedSoFar: collectedInfoRef.current,
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
                if (info.collectedInfo) setCollectedInfo((prev) => {
                  const incoming = info.collectedInfo!;
                  const merged = { ...prev, ...incoming };
                  // Preserve paletteColors if Winnie didn't explicitly set it this turn
                  if (incoming.paletteColors === null && prev?.paletteColors) {
                    merged.paletteColors = prev.paletteColors;
                  }
                  // Preserve colorKeywords/styleKeywords if Winnie didn't set them
                  if (incoming.colorKeywords === null && prev?.colorKeywords) {
                    merged.colorKeywords = prev.colorKeywords;
                  }
                  if (incoming.styleKeywords === null && prev?.styleKeywords) {
                    merged.styleKeywords = prev.styleKeywords;
                  }
                  return merged;
                });
                if (info.isComplete) {
                  setIsComplete(true);
                }
              } else if (event.type === "error") {
                throw new Error(event.message ?? "Chat error");
              }
            } catch (parseErr) {
              if (parseErr instanceof Error && parseErr.message !== "Chat error") {
                /* skip malformed SSE */
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
        abortRef.current = null;
        setIsStreaming(false);
        inputRef.current?.focus();
      }
    },
    [isComplete],
  );

  const handleNext = () => {
    if (!collectedInfo?.name && !collectedInfo?.idea) {
      return;
    }
    const fullInfo: WizardProjectInfo = {
      name: collectedInfo.name ?? "My Project",
      idea: collectedInfo.idea ?? "",
      style: collectedInfo.style ?? "modern",
      targetAudience: collectedInfo.targetAudience ?? "general",
      tone: collectedInfo.tone ?? "professional",
      language: collectedInfo.language ?? "en",
      pages: collectedInfo.pages ?? [{ title: "Home", slug: "home", description: "Homepage" }],
      paletteColors: collectedInfo.paletteColors ?? undefined,
      colorKeywords: collectedInfo.colorKeywords ?? undefined,
      styleKeywords: collectedInfo.styleKeywords ?? undefined,
    };
    onComplete(fullInfo);
  };

  // ── Palette selection handler ──
  const handlePaletteSelect = useCallback(
    (palette: StylePalette) => {
      const idea = collectedInfoRef.current?.idea ?? "";
      const name = collectedInfoRef.current?.name ?? "My Project";
      const language = collectedInfoRef.current?.language ?? "en";
      const fullInfo = buildProjectInfoFromPalette(palette, name, idea, language);
      setCollectedInfo(fullInfo);
      collectedInfoRef.current = fullInfo;
      setIsComplete(true);

      const msgId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        {
          id: `palette-${msgId}`,
          role: "assistant",
          content: `Great choice! "${palette.label}" is a perfect direction for ${name}. Let's customize the details!`,
          timestamp: Date.now(),
          status: "done" as const,
        },
      ]);
      chatHistory.current.push({
        role: "assistant",
        content: `User selected style: ${palette.label}`,
      });
    },
    [],
  );

  const showPalettePicker =
    !!(collectedInfo?.name && collectedInfo?.idea) &&
    !isComplete &&
    !isStreaming &&
    !collectedInfo?.paletteColors;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isWelcome = messages.length <= 1;

  return (
    <div className="flex flex-col h-full relative">
      {/* ── Animated gradient accent bar ── */}
      <div
        className="h-0.5 shrink-0 animate-gradient-flow"
        style={{
          background: "linear-gradient(90deg, #22746e, #5ec4b8, #E39C37, #FFBE0B, #22746e)",
          backgroundSize: "200% 100%",
        }}
        aria-hidden="true"
      />

      {/* ── Messages area ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto relative"
        aria-live="polite"
        role="log"
      >
        {/* ── Subtle radial gradient background ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isWelcome
              ? "radial-gradient(ellipse at 50% 30%, rgba(34, 116, 110, 0.04) 0%, transparent 60%), radial-gradient(ellipse at 50% 30%, rgba(255, 190, 11, 0.03) 0%, transparent 50%)"
              : "radial-gradient(ellipse at 50% 0%, rgba(34, 116, 110, 0.02) 0%, transparent 40%)",
          }}
          aria-hidden="true"
        />

        {isWelcome ? (
          /* ── Welcome Hero ── */
          <div className="flex flex-col items-center justify-center h-full text-center px-4 sm:px-6 relative">
            {/* Ambient floating particles */}
            {PARTICLES.map((p, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-primary/15 animate-float-particle pointer-events-none"
                style={{
                  left: p.x,
                  top: p.y,
                  width: p.size,
                  height: p.size,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                }}
                aria-hidden="true"
              />
            ))}

            {/* Avatar with subtle glow */}
            <div className="relative mb-6">
              {/* Soft glow */}
              <div
                className="absolute -inset-6 rounded-full bg-primary/4 blur-xl animate-hero-glow"
                aria-hidden="true"
              />
              <div className="relative">
                <WinnieAvatar size="lg" animated />
              </div>
            </div>

            {/* Greeting with staggered reveal */}
            <div className="animate-wizard-fade-up">
              <h2 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
                Let&apos;s build something amazing
              </h2>
              <p className="text-sm text-on-surface-outline mt-2.5 max-w-sm mx-auto leading-relaxed">
                Tell me about your dream website and I&apos;ll help bring it to life
              </p>
            </div>

            {/* Import teasers */}
            <div className="mt-7 w-full max-w-md animate-card-enter" style={{ animationDelay: "150ms" }}>
              <ImportPlaceholders />
            </div>

            {/* ── Suggestion chips ── */}
            <div className="flex flex-wrap justify-center gap-2 mt-5 w-full max-w-md">
              {SUGGESTION_CARDS.map((card, i) => (
                <button
                  key={card.title}
                  type="button"
                  onClick={() => handleSend(card.prompt)}
                  disabled={isStreaming}
                  className={cn(
                    "animate-card-enter inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full",
                    "text-xs font-medium text-on-surface-variant",
                    "border border-outline-variant/20 bg-surface-lowest",
                    "hover:border-primary/25 hover:text-on-surface hover:bg-surface-container/60",
                    "active:scale-[0.97] transition-all duration-200",
                    "disabled:opacity-50 disabled:pointer-events-none",
                    "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
                  )}
                  style={{ animationDelay: `${(i + 2) * 80}ms` }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: card.accent }}
                  />
                  {card.title}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ── Normal chat messages ── */
          <div className="space-y-5 px-4 sm:px-6 py-6">
            {messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 animate-wizard-fade-up",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row",
                )}
              >
                {/* Avatar */}
                {msg.role === "assistant" && (
                  <div className="shrink-0 mt-1">
                    <WinnieAvatar size="sm" />
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={cn(
                    "max-w-[85%] text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-on-primary px-4 py-3 rounded-2xl rounded-tr-md shadow-sm shadow-primary/10"
                      : "bg-surface-container/40 text-on-surface px-4 py-3 rounded-2xl rounded-tl-md border border-outline-variant/10",
                  )}
                >
                  {msg.content ? (
                    <>
                      <span className="whitespace-pre-wrap">
                        {msg.status === "streaming"
                          ? msg.content.slice(0, typewriterPosRef.current)
                          : msg.content}
                      </span>
                      {msg.status === "streaming" && (
                        <span className="inline-block w-0.5 h-4 bg-primary/70 ml-0.5 align-middle animate-cursor-blink" />
                      )}
                      {/* Continue button with celebration */}
                      {msg.role === "assistant" && isComplete && msg.status === "done" && idx === messages.length - 1 && (
                        <div className="mt-4 relative">
                          {/* Celebration confetti burst */}
                          {showConfetti && CONFETTI.map((c, ci) => (
                            <span
                              key={ci}
                              className="absolute animate-confetti-burst rounded-full"
                              style={{
                                width: 6,
                                height: 6,
                                backgroundColor: c.color,
                                left: `${c.x}%`,
                                top: -8,
                                animationDelay: `${c.delay}s`,
                                transform: `rotate(${c.angle}deg)`,
                              }}
                              aria-hidden="true"
                            />
                          ))}
                          <div className="animate-celebrate-glow rounded-xl">
                            <button
                              type="button"
                              onClick={handleNext}
                              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-primary/20"
                            >
                              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                                auto_awesome
                              </span>
                              Continue to Customize
                              <span className="material-symbols-outlined text-base">arrow_forward</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Typing indicator — wave dots */
                    <div className="flex items-center gap-1.5 py-1 px-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-2 h-2 rounded-full bg-on-surface-outline/40 animate-dot-wave"
                          style={{ animationDelay: `${i * 200}ms` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Style palette picker (appears after name + idea collected) ── */}
      {showPalettePicker && (
        <div className="px-4 sm:px-6 pb-2 shrink-0 animate-card-enter">
          <StylePalettePicker
            businessIdea={collectedInfo?.idea ?? ""}
            onSelect={handlePaletteSelect}
            disabled={isStreaming}
            colorKeywords={collectedInfo?.colorKeywords}
            styleKeywords={collectedInfo?.styleKeywords}
          />
        </div>
      )}

      {/* ── Input area ── */}
      <div className="px-4 sm:px-6 pb-4 pt-2 shrink-0">
        <div className="flex items-center gap-2 bg-surface-container/40 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/15 focus-within:bg-surface-container/60 transition-all duration-200">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder={isWelcome ? "Try a suggestion above, or type your idea..." : "Describe your website idea..."}
            disabled={isStreaming}
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none outline-none max-h-32 min-h-6 leading-relaxed placeholder:text-on-surface-outline/50"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className="w-9 h-9 flex items-center justify-center bg-primary text-on-primary rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-20 shrink-0"
            aria-label="Send message"
          >
            <span className="material-symbols-outlined text-lg">arrow_upward</span>
          </button>
        </div>

        {/* Actions row */}
        <div className="flex items-center justify-between mt-2 px-1">
          <button
            type="button"
            onClick={onSkip}
            className="text-[11px] text-on-surface-outline/70 hover:text-on-surface-variant transition-colors"
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
    </div>
  );
}
