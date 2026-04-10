import { ChatPromptTemplate } from '@langchain/core/prompts';
import { COMPONENT_CATALOG, type ComponentInfo } from './component-catalog';
import type { DesignGuidance } from '../knowledge/design-knowledge';
import { STOCK_IMAGES, BUSINESS_STOCK_MAP, stockPath } from '@/features/ai/stock-images';
import type { StockCategory } from '@/features/ai/stock-images';
import { buildUnifiedDesignTokensBlock, buildSystemLevelDesignRules, buildPolishRules, type MinimalStyleguideTokens } from './prompt-utils';

export interface SectionPromptContext {
  userPrompt: string;
  businessType: string;
  designGuidance?: DesignGuidance;
  styleguideData?: MinimalStyleguideTokens;
  /** RAG + design guidance text for prompt injection */
  designContext?: string;
  /** Position context: which section out of how many */
  position: { index: number; total: number };
  /** When true, adds makeup enhancement rules for polishing existing sections */
  isMakeup?: boolean;
}

// ─── Stock images — compact path list filtered by section types ─────────────

/**
 * Compact stock image hint — only includes categories relevant to the
 * section types being generated/polished. Limits to 4 images per category.
 */
const SECTION_IMAGE_CATEGORIES: Record<string, StockCategory[]> = {
  HeroSection: ['hero'],
  FeaturesGrid: ['hero'],
  TestimonialSection: ['testimonials'],
  TeamSection: ['team'],
  Gallery: ['hero', 'food', 'travel', 'people'],
  ProductCards: ['food', 'fashion', 'education'],
  BlogSection: ['blog', 'hero'],
  CTASection: ['cta'],
  StatsSection: ['hero'],
  PricingTable: ['hero'],
  FeatureShowcase: ['hero'],
  ContactForm: ['hero'],
  HeaderNav: [],
  FooterSection: [],
  LogoGrid: [],
  SocialProof: ['people'],
  ComparisonTable: ['hero'],
  AnnouncementBar: [],
  Banner: ['cta'],
  CountdownTimer: ['cta'],
  NewsletterSignup: ['cta'],
};

