/**
 * Color Matcher — Dynamic styleguide recommendations from user color/style keywords.
 *
 * Bridges user language ("xanh va do", "minimalist, glossy") to the 120 palettes,
 * 22 design styles, and 14 typography pairings in design-knowledge.ts.
 *
 * Zero LLM cost — pure string matching + HSL distance math.
 */

import {
  PRODUCT_COLOR_PALETTES,
  DESIGN_STYLES,
  TYPOGRAPHY_PAIRINGS,
  resolveDesignGuidance,
  type ColorPalette,
  type DesignStyle,
  type FontPairing,
} from './design-knowledge';
import { detectBusinessType } from './business-detect';

// ─── Bilingual Color Name -> Hex Map ───────────────────────────────────────

const COLOR_NAMES: Record<string, string> = {
  // English
  red: '#EF4444', blue: '#3B82F6', green: '#22C55E', yellow: '#EAB308',
  orange: '#F97316', purple: '#A855F7', pink: '#EC4899', black: '#1F2937',
  white: '#FFFFFF', gray: '#6B7280', grey: '#6B7280', gold: '#D4A017',
  teal: '#14B8A6', cyan: '#06B6D4', indigo: '#4F46E5', navy: '#1E3A8A',
  brown: '#92400E', maroon: '#7F1D1D', olive: '#84CC16', coral: '#F87171',
  turquoise: '#2DD4BF', magenta: '#D946EF', beige: '#D2B48C', cream: '#FFF8F0',
  burgundy: '#881337', charcoal: '#334155', mint: '#34D399', peach: '#FB923C',
  lavender: '#A78BFA', ruby: '#DC2626', emerald: '#059669', sapphire: '#2563EB',
  amber: '#F59E0B', crimson: '#DC2626', scarlet: '#EF4444', ivory: '#FFFFF0',
  silver: '#9CA3AF', bronze: '#B45309', copper: '#C2410C',
  // Vietnamese
  '\u0111\u1ecf': '#EF4444', 'xanh': '#3B82F6', 'xanh d\u01b0\u01a1ng': '#3B82F6',
  'xanh l\u00e1': '#22C55E', 'xanh da tr\u1eddi': '#3B82F6', 'v\u00e0ng': '#EAB308',
  'cam': '#F97316', 't\u00edm': '#A855F7', 'h\u1ed3ng': '#EC4899', '\u0111en': '#1F2937',
  'tr\u1eafng': '#FFFFFF', 'x\u00e1m': '#6B7280', 'v\u00e0ng kim': '#D4A017', 'n\u00e2u': '#92400E',
  'h\u1ed3ng \u0111\u00e0o': '#F472B6', 'xanh ng\u1ecdc': '#14B8A6', '\u0111\u1ecf t\u01b0\u01a1i': '#EF4444',
  'xanh \u0111en': '#1F2937', 'tr\u1eafng kem': '#FFF8F0', 'v\u00e0ng \u0111\u1ed3ng': '#B45309',
};

// ─── HSL Conversion ────────────────────────────────────────────────────────

interface HSL { h: number; s: number; l: number }

function hexToHSL(hex: string): HSL {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let hue: number;
  if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) hue = ((b - r) / d + 2) / 6;
  else hue = ((r - g) / d + 4) / 6;

  return { h: hue * 360, s, l };
}

/**
 * Perceptual color distance using HSL.
 * Weighted: hue differences matter more for saturated colors.
 */
function colorDistance(a: string, b: string): number {
  const hslA = hexToHSL(a);
  const hslB = hexToHSL(b);

  // Hue distance (circular)
  let dh = Math.abs(hslA.h - hslB.h);
  if (dh > 180) dh = 360 - dh;
  const dhNorm = dh / 180; // 0..1

  // Saturation-weighted hue distance
  const avgSat = (hslA.s + hslB.s) / 2;

  const ds = Math.abs(hslA.s - hslB.s);
  const dl = Math.abs(hslA.l - hslB.l);

  // Weighted sum (hue weighted by saturation)
  return dhNorm * avgSat * 2 + ds + dl;
}

// ─── Color Keyword Extractor ───────────────────────────────────────────────

/**
 * Scan text for color names (bilingual EN/VI). Returns matched hex values.
 */
