import { ChatPromptTemplate } from '@langchain/core/prompts';
import { COMPONENT_CATALOG, type ComponentInfo } from './component-catalog';
import type { DesignGuidance } from '../knowledge/design-knowledge';
import { STOCK_IMAGES, BUSINESS_STOCK_MAP, stockPath } from '@/features/ai/stock-images';
import type { StockCategory } from '@/features/ai/stock-images';
import { buildUnifiedDesignTokensBlock, type MinimalStyleguideTokens } from './prompt-utils';

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

// ─── Stock images — build exact path list from registry ──────────────────────

function buildStockImageHint(businessType: string): string {
  const businessKey = Object.keys(BUSINESS_STOCK_MAP).find(
    (k) => businessType.toLowerCase().includes(k.toLowerCase()),
  );
  const categories: StockCategory[] = businessKey
    ? [...(BUSINESS_STOCK_MAP[businessKey] ?? [])]
    : ['hero', 'people'];

  const essential: StockCategory[] = ['hero', 'team', 'testimonials', 'cta', 'blog'];
  const allCategories = [...new Set([...categories, ...essential])];

  const lines: string[] = [];
  for (const cat of allCategories) {
    const images = STOCK_IMAGES[cat];
    if (images?.length) {
      const paths = images.map((img) => stockPath(img));
      lines.push(`- ${cat}: ${paths.join(', ')}`);
    }
  }
  return lines.join('\n');
}

/**
 * Compact stock image hint for batch polish — only includes categories
 * relevant to the section types being polished. Much smaller than
 * buildStockImageHint() which dumps ALL categories.
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

/**
 * Build a focused prompt for generating a single section's props.
 */
