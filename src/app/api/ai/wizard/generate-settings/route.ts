import { NextRequest } from "next/server";
import { createFastModelBundle } from "@/lib/ai/provider";
import { generateStyleguideFromBusinessType } from "@/lib/ai/knowledge/auto-styleguide";
import { detectBusinessType } from "@/lib/ai/knowledge/business-detect";
import { resolveWizardRecommendations } from "@/lib/ai/knowledge/color-matcher";

import type { WizardProjectInfo, GenerateSettingsResponse } from "@/types/wizard";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { generateCssVariables } from "@/lib/css-variables";

// ─── Business type detection (uses shared utility) ──────────────────────────
// detectBusinessType is imported from @/lib/ai/knowledge/business-detect

// ─── Fallback styleguide (when no business type match) ────────────────────────

function buildFallbackStyleguide(): GenerateSettingsResponse["styleguide"] {
  const colors = {
    primary: "#2563EB",
    secondary: "#3B82F6",
    accent: "#EA580C",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    text: "#1E293B",
    textMuted: "#64748B",
    border: "#E2E8F0",
    error: "#EF4444",
    success: "#22C55E",
    warning: "#F59E0B",
  };
  const typography = {
    headingFont: "Inter, sans-serif",
    bodyFont: "Inter, sans-serif",
    monoFont: "JetBrains Mono, monospace",
    fontSizes: {
      xs: "0.75rem", sm: "0.875rem", base: "1rem", lg: "1.125rem",
      xl: "1.25rem", "2xl": "1.5rem", "3xl": "1.875rem", "4xl": "2.25rem",
    },
    fontWeights: { light: "300", normal: "400", medium: "500", semibold: "600", bold: "700" },
  };
  const spacing = {
    values: {
      "0": "0", "1": "0.25rem", "2": "0.5rem", "3": "0.75rem", "4": "1rem",
      "5": "1.25rem", "6": "1.5rem", "8": "2rem", "10": "2.5rem",
      "12": "3rem", "16": "4rem", "20": "5rem", "24": "6rem",
    },
  };
  const sg = { colors, typography, spacing, cssVariables: {} as Record<string, string> };
  sg.cssVariables = generateCssVariables(sg) ?? {};
  return sg;
}

// ─── SEO prompt (tiny — only metadata text) ────────────────────────────────────

