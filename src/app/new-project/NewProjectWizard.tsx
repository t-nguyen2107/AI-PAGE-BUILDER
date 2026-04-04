"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWizardStore } from "@/store/wizard-store";
import type { WizardStep, WizardProjectInfo, WizardSettings } from "@/types/wizard";
import { StepIndicator } from "./components/StepIndicator";
import { WinnieChat } from "./components/WinnieChat";
import { ProjectSettingsStep } from "./components/ProjectSettingsStep";
import { FinalizeStep } from "./components/FinalizeStep";

export function NewProjectWizard() {
  const router = useRouter();
  const { step, setStep, projectInfo, setProjectInfo, settings, setSettings, reset } = useWizardStore();
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
    // Create blank project with minimal defaults and redirect to builder
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
      // Fallback: go home
      router.push("/");
    }
  };

  const handleStepClick = (s: WizardStep) => {
    if (completedSteps.has(s)) {
      setStep(s);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-surface">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-outline-variant/20 bg-surface-lowest shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-base text-primary">add_circle</span>
          </div>
          <h1 className="text-sm font-semibold text-on-surface">New Project</h1>
        </div>

        <div className="flex items-center gap-3">
          <StepIndicator
            currentStep={step}
            onStepClick={handleStepClick}
            completedSteps={completedSteps}
          />
          <button
            type="button"
            onClick={() => {
              reset();
              router.push("/");
            }}
            className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Cancel"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 min-h-0",
          step === "finalize" ? "flex items-center justify-center" : "",
        )}
      >
        {step === "chat" && (
          <div className="max-w-2xl mx-auto w-full h-full">
            <WinnieChat onComplete={handleProjectInfoComplete} onSkip={handleSkip} />
          </div>
        )}

        {step === "settings" && projectInfo && (
          <div className="max-w-3xl mx-auto w-full h-full">
            <ProjectSettingsStep
              projectInfo={projectInfo}
              onSettingsReady={handleSettingsReady}
              onBack={() => setStep("chat")}
            />
          </div>
        )}

        {step === "finalize" && projectInfo && settings && (
          <div className="w-full h-full">
            <FinalizeStep projectInfo={projectInfo} settings={settings} />
          </div>
        )}
      </main>
    </div>
  );
}