export function extractColorKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  const seen = new Set<string>();

  // Sort by length descending so multi-word matches win (e.g., "xanh duong" > "xanh")
  const sortedNames = Object.keys(COLOR_NAMES).sort((a, b) => b.length - a.length);

  let remaining = lower;
  for (const name of sortedNames) {
    const idx = remaining.indexOf(name);
    if (idx !== -1) {
      const hex = COLOR_NAMES[name];
      if (!seen.has(hex)) {
        seen.add(hex);
        found.push(hex);
      }
      // Remove matched portion to avoid double-matching substrings
      remaining = remaining.substring(0, idx) + ' '.repeat(name.length) + remaining.substring(idx + name.length);
    }
  }

  return found;
}

// ─── Palette Matcher ───────────────────────────────────────────────────────

export interface RankedPalette {
  id: string;
  label: string;
  palette: ColorPalette;
  typography: FontPairing;
  style: DesignStyle;
  relevance: number; // 0..1
}

/**
 * Match palettes by color similarity to user-specified hex colors.
 * Returns ranked list with relevance scores.
 */
export function matchPalettesByColors(
  hexColors: string[],
  topN = 8,
): RankedPalette[] {
  if (hexColors.length === 0) return [];

  const scored: RankedPalette[] = [];

  for (const [id, palette] of Object.entries(PRODUCT_COLOR_PALETTES)) {
    // Compare user colors against palette's primary, secondary, accent
    const paletteColors = [palette.primary, palette.secondary, palette.accent];
    let totalDist = 0;
    let matchedCount = 0;

    for (const userHex of hexColors) {
      let bestDist = Infinity;
      for (const pHex of paletteColors) {
        const d = colorDistance(userHex, pHex);
        if (d < bestDist) bestDist = d;
      }
      totalDist += bestDist;
      // Consider it a "match" if distance is reasonable
      if (bestDist < 0.6) matchedCount++;
    }

    // Relevance: higher is better
    const avgDist = totalDist / hexColors.length;
    const coverageBonus = matchedCount / hexColors.length;
    const relevance = Math.max(0, 1 - avgDist / 2) * 0.6 + coverageBonus * 0.4;

    // Resolve typography and style for this palette
    const guidance = resolveDesignGuidance(id);

    scored.push({
      id,
      label: id.split('/').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      palette,
      typography: guidance?.typography ?? TYPOGRAPHY_PAIRINGS['modern_professional'],
      style: guidance?.style ?? DESIGN_STYLES['minimalism'],
      relevance,
    });
  }

  scored.sort((a, b) => b.relevance - a.relevance);
  return scored.slice(0, topN);
}

// ─── Style Keyword Matcher ─────────────────────────────────────────────────

/**
 * Match user style text against DESIGN_STYLES keywords.
 * Returns best matching style or null.
 */
export function matchStyleByKeywords(text: string): { key: string; style: DesignStyle } | null {
  const lower = text.toLowerCase();
  let bestMatch: { key: string; style: DesignStyle; score: number } | null = null;

  for (const [key, style] of Object.entries(DESIGN_STYLES)) {
    let score = 0;
    // Check keywords
    for (const kw of style.keywords) {
      if (lower.includes(kw.toLowerCase())) score += 2;
    }
    // Check style key itself (e.g., "minimalism" matches "minimalist")
    const keyParts = key.replace(/[-_]/g, ' ').split(' ');
    for (const part of keyParts) {
      if (lower.includes(part.toLowerCase())) score += 3;
    }
    // Check bestFor
    for (const bf of style.bestFor) {
      if (lower.includes(bf.toLowerCase())) score += 1;
    }

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { key, style, score };
    }
  }

  return bestMatch ? { key: bestMatch.key, style: bestMatch.style } : null;
}

/**
 * Match user text against TYPOGRAPHY_PAIRINGS mood/bestFor.
 */
function matchTypographyByKeywords(text: string): { key: string; pairing: FontPairing } | null {
  const lower = text.toLowerCase();
  let bestMatch: { key: string; pairing: FontPairing; score: number } | null = null;

  for (const [key, pairing] of Object.entries(TYPOGRAPHY_PAIRINGS)) {
    let score = 0;
    for (const mood of pairing.mood) {
      if (lower.includes(mood.toLowerCase())) score += 2;
    }
    for (const bf of pairing.bestFor) {
      if (lower.includes(bf.toLowerCase())) score += 1;
    }

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { key, pairing, score };
    }
  }

  return bestMatch ? { key: bestMatch.key, pairing: bestMatch.pairing } : null;
}

// ─── Main Resolver ─────────────────────────────────────────────────────────

export interface PaletteRecommendation {
  id: string;
  label: string;
  /** Full 8-token color set for styleguide generation */
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
  };
  headingFont: string;
  bodyFont: string;
  styleName: string;
  gradient: string;
  relevance: number;
}