const SEO_PROMPT = `Generate SEO metadata for a website. Respond in valid JSON only:
{"seoTitle":"under 60 chars","seoDescription":"120-160 chars","seoKeywords":"5-8 keywords, comma-separated","ogTitle":"under 60 chars","ogDescription":"under 160 chars"}

Rules: match the project's language. Include business name in titles. Make descriptions compelling.`;

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectInfo } = body as { projectInfo: WizardProjectInfo };

    if (!projectInfo?.name || !projectInfo?.idea) {
      return Response.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "projectInfo with name and idea is required" } },
        { status: 422 },
      );
    }

    // 1. Generate styleguide deterministically (instant — no LLM)
    const businessType = detectBusinessType(
      [projectInfo.idea, projectInfo.name, projectInfo.style, projectInfo.targetAudience].join(" "),
    );
    const autoResult = businessType ? generateStyleguideFromBusinessType(businessType) : null;

    let styleguide: GenerateSettingsResponse["styleguide"];
    if (projectInfo.paletteColors) {
      // Tier 1: User selected a palette — use those colors directly
      const colors = projectInfo.paletteColors;
      const fallback = buildFallbackStyleguide();
      const autoTypography = autoResult?.styleguide?.typography ?? fallback.typography;
      const autoSpacing = autoResult?.styleguide?.spacing ?? fallback.spacing;
      const sg = { colors, typography: autoTypography, spacing: autoSpacing, cssVariables: {} as Record<string, string> };
      sg.cssVariables = generateCssVariables(sg);
      styleguide = sg;
    } else if (projectInfo.colorKeywords || projectInfo.styleKeywords) {
      // Tier 2: Keywords from Winnie — resolve matching palette via color-matcher
      const recs = resolveWizardRecommendations({
        businessIdea: projectInfo.idea,
        colorText: projectInfo.colorKeywords,
        styleText: projectInfo.styleKeywords,
        topN: 1,
      });
      const topRec = recs[0];
      if (topRec) {
        const colors = topRec.colors;
        const fallback = buildFallbackStyleguide();
        const autoTypography = autoResult?.styleguide?.typography ?? fallback.typography;
        const autoSpacing = autoResult?.styleguide?.spacing ?? fallback.spacing;
        const sg = { colors, typography: autoTypography, spacing: autoSpacing, cssVariables: {} as Record<string, string> };
        sg.cssVariables = generateCssVariables(sg);
        styleguide = sg;
      } else {
        styleguide = autoResult?.styleguide ?? buildFallbackStyleguide();
      }
    } else if (autoResult?.styleguide) {
      styleguide = {
        colors: autoResult.styleguide.colors,
        typography: autoResult.styleguide.typography,
        spacing: autoResult.styleguide.spacing,
        cssVariables: (autoResult.styleguide.cssVariables ?? {}) as Record<string, string>,
      };
    } else {
      styleguide = buildFallbackStyleguide();
    }

    // 2. General info — derived directly from projectInfo (no LLM)
    const general: GenerateSettingsResponse["general"] = {
      siteName: projectInfo.name,
      companyName: projectInfo.name,
      language: projectInfo.language || "en",
    };

    // 3. SEO — small LLM call for creative text only
    const { model, jsonCallOptions } = createFastModelBundle({ maxTokens: 1024 });

    const seoPrompt = `Website: "${projectInfo.name}". Business: ${projectInfo.idea}. Audience: ${projectInfo.targetAudience || "general"}. Language: ${projectInfo.language || "en"}.`;

    const seoResponse = await model.invoke(
      [new SystemMessage(SEO_PROMPT), new HumanMessage(seoPrompt)],
      jsonCallOptions,
    );

    const seoText =
      typeof seoResponse.content === "string"
        ? seoResponse.content
        : Array.isArray(seoResponse.content)
          ? seoResponse.content
              .filter((c): c is { type: string; text: string } => typeof c === "object" && c.type === "text")
              .map((c) => c.text)
              .join("")
          : "";

    const cleanedSeo = seoText.replace(/<think[\s\S]*?<\/think>/g, "").trim();

    let seo: GenerateSettingsResponse["seo"];
    try {
      const parsed = JSON.parse(cleanedSeo) as GenerateSettingsResponse["seo"];
      seo = parsed;
    } catch {
      // Try extracting JSON from response
      const braceStart = cleanedSeo.indexOf("{");
      const braceEnd = cleanedSeo.lastIndexOf("}");
      if (braceStart !== -1 && braceEnd > braceStart) {
        try {
          seo = JSON.parse(cleanedSeo.slice(braceStart, braceEnd + 1)) as GenerateSettingsResponse["seo"];
        } catch {
          seo = buildFallbackSeo(projectInfo);
        }
      } else {
        seo = buildFallbackSeo(projectInfo);
      }
    }

    const settings: GenerateSettingsResponse = { styleguide, seo, general };

    return Response.json({
      success: true,
      data: settings,
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    });
  } catch (err) {
    console.error("Generate settings error:", err);
    return Response.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: err instanceof Error ? err.message : "Failed to generate settings" } },
      { status: 500 },
    );
  }
}

function buildFallbackSeo(info: WizardProjectInfo): GenerateSettingsResponse["seo"] {
  const name = info.name || "Website";
  return {
    seoTitle: `${name} — ${info.idea?.slice(0, 40) || "Welcome"}`.slice(0, 60),
    seoDescription: `${info.idea || "Discover what we offer"}. ${info.targetAudience ? `Serving ${info.targetAudience}.` : ""}`.slice(0, 160),
    seoKeywords: [info.name, info.idea?.split(" ").slice(0, 3).join(" ")].filter(Boolean).join(", "),
    ogTitle: name.slice(0, 60),
    ogDescription: (info.idea || "").slice(0, 160),
  };
}