function buildBatchStockImageHint(businessType: string, sectionTypes: string[]): string {
  const neededCategories = new Set<StockCategory>(['hero', 'testimonials']);
  for (const type of sectionTypes) {
    for (const cat of (SECTION_IMAGE_CATEGORIES[type] ?? ['hero'])) {
      neededCategories.add(cat);
    }
  }

  // Also add business-specific categories
  const businessKey = Object.keys(BUSINESS_STOCK_MAP).find(
    (k) => businessType.toLowerCase().includes(k.toLowerCase()),
  );
  if (businessKey) {
    for (const cat of (BUSINESS_STOCK_MAP[businessKey] ?? [])) {
      neededCategories.add(cat);
    }
  }

  const lines: string[] = [];
  for (const cat of neededCategories) {
    const images = STOCK_IMAGES[cat];
    if (images?.length) {
      // Only first 4 images per category (compact)
      const paths = images.slice(0, 4).map((img) => stockPath(img));
      lines.push(`- ${cat}: ${paths.join(', ')}`);
    }
  }
  return lines.join('\n');
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

// ─── Shared constants (used by both single and batch prompts) ─────────────

const CONTENT_PROPS: Record<string, string> = {
  HeroSection: 'heading, subtext, ctaText, badge text, trustBadges (3-4 items)',
  FeaturesGrid: 'heading, subtext, 4-6 features with title + description + icon name',
  TestimonialSection: 'heading, 3-4 testimonials with specific quote + author + role',
  CTASection: 'heading, subtext, ctaText',
  PricingTable: 'heading, 3 tiers with name + price + realistic feature list',
  StatsSection: 'heading, 4 stats with believable values and labels',
  FAQSection: 'heading, 5-6 items with question + actionable answer',
  Gallery: 'heading, 6+ images with descriptive alt text',
  ProductCards: 'heading, 4-6 products with name + price + description',
  TeamSection: 'heading, 3-4 members with name + specific role title',
  BlogSection: 'heading, 3 posts with title + excerpt + date',
  ContactForm: 'heading, subtext, buttonText',
  NewsletterSignup: 'heading, subtext with SPECIFIC value proposition, buttonText',
  HeaderNav: 'logo, 4-5 links with labels matching page sections, ctaText',
  FooterSection: 'logo, description, 3-4 linkGroups',
  FeatureShowcase: 'heading, description, 2-3 features with specific titles',
  LogoGrid: 'heading, 5-6 logos with realistic company names',
  Banner: 'heading, subtext, ctaText',
  AnnouncementBar: 'message, ctaText',
  CountdownTimer: 'heading, endDate',
};

/** Shared cliché warning — avoids repeating in multiple prompt locations. */
const CLICHE_WARNING = `NO generic clichés — avoid: "craftsmanship", "world-class", "innovative solutions", "best in class", "high-quality", "state-of-the-art", "cutting-edge". Use SPECIFIC details instead.`;

/** Shared concrete writing rules. */
const CONCRETE_RULES = `BE CONCRETE: "hand-rolled pasta with 24-month aged Parmigiano" not "delicious food". USE NUMBERS: "10,000+ customers" not "many customers". "$2.5M saved" not "significant savings".`;

/**
 * Build a focused prompt for generating a single section's props.
 */
export function buildSectionPrompt(
  sectionType: string,
  catalogEntry: ComponentInfo,
  context: SectionPromptContext,
): ChatPromptTemplate {
  const { position, businessType, designGuidance, styleguideData, designContext, isMakeup } = context;

  // Design tokens only needed in full AI mode — polish mode skips them (defaults-engine handles visual styling)
  const designTokensBlock = !isMakeup ? buildUnifiedDesignTokensBlock(designGuidance, styleguideData) : '';

  const stockImageHint = buildBatchStockImageHint(businessType, [sectionType]);

  const contentPropsForType = CONTENT_PROPS[sectionType] || '';

  const makeupRules = isMakeup ? `
## ★ POLISH RULES (MANDATORY)

1. **Content Quality** (MOST IMPORTANT): Write SPECIFIC, COMPELLING content tailored to ${businessType}. ${CLICHE_WARNING} Use CONCRETE details: specific numbers, named dishes/products, real-sounding testimonials with measurable outcomes, specific features with benefits.
2. **Images**: Fill ALL image props using EXACT paths from the stock library below. Each section MUST use a DIFFERENT image.
3. **Visual styling is auto-applied**: Do NOT set animation, cardStyle, hoverEffect, variant, columns, gradientFrom/gradientTo, or padding props — these are injected automatically based on the design style.
` : '';

  const contentPropsBlock = contentPropsForType ? `
## Content Fields for ${sectionType}
Focus on these content fields: ${contentPropsForType}
` : '';

  const systemMessageRaw = `You are generating section ${position.index + 1} of ${position.total} for a ${businessType} landing page.
${makeupRules}${contentPropsBlock}
## Component: ${sectionType}

Description: ${catalogEntry.description}

Props Signature: ${catalogEntry.propsSignature}

${catalogEntry.recommendedDefaults ? `Recommended Defaults: ${catalogEntry.recommendedDefaults}` : ''}

${designTokensBlock}

${isMakeup ? buildPolishRules() : buildSystemLevelDesignRules()}

${designContext ? `## Design Intelligence\n${designContext}\n` : ''}
## Response Format

Return JSON with this exact structure (do NOT include "type" or "id" — those are auto-generated):
{ "props": { ${getResponseFormatHint(sectionType)} } }

## Content Quality Rules

1. Use the USER'S LANGUAGE for all visible content (headings, descriptions, button labels).
2. ${CLICHE_WARNING}
3. ${CONCRETE_RULES}
4. **EMOTION + SPECIFICITY**: "Your dream kitchen, designed in 48 hours" not "We design kitchens".
5. Tailor content specifically to: ${businessType}.
6. For images, you MUST use EXACT paths from this stock library — do NOT invent filenames:
${stockImageHint}
   If a path is not listed above, do NOT use it.
7. Return ONLY valid JSON. No markdown, no explanation, no code fences.`;

  const systemMessage = systemMessageRaw.replace(/{/g, '{{').replace(/}/g, '}}');

  return ChatPromptTemplate.fromMessages([
    ['system', systemMessage],
    ['human', '{input}'],
  ]);
}

// ---------------------------------------------------------------------------
// Batch Section Prompt — polish ALL sections in one request
// ---------------------------------------------------------------------------

export interface BatchSectionPromptContext {
  userPrompt: string;
  businessType: string;
  businessName?: string;
  designGuidance?: DesignGuidance;
  styleguideData?: MinimalStyleguideTokens;
  designContext?: string;
  isMakeup?: boolean;
}

/**
 * Build a single prompt that polishes ALL sections at once.
 * Model returns a JSON array: { "components": [{ "type": "...", "props": {...} }, ...] }
 */
export function buildBatchSectionPrompt(
  sections: Array<{ type: string; props: Record<string, unknown> }>,
  context: BatchSectionPromptContext,
): ChatPromptTemplate {
  const { businessType, businessName, designGuidance, styleguideData, designContext, isMakeup } = context;
  // Design tokens only needed in full AI mode — polish mode skips them (defaults-engine handles visual styling)
  const designTokensBlock = !isMakeup ? buildUnifiedDesignTokensBlock(designGuidance, styleguideData) : '';
  const sectionTypes = sections.map(s => s.type);
  const stockImageHint = buildBatchStockImageHint(businessType, sectionTypes);
  const total = sections.length;

  // Build per-section catalog entries (compact — avoid bloating prompt)
  const sectionCatalog = sections.map((s, i) => {
    const entry = COMPONENT_CATALOG[s.type];
    if (!entry) return `${i + 1}. **${s.type}**: (no catalog entry)`;
    const lines = [
      `${i + 1}. **${s.type}** (section ${i + 1}/${total})`,
      `   Description: ${entry.shortDescription}`,
    ];
    // Skip full propsSignature for makeup — model only modifies existing props
    if (!isMakeup) {
      lines.push(`   Props: ${entry.propsSignature}`);
    }
    lines.push(`   Current plan: ${JSON.stringify(s.props).substring(0, 150)}`);
    return lines.join('\n');
  }).join('\n');

  const contentPropsList = sections.map((s) => {
    const req = CONTENT_PROPS[s.type];
    return req ? `- **${s.type}**: ${req}` : `- **${s.type}**: fill in all relevant props`;
  }).join('\n');

  const businessNameStr = businessName || businessType;

  const makeupRules = isMakeup ? `
## ★ POLISH RULES (MANDATORY)

1. **Content Quality** (MOST IMPORTANT): Write SPECIFIC, COMPELLING content for "${businessNameStr}" (${businessType}). ${CLICHE_WARNING} Use CONCRETE details: specific numbers, named dishes/products, real-sounding testimonials with measurable outcomes, specific features with benefits.
2. **Images**: Fill ALL image props using EXACT paths from the stock library below. Each section MUST use a DIFFERENT image.
3. **Visual styling is auto-applied**: Do NOT set animation, cardStyle, hoverEffect, variant, columns, gradientFrom/gradientTo, or padding props — these are injected automatically based on the design style.
` : '';

  const systemMessageRaw = `You are polishing ALL sections of a ${businessType} landing page for "${businessNameStr}" in a single pass.

${makeupRules}
## Sections to Polish (${total} total)

${sectionCatalog}

## Content Fields per Section
${contentPropsList}

${designTokensBlock}

${isMakeup ? buildPolishRules() : buildSystemLevelDesignRules()}

${designContext ? `## Design Intelligence\n${designContext}\n` : ''}
## Stock Image Library (use EXACT paths — do NOT invent filenames)
${stockImageHint}

## Response Format

Return a SINGLE JSON object with a "components" array. Each element has "type" and "props".
Maintain the SAME ORDER as the input sections. Include ALL ${total} sections.

Example:
{ "components": [
  { "type": "HeaderNav", "props": { "logo": "${businessNameStr}", "links": [...], ... } },
  { "type": "HeroSection", "props": { "heading": "...", "ctaText": "...", ... } }
] }

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, no code fences.`;

  const contentQualityRules = !isMakeup ? `
## Content Quality Rules

1. Use the USER'S LANGUAGE for all visible text.
2. ${CLICHE_WARNING}
3. ${CONCRETE_RULES}
4. Tailor ALL content to: ${businessType} — "${businessNameStr}".
` : '';

  const systemMessage = (systemMessageRaw + contentQualityRules).replace(/{/g, '{{').replace(/}/g, '}}');

  return ChatPromptTemplate.fromMessages([
    ['system', systemMessage],
    ['human', '{input}'],
  ]);
}
