"use client";

import { cn } from "@/lib/utils";
import type { WizardStep } from "@/types/wizard";

const STEPS: Array<{ id: WizardStep; label: string; icon: string }> = [
  { id: "chat", label: "Plan", icon: "forum" },
  { id: "settings", label: "Customize", icon: "palette" },
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
    <div className="flex items-center gap-1">
      {STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = completedSteps.has(step.id);
        const isPast = index < currentIndex;
        const isClickable = isPast || isCompleted;

        return (
          <div key={step.id} className="flex items-center">
            {index > 0 && (
              <div
                className={cn(
                  "w-8 h-0.5 mx-1 rounded-full transition-colors",
                  isPast ? "bg-primary" : "bg-outline-variant/30",
                )}
              />
            )}
            <button
              type="button"
              disabled={!isClickable && !isActive}
              onClick={() => isClickable && onStepClick?.(step.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                isActive && "bg-primary text-on-primary shadow-md shadow-primary/20",
                isPast && !isActive && "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer",
                !isPast && !isActive && "text-on-surface-outline cursor-default",
              )}
            >
              <span
                className={cn(
                  "material-symbols-outlined text-sm",
                  isActive ? "text-on-primary" : isPast ? "text-primary" : "text-on-surface-outline",
                )}
              >
                {isCompleted && isPast ? "check_circle" : step.icon}
              </span>
              {step.label}
            </button>
          </div>
        );
      })}
    </div>
  );
}
