"use client";

import React from "react";
import type { Plugin } from "@puckeditor/core";
import { AIChatPanel } from "./AIChatPanel";

interface AIPluginOptions {
  projectId: string;
  pageId: string;
}

export function createAIPlugin({ projectId, pageId }: AIPluginOptions): Plugin {
  return {
    name: "ai",
    label: "AI",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    render: () => <AIChatPanel projectId={projectId} pageId={pageId} />,
  };
}
