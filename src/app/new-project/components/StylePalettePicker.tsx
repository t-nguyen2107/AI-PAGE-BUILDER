"use client";

import { cn } from "@/lib/utils";
import type { WizardProjectInfo } from "@/types/wizard";
import { detectBusinessType } from "@/lib/ai/knowledge/business-detect";
import { resolveDesignGuidance, LANDING_PATTERNS } from "@/lib/ai/knowledge/design-knowledge";

// ── Palette definitions ──────────────────────────────────────────────

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
  /** Full color definitions for styleguide generation */
  colors: PaletteColors;
}

export const PALETTES: StylePalette[] = [
  {
    id: "warm-cozy",
    label: "Warm & Cozy",
    description: "Earth tones, inviting warmth",
    gradient: "linear-gradient(135deg, #8B4513, #D4A374, #C48B20)",
    swatches: ["#8B4513", "#D4A374", "#C48B20", "#FFF8F0", "#5C3D3D"],
    fontHeading: "Playfair Display",
    fontBody: "Lora",
    styleKeywords: "warm, artisanal, inviting",
    audience: "local customers, community",
    tone: "friendly, welcoming",
    relevantTypes: ["restaurant", "bakery", "cafe", "hospitality", "food", "coffee", "nonprofit"],
    colors: {
      primary: "#8B4513",
      secondary: "#D4A374",
      accent: "#C48B20",
      background: "#FFF8F0",
      surface: "#FFFFFF",
      text: "#5C3D3D",
      textMuted: "#8B7355",
      border: "#E8D5C4",
    },
  },
  {
    id: "clean-modern",
    label: "Clean & Modern",
    description: "Bold accents, airy whitespace",
    gradient: "linear-gradient(135deg, #0EA5E8, #22746E, #081B22)",
    swatches: ["#22746E", "#081B22", "#E39C37", "#F5F6F7", "#B2E8E2"],
    fontHeading: "Inter",
    fontBody: "DM Sans",
    styleKeywords: "clean, modern, professional",
    audience: "professionals, businesses",
    tone: "professional, confident",
    relevantTypes: ["saas", "tech", "corporate", "education", "healthcare", "finance"],
    colors: {
      primary: "#22746E",
      secondary: "#081B22",
      accent: "#E39C37",
      background: "#F5F6F7",
      surface: "#FFFFFF",
      text: "#0D1F24",
      textMuted: "#3D4F55",
      border: "#D3DCDF",
    },
  },
  {
    id: "bold-dynamic",
    label: "Bold & Dynamic",
    description: "High contrast, vibrant energy",
    gradient: "linear-gradient(135deg, #FF3B3B, #FF6B6B, #6C3CEA)",
    swatches: ["#FF3B3B", "#FF6B6B", "#1A1A2E", "#0D1B2A", "#FFF4F0"],
    fontHeading: "Space Grotesk",
    fontBody: "Plus Jakarta Sans",
    styleKeywords: "bold, energetic, dynamic",
    audience: "young adults, active lifestyle",
    tone: "enthusiastic, motivating",
    relevantTypes: ["fitness", "agency", "creative", "entertainment", "travel", "sports", "fashion"],
    colors: {
      primary: "#FF3B3B",
      secondary: "#1A1A2E",
      accent: "#FF6B6B",
      background: "#FFF4F0",
      surface: "#FFFFFF",
      text: "#0D1B2A",
      textMuted: "#6B7280",
      border: "#E5E7EB",
    },
  },
  {
    id: "elegant-minimal",
    label: "Elegant & Minimal",
    description: "Refined neutrals, editorial feel",
    gradient: "linear-gradient(135deg, #1A1A2E, #2D2D2D, #F5F0F0)",
    swatches: ["#1A1A2E", "#2D2D2D", "#F5F0F0", "#FAFAFA", "#E8E8E8"],
    fontHeading: "Newsreader",
    fontBody: "Inter",
    styleKeywords: "elegant, minimal, editorial",
    audience: "discerning clients, art directors",
    tone: "sophisticated, refined",
    relevantTypes: ["portfolio", "fashion", "luxury", "realestate", "photography", "design", "jewelry"],
    colors: {
      primary: "#1A1A2E",
      secondary: "#2D2D2D",
      accent: "#C9A96E",
      background: "#FAFAFA",
      surface: "#FFFFFF",
      text: "#1A1A2E",
      textMuted: "#6B7280",
      border: "#E8E8E8",
    },
  },
];

