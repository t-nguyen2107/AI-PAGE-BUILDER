/**
 * Centralized utility functions for Prompt Engineering.
 * Used to construct Design System markdown blocks consistently across
 * all AI generation phases (planning, polishing, modifying).
 */

import type { DesignGuidance } from '../knowledge/design-knowledge';
import type { DesignStyle } from '../../../puck/lib/design-styles';

// ─── Style Priority → DesignStyle mapping ──────────────────────────────

/** Maps the text-based stylePriority from ProductReasoning to a DesignStyle value */
export function mapStylePriorityToDesignStyle(stylePriority: string): DesignStyle {
  const lower = stylePriority.toLowerCase();
  if (lower.includes('brutalism') && !lower.includes('neo')) return 'brutalism';
  if (lower.includes('brutalism') && lower.includes('neo')) return 'neobrutalism';
  if (lower.includes('glassmorphism') || lower.includes('glass')) return 'glassmorphism';
  if (lower.includes('bento')) return 'bento';
  if (lower.includes('aurora') || lower.includes('gradient flow') || lower.includes('retro futurism')) return 'aurora';
  if (lower.includes('soft') || lower.includes('organic') || lower.includes('biophilic') || lower.includes('warm')) return 'soft-ui';
  if (lower.includes('minimal') && !lower.includes('bold')) return 'minimal';
  if (lower.includes('luxury') || lower.includes('elegant')) return 'minimal';
  if (lower.includes('dark mode') || lower.includes('oled')) return 'aurora';
  return 'elevated'; // default
}

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface ColorPalette {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  surface?: string;
  text?: string;
  textMuted?: string;
  border?: string;
  error?: string;
  success?: string;
  warning?: string;
  custom?: Record<string, string>;
}

export interface TypographySystem {
  headingFont?: string;
  bodyFont?: string;
  monoFont?: string;
  fontSizes?: Record<string, string>;
  fontWeights?: Record<string, string>;
  lineHeights?: Record<string, string>;
  letterSpacings?: Record<string, string>;
}

export interface SpacingScale {
  values?: Record<string, string>;
}

