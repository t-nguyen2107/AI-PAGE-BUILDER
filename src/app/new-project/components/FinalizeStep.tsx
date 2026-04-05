"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { generateCssVariables } from "@/lib/css-variables";
import { WinnieAvatar } from "./WinnieAvatar";
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
  description: string;
  icon: string;
}

const PHASES: PhaseInfo[] = [
  { phase: "creating", label: "Creating project", description: "Setting up your workspace", icon: "folder_open" },
  { phase: "styleguide", label: "Style guide", description: "Applying colors and typography", icon: "palette" },
  { phase: "seo", label: "SEO setup", description: "Configuring metadata and search", icon: "search" },
  { phase: "generating", label: "AI generation", description: "Building your homepage with AI", icon: "auto_awesome" },
  { phase: "done", label: "All done!", description: "Redirecting to editor...", icon: "check_circle" },
];

export function FinalizeStep({ projectInfo, settings }: FinalizeStepProps) {
  const router = useRouter();
  const { setIds, projectId: existingProjectId } = useWizardStore();
  const [currentPhase, setCurrentPhase] = useState<FinalizePhase>("creating");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>("");

  const mountedRef = useRef(true);
  // Refs to avoid stale closures in finalize callback
  const projectInfoRef = useRef(projectInfo);
  const settingsRef = useRef(settings);
  const routerRef = useRef(router);
  const setIdsRef = useRef(setIds);
  const existingProjectIdRef = useRef(existingProjectId);

  // Keep refs in sync
  useEffect(() => { projectInfoRef.current = projectInfo; }, [projectInfo]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { routerRef.current = router; }, [router]);
  useEffect(() => { setIdsRef.current = setIds; }, [setIds]);
  useEffect(() => { existingProjectIdRef.current = existingProjectId; }, [existingProjectId]);

  const finalize = useCallback(async () => {
    const info = projectInfoRef.current;
    const s = settingsRef.current;
    const r = routerRef.current;
    const setI = setIdsRef.current;
    const existingId = existingProjectIdRef.current;

    try {
      let projectId: string;
      let homePageId: string;
      let styleguideId: string;

      if (existingId) {
        if (!mountedRef.current) return;
        setCurrentPhase("creating");
        const projRes = await apiClient.getProject(existingId);
        if (!mountedRef.current) return;
        if (!projRes.success || !projRes.data) {
          throw new Error("Failed to load existing project");
        }
        const proj = projRes.data as unknown as {
          id: string;
          pages?: Array<{ id: string; title: string; isHomePage?: boolean }>;
          styleguide?: { id: string };
        };
        projectId = proj.id;
        const homePage = proj.pages?.find((p) => p.isHomePage) ?? proj.pages?.[0];
        if (!homePage) throw new Error("No home page found");
        homePageId = homePage.id;
        styleguideId = (proj.styleguide as { id: string } | undefined)?.id ?? "";
        setI(projectId, homePageId, styleguideId);
      } else {
        if (!mountedRef.current) return;
        setCurrentPhase("creating");
        const finalizeRes = await apiClient.wizardFinalize({ projectInfo: info, settings: s });
        if (!mountedRef.current) return;
        if (!finalizeRes.success || !finalizeRes.data) {
          throw new Error("Failed to create project");
        }
        ({ projectId, homePageId, styleguideId } = finalizeRes.data);
        setI(projectId, homePageId, styleguideId);
      }

      if (!mountedRef.current) return;
      setCurrentPhase("styleguide");
      const cssVars = generateCssVariables(s.styleguide as Parameters<typeof generateCssVariables>[0]);
      if (!cssVars || typeof cssVars !== "object") {
        throw new Error("Failed to generate CSS variables");
      }
      // WizardStyleguide fields are structurally compatible with Styleguide at runtime
      const styleguideUpdate = {
        colors: s.styleguide.colors,
        typography: s.styleguide.typography,
        spacing: s.styleguide.spacing,
        cssVariables: cssVars,
      } as unknown as Parameters<typeof apiClient.updateStyleguide>[1];
      await apiClient.updateStyleguide(projectId, styleguideUpdate);

      if (!mountedRef.current) return;
      setCurrentPhase("seo");
      await apiClient.updateProject(projectId, {
        siteName: s.general.siteName,
        companyName: s.general.companyName,
        language: s.general.language,
      } as Parameters<typeof apiClient.updateProject>[1]);

      if (!mountedRef.current) return;
      setCurrentPhase("generating");
      const prompt = `Create a complete homepage for "${info.name}".
Business: ${info.idea}
Target audience: ${info.targetAudience}
Visual style: ${info.style}
Tone: ${info.tone}

Generate a professional landing page with all essential sections including header, hero, features, and footer.`;

      await new Promise<void>((resolve) => {
        apiClient.generateFromPromptStream(
          {
            prompt,
            projectId,
            pageId: homePageId,
            styleguideId,
          },
          () => {},
          () => { resolve(); },
          (err) => {
            console.error("Homepage generation error:", err);
            resolve();
          },
          (_step, label) => {
            setGenerationProgress(label);
          },
        );
      });

      setCurrentPhase("done");
      setTimeout(() => {
        r.push(`/builder/${projectId}`);
      }, 1500);
    } catch (err) {
      console.error("Finalize error:", err);
      setCurrentPhase("error");
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    finalize().catch(() => {
      if (mountedRef.current) {
        setCurrentPhase("error");
        setErrorMessage("An unexpected error occurred");
      }
    });
    return () => { mountedRef.current = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentPhaseIndex = PHASES.findIndex((p) => p.phase === currentPhase);
  // Start at 15% when creating begins, scale up from there
  const progressPercent =
    currentPhase === "done" ? 100
    : Math.round(15 + ((currentPhaseIndex) / (PHASES.length - 1)) * 85);

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8">
      {/* Central avatar */}
      <div className="relative mb-8">
        {/* Glow ring */}
        <div className={cn(
          "absolute -inset-4 rounded-full blur-2xl transition-colors duration-700",
          currentPhase === "done" ? "bg-success/15" : currentPhase === "error" ? "bg-error/10" : "bg-primary/10",
        )} />

        {/* Spinning ring */}
        {currentPhase !== "done" && currentPhase !== "error" && (
          <div className="absolute -inset-1 rounded-full">
            <div className="w-full h-full rounded-full border-2 border-transparent border-t-primary border-r-primary/30 animate-spin" style={{ animationDuration: "2s" }} />
          </div>
        )}

        <WinnieAvatar
          size="lg"
          animated={currentPhase !== "done" && currentPhase !== "error"}
          className={cn(
            "transition-all duration-500",
            currentPhase === "done" && "ring-2 ring-success/30 ring-offset-2 ring-offset-surface-lowest",
            currentPhase === "error" && "ring-2 ring-error/30 ring-offset-2 ring-offset-surface-lowest",
          )}
        />
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-on-surface">
            {currentPhase === "done" ? "Complete!" : currentPhase === "error" ? "Failed" : `Step ${currentPhaseIndex + 1} of ${PHASES.length}`}
          </span>
          <span className={cn(
            "text-xs font-bold tabular-nums",
            currentPhase === "done" ? "text-success" : currentPhase === "error" ? "text-error" : "text-primary",
          )}>
            {progressPercent}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-outline-variant/10 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              currentPhase === "done" ? "bg-success" : currentPhase === "error" ? "bg-error" : "bg-primary",
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Phase timeline */}
      <div className="w-full max-w-sm space-y-1">
        {PHASES.map((phase, index) => {
          const isCompleted = currentPhaseIndex > index || currentPhase === "done";
          const isActive = phase.phase === currentPhase;

          return (
            <div
              key={phase.phase}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300",
                isActive && "bg-primary/5 ring-1 ring-primary/10",
                isCompleted && !isActive && "opacity-60",
                !isCompleted && !isActive && "opacity-40",
                currentPhase === "error" && !isActive && "opacity-40",
              )}
            >
              {/* Status icon */}
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300",
                isCompleted && "bg-success/10",
                isActive && currentPhase !== "error" && "bg-primary/10",
                isActive && currentPhase === "error" && "bg-error/10",
                !isCompleted && !isActive && "bg-surface-container",
              )}>
                <span
                  className={cn(
                    "material-symbols-outlined text-sm",
                    isCompleted && "text-success",
                    isActive && currentPhase !== "error" && "text-primary",
                    isActive && currentPhase === "error" && "text-error",
                    !isCompleted && !isActive && "text-on-surface-outline",
                  )}
                >
                  {isCompleted ? "check_circle" : phase.icon}
                </span>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-xs font-semibold leading-tight",
                  isCompleted && "text-success",
                  isActive && "text-on-surface",
                  !isCompleted && !isActive && "text-on-surface-outline",
                )}>
                  {phase.label}
                </p>
                <p className="text-[10px] text-on-surface-outline mt-0.5 truncate">
                  {isActive && phase.phase === "generating" && generationProgress
                    ? generationProgress
                    : phase.description}
                </p>
              </div>

              {/* Spinner */}
              {isActive && currentPhase !== "done" && currentPhase !== "error" && (
                <div className="w-3.5 h-3.5 border-2 border-primary/40 border-t-primary rounded-full animate-spin shrink-0" />
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
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary text-on-primary rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Try Again
          </button>
        </div>
      )}

      {/* Project name */}
      <p className="mt-6 text-[11px] text-on-surface-outline/70">
        Building &ldquo;{projectInfo.name}&rdquo;
      </p>
    </div>
  );
}
