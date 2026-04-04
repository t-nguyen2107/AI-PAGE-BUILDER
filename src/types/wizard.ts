// Wizard types for the New Project Wizard flow

export interface WizardProjectInfo {
  name: string;
  idea: string;
  style: string;
  targetAudience: string;
  tone: string;
  language: string;
  pages: WizardSitemapPage[];
}

export interface WizardSitemapPage {
  title: string;
  slug: string;
  description: string;
}

export interface WizardSettings {
  styleguide: WizardStyleguide;
  seo: WizardSeo;
  general: WizardGeneral;
}

export interface WizardStyleguide {
  colors: Record<string, string>;
  typography: {
    headingFont?: string;
    bodyFont?: string;
    monoFont?: string;
    fontSizes?: Record<string, string>;
    fontWeights?: Record<string, string>;
  };
  spacing: { values: Record<string, string> };
  cssVariables: Record<string, string>;
}

export interface WizardSeo {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogTitle: string;
  ogDescription: string;
}

export interface WizardGeneral {
  siteName: string;
  companyName: string;
  language: string;
}

export type WizardStep = "chat" | "settings" | "finalize";

export interface WizardChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface WinnieResponse {
  reply: string;
  collectedInfo: Partial<WizardProjectInfo> | null;
  isComplete: boolean;
}

export interface FinalizeRequest {
  projectInfo: WizardProjectInfo;
  settings: WizardSettings;
}

export interface FinalizeResponse {
  projectId: string;
  homePageId: string;
  styleguideId: string;
  pages: Array<{ id: string; title: string; slug: string }>;
}

export interface GenerateSettingsResponse {
  styleguide: WizardStyleguide;
  seo: WizardSeo;
  general: WizardGeneral;
}
