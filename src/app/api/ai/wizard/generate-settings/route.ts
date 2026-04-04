import { NextRequest } from "next/server";
import { createModelBundle } from "@/lib/ai/provider";
import type { WizardProjectInfo, GenerateSettingsResponse } from "@/types/wizard";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

const GENERATE_SETTINGS_PROMPT = `You are an AI design consultant. Given a project description, generate a complete styleguide and SEO metadata for a website builder.

You MUST respond in valid JSON with this exact structure:
{
  "styleguide": {
    "colors": {
      "primary": "#hex",
      "secondary": "#hex",
      "accent": "#hex",
      "background": "#hex",
      "surface": "#hex",
      "text": "#hex",
      "textMuted": "#hex",
      "border": "#hex",
      "error": "#ef4444",
      "success": "#22c55e",
      "warning": "#f59e0b"
    },
    "typography": {
      "headingFont": "Font Name, sans-serif",
      "bodyFont": "Font Name, sans-serif",
      "monoFont": "JetBrains Mono, monospace",
      "fontSizes": {
        "xs": "0.75rem", "sm": "0.875rem", "base": "1rem", "lg": "1.125rem",
        "xl": "1.25rem", "2xl": "1.5rem", "3xl": "1.875rem", "4xl": "2.25rem"
      },
      "fontWeights": {
        "light": "300", "normal": "400", "medium": "500", "semibold": "600", "bold": "700"
      }
    },
    "spacing": {
      "values": {
        "0": "0", "1": "0.25rem", "2": "0.5rem", "3": "0.75rem", "4": "1rem",
        "5": "1.25rem", "6": "1.5rem", "8": "2rem", "10": "2.5rem",
        "12": "3rem", "16": "4rem", "20": "5rem", "24": "6rem"
      }
    },
    "cssVariables": {}
  },
  "seo": {
    "seoTitle": "under 60 chars",
    "seoDescription": "under 160 chars",
    "seoKeywords": "keyword1, keyword2, keyword3",
    "ogTitle": "under 60 chars",
    "ogDescription": "under 160 chars"
  },
  "general": {
    "siteName": "site name",
    "companyName": "company name",
    "language": "en or vi or other code"
  }
}

## Color Selection Rules
- Restaurant/Cafe: warm tones (deep reds, oranges, cream, brown)
- SaaS/Tech: clean blues, grays, white, with one accent
- Creative/Portfolio: bold accent, dark or light neutral base
- Ecommerce: trust-building blues or energetic oranges
- Blog: clean, readable, minimal contrast
- Agency: sophisticated, often dark with bright accent
- Health/Wellness: greens, blues, soft neutrals
- Education: blues, warm accents, approachable
- Fashion/Luxury: black/gold/dark tones or minimal white with accent
- Playful/Kids: bright primary colors, fun accents

## Font Selection Rules
- Available fonts: Inter, Poppins, Montserrat, Playfair Display, Lora, Merriweather, Roboto, Open Sans, Raleway, Nunito, Space Grotesk, DM Sans, Manrope, Outfit, Sora
- Sans-serif for modern/business/SaaS: Inter, DM Sans, Space Grotesk
- Serif for elegant/luxury/editorial: Playfair Display, Lora, Merriweather
- Friendly/approachable: Poppins, Nunito, Outfit
- Bold/creative: Montserrat, Sora, Raleway

## SEO Rules
- seoTitle: under 60 characters, includes business name and value proposition
- seoDescription: 120-160 characters, compelling, includes target audience keywords
- seoKeywords: 5-8 relevant keywords, comma-separated
- Match the language of the project`;

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

    const { model, jsonCallOptions } = createModelBundle();

    const userPrompt = `Generate a styleguide and SEO metadata for this website project:
- Name: ${projectInfo.name}
- Idea: ${projectInfo.idea}
- Style: ${projectInfo.style || "modern"}
- Target audience: ${projectInfo.targetAudience || "general"}
- Tone: ${projectInfo.tone || "professional"}
- Language: ${projectInfo.language || "en"}

Generate appropriate colors, fonts, spacing, and SEO metadata.`;

    const response = await model.invoke(
      [new SystemMessage(GENERATE_SETTINGS_PROMPT), new HumanMessage(userPrompt)],
      jsonCallOptions,
    );

    const text =
      typeof response.content === "string"
        ? response.content
        : Array.isArray(response.content)
          ? response.content
              .filter((c): c is { type: string; text: string } => typeof c === "object" && c.type === "text")
              .map((c) => c.text)
              .join("")
          : "";

    // Clean and parse JSON
    const cleaned = text.replace(/<think[\s\S]*?<\/think>/g, "").trim();

    let settings: GenerateSettingsResponse;
    try {
      // Try direct parse
      settings = JSON.parse(cleaned) as GenerateSettingsResponse;
    } catch {
      // Try extracting from code fence
      const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fenceMatch) {
        settings = JSON.parse(fenceMatch[1].trim()) as GenerateSettingsResponse;
      } else {
        // Try brace matching
        const braceStart = cleaned.indexOf("{");
        const braceEnd = cleaned.lastIndexOf("}");
        if (braceStart !== -1 && braceEnd > braceStart) {
          settings = JSON.parse(cleaned.slice(braceStart, braceEnd + 1)) as GenerateSettingsResponse;
        } else {
          throw new Error("Could not parse AI response as JSON");
        }
      }
    }

    // Ensure cssVariables is populated
    if (settings.styleguide && !settings.styleguide.cssVariables) {
      settings.styleguide.cssVariables = {};
    }

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
