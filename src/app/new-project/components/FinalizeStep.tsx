"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { generateCssVariables } from "@/lib/css-variables";
import type { WizardProjectInfo, WizardSettings } from "@/types/wizard";
import { useWizardStore } from "@/store/wizard-store";

interface FinalizeStepProps {
  projectInfo: WizardProjectInfo;
  settings: WizardSettings;
}

type FinalizePhase = "creating" | "styleguide" | "seo" | "generating" | "done" | "error";

interface PhaseInfo {
  phase: FinalizePhase;
  label: string;
  icon: string;
}

const PHASES: PhaseInfo[] = [
  { phase: "creating", label: "Creating project...", icon: "folder_open" },
  { phase: "styleguide", label: "Setting up styleguide...", icon: "palette" },
  { phase: "seo", label: "Applying SEO settings...", icon: "search" },
  { phase: "generating", label: "Generating your homepage...", icon: "auto_awesome" },
  { phase: "done", label: "Done! Redirecting...", icon: "check_circle" },
];

export function FinalizeStep({ projectInfo, settings }: FinalizeStepProps) {
  const router = useRouter();
  const { setIds } = useWizardStore();
  const [currentPhase, setCurrentPhase] = useState<FinalizePhase>("creating");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>("");

  const finalize = useCallback(async () => {
    try {
      // Phase 1: Create project
      setCurrentPhase("creating");
      const finalizeRes = await apiClient.wizardFinalize({ projectInfo, settings });

      if (!finalizeRes.success || !finalizeRes.data) {
        throw new Error("Failed to create project");
      }

      const { projectId, homePageId, styleguideId } = finalizeRes.data;
      setIds(projectId, homePageId, styleguideId);

      // Phase 2: Update styleguide with AI suggestions + CSS variables
      setCurrentPhase("styleguide");
      const styleguideWithVars = {
        ...settings.styleguide,
        cssVariables: generateCssVariables(settings.styleguide as Parameters<typeof generateCssVariables>[0]),
      };
      await apiClient.updateStyleguide(projectId, styleguideWithVars as unknown as Parameters<typeof apiClient.updateStyleguide>[1]);

      // Phase 3: Update SEO on homepage
      setCurrentPhase("seo");
      await apiClient.updateProject(projectId, {
        siteName: settings.general.siteName,
        companyName: settings.general.companyName,
        language: settings.general.language,
      } as Parameters<typeof apiClient.updateProject>[1]);

      // Phase 4: Generate homepage via existing AI pipeline
      setCurrentPhase("generating");
      const prompt = `Create a complete homepage for "${projectInfo.name}".
Business: ${projectInfo.idea}
Target audience: ${projectInfo.targetAudience}
Visual style: ${projectInfo.style}
Tone: ${projectInfo.tone}

Generate a professional landing page with all essential sections including header, hero, features, and footer.`;

      await new Promise<void>((resolve) => {
        apiClient.generateFromPromptStream(
          {
            prompt,
            projectId,
            pageId: homePageId,
            styleguideId,
          },
          // onChunk - not used for display here
          () => {},
          // onDone
          () => {
            resolve();
          },
          // onError - don't fail the whole flow, just warn
          (err) => {
            console.error("Homepage generation error:", err);
            // Still resolve - user can regenerate from AI panel
            resolve();
          },
          // onStatus
          (_step, label) => {
            setGenerationProgress(label);
          },
        );
      });

      // Phase 5: Done!
      setCurrentPhase("done");
      setTimeout(() => {
        router.push(`/builder/${projectId}`);
      }, 1500);
    } catch (err) {
      console.error("Finalize error:", err);
      setCurrentPhase("error");
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  }, [projectInfo, settings, router, setIds]);

  useEffect(() => {
    let cancelled = false;
    finalize().catch(() => {
      if (!cancelled) {
        setCurrentPhase("error");
        setErrorMessage("An unexpected error occurred");
      }
    });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- intentionally run once on mount

  const currentPhaseIndex = PHASES.findIndex((p) => p.phase === currentPhase);

  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      {/* Progress indicator */}
      <div className="w-full max-w-md space-y-3">
        {PHASES.map((phase, index) => {
          const isCompleted = currentPhaseIndex > index || currentPhase === "done";
          const isActive = phase.phase === currentPhase;
          const isPending = currentPhaseIndex < index;

          return (
            <div
              key={phase.phase}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                isActive && "bg-primary/5 border border-primary/20",
                isCompleted && "opacity-60",
                isPending && "opacity-30",
                currentPhase === "error" && "opacity-30",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                  isCompleted && "bg-success/10",
                  isActive && "bg-primary/10",
                  isPending && "bg-surface-container",
                )}
              >
                <span
                  className={cn(
                    "material-symbols-outlined text-lg",
                    isCompleted && "text-success",
                    isActive && currentPhase !== "error" && "text-primary animate-pulse",
                    isPending && "text-on-surface-outline",
                  )}
                >
                  {isCompleted ? "check_circle" : phase.icon}
                </span>
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    "text-xs font-medium",
                    isCompleted && "text-success line-through",
                    isActive && "text-on-surface",
                    isPending && "text-on-surface-outline",
                  )}
                >
                  {phase.label}
                </p>
                {isActive && phase.phase === "generating" && generationProgress && (
                  <p className="text-[10px] text-on-surface-outline mt-0.5">{generationProgress}</p>
                )}
              </div>
              {isActive && currentPhase !== "error" && currentPhase !== "done" && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          );
        })}
      </div>

      {/* Error state */}
      {currentPhase === "error" && (
        <div className="mt-6 text-center">
          <p className="text-sm text-error mb-3">{errorMessage}</p>
          <button
            type="button"
            onClick={finalize}
            className="px-4 py-2 text-xs font-medium bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Project name display */}
      <p className="mt-8 text-xs text-on-surface-outline">
        Building &ldquo;{projectInfo.name}&rdquo;
      </p>
    </div>
  );
}
