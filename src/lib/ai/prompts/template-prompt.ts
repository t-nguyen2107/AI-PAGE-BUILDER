/**
 * Template Selection Prompt — compact prompt for AI to output Puck ComponentData directly.
 *
 * AI returns { components: [{ type: "HeroSection", props: {...} }] } format.
 * No DOM node generation or adapter conversion needed.
 */

import { ChatPromptTemplate } from '@langchain/core/prompts';
import { COMPONENT_CATALOG } from './component-catalog';

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

export interface StyleguideTokens {
  colors?: string;       // JSON string → ColorPalette
  typography?: string;   // JSON string → TypographySystem
  spacing?: string;      // JSON string → SpacingScale
  cssVariables?: string; // JSON string → Record<string, string>
}

export interface TemplatePromptContext {
  businessType?: string;
  businessStyle?: string;
  language?: string;
  stockImages?: Record<string, string[]>;
  styleguideData?: StyleguideTokens;
  /** Compact design guidance text from knowledge base */
  designContext?: string;
}

// ---------------------------------------------------------------------------
// Styleguide Token Parser — safe JSON parse with fallback
// ---------------------------------------------------------------------------

function safeParseJson<T>(json: string | undefined | null): T | null {
  if (!json || typeof json !== 'string') return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/**
 * Derive a small Tailwind-friendly shadow token from the primary color.
 * Uses the primary hex as a tinted shadow with reduced opacity.
 */
function deriveShadowToken(primaryHex?: string): string {
  if (!primaryHex) return 'rgba(0,0,0,0.1)';
  // Convert hex to rgba with 0.15 alpha for soft shadow
  const hex = primaryHex.replace('#', '');
  if (hex.length < 6) return 'rgba(0,0,0,0.1)';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r},${g},${b},0.15)`;
}

/**
 * Derive a gradient pair from primary + accent colors.
 */
function deriveGradientPair(colors: ColorPalette): { from: string; to: string } {
  const from = colors.primary ?? '#3b82f6';
  const to = colors.accent ?? colors.secondary ?? '#8b5cf6';
  return { from, to };
}

// ---------------------------------------------------------------------------
// Styleguide Block Builder — converts parsed JSON into prompt instruction blocks
// ---------------------------------------------------------------------------

function buildStyleguideBlocks(sg: StyleguideTokens): string {
  const colors = safeParseJson<ColorPalette>(sg.colors);
  const typography = safeParseJson<TypographySystem>(sg.typography);
  const spacing = safeParseJson<SpacingScale>(sg.spacing);
  const cssVars = safeParseJson<Record<string, string>>(sg.cssVariables);

  // If nothing parseable, skip entirely
  if (!colors && !typography && !spacing && !cssVars) return '';

  const blocks: string[] = [];

  // ── COLOR TOKENS ──
  if (colors) {
    const gradient = deriveGradientPair(colors);
    const shadow = deriveShadowToken(colors.primary);
    const hasCustom = colors.custom && Object.keys(colors.custom).length > 0;
    const customLines = hasCustom
      ? Object.entries(colors.custom!)
          .map(([k, v]) => `    ${k}: ${v}`)
          .join('\n')
      : '';

    blocks.push(`### Color Tokens (USE these exact values in component props)

  Core Palette:
    primary:    ${colors.primary ?? '(not set)'}     → CTAs, nav highlights, key interactive elements, primary buttons
    secondary:  ${colors.secondary ?? '(not set)'}     → Secondary buttons, supporting UI elements
    accent:     ${colors.accent ?? '(not set)'}     → Badges, tags, highlights, icon accents
    background: ${colors.background ?? '(not set)'}     → Page background
    surface:    ${colors.surface ?? '(not set)'}     → Card backgrounds, elevated panels
    text:       ${colors.text ?? '(not set)'}     → Body text, headings (on light bg)
    textMuted:  ${colors.textMuted ?? '(not set)'}     → Subtle text, captions, descriptions
    border:     ${colors.border ?? '(not set)'}     → Dividers, card borders
    error:      ${colors.error ?? '(not set)'}     → Error states
    success:    ${colors.success ?? '(not set)'}     → Success states
    warning:    ${colors.warning ?? '(not set)'}     → Warning states

  Derived Tokens:
    gradient:    ${gradient.from} → ${gradient.to}   (use in HeroSection gradientFrom/gradientTo)
    shadow:      ${shadow}          (tinted box-shadow for cards)
