"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWizardStore } from "@/store/wizard-store";
import type { WizardStep, WizardProjectInfo, WizardSettings } from "@/types/wizard";
import { StepIndicator } from "./components/StepIndicator";
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
  const { step, setStep, projectInfo, setProjectInfo, settings, setSettings, reset, projectId, setIds } = useWizardStore();

  // Store existing projectId from dashboard
  useEffect(() => {
    if (existingProjectId && !projectId) {
      setIds(existingProjectId, "", "");
    }
  }, [existingProjectId, projectId, setIds]);

  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(new Set());

  const handleProjectInfoComplete = (info: WizardProjectInfo) => {
    setProjectInfo(info);
    setStep("settings");
    setCompletedSteps((prev) => new Set(prev).add("chat"));
  };

  const handleSettingsReady = (s: WizardSettings) => {
    setSettings(s);
    setStep("finalize");
    setCompletedSteps((prev) => new Set(prev).add("settings"));
  };

  const handleSkip = async () => {
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

  const currentTitle = STEP_TITLES[step];

  return (
    <div className="flex h-screen bg-surface">
      {/* ── Left Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-72 bg-surface-container/40 border-r border-outline-variant/15 shrink-0">
        {/* Brand */}
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/25">
              <span className="material-symbols-outlined text-lg text-on-primary">layers</span>
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface tracking-tight">PageBuilder</p>
              <p className="text-[10px] text-on-surface-outline">AI Website Creator</p>
            </div>
          </div>

          {/* Step indicator */}
          <StepIndicator
            currentStep={step}
            onStepClick={handleStepClick}
            completedSteps={completedSteps}
          />
        </div>

        {/* Bottom: skip link */}
        <div className="mt-auto px-6 pb-6">
          <button
            type="button"
            onClick={handleSkip}
            className="flex items-center gap-2 text-xs text-on-surface-outline hover:text-primary transition-colors group"
          >
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            Skip &amp; create blank project
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile: shows steps; desktop: shows title + close) */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile brand */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-base text-on-primary">layers</span>
              </div>
            </div>
            <div>
              <h1 className="text-base font-bold text-on-surface tracking-tight">{currentTitle.title}</h1>
              <p className="text-xs text-on-surface-outline mt-0.5">{currentTitle.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile step indicator (horizontal) */}
            <div className="lg:hidden flex items-center gap-1 mr-2">
              {(["chat", "settings", "finalize"] as const).map((s, i) => {
                const isActive = s === step;
                const isPast = i < ["chat", "settings", "finalize"].indexOf(step);
                return (
                  <div key={s} className="flex items-center">
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      isActive && "bg-primary scale-125",
                      isPast && "bg-primary/50",
                      !isActive && !isPast && "bg-outline-variant/30",
                    )} />
                    {i < 2 && <div className={cn("w-4 h-0.5", isPast ? "bg-primary/50" : "bg-outline-variant/20")} />}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => { reset(); router.push("/"); }}
              className="p-2 rounded-xl text-on-surface-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              title="Cancel & go back"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </header>

        {/* Content area */}
        <div className={cn(
          "flex-1 min-h-0",
          step === "finalize" ? "" : "",
        )}>
          {step === "chat" && (
            <div className="h-full max-w-2xl mx-auto w-full">
              <WinnieChat onComplete={handleProjectInfoComplete} onSkip={handleSkip} />
            </div>
          )}

          {step === "settings" && projectInfo && (
            <div className="h-full max-w-4xl mx-auto w-full">
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

        {/* Mobile skip */}
        <div className="lg:hidden px-6 pb-4">
          <button
            type="button"
            onClick={handleSkip}
            className="flex items-center gap-2 text-xs text-on-surface-outline hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Skip &amp; create blank project
          </button>
        </div>
      </main>
    </div>
  );
}
