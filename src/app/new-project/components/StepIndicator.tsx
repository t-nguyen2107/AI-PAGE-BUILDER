"use client";

import { cn } from "@/lib/utils";
import type { WizardStep } from "@/types/wizard";

const STEPS: Array<{ id: WizardStep; label: string; icon: string }> = [
  { id: "chat", label: "Plan", icon: "chat_bubble" },
  { id: "settings", label: "Customize", icon: "tune" },
  { id: "finalize", label: "Build", icon: "rocket_launch" },
];

interface StepIndicatorProps {
  currentStep: WizardStep;
  onStepClick?: (step: WizardStep) => void;
  completedSteps?: Set<WizardStep>;
}

export function StepIndicator({ currentStep, onStepClick, completedSteps = new Set() }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav className="flex flex-col gap-0.5" aria-label="Wizard progress">
      {STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = completedSteps.has(step.id);
        const isPast = index < currentIndex;
        const isClickable = isPast || isCompleted;
        const isDone = isCompleted || isPast;

        return (
          <div key={step.id}>
            <button
              type="button"
              disabled={!isClickable && !isActive}
              onClick={() => isClickable && onStepClick?.(step.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 text-left",
                isActive && "bg-primary/5",
                !isActive && isClickable && "hover:bg-surface-container/60 cursor-pointer",
                !isActive && !isClickable && "cursor-default",
              )}
            >
              {/* Step number */}
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 text-[13px] font-bold",
                isDone && "bg-primary text-on-primary shadow-md shadow-primary/20",
                isActive && !isDone && "ring-2 ring-primary ring-offset-2 ring-offset-surface text-primary bg-primary/10",
                !isDone && !isActive && "bg-outline-variant/12 text-on-surface-outline",
              )}>
                {isDone ? (
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <div className="flex flex-col ml-1">
                <span className={cn(
                  "text-sm font-semibold transition-colors",
                  isActive && "text-on-surface",
                  isDone && "text-primary",
                  !isDone && !isActive && "text-on-surface-outline",
                )}>
                  {step.label}
                </span>
                <span className={cn(
                  "text-[11px] transition-colors mt-0.5",
                  isActive ? "text-on-surface-variant" : "text-on-surface-outline/50",
                )}>
                  {isDone ? "Completed" : isActive ? "In progress" : "Upcoming"}
                </span>
              </div>
            </button>

            {/* Connector */}
            {index < STEPS.length - 1 && (
              <div className="flex items-center pl-7 py-0.5">
                <div className={cn(
                  "w-px h-6 rounded-full transition-colors duration-500",
                  isDone ? "bg-primary/40" : "bg-outline-variant/15",
                )} />
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