export function buildSectionPrompt(
  sectionType: string,
  catalogEntry: ComponentInfo,
  context: SectionPromptContext,
): ChatPromptTemplate {
  const { position, businessType, designGuidance, styleguideData, designContext, isMakeup } = context;

  // Utilize the unified prompt utils for robust design/styleguide injection
  const designTokensBlock = buildUnifiedDesignTokensBlock(designGuidance, styleguideData);

  const stockImageHint = buildStockImageHint(businessType);

  const REQUIRED_PROPS: Record<string, string> = {
    HeroSection: 'animation ("fade-up"), backgroundUrl OR gradientFrom+gradientTo (use rich multi-tone gradients, NEVER flat solid), backgroundOverlay (true if using image), padding ("128px" for hero, never less), badge (compelling 2-4 word label like "Trusted by 10,000+" or "New Menu This Season")',
    FeaturesGrid: 'animation ("stagger"), cardStyle ("elevated" or "glass"), hoverEffect ("lift"), columns (3), icon on EVERY feature (use Material Symbols icon names)',
    TestimonialSection: 'animation ("stagger-fade"), variant ("carousel"), avatarUrl on EVERY testimonial, 3-4 testimonials with SPECIFIC measurable results (e.g. "reduced costs by 40%" NOT "great service")',
    CTASection: 'animation ("fade-up"), variant ("gradient"), gradientFrom + gradientTo from palette colors (use distinct complementary colors for visual impact)',
    PricingTable: 'animation ("stagger"), highlightedBadge ("Most Popular" on middle tier), 3 tiers with realistic specific feature lists',
    StatsSection: 'animation ("fade-up"), animated (true), columns (4), cardStyle ("gradient" or "bordered"), 4 stats with BELIEVABLE non-round numbers',
    FAQSection: 'animation ("fade-up"), 5-6 items with reassuring next-step answers',
    Gallery: 'animation ("stagger"), columns (3), 6+ images with descriptive alt text',
    ProductCards: 'animation ("stagger"), hoverEffect ("lift"), columns (3), realistic prices like "$49.99"',
    TeamSection: 'animation ("stagger"), avatarUrl on EVERY member (use /stock/team/person-N.webp), specific role titles not generic "Team Member"',
    BlogSection: 'animation ("stagger"), columns (3), 3 posts with imageUrl and realistic recent dates',
    FeatureShowcase: 'animation ("fade-up"), image (stock path), 2-3 features with specific titles',
    ContactForm: 'animation ("fade-up"), showPhone (true), showCompany (true), buttonText with action verb',
    NewsletterSignup: 'animation ("fade-up"), buttonText, placeholder, subtext with SPECIFIC value proposition (not generic "stay updated")',
    LogoGrid: 'animation ("fade-up"), 5-6 logos with realistic company names',
    Banner: 'animation ("fade-up"), variant ("gradient")',
    AnnouncementBar: 'variant ("gradient"), ctaText',
    HeaderNav: 'sticky (true), 4-5 links matching page section headings, ctaText with action verb, animation ("fade-down")',
    FooterSection: '3-4 linkGroups, copyright with current year, description (1-sentence mission), animation ("fade-up")',
  };

  const requiredPropsForType = REQUIRED_PROPS[sectionType] || '';

  const designStyleRule = `
## DESIGN STYLE (MANDATORY)
You MUST include a "designStyle" prop on EVERY section component. Use the exact value from the "designStyle prop" line in the Design Direction section above. This prop controls card styles, typography, borders, shadows, and hover effects. Available values: elevated, minimal, glassmorphism, brutalism, neobrutalism, soft-ui, aurora, bento.`;

  const makeupRules = isMakeup ? `
## ★ VISUAL POLISH REQUIREMENTS (CRITICAL — READ FIRST)

You are POLISHING this section — make it VISUALLY STUNNING and MODERN. These rules are MANDATORY:

1. **Animation**: You MUST set the "animation" prop on EVERY component. Use "fade-up" for hero/CTA/stats/footer, "fade-down" for HeaderNav, "stagger" for grids/galleries/products, "stagger-fade" for testimonials/teams.
2. **Gradients**: You MUST use gradientFrom/gradientTo on HeroSection and CTASection with the exact color tokens from the palette below. Use RICH multi-tone gradients (e.g. primary to accent, not primary to primary). NEVER use flat solid backgrounds for hero or CTA.
3. **Images**: Fill ALL image props using EXACT paths from the stock library below. Do NOT invent filenames. IMPORTANT: Each section MUST use a DIFFERENT image — never reuse the same path across sections. Pick the most relevant category for each section type.
4. **Content Quality** (MOST IMPORTANT): Write SPECIFIC, COMPELLING content tailored to ${businessType}. AVOID generic clichés like "crafted with passion", "high-quality", "best in class", "world-class", "innovative solutions". Instead use CONCRETE details: specific numbers, named dishes/products, real-sounding testimonials with measurable outcomes, specific features with benefits. Make every word earn its place.
5. **Visual Variety**: You MUST use variant props — TestimonialSection: variant "carousel", CTASection: variant "gradient", FeaturesGrid: cardStyle "elevated" or "glass", StatsSection: cardStyle "gradient" or "bordered".
6. **Hover Effects**: You MUST set hoverEffect "lift" on FeaturesGrid, ProductCards, and any card-based components.
7. **Background Alternation**: This is section ${position.index + 1} of ${position.total}. ${position.index % 2 === 0 ? 'Use light or gradient background.' : 'Use muted or dark background for contrast.'}
8. **Badge**: HeroSection MUST include a badge — a short 2-4 word credibility label (e.g. "Trusted by 10,000+", "Since 2010", "Award Winning", "Free Shipping").
9. **Trust Elements**: Add trustBadges to HeroSection when relevant (3-4 short trust indicators like "No credit card required", "14-day free trial", "24/7 support").
10. **Padding**: HeroSection padding MUST be "128px" for maximum visual impact. Never use small padding on hero sections.
` : '';

  const requiredPropsBlock = requiredPropsForType ? `
## REQUIRED PROPS for ${sectionType}
You MUST include these props in your output: ${requiredPropsForType}
` : '';

  const systemMessageRaw = `You are generating section ${position.index + 1} of ${position.total} for a ${businessType} landing page.
${designStyleRule}${makeupRules}${requiredPropsBlock}
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

## Content Quality Rules

1. Use the USER'S LANGUAGE for all visible content (headings, descriptions, button labels).
2. **NO GENERIC CLICHES** — Avoid: "craftsmanship", "world-class", "innovative solutions", "best in class", "high-quality", "state-of-the-art", "cutting-edge". Use SPECIFIC details instead.
3. **BE CONCRETE**: Instead of "delicious food" write "hand-rolled pasta with 24-month aged Parmigiano". Instead of "great service" write "response time under 2 hours".
4. **USE NUMBERS**: "10,000+ customers" not "many customers". "$2.5M saved" not "significant savings". "4.9 stars" not "highly rated".
5. **EMOTION + SPECIFICITY**: "Your dream kitchen, designed in 48 hours" not "We design kitchens".
6. Tailor content specifically to: ${businessType}.
7. For images, you MUST use EXACT paths from this stock library — do NOT invent filenames:
${stockImageHint}
   If a path is not listed above, do NOT use it.
8. Return ONLY valid JSON. No markdown, no explanation, no code fences.`;

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
  const designTokensBlock = buildUnifiedDesignTokensBlock(designGuidance, styleguideData, { skipUxRules: isMakeup });
  const sectionTypes = sections.map(s => s.type);
  const stockImageHint = isMakeup
    ? buildBatchStockImageHint(businessType, sectionTypes)
    : buildStockImageHint(businessType);
  const total = sections.length;

  // Build per-section catalog entries (compact — avoid bloating prompt)
  const sectionCatalog = sections.map((s, i) => {
    const entry = COMPONENT_CATALOG[s.type];
    if (!entry) return `${i + 1}. **${s.type}**: (no catalog entry)`;
    return `${i + 1}. **${s.type}** (section ${i + 1}/${total})
   Description: ${entry.shortDescription}
   Props: ${entry.propsSignature}
   Current plan: ${JSON.stringify(s.props).substring(0, 150)}`;
  }).join('\n');

  const REQUIRED_PROPS: Record<string, string> = {
    HeroSection: 'animation ("fade-up"), gradientFrom+gradientTo (rich gradient, NEVER flat solid), backgroundOverlay, padding ("128px"), badge (2-4 word credibility label)',
    FeaturesGrid: 'animation ("stagger"), cardStyle ("elevated"), hoverEffect ("lift"), columns (3)',
    TestimonialSection: 'animation ("stagger-fade"), variant ("carousel"), avatarUrl on EVERY testimonial, 3-4 testimonials with specific measurable results',
    CTASection: 'animation ("fade-up"), variant ("gradient"), gradientFrom+gradientTo from palette',
    PricingTable: 'animation ("stagger"), highlightedBadge ("Most Popular"), 3 tiers with realistic features',
    StatsSection: 'animation ("fade-up"), animated (true), columns (4), cardStyle ("gradient"), 4 believable stats',
    FAQSection: 'animation ("fade-up"), 5-6 items with actionable answers',
    Gallery: 'animation ("stagger"), columns (3), 6+ images with alt text',
    ProductCards: 'animation ("stagger"), hoverEffect ("lift"), columns (3), realistic prices',
    TeamSection: 'animation ("stagger"), avatarUrl on every member (/stock/team/person-N.webp), specific role titles',
    BlogSection: 'animation ("stagger"), columns (3), imageUrl on every post, recent dates',
    ContactForm: 'animation ("fade-up"), showPhone (true), showCompany (true)',
    HeaderNav: 'sticky (true), 4-5 links, ctaText with action verb, animation ("fade-down")',
    FooterSection: '3-4 linkGroups, copyright, description, animation ("fade-up")',
    Banner: 'animation ("fade-up"), variant ("gradient")',
    AnnouncementBar: 'variant ("gradient"), ctaText',
  };

  const requiredPropsList = sections.map((s) => {
    const req = REQUIRED_PROPS[s.type];
    return req ? `- **${s.type}**: ${req}` : `- **${s.type}**: fill in all relevant props`;
  }).join('\n');

  const businessNameStr = businessName || businessType;

  const designStyleRule = `
## DESIGN STYLE (MANDATORY)
You MUST include a "designStyle" prop on EVERY section component. Use the exact value from the "designStyle prop" line in the Design Direction section above. This prop controls card styles, typography, borders, shadows, and hover effects. Available values: elevated, minimal, glassmorphism, brutalism, neobrutalism, soft-ui, aurora, bento.`;

  const makeupRules = isMakeup ? `
## ★ VISUAL POLISH RULES (MANDATORY)

1. **Animation**: EVERY component MUST have "animation" prop. "fade-up" for hero/CTA/stats/footer, "fade-down" for HeaderNav, "stagger" for grids/galleries/products, "stagger-fade" for testimonials/teams.
2. **Gradients**: HeroSection and CTASection MUST use gradientFrom/gradientTo with palette colors. Rich multi-tone gradients — NEVER flat solid backgrounds.
3. **Images**: Fill ALL image props using EXACT paths from stock library. Each section MUST use a DIFFERENT image.
4. **Content Quality**: Write SPECIFIC, COMPELLING content for "${businessNameStr}" (${businessType}). NO generic clichés. Use concrete numbers, specific dish/product names, real-sounding testimonials with measurable outcomes.
5. **Visual Variety**: Use variant props — TestimonialSection: variant "carousel", CTASection: variant "gradient", FeaturesGrid: cardStyle "elevated".
6. **Hover Effects**: hoverEffect "lift" on FeaturesGrid, ProductCards.
7. **Background Alternation**: Alternate light/muted backgrounds across sections for visual rhythm.
8. **Badge**: HeroSection MUST include a compelling 2-4 word badge.
` : '';

  const systemMessageRaw = `You are polishing ALL sections of a ${businessType} landing page for "${businessNameStr}" in a single pass.

${designStyleRule}
${makeupRules}
## Sections to Polish (${total} total)

${sectionCatalog}

## Required Props per Section
${requiredPropsList}

${designTokensBlock}

${designContext ? `## Design Intelligence\n${designContext}\n` : ''}
## Stock Image Library (use EXACT paths — do NOT invent filenames)
${stockImageHint}

## Response Format

Return a SINGLE JSON object with a "components" array. Each element has "type" and "props".
Maintain the SAME ORDER as the input sections. Include ALL ${total} sections.

Example:
{ "components": [
  { "type": "HeaderNav", "props": { "logo": "${businessNameStr}", "links": [...], ... } },
  { "type": "HeroSection", "props": { "heading": "...", "animation": "fade-up", ... } }
] }

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, no code fences.`;

  const contentQualityRules = !isMakeup ? `
## Content Quality Rules

1. Use the USER'S LANGUAGE for all visible text.
2. NO generic clichés — avoid "craftsmanship", "world-class", "innovative solutions", "high-quality".
3. BE CONCRETE: "hand-rolled pasta with 24-month aged Parmigiano" not "delicious food".
4. USE NUMBERS: "10,000+ customers" not "many customers". "$2.5M saved" not "significant savings".
5. Tailor ALL content to: ${businessType} — "${businessNameStr}".
` : '';

  const systemMessage = (systemMessageRaw + contentQualityRules).replace(/{/g, '{{').replace(/}/g, '}}');

  return ChatPromptTemplate.fromMessages([
    ['system', systemMessage],
    ['human', '{input}'],
  ]);
}
