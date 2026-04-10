import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { SystemMessage } from '@langchain/core/messages';
import type { ComponentTierPlan } from './prompt-optimizer';
import { COMPONENT_CATALOG } from './component-catalog';
import type { DesignGuidance } from '../knowledge/design-knowledge';
import {
  LANDING_PATTERNS,
  PRODUCT_REASONING,
  PRODUCT_COLOR_PALETTES,
  type LandingPattern,
  type ProductReasoning,
} from '../knowledge/design-knowledge';

// ---------------------------------------------------------------------------
// Parsed styleguide tokens
// ---------------------------------------------------------------------------

interface ParsedColors {
  primary?: string;
  onPrimary?: string;
  secondary?: string;
  accent?: string;
  onAccent?: string;
  background?: string;
  foreground?: string;
  card?: string;
  muted?: string;
  border?: string;
}

interface ParsedTypography {
  headingFont?: string;
  bodyFont?: string;
  headingWeight?: string;
  bodyWeight?: string;
}

/**
 * Parse raw styleguide JSON strings into actionable design tokens.
 * Handles both stringified JSON and pre-parsed objects.
 */
function parseStyleguideColors(raw: string | undefined): ParsedColors {
  if (!raw) return {};
  try {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!data || typeof data !== 'object') return {};

    // Support various styleguide formats: flat tokens, nested "colors" object, or CSS-var style
    const flat = data.colors ?? data;

    return {
      primary: flat.primary ?? flat['--color-primary'] ?? undefined,
      onPrimary: flat.onPrimary ?? flat['--color-on-primary'] ?? flat.onprimary ?? undefined,
      secondary: flat.secondary ?? flat['--color-secondary'] ?? undefined,
      accent: flat.accent ?? flat['--color-accent'] ?? undefined,
      onAccent: flat.onAccent ?? flat['--color-on-accent'] ?? flat.onaccent ?? undefined,
      background: flat.background ?? flat['--color-background'] ?? flat.surface ?? undefined,
      foreground: flat.foreground ?? flat['--color-foreground'] ?? flat.text ?? undefined,
      card: flat.card ?? flat['--color-card'] ?? flat.cardBg ?? undefined,
      muted: flat.muted ?? flat['--color-muted'] ?? flat.mutedBg ?? undefined,
      border: flat.border ?? flat['--color-border'] ?? undefined,
    };
  } catch {
    return {};
  }
}

