/**
 * Section Prompt Builder — focused prompt for generating a single section.
 *
 * Much smaller than template-prompt (1 component catalog entry instead of 26).
 * Used by the 2-pass generation pipeline for parallel per-section generation.
 */

import { ChatPromptTemplate } from '@langchain/core/prompts';
import type { ComponentInfo } from './component-catalog';
import type { DesignGuidance } from '../knowledge/design-knowledge';

export interface StyleguideTokens {
  colors?: string;
  typography?: string;
  spacing?: string;
  cssVariables?: string;
}

export interface SectionPromptContext {
  userPrompt: string;
  businessType: string;
  designGuidance?: DesignGuidance;
  styleguideData?: StyleguideTokens;
  /** RAG + design guidance text for prompt injection */
  designContext?: string;
  /** Position context: which section out of how many */
  position: { index: number; total: number };
  /** When true, adds makeup enhancement rules for polishing existing sections */
  isMakeup?: boolean;
}

// ─── Stock images by business category ─────────────────────────────────────────

const BUSINESS_IMAGES: Record<string, string> = {
  'restaurant': '/stock/food/meal-table.webp',
  'bakery': '/stock/food/meal-table.webp',
  'coffee': '/stock/drink/coffee-shop.webp',
  'fitness': '/stock/fitness/gym-workout.webp',
  'healthcare': '/stock/medical/doctor.webp',
  'education': '/stock/education/classroom.webp',
  'travel': '/stock/travel/beach-sunset.webp',
  'fashion': '/stock/fashion/fashion-show.webp',
  'real estate': '/stock/realestate/house-modern.webp',
  'SaaS': '/stock/hero/office-modern.webp',
  'e-commerce': '/stock/hero/startup-team.webp',
};

function getHeroImage(businessType: string): string {
  for (const [key, path] of Object.entries(BUSINESS_IMAGES)) {
    if (businessType.toLowerCase().includes(key.toLowerCase())) return path;
  }
  return '/stock/hero/office-modern.webp';
}

function getResponseFormatHint(sectionType: string): string {
  if (sectionType === 'HeaderNav') {
    return '"logo": "BrandName", "links": [{"label": "Home", "href": "#"}], "sticky": true';
  }
  if (sectionType === 'HeroSection') {
    return '"heading": "...", "subtext": "...", "ctaText": "...", "ctaHref": "#"';
  }
  return '"heading": "...", ...fill in all required props';
}

/**
 * Build a focused prompt for generating a single section's props.
 * Returns a ChatPromptTemplate with system + human messages.
 */
export function buildSectionPrompt(
  sectionType: string,
  catalogEntry: ComponentInfo,
  context: SectionPromptContext,
): ChatPromptTemplate {
  const { position, businessType, designGuidance, styleguideData, designContext, isMakeup } = context;

  // ── Build design tokens block ──
  const designTokensBlock = buildDesignTokensBlock(designGuidance, styleguideData);

  // ── Build stock image hints ──
  const heroImage = getHeroImage(businessType);

  // ── Makeup enhancement rules (added when polishing existing sections) ──
  const makeupRules = isMakeup ? `
## Makeup Enhancement Rules

You are POLISHING this section — make it visually stunning:

1. **Animation**: Set "animation" prop — use "fade-up" for hero/CTA/stats, "stagger" for grids/galleries/products, "stagger-fade" for testimonials/teams.
2. **Gradients**: Use gradientFrom/gradientTo on HeroSection/CTASection with the exact color tokens from above. NEVER use flat solid backgrounds for hero or CTA.
3. **Images**: Fill ALL image props with appropriate stock paths. Hero backgrounds use ${heroImage}, testimonials use /stock/testimonials/avatar-N.webp, products use relevant /stock/ paths.
4. **Text Polish**: Refine heading text to be compelling and specific to ${businessType}. Make descriptions vivid but concise.
5. **Visual Variety**: Use variant props — TestimonialSection variant "carousel", CTASection variant "gradient", FeaturesGrid cardStyle "elevated".
6. **Hover Effects**: Set hoverEffect "lift" on FeaturesGrid and ProductCards.
7. **Background Alternation**: This is section ${position.index + 1} of ${position.total}. ${position.index % 2 === 0 ? 'Use light or gradient background.' : 'Use muted or dark background for contrast.'}
` : '';

  const systemMessageRaw = `You are generating section ${position.index + 1} of ${position.total} for a ${businessType} landing page.

## Component: ${sectionType}

Description: ${catalogEntry.description}

Props Signature: ${catalogEntry.propsSignature}

${catalogEntry.recommendedDefaults ? `Recommended Defaults: ${catalogEntry.recommendedDefaults}` : ''}

${catalogEntry.variantTips ? `Variant Tips: ${catalogEntry.variantTips}` : ''}

${designTokensBlock}

${designContext ? `## Design Intelligence\n${designContext}\n` : ''}
## Response Format

Return JSON with this exact structure (do NOT include "type" or "id" — those are auto-generated):
{ "props": { ${getResponseFormatHint(sectionType)} } }

## Content Rules

1. Use the USER'S LANGUAGE for all visible content (headings, descriptions, button labels).
2. No placeholder text — use realistic, business-specific content.
3. Tailor content specifically to: ${businessType}.
4. For images, use: ${heroImage} and /stock/ paths.
5. Return ONLY valid JSON. No markdown, no explanation, no code fences.
${makeupRules}`;

  // Escape braces for LangChain
  const systemMessage = systemMessageRaw.replace(/{/g, '{{').replace(/}/g, '}}');

  return ChatPromptTemplate.fromMessages([
    ['system', systemMessage],
    ['human', '{input}'],
  ]);
}

// ---------------------------------------------------------------------------
// Styleguide token types (parsed from Prisma JSON strings)
// ---------------------------------------------------------------------------

interface ColorPalette {
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

interface TypographySystem {
  headingFont?: string;
  bodyFont?: string;
  monoFont?: string;
  fontSizes?: Record<string, string>;
  fontWeights?: Record<string, string>;
  lineHeights?: Record<string, string>;
  letterSpacings?: Record<string, string>;
}

interface SpacingScale {
  values?: Record<string, string>;
}

function safeParseJson<T>(json: string | undefined | null): T | null {
  if (!json || typeof json !== 'string') return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function deriveShadowToken(primaryHex?: string): string {
  if (!primaryHex) return 'rgba(0,0,0,0.1)';
  const hex = primaryHex.replace('#', '');
  if (hex.length < 6) return 'rgba(0,0,0,0.1)';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r},${g},${b},0.15)`;
}

