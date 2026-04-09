"use client";

import { createContext, useContext } from "react";

interface AIContextValue {
  projectId: string;
  pageId: string;
  styleguideId: string;
  generationStatus: string | null;
}

export const AIContext = createContext<AIContextValue>({
  projectId: "",
  pageId: "",
  styleguideId: "",
  generationStatus: null,
});

export function useAIContext() {
  return useContext(AIContext);
}
