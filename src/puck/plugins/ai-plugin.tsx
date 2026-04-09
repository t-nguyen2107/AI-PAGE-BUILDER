"use client";

import React from "react";
import type { Plugin } from "@puckeditor/core";
import { AIChatPanel } from "./AIChatPanel";

interface AIPluginOptions {
  projectId: string;
  pageId: string;
  styleguideId?: string;
  generationStatus?: string | null;
}

export function createAIPlugin({ projectId, pageId, styleguideId, generationStatus }: AIPluginOptions): Plugin {
  return {
    name: "ai",
    label: "AI",
    icon: (
      <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
    ),
    render: () => <AIChatPanel projectId={projectId} pageId={pageId} styleguideId={styleguideId ?? ""} generationStatus={generationStatus} />,
  };
}
