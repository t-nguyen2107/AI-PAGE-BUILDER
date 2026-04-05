"use client";

import { Suspense } from "react";
import { NewProjectWizard } from "./NewProjectWizard";

function WizardFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
          <span className="material-symbols-outlined text-2xl text-primary">auto_awesome</span>
        </div>
        <div className="absolute -inset-3 rounded-3xl bg-primary/5 blur-2xl -z-10" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-on-surface">Loading Wizard</p>
        <p className="text-xs text-on-surface-outline mt-1">Preparing your creative workspace...</p>
      </div>
      <div className="w-24 h-1 rounded-full bg-outline-variant/10 overflow-hidden">
        <div className="h-full w-1/2 rounded-full bg-primary/40 animate-[indeterminate_1.5s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <div className="fixed inset-0 bg-surface z-base">
      <Suspense fallback={<WizardFallback />}>
        <NewProjectWizard />
      </Suspense>
    </div>
  );
}