function deriveGradientPair(colors: ColorPalette): { from: string; to: string } {
  const from = colors.primary ?? '#3b82f6';
  const to = colors.accent ?? colors.secondary ?? '#8b5cf6';
  return { from, to };
}

function buildDesignTokensBlock(
  designGuidance?: DesignGuidance,
  styleguideData?: StyleguideTokens,
): string {
  const blocks: string[] = [];

  // ── Design Guidance (from design-knowledge) ──
  if (designGuidance) {
    const { colorPalette: p, reasoning: r, typography: t } = designGuidance;
    blocks.push(`### Design Direction
- Style: ${r.stylePriority}
- Colors: primary=${p.primary}, secondary=${p.secondary}, accent=${p.accent}, background=${p.background}, foreground=${p.foreground}, card=${p.card}, muted=${p.muted}, border=${p.border}
- Typography: ${t.heading} (headings) + ${t.body} (body)
- Effects: ${r.keyEffects}
- Avoid: ${r.antiPatterns}`);
  }

  // ── Styleguide Colors (structured, from database) ──
  const colors = safeParseJson<ColorPalette>(styleguideData?.colors);
  if (colors) {
    const gradient = deriveGradientPair(colors);
    const shadow = deriveShadowToken(colors.primary);
    const lines: string[] = [
      `  primary: ${colors.primary ?? '(not set)'} → CTAs, primary buttons, nav highlights`,
      `  secondary: ${colors.secondary ?? '(not set)'} → Secondary buttons, supporting elements`,
      `  accent: ${colors.accent ?? '(not set)'} → Badges, tags, icon accents`,
      `  background: ${colors.background ?? '(not set)'} → Page background`,
      `  surface: ${colors.surface ?? '(not set)'} → Card backgrounds, elevated panels`,
      `  text: ${colors.text ?? '(not set)'} → Body text, headings`,
      `  textMuted: ${colors.textMuted ?? '(not set)'} → Subtle text, captions`,
      `  border: ${colors.border ?? '(not set)'} → Dividers, card borders`,
      `  gradient: ${gradient.from} → ${gradient.to} → → (use in HeroSection gradientFrom/gradientTo)`,
      `  shadow: ${shadow} (tinted box-shadow for cards)`,
    ];
    blocks.push(`### Styleguide Colors (USE these exact values)\n${lines.join('\n')}`);
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

  // ── Token Application Rules (compact, section-specific) ──
  if (colors || typography) {
    blocks.push(`### Token Rules
- Apply color values EXACTLY as specified — do NOT invent your own palette.
- Use gradient tokens for HeroSection gradientFrom/gradientTo props.
- Use surface color for card backgrounds, shadow token for elevated cards.
- Use primary color for CTA buttons and highlighted elements.
- Use accent color for badges, tags, and secondary highlights.
- Typography: headingFont for all section headings and hero text; bodyFont for descriptions and labels.
- Alternate section backgrounds: background → surface → dark → gradient.`);
  }

  return blocks.length > 0 ? blocks.join('\n\n') : '';
}
