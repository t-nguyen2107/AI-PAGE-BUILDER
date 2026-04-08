import { NextRequest } from "next/server";
import { createFastModelBundle } from "@/lib/ai/provider";
import { generateStyleguideFromBusinessType } from "@/lib/ai/knowledge/auto-styleguide";

import type { WizardProjectInfo, GenerateSettingsResponse } from "@/types/wizard";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { generateCssVariables } from "@/lib/css-variables";

// ─── Business type detection ──────────────────────────────────────────────────

const BUSINESS_KEYWORDS: Array<{ type: string; keywords: string[] }> = [
  { type: "restaurant/dining", keywords: ["restaurant", "nhà hàng", "ẩm thực", "dining", "food"] },
  { type: "bakery/pastry shop", keywords: ["bakery", "tiệm bánh", "bánh", "pastry", "cake"] },
  { type: "coffee shop/cafe", keywords: ["coffee", "cafe", "cà phê", "quán cà phê", "espresso"] },
  { type: "spa/wellness", keywords: ["spa", "massage", "wellness", "yoga", "thư giãn"] },
  { type: "fitness/gym", keywords: ["gym", "fitness", "thể hình", "workout", "training"] },
  { type: "SaaS/technology", keywords: ["saas", "software", "app", "platform", "tool", "dashboard", "api"] },
  { type: "e-commerce/store", keywords: ["shop", "store", "ecommerce", "bán hàng", "cửa hàng", "retail"] },
  { type: "e-commerce/luxury", keywords: ["luxury", "cao cấp", "premium", "boutique"] },
  { type: "real estate", keywords: ["real estate", "bất động sản", "property", "nhà đất"] },
  { type: "education/training", keywords: ["education", "course", "đào tạo", "học", "training", "academy"] },
  { type: "healthcare/medical", keywords: ["healthcare", "medical", "y tế", "phòng khám", "clinic", "hospital"] },
  { type: "fashion/clothing", keywords: ["fashion", "thời trang", "clothing", "áo", "quần"] },
  { type: "travel/hospitality", keywords: ["travel", "du lịch", "hotel", "khách sạn", "tour"] },
  { type: "law firm/legal", keywords: ["law", "legal", "luật", "pháp lý", "attorney"] },
  { type: "construction/architecture", keywords: ["construction", "xây dựng", "architecture", "kiến trúc"] },
  { type: "personal portfolio", keywords: ["portfolio", "cv", "resume", "personal", "cá nhân"] },
  { type: "creative agency", keywords: ["agency", "creative", "design", "thiết kế", "studio"] },
  { type: "blog/media", keywords: ["blog", "news", "tạp chí", "media", "magazine"] },
  { type: "nonprofit/charity", keywords: ["nonprofit", "charity", "từ thiện", "community"] },
  { type: "event/conference", keywords: ["event", "conference", "sự kiện", "hội nghị"] },
  { type: "crypto/web3", keywords: ["crypto", "blockchain", "web3", "nft", "defi"] },
  { type: "B2B/service", keywords: ["b2b", "enterprise", "consulting", "tư vấn"] },
  { type: "food/delivery", keywords: ["delivery", "giao đồ ăn", "food delivery", "ship đồ ăn"] },
  { type: "music/podcast", keywords: ["music", "podcast", "nhạc", "âm nhạc"] },
  { type: "AI/chatbot", keywords: ["ai", "chatbot", "machine learning", "ml"] },
  { type: "productivity/tool", keywords: ["productivity", "tool", "automation", "workflow"] },
];

function detectBusinessType(projectInfo: WizardProjectInfo): string {
  const text = [
    projectInfo.idea,
    projectInfo.name,
    projectInfo.style,
    projectInfo.targetAudience,
  ].join(" ").toLowerCase();

  let bestMatch = "";
  let bestScore = 0;

  for (const { type, keywords } of BUSINESS_KEYWORDS) {
    const score = keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = type;
    }
  }

  return bestMatch;
}

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
    const businessType = detectBusinessType(projectInfo);
    const autoResult = businessType ? generateStyleguideFromBusinessType(businessType) : null;

    let styleguide: GenerateSettingsResponse["styleguide"];
    if (projectInfo.paletteColors) {
      // User selected a palette — use those colors directly
      const colors = projectInfo.paletteColors;
      const fallback = buildFallbackStyleguide();
      const autoTypography = autoResult?.styleguide?.typography ?? fallback.typography;
      const autoSpacing = autoResult?.styleguide?.spacing ?? fallback.spacing;
      const sg = { colors, typography: autoTypography, spacing: autoSpacing, cssVariables: {} as Record<string, string> };
      sg.cssVariables = generateCssVariables(sg);
      styleguide = sg;
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
