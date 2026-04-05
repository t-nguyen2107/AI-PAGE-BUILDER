"use client";

import { Suspense } from "react";
import { NewProjectWizardModal } from "./components/NewProjectWizardModal";
import { WinnieAvatar } from "./components/WinnieAvatar";

function WizardFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5">
      <WinnieAvatar size="lg" animated />
      <div className="text-center">
        <p className="text-sm font-semibold text-on-surface">Loading Wizard</p>
        <p className="text-xs text-on-surface-outline mt-1">Preparing your creative workspace...</p>
      </div>
    </div>
  );
}

/**
 * Standalone /new-project page — opens wizard modal immediately.
 */
export default function NewProjectPage() {
  return (
    <Suspense fallback={<WizardFallback />}>
      <NewProjectWizardModal
        open={true}
        onClose={() => {
          window.location.href = "/";
        }}
      />
    </Suspense>
  );
}