// ── Business type → best palette mapping (derived from shared knowledge) ──────

/** Map canonical business types (from business-detect) to palette IDs. */
const BUSINESS_PALETTE_MAP: Record<string, string> = {
  // warm-cozy
  "restaurant/dining": "warm-cozy",
  "bakery/pastry shop": "warm-cozy",
  "coffee shop/cafe": "warm-cozy",
  "travel/hospitality": "warm-cozy",
  "food/delivery": "warm-cozy",
  "nonprofit/charity": "warm-cozy",
  // clean-modern
  "SaaS/technology": "clean-modern",
  "education/training": "clean-modern",
  "healthcare/medical": "clean-modern",
  "B2B/service": "clean-modern",
  "productivity/tool": "clean-modern",
  "AI/chatbot": "clean-modern",
  // bold-dynamic
  "fitness/gym": "bold-dynamic",
  "creative agency": "bold-dynamic",
  "fashion/clothing": "bold-dynamic",
  "event/conference": "bold-dynamic",
  "music/podcast": "bold-dynamic",
  // elegant-minimal
  "personal portfolio": "elegant-minimal",
  "e-commerce/luxury": "elegant-minimal",
  "real estate": "elegant-minimal",
  "law firm/legal": "elegant-minimal",
};

/** Resolve palette ID from a detected business type, with fuzzy fallback. */
function resolvePaletteId(businessType: string | null): string | null {
  if (!businessType) return null;
  // Direct match
  if (BUSINESS_PALETTE_MAP[businessType]) return BUSINESS_PALETTE_MAP[businessType];
  // Fuzzy: check if any map key is contained in the business type or vice versa
  const norm = businessType.toLowerCase();
  for (const [key, paletteId] of Object.entries(BUSINESS_PALETTE_MAP)) {
    const normKey = key.toLowerCase();
    if (norm.includes(normKey) || normKey.includes(norm)) return paletteId;
  }
  // Word-level fallback
  const words = norm.split(/[\s/\\]+/).filter(w => w.length > 3);
  for (const [key, paletteId] of Object.entries(BUSINESS_PALETTE_MAP)) {
    const normKey = key.toLowerCase();
    if (words.some(w => normKey.includes(w))) return paletteId;
  }
  return null;
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
  // Extract unique page-like section names (skip HeaderNav/FooterSection/AnnouncementBar)
  const skipSections = new Set(["HeaderNav", "FooterSection", "AnnouncementBar"]);
  const pageSections = sectionOrder.filter(s => !skipSections.has(s));
  if (pageSections.length === 0) return DEFAULT_PAGES;

  // Map section types to human-readable page entries
  return pageSections.map(section => ({
    title: section.replace(/([A-Z])/g, " $1").trim(),
    slug: section.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, ""),
    description: `Auto-generated ${section} page`,
  }));
}

// ── Helper: get ranked palettes for a business type ───────────────────────
export function getRankedPalettes(businessType: string | null): StylePalette[] {
  const paletteId = resolvePaletteId(businessType);
  if (!paletteId) return PALETTES;
  const matched = PALETTES.find((p) => p.id === paletteId);
  if (!matched) return PALETTES;
  const rest = PALETTES.filter((p) => p.id !== paletteId);
  return [matched, ...rest];
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
}

export function StylePalettePicker({ businessIdea, onSelect, disabled }: StylePalettePickerProps) {
  const businessType = detectBusinessType(businessIdea);
  const ranked = getRankedPalettes(businessType);

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-on-surface-variant text-center">
        Pick a style direction for your project
      </p>
      <div className="grid grid-cols-2 gap-3">
        {ranked.map((palette, index) => {
          const isRecommended = index === 0 && businessType;
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
