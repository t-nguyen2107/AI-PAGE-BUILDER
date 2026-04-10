"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { WizardProjectInfo } from "@/types/wizard";
import { detectBusinessType } from "@/lib/ai/knowledge/business-detect";
import { resolveDesignGuidance } from "@/lib/ai/knowledge/design-knowledge";
import {
  resolveWizardRecommendations,
  type PaletteRecommendation,
} from "@/lib/ai/knowledge/color-matcher";

// ── Palette color shape (kept for backward compat) ──────────────────────

export interface PaletteColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
}

export interface StylePalette {
  id: string;
  label: string;
  description: string;
  gradient: string;
  swatches: string[];
  fontHeading: string;
  fontBody: string;
  styleKeywords: string;
  audience: string;
  tone: string;
  relevantTypes: string[];
  colors: PaletteColors;
}

// Default pages fallback
const DEFAULT_PAGES: Array<{ title: string; slug: string; description: string }> = [
  { title: "Home", slug: "home", description: "Welcome page" },
  { title: "About", slug: "about", description: "About us" },
  { title: "Contact", slug: "contact", description: "Contact information" },
];

/** Derive page suggestions from design-knowledge LANDING_PATTERNS. */
function derivePagesFromGuidance(businessType: string | null): typeof DEFAULT_PAGES {
  const guidance = businessType ? resolveDesignGuidance(businessType) : null;
  if (!guidance) return DEFAULT_PAGES;

  const sectionOrder = guidance.pattern.sectionOrder;
  const skipSections = new Set(["HeaderNav", "FooterSection", "AnnouncementBar"]);
  const pageSections = sectionOrder.filter(s => !skipSections.has(s));
  if (pageSections.length === 0) return DEFAULT_PAGES;

  return pageSections.map(section => ({
    title: section.replace(/([A-Z])/g, " $1").trim(),
    slug: section.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, ""),
    description: `Auto-generated ${section} page`,
  }));
}

/** Convert a PaletteRecommendation to a StylePalette for backward compat. */
function recommendationToPalette(rec: PaletteRecommendation): StylePalette {
  return {
    id: rec.id,
    label: rec.label,
    description: rec.styleName,
    gradient: rec.gradient,
    swatches: [rec.colors.primary, rec.colors.secondary, rec.colors.accent, rec.colors.background, rec.colors.text],
    fontHeading: rec.headingFont,
    fontBody: rec.bodyFont,
    styleKeywords: rec.styleName,
    audience: "general",
    tone: "professional",
    relevantTypes: [],
    colors: rec.colors,
  };
}

// ── Helper: build full project info from palette selection ──────────────────────
export function buildProjectInfoFromPalette(
  palette: StylePalette,
  name: string,
  idea: string,
  language: string,
): WizardProjectInfo {
  const businessType = detectBusinessType(idea);
  const pages = derivePagesFromGuidance(businessType);

  return {
    name,
    idea,
    style: palette.styleKeywords,
    targetAudience: palette.audience,
    tone: palette.tone,
    language,
    pages,
    paletteColors: palette.colors,
  };
}

// ── Component ─────────────────────────────────────────────────────────────
interface StylePalettePickerProps {
  businessIdea: string;
  onSelect: (palette: StylePalette) => void;
  disabled?: boolean;
  /** Color keywords from Winnie chat */
  colorKeywords?: string;
  /** Style keywords from Winnie chat */
  styleKeywords?: string;
}

export function StylePalettePicker({ businessIdea, onSelect, disabled, colorKeywords, styleKeywords }: StylePalettePickerProps) {
  const recommendations = useMemo(
    () => resolveWizardRecommendations({
      businessIdea,
      colorText: colorKeywords,
      styleText: styleKeywords,
      topN: 4,
    }),
    [businessIdea, colorKeywords, styleKeywords],
  );

  const palettes = useMemo(
    () => recommendations.map(recommendationToPalette),
    [recommendations],
  );

  const businessType = businessIdea ? detectBusinessType(businessIdea) : null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-on-surface-variant text-center">
        Pick a style direction for your project
      </p>
      <div className="grid grid-cols-2 gap-3">
        {palettes.map((palette, index) => {
          const isRecommended = index === 0 && (businessType || colorKeywords || styleKeywords);
          return (
            <button
              key={palette.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(palette)}
              className={cn(
                "group relative rounded-2xl border overflow-hidden transition-all duration-200",
                "border-outline-variant/20 bg-surface-lowest",
                "hover:border-primary/40 hover:shadow-md hover:shadow-primary/10 hover:scale-[1.02]",
                "active:scale-[0.98]",
                "disabled:opacity-50 disabled:pointer-events-none",
                isRecommended && "ring-2 ring-primary/20",
              )}
            >
              {/* Recommended badge */}
              {isRecommended && (
                <span className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md bg-primary text-on-primary text-[10px] font-semibold">
                  Recommended
                </span>
              )}

              {/* Gradient preview */}
              <div
                className="h-20 rounded-xl relative"
                style={{ background: palette.gradient }}
              >
                {/* Color swatches */}
                <div className="absolute bottom-2 left-2 flex gap-1">
                  {palette.swatches.map((color) => (
                    <span
                      key={color}
                      className="w-4 h-4 rounded-full border-2 border-white/50 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Label */}
              <div className="px-3 py-2.5">
                <p className="text-xs font-semibold text-on-surface leading-tight">
                  {palette.label}
                </p>
                <p className="text-[10px] text-on-surface-outline leading-tight">
                  {palette.description}
                </p>
                <p className="text-[10px] text-on-surface-outline/60 mt-0.5 truncate">
                  {palette.fontHeading} + {palette.fontBody}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
