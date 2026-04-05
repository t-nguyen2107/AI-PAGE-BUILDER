/**
 * Auto-Styleguide Generator — creates project styleguide from detected business type.
 *
 * When AI detects a business type (e.g. "restaurant/dining", "SaaS/technology"),
 * this module generates a complete styleguide with matching colors, typography,
 * and CSS variables — all derived from the design knowledge constants.
 *
 * Used by the AI generation pipeline to auto-brand projects.
 */

import {
  PRODUCT_COLOR_PALETTES,
  TYPOGRAPHY_PAIRINGS,
  resolveDesignGuidance,
  type ColorPalette as KnowledgePalette,
} from './design-knowledge';

import { generateCssVariables, type StyleGuideData } from '@/lib/css-variables';
import { DEFAULT_COLORS, PROJECT_ROUTE_DEFAULT_PRIMARY } from '@/lib/constants';
import { prisma } from '@/lib/prisma';

// ─── Default styleguide values (kept in sync with projects/route.ts) ────────

const DEFAULT_TYPOGRAPHY = {
  headingFont: 'Inter, sans-serif',
  bodyFont: 'Inter, sans-serif',
  monoFont: 'JetBrains Mono, monospace',
  fontSizes: {
    xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem',
    xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem',
  },
  fontWeights: {
    light: '300', normal: '400', medium: '500', semibold: '600', bold: '700',
  },
};

const DEFAULT_SPACING = {
  values: {
    '0': '0', '1': '0.25rem', '2': '0.5rem', '3': '0.75rem', '4': '1rem',
    '5': '1.25rem', '6': '1.5rem', '8': '2rem', '10': '2.5rem', '12': '3rem',
    '16': '4rem', '20': '5rem', '24': '6rem',
  },
};

// ─── Mapping helpers ────────────────────────────────────────────────────────

/** Map knowledge ColorPalette → styleguide ColorPalette format */
function mapColors(kp: KnowledgePalette): Record<string, string> {
  return {
    primary: kp.primary,
    secondary: kp.secondary,
    accent: kp.accent,
    background: kp.background,
    surface: kp.card,            // card → surface
    text: kp.foreground,         // foreground → text
    textMuted: kp.mutedForeground,
    border: kp.border,
    error: DEFAULT_COLORS.error,
    success: DEFAULT_COLORS.success,
    warning: DEFAULT_COLORS.warning,
  };
}

/** Find best typography pairing for the detected business type */
function resolveTypography(businessType: string): { heading: string; body: string } {
  const guidance = resolveDesignGuidance(businessType);
  if (guidance?.typography) {
    return { heading: guidance.typography.heading, body: guidance.typography.body };
  }

  // Fallback: mood-based lookup from TYPOGRAPHY_PAIRINGS using word-level matching
  const productReasoning = resolveDesignGuidance(businessType)?.reasoning;
  const mood = productReasoning?.typographyMood ?? '';
  const moodTokens = mood.toLowerCase().split(/[\s,]+/).filter(Boolean);

  let bestPairing: { heading: string; body: string } | null = null;
  let bestScore = 0;

  for (const [, pairing] of Object.entries(TYPOGRAPHY_PAIRINGS)) {
    const score = pairing.mood.reduce((acc, m) => {
      const mLower = m.toLowerCase();
      return acc + moodTokens.filter((t) => mLower.includes(t) || t.includes(mLower)).length;
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      bestPairing = { heading: pairing.heading, body: pairing.body };
    }
  }

  if (bestPairing && bestScore > 0) return bestPairing;

  // Ultimate fallback
  return { heading: 'Inter', body: 'Inter' };
}

// ─── Main generator ─────────────────────────────────────────────────────────

export interface AutoStyleguideResult {
  /** The generated styleguide data (ready for DB storage) */
  styleguide: StyleGuideData;
  /** Whether the styleguide was generated (false if no matching palette) */
  generated: boolean;
  /** The business type used for generation */
  businessType: string;
}

/**
 * Generate a complete styleguide from a detected business type.
 * Returns null if no matching palette exists for the business type.
 */
export function generateStyleguideFromBusinessType(
  businessType: string,
): AutoStyleguideResult | null {
  const palette = PRODUCT_COLOR_PALETTES[businessType];
  if (!palette) return null;

  const colors = mapColors(palette);
  const fonts = resolveTypography(businessType);

  const typography = {
    headingFont: `${fonts.heading}, sans-serif`,
    bodyFont: `${fonts.body}, sans-serif`,
    monoFont: DEFAULT_TYPOGRAPHY.monoFont,
    fontSizes: DEFAULT_TYPOGRAPHY.fontSizes,
    fontWeights: DEFAULT_TYPOGRAPHY.fontWeights,
  };

  const spacing = DEFAULT_SPACING;

  const styleguide: StyleGuideData = {
    colors,
    typography,
    spacing,
    cssVariables: {},  // populated below
  };

  styleguide.cssVariables = generateCssVariables(styleguide);

  return {
    styleguide,
    generated: true,
    businessType,
  };
}

/**
 * Check if a project's styleguide is still using default/generic colors.
 * Returns true if colors match the system defaults (never auto-customized).
 */
export function isDefaultStyleguide(colors: Record<string, string>): boolean {
  return (
    colors.primary === DEFAULT_COLORS.primary ||
    colors.primary === PROJECT_ROUTE_DEFAULT_PRIMARY
  );
}

/**
 * Auto-update a project's styleguide if it's still using defaults.
 * Non-fatal — silently skips if styleguide is already customized or no match found.
 *
 * @returns true if the styleguide was updated, false otherwise
 */
export async function autoUpdateStyleguide(
  projectId: string,
  businessType: string,
): Promise<boolean> {
  try {
    const result = generateStyleguideFromBusinessType(businessType);
    if (!result) return false;

    // Use interactive transaction to prevent race condition
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.styleguide.findUnique({
        where: { projectId },
      });
      if (!existing) return false;

      // Only auto-update if still using default colors
      const currentColors = JSON.parse(existing.colors) as Record<string, string>;
      if (!isDefaultStyleguide(currentColors)) return false;

      await tx.styleguide.update({
        where: { projectId },
        data: {
          name: `${businessType} Style`,
          colors: JSON.stringify(result.styleguide.colors),
          typography: JSON.stringify(result.styleguide.typography),
          cssVariables: JSON.stringify(result.styleguide.cssVariables),
        },
      });
      return true;
    });

    if (updated) {
      console.info(`[auto-styleguide] Updated project ${projectId} with ${businessType} styleguide`);
    }
    return updated;
  } catch (err) {
    console.warn('[auto-styleguide] Failed to auto-update styleguide (non-fatal):', err);
    return false;
  }
}