${customLines}`);
  }

  // ── TYPOGRAPHY TOKENS ──
  if (typography) {
    const headingFont = typography.headingFont ?? 'Inter';
    const bodyFont = typography.bodyFont ?? 'Inter';
    const monoFont = typography.monoFont ?? 'monospace';

    const fontSizeLines = typography.fontSizes
      ? Object.entries(typography.fontSizes)
          .map(([k, v]) => `    ${k}: ${v}`)
          .join('\n')
      : '';

    const weightLines = typography.fontWeights
      ? Object.entries(typography.fontWeights)
          .map(([k, v]) => `    ${k}: ${v}`)
          .join('\n')
      : '';

    const lhLines = typography.lineHeights
      ? Object.entries(typography.lineHeights)
          .map(([k, v]) => `    ${k}: ${v}`)
          .join('\n')
      : '';

    const lsLines = typography.letterSpacings
      ? Object.entries(typography.letterSpacings)
          .map(([k, v]) => `    ${k}: ${v}`)
          .join('\n')
      : '';

    blocks.push(`### Typography Tokens

  Fonts:
    headingFont: ${headingFont}   (use for all headings, hero text, section titles)
    bodyFont:    ${bodyFont}   (use for body text, descriptions, labels)
    monoFont:    ${monoFont}   (use for code blocks, numbers, technical data)
${fontSizeLines ? '  Font Sizes:\n' + fontSizeLines : ''}${weightLines ? '  Font Weights:\n' + weightLines : ''}${lhLines ? '  Line Heights:\n' + lhLines : ''}${lsLines ? '  Letter Spacings:\n' + lsLines : ''}`);
  }

  // ── SPACING TOKENS ──
  if (spacing?.values && Object.keys(spacing.values).length > 0) {
    const spacingLines = Object.entries(spacing.values)
      .map(([k, v]) => `    ${k}: ${v}`)
      .join('\n');

    blocks.push(`### Spacing Scale

${spacingLines}

  Usage: Apply as padding/margin values. Use larger values for section padding, smaller for intra-component gaps.`);
  }

  // ── CSS VARIABLES ──
  if (cssVars && Object.keys(cssVars).length > 0) {
    const varLines = Object.entries(cssVars)
      .map(([k, v]) => `    ${k}: ${v}`)
      .join('\n');

    blocks.push(`### CSS Custom Properties (reference for advanced styling)

${varLines}`);
  }

  return blocks.join('\n\n');
}

// ---------------------------------------------------------------------------
// Prompt Builder
// ---------------------------------------------------------------------------

/**
 * Build the compact Puck component selection prompt.
 */
export function buildTemplatePrompt(_ctx?: TemplatePromptContext): ChatPromptTemplate {
  const stockImagesHint = _ctx?.stockImages
    ? JSON.stringify(_ctx.stockImages)
    : '/stock/hero/*.webp, /stock/food/*.webp, /stock/team/*.webp, etc.';

  const extraRules: string[] = [];
  if (_ctx?.businessType) extraRules.push(`7. Business type: "${_ctx.businessType}". Tailor ALL content (headings, descriptions, prices, features, team names, FAQ answers) to this business.`);
  if (_ctx?.businessStyle) extraRules.push(`8. Visual style: ${_ctx.businessStyle}`);

  // ── STYLEGUIDE TOKENS BLOCK ──
  const styleguideBlock = _ctx?.styleguideData
    ? buildStyleguideBlocks(_ctx.styleguideData)
    : '';

  // ── DESIGN INTELLIGENCE BLOCK ──
  const designBlock = _ctx?.designContext
    ? `## DESIGN INTELLIGENCE

${_ctx.designContext}

### Component Prop Rules
- ALWAYS set animation on content sections: HeroSection="fade-up", FeaturesGrid="stagger", PricingTable="stagger", TestimonialSection="stagger-fade"
- Use variant props: TestimonialSection variant="carousel", CTASection variant="gradient"|"dark", FeaturesGrid cardStyle="elevated"|"icon"
- Use hoverEffect on FeaturesGrid ("lift") and ProductCards ("lift"|"zoom")
- Use gradientFrom/gradientTo on HeroSection for rich backgrounds (never flat solid color)
- PricingTable: include highlightedBadge, pricingToggle with yearlyPlans, animation="stagger"
- Alternate section backgrounds: white → muted → dark → gradient (never all-white)
${styleguideBlock ? `
### Active Token Application Rules
- HeroSection: Use gradient tokens for gradientFrom/gradientTo. Use primary color for CTA buttons.
- FeaturesGrid: Use surface color for card backgrounds with shadow token for elevated cards.
- PricingTable: Use primary color for highlighted/high-popular plan. Use accent for badge.
- TestimonialSection: Use muted background (surface or textMuted-based) for card variety.
- CTASection: Use gradient pair or primary→dark for bold CTA backgrounds.
- FooterSection: Use dark variant — background with primary-tint, text with light/muted colors.
- StatsSection: Use accent color for stat numbers. Use heading font for impact.
- FAQSection: Use border color for dividers. Use surface for accordion hover states.
- HeaderNav: Use primary for logo text / active link. Use background color for nav bar.
- All sections: Alternate between background (light) → surface (slightly elevated) → primary-dark → gradient. Never place same-background sections adjacently.
- Typography: headingFont for all section headings and hero text. bodyFont for descriptions, labels, body copy.
` : ''}`
    : styleguideBlock
      ? `## STYLEGUIDE TOKENS

