"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWizardStore } from "@/store/wizard-store";
import { useToastStore } from "@/store/toast-store";
import type { WizardStep } from "@/types/wizard";
import { StepIndicator } from "./StepIndicator";
import { WinnieAvatar } from "./WinnieAvatar";
import { WinnieChat } from "./WinnieChat";
import { ProjectSettingsStep } from "./ProjectSettingsStep";
import { FinalizeStep } from "./FinalizeStep";

const STEP_TITLES: Record<WizardStep, { title: string; subtitle: string }> = {
  chat: { title: "Let's build something great", subtitle: "Tell Winnie about your vision" },
  settings: { title: "Make it yours", subtitle: "Customize style and SEO settings" },
  finalize: { title: "Bringing it to life", subtitle: "We're generating your website" },
};

interface NewProjectWizardModalProps {
  open: boolean;
  onClose: () => void;
  /** Optional existing project ID (when coming from dashboard "edit" flow) */
  initialProjectId?: string;
}

export function NewProjectWizardModal({ open, onClose, initialProjectId }: NewProjectWizardModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const toast = useToastStore((s) => s.addToast);

  const {
    step,
    setStep,
    projectInfo,
    setProjectInfo,
    settings,
    setSettings,
    projectId,
    setIds,
    completedSteps,
    completeStep,
    reset,
  } = useWizardStore();

  // Set existing projectId if provided (in useEffect to avoid render-time mutation)
  useEffect(() => {
    if (initialProjectId && !projectId) {
      setIds(initialProjectId, "", "");
    }
  }, [initialProjectId, projectId, setIds]);

  // Only render portal client-side (avoid SSR document error)
  useEffect(() => { setMounted(true); }, []);

  const handleProjectInfoComplete = (info: NonNullable<typeof projectInfo>) => {
    setProjectInfo(info);
    setStep("settings");
    completeStep("chat");
  };

  const handleSettingsReady = (s: NonNullable<typeof settings>) => {
    setSettings(s);
    setStep("finalize");
    completeStep("settings");
  };

  const handleSkip = async () => {
    reset();
    if (projectId) {
      onClose();
      router.push(`/builder/${projectId}`);
      return;
    }
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "My Project" }),
      });
      const data = await res.json();
      if (data.success && data.data?.id) {
        onClose();
        router.push(`/builder/${data.data.id}`);
      } else {
        throw new Error("Failed to create blank project");
      }
    } catch (err) {
      console.error("Skip failed:", err);
      toast("Failed to create project. Redirecting to dashboard.", "error");
      onClose();
      router.push("/");
    }
  };

  const handleStepClick = (s: WizardStep) => {
    if (completedSteps.has(s)) {
      setStep(s);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Focus trap + escape key + body scroll lock
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Don't close during finalize
        if (step === "finalize") return;
        handleClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step, onClose],
  );

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => {
        dialogRef.current?.focus();
      });
    }
    return () => {
      document.body.style.overflow = "";
      if (!open && previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => { document.removeEventListener("keydown", handleKeyDown); };
  }, [open, handleKeyDown]);

  if (!mounted || !open) return null;

  const currentTitle = STEP_TITLES[step];

  return createPortal(
    <div className="fixed inset-0 z-modal flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={step === "finalize" ? undefined : handleClose}
        aria-hidden="true"
      />

      {/* Dialog card */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="New Project Wizard"
        tabIndex={-1}
        className={cn(
          "relative w-full max-w-5xl bg-surface-lowest overflow-hidden flex flex-col",
          "shadow-2xl border border-outline-variant/10",
          "h-[92vh] sm:h-[88vh]",
          "rounded-2xl sm:rounded-3xl",
        )}
      >
        {/* ── Top bar ── */}
        <header className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-outline-variant/10 shrink-0">
          {/* Left: Winnie branding */}
          <div className="flex items-center gap-3">
            <WinnieAvatar size="sm" />
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-on-surface tracking-tight">Winnie</p>
              <p className="text-[10px] text-on-surface-outline">AI Assistant</p>
            </div>
          </div>

          {/* Center: Step indicator */}
          <div className="hidden sm:flex">
            <StepIndicator
              currentStep={step}
              onStepClick={handleStepClick}
              completedSteps={completedSteps}
            />
          </div>

          {/* Right: title + close */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-xs font-semibold text-on-surface">{currentTitle.title}</p>
              <p className="text-[10px] text-on-surface-outline">{currentTitle.subtitle}</p>
            </div>

            {/* Mobile step dots */}
            <div className="sm:hidden flex items-center gap-1">
              {(["chat", "settings", "finalize"] as const).map((s, i) => {
                const isActive = s === step;
                const isPast = i < ["chat", "settings", "finalize"].indexOf(step);
                return (
                  <div key={s} className="flex items-center">
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      isActive && "bg-primary scale-125",
                      isPast && "bg-primary/60",
                      !isActive && !isPast && "bg-outline-variant/30",
                    )} />
                    {i < 2 && (
                      <div className={cn(
                        "w-3 h-0.5 rounded-full transition-colors duration-300",
                        isPast ? "bg-primary/40" : "bg-outline-variant/20",
                      )} />
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl text-on-surface-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              aria-label="Cancel and close"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </header>

        {/* ── Content area ── */}
        <div className="flex-1 min-h-0">
          {step === "chat" && (
            <div className="h-full max-w-2xl mx-auto w-full">
              <WinnieChat onComplete={handleProjectInfoComplete} onSkip={handleSkip} />
            </div>
          )}

          {step === "settings" && projectInfo && (
            <div className="h-full max-w-3xl mx-auto w-full">
              <ProjectSettingsStep
                projectInfo={projectInfo}
                onSettingsReady={handleSettingsReady}
                onBack={() => setStep("chat")}
              />
            </div>
          )}

          {step === "finalize" && projectInfo && settings && (
            <div className="h-full">
              <FinalizeStep projectInfo={projectInfo} settings={settings} />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