function parseStyleguideTypography(raw: string | undefined): ParsedTypography {
  if (!raw) return {};
  try {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!data || typeof data !== 'object') return {};

    const flat = data.typography ?? data;

    return {
      headingFont: flat.headingFont ?? flat.headingFontFamily ?? flat.heading?.fontFamily ?? undefined,
      bodyFont: flat.bodyFont ?? flat.bodyFontFamily ?? flat.body?.fontFamily ?? undefined,
      headingWeight: flat.headingWeight ?? flat.heading?.fontWeight ?? undefined,
      bodyWeight: flat.bodyWeight ?? flat.body?.fontWeight ?? undefined,
    };
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// Business-type detection from designContext text
// ---------------------------------------------------------------------------

/**
 * Extract a canonical business type from the designContext text blob.
 * The designContext contains lines like "Business type: restaurant/dining"
 * which are injected by the prompt optimizer.
 */
function extractBusinessType(designContext?: string): string | null {
  if (!designContext) return null;
  // Match "[Business Type] SaaS/technology" from formatDesignGuidance output
  const match = designContext.match(/\[Business Type\]\s*(.+)/);
  if (match) return match[1].trim();

  // Fallback: scan for known palette keys in the text
  for (const key of Object.keys(PRODUCT_COLOR_PALETTES)) {
    if (designContext.toLowerCase().includes(key.toLowerCase())) {
      return key;
    }
  }
  return null;
}

/**
 * Resolve landing pattern + reasoning from a business type string.
 * Returns null if no matching entry exists.
 */
function resolveBusinessPattern(businessType: string): {
  pattern: LandingPattern;
  reasoning: ProductReasoning;
} | null {
  const pattern = LANDING_PATTERNS[PRODUCT_REASONING[businessType]?.recommendedPattern ?? ''];
  const reasoning = PRODUCT_REASONING[businessType];
  if (!pattern || !reasoning) return null;
  return { pattern, reasoning };
}

// ---------------------------------------------------------------------------
// Styleguide section builder
// ---------------------------------------------------------------------------

/**
 * Build an actionable styleguide section from parsed tokens + optional
 * design guidance palette. Merges both sources, with styleguide values
 * taking priority and guidance palette filling in gaps.
 */
function buildStyleguideSection(
  colorsRaw: string | undefined,
  typographyRaw: string | undefined,
  spacingRaw: string | undefined,
  cssVariablesRaw: string | undefined,
  guidance?: DesignGuidance,
): string {
  const parsed = parseStyleguideColors(colorsRaw);
  const parsedTypo = parseStyleguideTypography(typographyRaw);

  // Merge: guidance palette fills in anything the styleguide lacks
  const palette = guidance?.colorPalette;
  const tokens: ParsedColors = {
    primary: parsed.primary ?? palette?.primary,
    onPrimary: parsed.onPrimary ?? palette?.onPrimary,
    secondary: parsed.secondary ?? palette?.secondary,
    accent: parsed.accent ?? palette?.accent,
    onAccent: parsed.onAccent ?? palette?.onAccent,
    background: parsed.background ?? palette?.background,
    foreground: parsed.foreground ?? palette?.foreground,
    card: parsed.card ?? palette?.card,
    muted: parsed.muted ?? palette?.muted,
    border: parsed.border ?? palette?.border,
  };

  const typoTokens: ParsedTypography = {
    headingFont: parsedTypo.headingFont ?? guidance?.typography.heading,
    bodyFont: parsedTypo.bodyFont ?? guidance?.typography.body,
    headingWeight: parsedTypo.headingWeight,
    bodyWeight: parsedTypo.bodyWeight,
  };

  // Only emit if we have at least some values
  const hasColors = Object.values(tokens).some(Boolean);
  const hasTypo = Object.values(typoTokens).some(Boolean);
  if (!hasColors && !hasTypo && !spacingRaw && !cssVariablesRaw) return '';

  const parts: string[] = ['\n## Styleguide Constraints\n', 'You MUST follow these design constraints:\n'];

  if (hasColors) {
    parts.push('### Color Tokens');
    if (tokens.primary) parts.push(`- Primary (CTAs, nav highlights, key interactive): ${tokens.primary}`);
    if (tokens.onPrimary) parts.push(`- OnPrimary (text on primary bg): ${tokens.onPrimary}`);
    if (tokens.secondary) parts.push(`- Secondary (secondary actions, hover states): ${tokens.secondary}`);
    if (tokens.accent) parts.push(`- Accent (badges, tags, highlights): ${tokens.accent}`);
    if (tokens.onAccent) parts.push(`- OnAccent (text on accent bg): ${tokens.onAccent}`);
    if (tokens.background) parts.push(`- Background (page bg): ${tokens.background}`);
    if (tokens.foreground) parts.push(`- Foreground (main text): ${tokens.foreground}`);
    if (tokens.card) parts.push(`- Card (card bg, elevated panels): ${tokens.card}`);
    if (tokens.muted) parts.push(`- Muted (subtle bg, cards): ${tokens.muted}`);
    if (tokens.border) parts.push(`- Border (dividers, outlines): ${tokens.border}`);
    parts.push('');
    parts.push('### Color Application Rules (MANDATORY — VIOLATION = INVALID OUTPUT)');
    parts.push('- You MUST use the exact hex values listed above for ALL color props. NEVER invent, guess, or approximate colors.');
    parts.push('- HeroSection: gradient uses CSS variables automatically — only set gradientFrom/gradientTo for custom user-specified colors');
    parts.push('- CTASection: use variant="gradient" (gradients use CSS vars, no hex needed)');
    parts.push('- PricingTable: highlighted card uses primary for border/accent. highlightedBadge uses accent token');
    parts.push('- StatsSection: accent color for stat values. Background: muted or dark variant');
    parts.push('- TestimonialSection: muted background with foreground text');
    parts.push('- FooterSection: dark background (primary-dark or secondary), text using foreground/muted tokens');
    parts.push('- HeaderNav: primary color for logo/active link, background color for nav bar');
    parts.push('- Alternate section backgrounds: background → muted → dark → gradient. NEVER place same-background sections adjacently');
    parts.push('- NEVER use colors NOT listed above. If your palette is blue, do NOT output orange hex values.');
    parts.push('- NEVER use raw black (#000000) or raw white (#FFFFFF) — always use the token values above');
  }

  if (hasTypo) {
    parts.push('\n### Typography Rules');
    if (typoTokens.headingFont) parts.push(`- Heading font: "${typoTokens.headingFont}" — use for all h1-h6`);
    if (typoTokens.bodyFont) parts.push(`- Body font: "${typoTokens.bodyFont}" — use for paragraphs, descriptions, labels`);
    if (typoTokens.headingWeight) parts.push(`- Heading weight: ${typoTokens.headingWeight}`);
    if (typoTokens.bodyWeight) parts.push(`- Body weight: ${typoTokens.bodyWeight}`);
    parts.push('- HeroSection heading: large (48-64px equivalent), bold');
    parts.push('- Section headings: consistent size across FeaturesGrid, PricingTable, FAQSection');
    parts.push('- Body text: comfortable reading size (16-18px equivalent)');
  }

  // Parsed spacing scale (not raw JSON)
  if (spacingRaw) {
    parts.push('\n### Spacing Scale');
    try {
      const spacing = typeof spacingRaw === 'string' ? JSON.parse(spacingRaw) : spacingRaw;
      if (typeof spacing === 'object' && spacing !== null) {
        const entries = Object.entries(spacing as Record<string, unknown>);
        if (entries.length > 0) {
          for (const [key, val] of entries.slice(0, 8)) {
            parts.push(`- ${key}: ${val}`);
          }
        }
      } else {
        parts.push(String(spacing));
      }
    } catch {
      parts.push(spacingRaw);
    }
  }

  // CSS variables as token reference (compact)
  if (cssVariablesRaw) {
    parts.push('\n### CSS Variable Tokens');
    try {
      const cssVars = typeof cssVariablesRaw === 'string' ? JSON.parse(cssVariablesRaw) : cssVariablesRaw;
      if (typeof cssVars === 'object' && cssVars !== null) {
        const entries = Object.entries(cssVars as Record<string, unknown>);
        if (entries.length > 0) {
          for (const [key, val] of entries.slice(0, 12)) {
            parts.push(`- --${key}: ${val}`);
          }
          if (entries.length > 12) {
            parts.push(`- ... and ${entries.length - 12} more variables`);
          }
        }
      } else {
        parts.push(String(cssVars));
      }
    } catch {
      parts.push(cssVariablesRaw);
    }
  }

  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// Landing pattern → recommended page layout
// ---------------------------------------------------------------------------

/**
 * Build the RECOMMENDED PAGE LAYOUT section.
 *
 * Resolution order:
 * 1. designGuidance.pattern (full object from prompt-optimizer)
 * 2. designContext text → extract business type → look up from knowledge base
 * 3. Fallback: smart generic order based on page type heuristics
 */
function buildRecommendedLayoutSection(
  guidance?: DesignGuidance,
  designContext?: string,
): string {
  // Source 1: direct guidance object
  let pattern = guidance?.pattern;
  let reasoning = guidance?.reasoning;

  // Source 2: resolve from designContext text when guidance object is missing
  if (!pattern && designContext) {
    const businessType = extractBusinessType(designContext);
    if (businessType) {
      const resolved = resolveBusinessPattern(businessType);
      if (resolved) {
        pattern = resolved.pattern;
        reasoning = resolved.reasoning;
      }
    }
  }

  // Source 3: smart generic fallback (no fixed 10-component list)
  if (!pattern) {
    const defaultPattern = LANDING_PATTERNS['hero_features_cta']!;
    const defaultReasoning: ProductReasoning = {
      recommendedPattern: 'hero_features_cta',
      stylePriority: 'Clean Minimal',
      colorMood: 'Brand primary + Neutral tones',
      typographyMood: 'Professional + Clean',
      keyEffects: 'Subtle hover + Smooth transitions',
      antiPatterns: 'Excessive animation + Dark mode by default',
    };
    return buildPatternLayout(defaultPattern, defaultReasoning);
  }

  return buildPatternLayout(pattern, reasoning);
}

/**
 * Render a landing pattern + reasoning into the RECOMMENDED PAGE LAYOUT section.
 */
function buildPatternLayout(
  pattern: LandingPattern,
  reasoning?: ProductReasoning,
): string {
  const lines: string[] = ['## RECOMMENDED PAGE LAYOUT'];
  lines.push('');
  lines.push('Follow this section order precisely for the detected business type:');
  lines.push('');

  pattern.sectionOrder.forEach((section, i) => {
    lines.push(`${i + 1}. **${section}**`);
  });

  lines.push('');
  lines.push(`**CTA placement:** ${pattern.ctaPlacement}`);
  lines.push(`**Color strategy:** ${pattern.colorStrategy}`);
  lines.push(`**Conversion tip:** ${pattern.conversionTip}`);

  if (reasoning) {
    lines.push('');
    lines.push('### Design Reasoning');
    if (reasoning.stylePriority) lines.push(`- **Style priority:** ${reasoning.stylePriority}`);
    if (reasoning.typographyMood) lines.push(`- **Typography mood:** ${reasoning.typographyMood}`);
    if (reasoning.antiPatterns) lines.push(`- **Anti-patterns (AVOID):** ${reasoning.antiPatterns}`);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Per-section generation instructions
// ---------------------------------------------------------------------------

const SECTION_INSTRUCTIONS: Record<string, string> = {
  AnnouncementBar: 'Attention-grabbing message with optional CTA. Keep under 60 chars. Use variant "gradient".',
  HeaderNav: 'Logo + 4-5 nav links matching page sections + CTA button. Set sticky: true. Link labels should match section headings.',
  HeroSection: 'DRAMATIC heading, compelling subtext, TWO CTA buttons (primary + secondary), gradient/image background. Set animation "fade-up". Gradients use CSS vars automatically.',
  FeaturesGrid: '3-6 feature cards with specific descriptions tied to business type. Use cardStyle "elevated", hoverEffect "lift", animation "stagger".',
  StatsSection: '4 impressive but believable stats with count-up animation (animated: true). Choose numbers relevant to the industry.',
  LogoGrid: '5-6 partner/client logos with "Trusted by" heading. Use for social proof.',
  TestimonialSection: '3-4 testimonials with full names, realistic company names, specific quotes. Use variant "carousel", animation "stagger-fade".',
  PricingTable: '2-3 pricing tiers with believable prices and specific features. Highlight middle tier (highlightedBadge: "Most Popular"). Include pricingToggle with yearly discount.',
  FAQSection: '4-6 genuine questions customers would ask. Use "items" array (NOT "faqs") with {question, answer} objects. Use "heading" (NOT "title") for section title. Set accordion: true, animation "fade-up".',
  CTASection: 'Bold heading, compelling subtext, prominent CTA button. Use variant "gradient" or "dark" for contrast. Set animation "fade-up".',
  ContactForm: 'Contact form with showPhone and showCompany. Button text matches business type ("Send Message" / "Book a Demo" / "Reserve a Table").',
  FooterSection: 'Dark background, 3-4 link groups (Product/Company/Support/Legal), logo description, copyright with current year.',
  NewsletterSignup: 'Email form with compelling heading and benefit-focused subtext. buttonText "Subscribe".',
  Gallery: '6+ images in 3-column grid. Use for visual businesses (food, real estate, portfolio). Animation "stagger".',
  ProductCards: '4-6 products with prices, images, descriptions. Use hoverEffect "lift", animation "stagger".',
  FeatureShowcase: 'Split layout: image on one side + feature list on other. Use for product/app demos. Animation "fade-up".',
  CountdownTimer: 'Countdown to event/launch date. Use with event-specific heading.',
  TeamSection: '3-4 team members with realistic names, specific roles. Animation "stagger".',
  BlogSection: '3 recent blog post cards with thumbnails, dates, realistic titles. Animation "stagger".',
  ComparisonTable: 'Side-by-side feature comparison. Use for SaaS/product comparison.',
  SocialProof: 'Trust indicators with user counts and credibility stats.',
  Banner: 'Full-width promotional banner with urgency heading. Use variant "gradient".',
};

/**
 * Build the FULL PAGE GENERATION instruction block.
 *
 * When design guidance with a landing pattern is available, the section
 * list is derived from the pattern's `sectionOrder` enriched with
 * conversion tips and anti-patterns. Otherwise falls back to a generic
 * default list.
 */
function buildFullPageGeneration(guidance?: DesignGuidance, designContext?: string): string {
  let pattern = guidance?.pattern;
  let reasoning = guidance?.reasoning;

  // Resolve from designContext text when guidance object is missing
  if (!pattern && designContext) {
    const businessType = extractBusinessType(designContext);
    if (businessType) {
      const resolved = resolveBusinessPattern(businessType);
      if (resolved) {
        pattern = resolved.pattern;
        reasoning = resolved.reasoning;
      }
    }
  }

  const lines: string[] = [];
  lines.push('## FULL PAGE GENERATION');
  lines.push('');

  if (pattern) {
    lines.push('When asked for "landing page", "website", "complete page" — generate action "full_page" using the section order from RECOMMENDED PAGE LAYOUT above.');
    lines.push('');
    lines.push('Section-by-section instructions:');
    lines.push('');

    const order = pattern.sectionOrder;
    for (const section of order) {
      const instruction = SECTION_INSTRUCTIONS[section];
      if (instruction) {
        lines.push(`- **${section}** — ${instruction}`);
      }
    }

    lines.push('');
    lines.push(`**CTA strategy:** ${pattern.ctaPlacement}`);
    lines.push(`**Conversion focus:** ${pattern.conversionTip}`);

    if (reasoning) {
      lines.push('');
      if (reasoning.stylePriority) {
        lines.push(`**Style priority:** ${reasoning.stylePriority}`);
      }
      if (reasoning.typographyMood) {
        lines.push(`**Typography mood:** ${reasoning.typographyMood}`);
      }
      if (reasoning.antiPatterns) {
        lines.push(`**AVOID these anti-patterns:** ${reasoning.antiPatterns}`);
      }
    }
  } else {
    // Default fallback — use the most versatile pattern
    const defaultPattern = LANDING_PATTERNS['hero_features_cta']!;
    lines.push('When asked for "landing page", "website", "complete page" — generate action "full_page" with these components in order:');
    lines.push('');
    for (const section of defaultPattern.sectionOrder) {
      const instruction = SECTION_INSTRUCTIONS[section];
      if (instruction) {
        lines.push(`- **${section}** — ${instruction}`);
      }
    }
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

interface StyleguideData {
  colors?: string;
  typography?: string;
  spacing?: string;
  cssVariables?: string;
}

interface PromptContext {
  styleguideData?: StyleguideData;
  miniContext?: string;
  treeSummary?: string;
  projectProfile?: string;
  /** Pre-computed tier plan from prompt optimizer for dynamic catalog */
  componentTiers?: ComponentTierPlan;
  /** Compact design guidance text from knowledge base (colors, styles, patterns, typography) */
  designContext?: string;
  /** Resolved design guidance object (palette, style, pattern, typography, reasoning) */
  designGuidance?: DesignGuidance;
}

// ---------------------------------------------------------------------------
// Dynamic Catalog Builder (uses shared COMPONENT_CATALOG from component-catalog.ts)
// ---------------------------------------------------------------------------

function buildComponentEntry(name: string, info: import('./component-catalog').ComponentInfo): string {
  let entry = `### ${name}\n${info.description}\nProps: ${info.propsSignature}`;
  if (info.recommendedDefaults) entry += `\nRecommended defaults: ${info.recommendedDefaults}`;

  return entry;
}

function buildDynamicCatalog(tiers?: ComponentTierPlan): string {
  // Default: all components full detail (backward compatible)
  if (!tiers) {
    return Object.entries(COMPONENT_CATALOG)
      .map(([name, info]) => buildComponentEntry(name, info))
      .join('\n\n');
  }

  // Safety: if all tiers empty, fall back to full catalog
  const hasContent = tiers.fullDetail.length > 0 || tiers.summary.length > 0 || tiers.nameOnly.length > 0;
  if (!hasContent) {
    return Object.entries(COMPONENT_CATALOG)
      .map(([name, info]) => buildComponentEntry(name, info))
      .join('\n\n');
  }

  const parts: string[] = [];

  // Tier 1: Full detail (includes recommendedDefaults)
  for (const name of tiers.fullDetail) {
    const info = COMPONENT_CATALOG[name];
    if (info) {
      parts.push(buildComponentEntry(name, info));
    }
  }

  // Tier 2: Summary (name + short description + props)
  if (tiers.summary.length > 0) {
    parts.push('\n### Additional Components (summary)');
    for (const name of tiers.summary) {
      const info = COMPONENT_CATALOG[name];
      if (info) {
        let entry = `- ${name} — ${info.shortDescription}. Props: ${info.propsSignature}`;
        if (info.recommendedDefaults) entry += `. Defaults: ${info.recommendedDefaults}`;
        parts.push(entry);
      }
    }
  }

  // Tier 3: Name-only
  if (tiers.nameOnly.length > 0) {
    parts.push('\n### Other Available Components');
    parts.push(tiers.nameOnly.join(', '));
  }

  return parts.join('\n');
}

/**
 * Build the LangChain ChatPromptTemplate for AI generation.
 *
 * Structure:
 *   system — Puck component catalog + design system + styleguide + session context + page context
 *   history — conversation messages from this session
 *   human — user prompt
 */
export function buildChainPrompt(ctx?: PromptContext): ChatPromptTemplate {
  // --- Parsed styleguide section (actionable tokens, not raw JSON) ---
  const styleguideSection = buildStyleguideSection(
    ctx?.styleguideData?.colors,
    ctx?.styleguideData?.typography,
    ctx?.styleguideData?.spacing,
    ctx?.styleguideData?.cssVariables,
    ctx?.designGuidance,
  );

  const contextSection = ctx?.miniContext
    ? `
## Session Context (what the user has done so far)
${ctx.miniContext}
Reference this context when the user refers to previous changes or asks for modifications.
`
    : '';

  const treeContextSection = ctx?.treeSummary
    ? `
## Current Page Structure
The user's page currently has these components:
${ctx.treeSummary}

When the user asks to modify or add to the page, take the existing structure into account. Do NOT regenerate components that already exist unless explicitly asked. Prefer \`insert_component\` to append new components.
`
    : 'The page is currently empty. Generate a complete page from scratch.';

  // --- Recommended page layout from landing patterns ---
  const layoutSection = buildRecommendedLayoutSection(ctx?.designGuidance, ctx?.designContext);

  // --- Full page generation instructions using pattern ---
  const fullPageGeneration = buildFullPageGeneration(ctx?.designGuidance, ctx?.designContext);

  const systemContent = `You are a world-class UI/UX designer and frontend developer. You create STUNNING, MODERN, PROFESSIONAL websites. Every page must look like it was crafted by a senior design team.

## COMPONENT CATALOG

You have these components available. Each has specific props. You MUST use exact component type names and valid props.
NOTE: You may use ANY component listed, including summary/name-only ones. If unsure of exact props, provide your best guess — the system fills sensible defaults.

${buildDynamicCatalog(ctx?.componentTiers)}

## RESPONSE FORMAT

### ID Generation
Every component MUST have a unique "id" in props. Generate random IDs like: "comp_" + 6 random alphanumeric chars (e.g., "comp_a3x9k2").

### Component Naming
Every component SHOULD have a "name" in props — a short, descriptive snake_case slug (max 30 chars).
Use the convention: {type_prefix}_{content_hint}
Examples:
- HeroSection with heading "Welcome" → name: "hero_welcome"
- PricingTable with heading "Our Plans" → name: "pricing_our_plans"
- FAQSection → name: "faq"
- ButtonBlock "Get Started" → name: "button_get_started"
The name lets users reference components by name in chat (e.g., @hero_welcome).

### Component Rules
- Use EXACT component type names from the catalog above (case-sensitive)
- Include all required props
- Optional props can be omitted
- Numbers (columns, gap, height) must be actual numbers, not strings
- Booleans must be actual booleans, not strings

## DESIGN PRINCIPLES

1. **Alternate section styles** — vary backgrounds between white, muted, dark, gradient
2. **Consistent color palette** — pick ONE palette and stick to it
3. **Professional content** — realistic company names, descriptions, data. NO "Lorem ipsum"
4. **No emojis** — use plain text only
5. **Visual hierarchy** — clear headings, supporting text, prominent CTAs
6. **Generous spacing** — sections need breathing room
7. **Contrast** — dark backgrounds need light text and vice versa

## DESIGN INTELLIGENCE

When generating pages, follow these enhanced design rules:

### Color Usage
- If design guidance provides colors — USE them as your palette. Override any defaults.
- Use primary color for CTAs, nav highlights, and key interactive elements
- Use accent color for secondary actions and highlights (badges, tags)
- Alternate section backgrounds: white → muted (gray-50 equivalent) → dark → gradient
- Dark sections MUST use light text. Light sections MUST use dark text
- For HeroSection: gradient backgrounds use CSS variables automatically — no need to set gradientFrom/gradientTo

### Component Prop Utilization (CRITICAL)
- ALWAYS set \`animation\` prop on content sections (prefer "fade-up" or "stagger" for first visible, "stagger-fade" for grids)
- Use \`variant\` props for visual variety: TestimonialSection → try "carousel", CTASection → use "gradient" or "dark"
- Use \`hoverEffect\` on FeaturesGrid ("lift") and ProductCards ("lift" or "zoom")
- Use \`cardStyle\` on FeaturesGrid — alternate between "icon", "elevated", "image" for different feels
- HeroSection gradients use CSS variables (var(--primary) → var(--tertiary)) — only set gradientFrom/gradientTo when user specifies custom colors
- Use \`trustBadges\` on HeroSection when business type benefits from credibility signals
- Use ComponentMeta props (bgColor, textColor, padding) for per-section visual variety
- PricingTable: ALWAYS include highlightedBadge (e.g., "Most Popular"), set animation to "stagger", include pricingToggle with yearlyPlans
- StatsSection: ALWAYS set animated to true for count-up effect

### Content Quality
- Generate 4-6 features with SPECIFIC descriptions tied to the business type (not generic filler)
- Pricing tiers with believable prices, specific feature lists, highlighted popular plan
- Testimonials with full names, realistic company names, specific quotes about the business
- Stats with impressive but believable numbers relevant to the industry
- FAQ with genuine questions customers would ask about this specific business type

### Layout Variety
- Avoid all sections looking the same width/alignment — mix centered, split-left, split-right heroes
- Use ColumnsLayout or split layouts for visual rhythm
- Dense section → breathing room (spacer or simpler section) → dense section
${ctx?.designContext ? '### Active Design Guidance\n' + ctx.designContext : ''}

${layoutSection}

${fullPageGeneration}

## CLARIFICATION RULES

**Default to GENERATE.** Only clarify when the request is genuinely ambiguous (e.g., "change it" with no target component on an empty page, or conflicting instructions).
- If a project profile exists with business context → ALWAYS generate, never clarify.
- If the user provided context in PREVIOUS messages → generate immediately, do not re-ask.
- If the request is specific enough → generate immediately.
- If the page already has components and user says "make it better" → modify/improve, do not clarify.

## MODIFICATION ACTIONS

- "insert_component" — ADD new component(s) at position
- "insert_section" — ADD new section(s) (same as insert_component, for clarity)
- "modify_node" — change specific component props (targetComponentId required)
- "replace_node" — completely replace a component (targetComponentId required)
- "delete_node" — remove a component (targetComponentId required, components empty)
- "reorder_children" — change the order of all page components (components array is the new full order)
- "full_page" — replace ALL page content
- "clarify" — ask the user for clarification (message required)

### Few-Shot Action Examples
- User says: "Update the hero title to Welcome"
  -> {"action": "modify_node", "targetComponentId": "comp_123", "components": [{"type": "HeroSection", "props": {"heading": "Welcome"}}], "message": "Updated the title. Looks great!"}
- User says: "Change the second section to a pricing table"
  -> {"action": "replace_node", "targetComponentId": "comp_456", "components": [{"type": "PricingTable", "props": {...}}], "message": "Replaced successfully. Excellent choice!"}
- User says: "Move the FAQ section to the bottom"
  -> {"action": "reorder_children", "components": [{ "type": "HeroSection", "props": {"id": "..."} }, ...], "message": "Moved the FAQ section to the bottom."}

## TONE & PERSONA (For the "message" field)
- Tone: Professional, cute, and energetic.
- STRICT RULE: NEVER use emojis in the "message" field. Your positive energy must come purely from wording (e.g., "Excellent", "Done!").
- Language: Default to English. Match the language the user is writing in. Be concise.

${styleguideSection}${contextSection}${treeContextSection}
${ctx?.projectProfile ? `
## Project Design Direction
${ctx.projectProfile}
IMPORTANT: This project has an established identity. Your design MUST match:
- The business type and industry — choose appropriate imagery, colors, and tone
- The target audience — adjust complexity, language level, and visual style accordingly
- The preferred style (modern/elegant/bold/etc.) — reflect it in layout, typography, and color choices
- The content language — generate visible text in the project's language
` : ''}

CRITICAL: You MUST respond with valid JSON only. No markdown, no code fences, no explanation, no conversational text. Output ONLY this JSON structure:
{"action": "full_page" | "insert_component" | "insert_section" | "modify_node" | "replace_node" | "delete_node" | "reorder_children" | "clarify", "message": "Optional summary. REQUIRED for clarify.", "components": [{"type": "ComponentName", "props": {"id": "comp_abc123", "name": "hero_main", ...otherProps}}], "targetComponentId": "optional — can be component id or name", "position": 0}`;

  return ChatPromptTemplate.fromMessages([
    new SystemMessage(systemContent),
    new MessagesPlaceholder('history'),
    ['human', '{input}'],
  ]);
}

/**
 * Build a compact text summary of the current Puck page data.
 * Lists each component with its type and key props.
 */
export function buildTreeSummary(data: unknown): string {
  if (!data || typeof data !== 'object') return '';

  const d = data as Record<string, unknown>;
  const content = d.content as Array<Record<string, unknown>> | undefined;

  if (!content || !Array.isArray(content) || content.length === 0) {
    return '(empty page — no components)';
  }

  const lines: string[] = [];

  for (let i = 0; i < content.length; i++) {
    const comp = content[i];
    const type = comp.type ?? 'Unknown';
    const props = (comp.props as Record<string, unknown>) ?? {};
    const id = props.id ?? `index_${i}`;
    const name = typeof props.name === 'string' && props.name ? props.name : '';
    const label = props.heading ?? props.logo ?? props.content ?? '';
    const labelPart = label ? ` — "${String(label).substring(0, 50)}"` : '';
    const namePart = name ? ` @${name}` : '';
    lines.push(`${i + 1}. ${type} (id: "${id}"${namePart})${labelPart}`);
  }

  return lines.join('\n');
}