${styleguideBlock}

### Token Application Rules
- Apply colors EXACTLY as specified above — do NOT invent your own palette.
- Use gradient tokens for HeroSection gradientFrom/gradientTo props.
- Alternate section backgrounds: background → surface → dark (primary-tinted) → gradient.
- Typography: headingFont for headings/hero, bodyFont for body text/descriptions.
- Spacing: Use the spacing scale for section padding — prefer larger values for breathing room.
- Shadow: Use the derived shadow token for elevated card effects.
`
      : '';

  // Build component type reference from shared catalog
  const componentRef = Object.entries(COMPONENT_CATALOG)
    .map(([name, info]) => `### ${name}\nProps: ${info.propsSignature}`)
    .join('\n\n');

  // Build system message with regular braces — we escape them all at the end
  const systemMessageRaw = `You are a website page assembler. Given a user request, output an array of Puck UI components with their props filled in.

## Available Component Types and Their Props

${componentRef}

## Response Format

Return JSON with this exact structure (the "id" field in each props is auto-generated — do NOT include it):
{ "components": [ { "type": "HeaderNav", "props": { "logo": "BrandName", "links": [{ "label": "Home", "href": "#" }], "sticky": true } }, { "type": "HeroSection", "props": { "heading": "Welcome", "subtext": "Build something amazing", "ctaText": "Get Started", "ctaHref": "#", "align": "center", "backgroundOverlay": false, "padding": "96px" } }, { "type": "FooterSection", "props": { "logo": "BrandName", "linkGroups": [{ "title": "Product", "links": [{ "label": "Features", "href": "#" }] }], "copyright": "© 2026 BrandName" } } ] }

## Content Rules

1. Pick 5-8 components per page. Typical order: AnnouncementBar (optional), HeaderNav, HeroSection, FeaturesGrid/FeatureShowcase/StatsSection, SocialProof/LogoGrid, TestimonialSection, PricingTable/ComparisonTable, ProductCards (for e-commerce), FAQSection/BlogSection, NewsletterSignup, CTASection/Banner, CountdownTimer, ContactForm, FooterSection
2. Content must be professional — no emojis, no placeholder text (no "Lorem ipsum")
3. Use English for "type" and structural keys. Use the USER'S LANGUAGE for visible content (headings, descriptions, button labels, etc.)
4. For images, use paths from the stock library: ${stockImagesHint}
5. Tailor content to the user's business/industry. Be specific, not generic.
6. Provide realistic data: real-seeming names, believable prices, relevant feature descriptions
${extraRules.join('\n')}

${designBlock}
## Stock Image Paths (use in props where applicable)
- Hero backgrounds: /stock/hero/office-modern.webp, /stock/hero/tech-dark.webp, /stock/hero/startup-team.webp
- Food: /stock/food/meal-table.webp, /stock/food/pizza.webp, /stock/food/sushi.webp, /stock/food/steak.webp, /stock/food/burger.webp
- Coffee/drinks: /stock/drink/coffee-cup.webp, /stock/drink/coffee-shop.webp, /stock/drink/cocktail.webp
- Travel: /stock/travel/beach-sunset.webp, /stock/travel/paris-eiffel.webp, /stock/travel/santorini.webp
- Team avatars: /stock/team/person-1.webp through person-6.webp
- Testimonial avatars: /stock/testimonials/avatar-1.webp through avatar-4.webp
- Blog thumbnails: /stock/blog/writing.webp, /stock/blog/notebook.webp, /stock/blog/laptop-coffee.webp
- CTA backgrounds: /stock/cta/gradient-blue.webp, /stock/cta/abstract-waves.webp
- Features: /stock/features/analytics-dashboard.webp, /stock/features/data-charts.webp
- Nature: /stock/nature/forest.webp, /stock/nature/mountain-peak.webp, /stock/nature/sunset-ocean.webp
- Fitness: /stock/fitness/gym-workout.webp, /stock/fitness/yoga-pose.webp
- Medical: /stock/medical/doctor.webp, /stock/medical/nurse.webp
- Education: /stock/education/books-library.webp, /stock/education/classroom.webp
- Fashion: /stock/fashion/fashion-show.webp, /stock/fashion/shopping-bags.webp
- Pets: /stock/pets/golden-dog.webp, /stock/pets/cat-orange.webp
- Family: /stock/family/family-together.webp, /stock/family/parents-baby.webp
- Real estate: /stock/realestate/house-modern.webp, /stock/realestate/luxury-home.webp

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, no code fences.`;

  // Escape ALL literal braces so LangChain doesn't treat them as template variables
  const systemMessage = systemMessageRaw.replace(/{/g, '{{').replace(/}/g, '}}');

  return ChatPromptTemplate.fromMessages([
    ['system', systemMessage],
    ['human', '{input}'],
  ]);
}
