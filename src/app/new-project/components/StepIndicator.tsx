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
    <nav className="flex items-center" aria-label="Wizard progress">
      {STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = completedSteps.has(step.id);
        const isPast = index < currentIndex;
        const isClickable = isPast || isCompleted;
        const isDone = isCompleted || isPast;
        const isLast = index === STEPS.length - 1;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step circle + label */}
            <button
              type="button"
              disabled={!isClickable && !isActive}
              onClick={() => isClickable && onStepClick?.(step.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-300",
                isClickable && "cursor-pointer",
                !isClickable && !isActive && "cursor-default",
              )}
              aria-current={isActive ? "step" : undefined}
              aria-label={`${step.label} step${isDone ? ", completed" : isActive ? ", current" : ""}`}
            >
              {/* Circle */}
              <div
                className={cn(
                  "relative flex items-center justify-center rounded-full transition-all duration-500",
                  /* Sizes */
                  "w-9 h-9",
                  /* States */
                  isDone && "bg-primary text-on-primary shadow-md shadow-primary/20",
                  isActive && !isDone && "bg-primary/10 text-primary animate-step-pulse",
                  !isDone && !isActive && "bg-surface-container text-on-surface-outline border border-outline-variant/30",
                )}
              >
                {isDone ? (
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check
                  </span>
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-[11px] font-medium transition-colors duration-300",
                  isActive && "text-primary font-semibold",
                  isDone && "text-primary/70",
                  !isDone && !isActive && "text-on-surface-outline/60",
                )}
              >
                {step.label}
              </span>
            </button>

            {/* Connector line */}
            {!isLast && (
              <div className="relative w-10 sm:w-14 h-0.5 mx-1 sm:mx-2 rounded-full bg-outline-variant/20 overflow-hidden">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-700 ease-out",
                    isDone ? "w-full" : isActive && index + 1 === currentIndex + 1 ? "w-1/2" : "w-0",
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
