"use client";

import { cn } from "@/lib/utils";
import type { WizardProjectInfo } from "@/types/wizard";

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

// ── Business type → best palette mapping ───────────────────────────
const BUSINESS_PALETTE_HINTS: Record<string, string[]> = {
  restaurant: ["warm-cozy"],
  bakery: ["warm-cozy"],
  cafe: ["warm-cozy"],
  hospitality: ["warm-cozy"],
  food: ["warm-cozy"],
  coffee: ["warm-cozy"],
  nonprofit: ["warm-cozy"],
  saas: ["clean-modern"],
  tech: ["clean-modern"],
  corporate: ["clean-modern"],
  education: ["clean-modern"],
  healthcare: ["clean-modern"],
  finance: ["clean-modern"],
  fitness: ["bold-dynamic"],
  agency: ["bold-dynamic"],
  creative: ["bold-dynamic"],
  entertainment: ["bold-dynamic"],
  travel: ["bold-dynamic"],
  sports: ["bold-dynamic"],
  fashion: ["bold-dynamic"],
  portfolio: ["elegant-minimal"],
  luxury: ["elegant-minimal"],
  realestate: ["elegant-minimal"],
  photography: ["elegant-minimal"],
  design: ["elegant-minimal"],
  jewelry: ["elegant-minimal"],
};

// ── Business → suggested pages ────────────────────────────────────
const BUSINESS_PAGES: Record<string, Array<{ title: string; slug: string; description: string }>> = {
  restaurant: [
    { title: "Home", slug: "home", description: "Welcome page with hero and featured dishes" },
    { title: "Menu", slug: "menu", description: "Full food and drink menu" },
    { title: "About", slug: "about", description: "Restaurant story and team" },
    { title: "Contact", slug: "contact", description: "Location, hours, and reservations" },
  ],
  bakery: [
    { title: "Home", slug: "home", description: "Welcome page with featured products" },
    { title: "Products", slug: "products", description: "Product showcase" },
    { title: "About", slug: "about", description: "Our story and craft" },
    { title: "Contact", slug: "contact", description: "Location and orders" },
  ],
  cafe: [
    { title: "Home", slug: "home", description: "Welcome page with ambiance highlights" },
    { title: "Menu", slug: "menu", description: "Drinks and food menu" },
    { title: "About", slug: "about", description: "Our story" },
    { title: "Contact", slug: "contact", description: "Location and hours" },
  ],
  saas: [
    { title: "Home", slug: "home", description: "Landing page with features and pricing" },
    { title: "Features", slug: "features", description: "Detailed feature breakdown" },
    { title: "Pricing", slug: "pricing", description: "Plans comparison" },
    { title: "About", slug: "about", description: "Company story" },
    { title: "Contact", slug: "contact", description: "Contact form" },
  ],
  portfolio: [
    { title: "Home", slug: "home", description: "Portfolio showcase" },
    { title: "Work", slug: "work", description: "Full gallery" },
    { title: "About", slug: "about", description: "Bio and skills" },
    { title: "Contact", slug: "contact", description: "Get in touch" },
  ],
  ecommerce: [
    { title: "Home", slug: "home", description: "Shop homepage" },
    { title: "Shop", slug: "shop", description: "Product catalog" },
    { title: "About", slug: "about", description: "Brand story" },
    { title: "Contact", slug: "contact", description: "Customer support" },
  ],
  agency: [
    { title: "Home", slug: "home", description: "Agency landing page" },
    { title: "Services", slug: "services", description: "Service offerings" },
    { title: "Portfolio", slug: "portfolio", description: "Case studies" },
    { title: "Contact", slug: "contact", description: "Get a quote" },
  ],
  fitness: [
    { title: "Home", slug: "home", description: "Gym landing with classes" },
    { title: "Classes", slug: "classes", description: "Class schedule" },
    { title: "Trainers", slug: "trainers", description: "Meet our trainers" },
    { title: "Contact", slug: "contact", description: "Membership info" },
  ],
  blog: [
    { title: "Home", slug: "home", description: "Blog homepage" },
    { title: "About", slug: "about", description: "About the author" },
    { title: "Contact", slug: "contact", description: "Contact form" },
  ],
};

// Default pages fallback
const DEFAULT_PAGES: Array<{ title: string; slug: string; description: string }> = [
  { title: "Home", slug: "home", description: "Welcome page" },
  { title: "About", slug: "about", description: "About us" },
  { title: "Contact", slug: "contact", description: "Contact information" },
];

// ── Helper: detect business type from idea text ───────────────────
function detectBusinessType(idea: string): string | null {
  const lower = idea.toLowerCase();
  for (const type of Object.keys(BUSINESS_PALETTE_HINTS)) {
    if (lower.includes(type)) return type;
  }
  // Fuzzy match
  if (lower.includes("shop") || lower.includes("store") || lower.includes("sell")) return "ecommerce";
  if (lower.includes("gym") || lower.includes("yoga") || lower.includes("workout")) return "fitness";
  if (lower.includes("photo") || lower.includes("gallery") || lower.includes("art")) return "portfolio";
  if (lower.includes("food") || lower.includes("dining")) return "restaurant";
  if (lower.includes("article") || lower.includes("writing") || lower.includes("content")) return "blog";
  return null;
}

// ── Helper: get ranked palettes for a business type ───────────────────────
export function getRankedPalettes(businessType: string | null): StylePalette[] {
  const hints = businessType ? BUSINESS_PALETTE_HINTS[businessType] : null;
  if (!hints) return PALETTES;
  const ranked = [...hints.map((id) => PALETTES.find((p) => p.id === id)!).filter(Boolean)];
  const rest = PALETTES.filter((p) => !hints.includes(p.id));
  return [...ranked, ...rest];
}

// ── Helper: build full project info from palette selection ──────────────────────
export function buildProjectInfoFromPalette(
  palette: StylePalette,
  name: string,
  idea: string,
  language: string,
): WizardProjectInfo {
  const businessType = detectBusinessType(idea);
  const pages = (businessType && BUSINESS_PAGES[businessType]) || DEFAULT_PAGES;

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