export interface WizardRecommendationContext {
  /** User business idea text */
  businessIdea?: string;
  /** Raw text containing color descriptions (from Winnie chat) */
  colorText?: string;
  /** Raw text containing style descriptions (from Winnie chat) */
  styleText?: string;
  /** Number of recommendations to return (default: 4) */
  topN?: number;
}

/**
 * Main resolver: combines color keywords, style keywords, and business type
 * to produce ranked palette recommendations for the wizard.
 */
export function resolveWizardRecommendations(
  ctx: WizardRecommendationContext = {},
): PaletteRecommendation[] {
  const { businessIdea = '', colorText = '', styleText = '', topN = 4 } = ctx;

  // Combine all text for keyword extraction
  const allText = [colorText, styleText, businessIdea].join(' ');

  // 1. Extract color keywords
  const colorHexes = extractColorKeywords(allText);

  // 2. Find matching style
  const matchedStyle = matchStyleByKeywords(allText);

  // 3. Find matching typography
  const matchedTypo = matchTypographyByKeywords(allText);

  // 4. Detect business type for ranking boost
  const businessType = businessIdea ? detectBusinessType(businessIdea) : null;

  // 5. If colors found, rank all palettes by color similarity
  let candidates: RankedPalette[];

  if (colorHexes.length > 0) {
    candidates = matchPalettesByColors(colorHexes, 20);
  } else {
    // No explicit colors — rank by business type or show all
    candidates = getAllPaletteCandidates();
  }

  // 6. Apply style ranking boost
  if (matchedStyle) {
    for (const c of candidates) {
      if (c.style.keywords.some(kw => matchedStyle.style.keywords.includes(kw))) {
        c.relevance += 0.2;
      }
    }
  }

  // 7. Apply business type boost
  if (businessType) {
    const businessLower = businessType.toLowerCase();
    for (const c of candidates) {
      const idLower = c.id.toLowerCase();
      if (idLower.includes(businessLower) || businessLower.includes(idLower.split('/')[0])) {
        c.relevance += 0.3;
      }
    }
  }

  // 8. Sort by relevance and take top N
  candidates.sort((a, b) => b.relevance - a.relevance);
  const topCandidates = candidates.slice(0, topN);

  // 9. Build PaletteRecommendation objects
  return topCandidates.map((c) => {
    const p = c.palette;
    const t = matchedTypo?.pairing ?? c.typography;
    const s = matchedStyle?.style ?? c.style;

    return {
      id: c.id,
      label: c.label,
      colors: {
        primary: p.primary,
        secondary: p.secondary,
        accent: p.accent,
        background: p.background,
        surface: p.card,
        text: p.foreground,
        textMuted: p.mutedForeground,
        border: p.border,
      },
      headingFont: t.heading,
      bodyFont: t.body,
      styleName: s.keywords.slice(0, 3).join(', '),
      gradient: `linear-gradient(135deg, ${p.primary}, ${p.secondary}, ${p.accent})`,
      relevance: c.relevance,
    };
  });
}

/**
 * Get all palettes as candidates with neutral relevance (no colors specified).
 */
function getAllPaletteCandidates(): RankedPalette[] {
  // Prioritize well-known business types
  const priorityTypes = [
    'SaaS/technology', 'e-commerce/store', 'restaurant/dining', 'coffee shop/cafe',
    'bakery/pastry shop', 'fitness/gym', 'real estate', 'healthcare/medical',
    'fashion/clothing', 'travel/hospitality', 'law firm/legal', 'education/training',
    'personal portfolio', 'creative agency', 'spa/wellness', 'blog/media',
  ];

  const results: RankedPalette[] = [];

  // Add priority types first
  for (const bt of priorityTypes) {
    const palette = PRODUCT_COLOR_PALETTES[bt];
    if (!palette) continue;
    const guidance = resolveDesignGuidance(bt);
    results.push({
      id: bt,
      label: bt.split('/').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      palette,
      typography: guidance?.typography ?? TYPOGRAPHY_PAIRINGS['modern_professional'],
      style: guidance?.style ?? DESIGN_STYLES['minimalism'],
      relevance: 0.5,
    });
  }

  // Add remaining
  for (const [id, palette] of Object.entries(PRODUCT_COLOR_PALETTES)) {
    if (results.some(r => r.id === id)) continue;
    const guidance = resolveDesignGuidance(id);
    results.push({
      id,
      label: id.split('/').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      palette,
      typography: guidance?.typography ?? TYPOGRAPHY_PAIRINGS['modern_professional'],
      style: guidance?.style ?? DESIGN_STYLES['minimalism'],
      relevance: 0.3,
    });
  }

  return results;
}