export interface MinimalStyleguideTokens {
  colors?: string;       // JSON string → ColorPalette
  typography?: string;   // JSON string → TypographySystem
  spacing?: string;      // JSON string → SpacingScale
  cssVariables?: string; // JSON string → Record<string, string>
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function safeParseJson<T>(json: string | undefined | null): T | null {
  if (!json || typeof json !== 'string') return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function deriveShadowToken(primaryHex?: string): string {
  if (!primaryHex) return 'rgba(0,0,0,0.1)';
  const hex = primaryHex.replace('#', '');
  if (hex.length < 6) return 'rgba(0,0,0,0.1)';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r},${g},${b},0.15)`;
}

export function deriveGradientPair(colors: ColorPalette): { from: string; to: string } {
  const from = colors.primary ?? '#3b82f6';
  const to = colors.accent ?? colors.secondary ?? '#8b5cf6';
  return { from, to };
}

// ---------------------------------------------------------------------------
// Block Builders
// ---------------------------------------------------------------------------

/**
 * System-level design rules injected at the system prompt level.
 * These apply to ALL sections and should NOT be repeated per-section.
 * Token Rules and UX Design Rules are now at system prompt level via this function.
 */
export function buildSystemLevelDesignRules(): string {
  return `### Token Rules
- Apply color values EXACTLY as specified — do NOT invent your own palette.
- HeroSection gradient uses CSS variables automatically — do NOT set gradientFrom/gradientTo unless user specifies custom colors.
- Use surface color for card backgrounds, shadow token for elevated cards.
- Use primary color for CTA buttons and highlighted elements.
- Use accent color for badges, tags, and secondary highlights.
- Typography: headingFont for all section headings and hero text; bodyFont for descriptions and labels.
- Alternate section backgrounds: background → surface → dark → gradient.

### UX Design Rules (MANDATORY)
- Contrast: Minimum 4.5:1 for text, 3:1 for large text. Descriptive alt text on images.
- Layout: Base font 16px minimum. Line-height 1.5-1.7 for body. Section padding 96-128px.
- Animation: Duration 150-300ms transitions, 500-700ms reveals. Use transform (translateY, scale) for hover, NEVER animate width/height. Stagger delay 80-120ms between elements.
- Touch targets: Minimum 44×44px. Card padding 24-32px, border-radius 12-16px.
- Content: Specific compelling headings (NO "Welcome", "About Us"). Concrete descriptions 2-3 sentences max. Action verb CTAs ("Get Started", "Book a Demo").
- Anti-Patterns: NO placeholder text, NO generic clichés ("world-class", "innovative solutions"), NO emoji as icons in professional contexts.`;
}

/**
 * Builds the Styleguide Tokens markdown block used for guiding the AI on
 * exact hex values, font families, and spacing tokens to use.
 */
export function buildUnifiedDesignTokensBlock(
  designGuidance?: DesignGuidance,
  styleguideData?: MinimalStyleguideTokens,
): string {
  const blocks: string[] = [];

  // ── Design Guidance (from local DB/Vector) ──
  if (designGuidance) {
    const { colorPalette: p, reasoning: r, typography: t } = designGuidance;
    const recommendedDesignStyle = mapStylePriorityToDesignStyle(r.stylePriority);
    blocks.push(`### Design Direction
- Style: ${r.stylePriority}
- **designStyle prop: set to "${recommendedDesignStyle}" on EVERY section component.** This controls card styles, typography treatment, borders, shadows, and hover effects. Available values: elevated, minimal, glassmorphism, brutalism, neobrutalism, soft-ui, aurora, bento.
- Colors: primary=${p.primary}, secondary=${p.secondary}, accent=${p.accent}, background=${p.background}, foreground=${p.foreground}, card=${p.card}, muted=${p.muted}, border=${p.border}
- Typography: ${t.heading} (headings) + ${t.body} (body)
- Effects: ${r.keyEffects}
- Avoid: ${r.antiPatterns}`);
  }

  // ── Styleguide Colors ──
  const colors = safeParseJson<ColorPalette>(styleguideData?.colors);
  if (colors) {
    const gradient = deriveGradientPair(colors);
    const shadow = deriveShadowToken(colors.primary);
    
    blocks.push(`### Styleguide Colors (USE these exact values)
  primary: ${colors.primary ?? '(not set)'} → CTAs, primary buttons, nav highlights
  secondary: ${colors.secondary ?? '(not set)'} → Secondary buttons, supporting elements
  accent: ${colors.accent ?? '(not set)'} → Badges, tags, icon accents
  background: ${colors.background ?? '(not set)'} → Page background
  surface: ${colors.surface ?? '(not set)'} → Card backgrounds, elevated panels
  text: ${colors.text ?? '(not set)'} → Body text, headings
  textMuted: ${colors.textMuted ?? '(not set)'} → Subtle text, captions
  border: ${colors.border ?? '(not set)'} → Dividers, card borders
  gradient: ${gradient.from} → ${gradient.to} → (reference only — HeroSection uses CSS vars by default)
  shadow: ${shadow} (tinted box-shadow for cards)`);
  }

  // ── Styleguide Typography ──
  const typography = safeParseJson<TypographySystem>(styleguideData?.typography);
  if (typography) {
    const typoLines: string[] = [
      `  headingFont: ${typography.headingFont ?? 'Inter'} → all headings, hero text, section titles`,
      `  bodyFont: ${typography.bodyFont ?? 'Inter'} → body text, descriptions, labels`,
    ];
    if (typography.monoFont) typoLines.push(`  monoFont: ${typography.monoFont} → code blocks, numbers`);
    if (typography.fontSizes) {
      typoLines.push('  Font Sizes:');
      for (const [k, v] of Object.entries(typography.fontSizes)) typoLines.push(`    ${k}: ${v}`);
    }
    blocks.push(`### Styleguide Typography\n${typoLines.join('\n')}`);
  }

  // ── Styleguide Spacing ──
  const spacing = safeParseJson<SpacingScale>(styleguideData?.spacing);
  if (spacing?.values && Object.keys(spacing.values).length > 0) {
    const spacingLines = Object.entries(spacing.values)
      .map(([k, v]) => `  ${k}: ${v}`)
      .join('\n');
    blocks.push(`### Spacing Scale\n${spacingLines}`);
  }

  // ── CSS Custom Properties ──
  const cssVars = safeParseJson<Record<string, string>>(styleguideData?.cssVariables);
  if (cssVars && Object.keys(cssVars).length > 0) {
    const varLines = Object.entries(cssVars)
      .map(([k, v]) => `  ${k}: ${v}`)
      .join('\n');
    blocks.push(`### CSS Custom Properties\n${varLines}`);
  }

  // Token Rules and UX Design Rules are now at system prompt level via buildSystemLevelDesignRules()

  return blocks.length > 0 ? blocks.join('\n\n') : '';
}
