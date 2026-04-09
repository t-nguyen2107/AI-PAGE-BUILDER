"use client";

import type { Plugin } from "@puckeditor/core";
import { AIChatPanel } from "./AIChatPanel";

export function createAIPlugin(): Plugin {
  return {
    name: "ai",
    label: "AI",
    icon: (
      <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
    ),
    render: () => <AIChatPanel />,
  };
}
