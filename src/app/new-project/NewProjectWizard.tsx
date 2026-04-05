"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWizardStore } from "@/store/wizard-store";
import type { WizardStep } from "@/types/wizard";
import { StepIndicator } from "./components/StepIndicator";
import { WinnieAvatar } from "./components/WinnieAvatar";
import { WinnieChat } from "./components/WinnieChat";
import { ProjectSettingsStep } from "./components/ProjectSettingsStep";
import { FinalizeStep } from "./components/FinalizeStep";

const STEP_TITLES: Record<WizardStep, { title: string; subtitle: string }> = {
  chat: { title: "Let's build something great", subtitle: "Tell Winnie about your vision" },
  settings: { title: "Make it yours", subtitle: "Customize style and SEO settings" },
  finalize: { title: "Bringing it to life", subtitle: "We're generating your website" },
};

export function NewProjectWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingProjectId = searchParams.get("projectId");

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

  // Store existing projectId from dashboard
  if (existingProjectId && !projectId) {
    setIds(existingProjectId, "", "");
  }

  const handleProjectInfoComplete = (info: typeof projectInfo extends null ? never : NonNullable<typeof projectInfo>) => {
    setProjectInfo(info);
    setStep("settings");
    completeStep("chat");
  };

  const handleSettingsReady = (s: typeof settings extends null ? never : NonNullable<typeof settings>) => {
    setSettings(s);
    setStep("finalize");
    completeStep("settings");
  };

  const handleSkip = async () => {
    reset();
    if (projectId) {
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
        router.push(`/builder/${data.data.id}`);
      }
    } catch {
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
    router.push("/");
  };

  const currentTitle = STEP_TITLES[step];

  return (
    <div className="flex flex-col h-full">
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

        {/* Center: Step indicator (hidden on very small screens) */}
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
            aria-label="Cancel and go back"
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
  );
}
