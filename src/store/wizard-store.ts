import { create } from "zustand";
import type {
  WizardStep,
  WizardProjectInfo,
  WizardSettings,
} from "@/types/wizard";

interface WizardStore {
  step: WizardStep;
  projectInfo: WizardProjectInfo | null;
  settings: WizardSettings | null;
  projectId: string | null;
  homePageId: string | null;
  styleguideId: string | null;
  completedSteps: Set<WizardStep>;

  setStep: (step: WizardStep) => void;
  setProjectInfo: (info: WizardProjectInfo) => void;
  setSettings: (settings: WizardSettings) => void;
  setIds: (projectId: string, homePageId: string, styleguideId: string) => void;
  completeStep: (step: WizardStep) => void;
  reset: () => void;
}

const initialState = {
  step: "chat" as WizardStep,
  projectInfo: null,
  settings: null,
  projectId: null,
  homePageId: null,
  styleguideId: null,
  completedSteps: new Set<WizardStep>(),
};

export const useWizardStore = create<WizardStore>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setProjectInfo: (projectInfo) => set({ projectInfo }),
  setSettings: (settings) => set({ settings }),
  setIds: (projectId, homePageId, styleguideId) =>
    set({ projectId, homePageId, styleguideId }),
  completeStep: (step) =>
    set((s) => {
      const next = new Set(s.completedSteps);
      next.add(step);
      return { completedSteps: next };
    }),
  reset: () => set(initialState),
}));
