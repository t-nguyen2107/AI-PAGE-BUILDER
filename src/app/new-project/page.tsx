"use client";

import { NewProjectWizard } from "./NewProjectWizard";

export default function NewProjectPage() {
  return (
    <div className="fixed inset-0 bg-surface z-base">
      <NewProjectWizard />
    </div>
  );
}
