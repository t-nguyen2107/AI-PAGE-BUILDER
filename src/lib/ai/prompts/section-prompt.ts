import { ChatPromptTemplate } from '@langchain/core/prompts';
import type { ComponentInfo } from './component-catalog';
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
    HeroSection: 'animation ("fade-up"), backgroundUrl OR gradientFrom+gradientTo, backgroundOverlay (true if using image), padding ("96px" or "128px"), badge (short 2-4 word label)',
    FeaturesGrid: 'animation ("stagger"), cardStyle ("elevated"), hoverEffect ("lift"), columns (3)',
    TestimonialSection: 'animation ("stagger-fade"), variant ("carousel"), avatarUrl on EVERY testimonial',
    CTASection: 'animation ("fade-up"), variant ("gradient"), gradientFrom + gradientTo from palette colors',
    PricingTable: 'animation ("stagger"), highlightedBadge ("Most Popular" on middle tier)',
    StatsSection: 'animation ("fade-up"), animated (true), columns (4)',
    FAQSection: 'animation ("fade-up"), 5-6 items minimum',
    Gallery: 'animation ("stagger"), columns (3), 6+ images with descriptive alt text',
    ProductCards: 'animation ("stagger"), hoverEffect ("lift"), columns (3)',
    TeamSection: 'animation ("stagger"), avatarUrl on EVERY member (use /stock/team/person-N.webp)',
    BlogSection: 'animation ("stagger"), columns (3), 3 posts with imageUrl',
    FeatureShowcase: 'animation ("fade-up"), image (stock path), 2-3 features',
    ContactForm: 'animation ("fade-up"), showPhone (true), buttonText',
    NewsletterSignup: 'animation ("fade-up"), buttonText, placeholder',
    LogoGrid: 'animation ("fade-up"), 5-6 logos',
    Banner: 'animation ("fade-up"), variant ("gradient")',
    AnnouncementBar: 'variant ("gradient"), ctaText',
    HeaderNav: 'sticky (true), 4-5 links, ctaText',
    FooterSection: '3-4 linkGroups, copyright with current year, description',
  };

  const requiredPropsForType = REQUIRED_PROPS[sectionType] || '';

  const makeupRules = isMakeup ? `
## ★ VISUAL POLISH REQUIREMENTS (CRITICAL — READ FIRST)

You are POLISHING this section — make it visually stunning. These rules are MANDATORY:

1. **Animation**: You MUST set the "animation" prop. Use "fade-up" for hero/CTA/stats, "stagger" for grids/galleries/products, "stagger-fade" for testimonials/teams.
2. **Gradients**: You MUST use gradientFrom/gradientTo on HeroSection and CTASection with the exact color tokens from the palette below. NEVER use flat solid backgrounds for hero or CTA.
3. **Images**: Fill ALL image props using EXACT paths from the stock library below. Do NOT invent filenames.
4. **Text Polish**: Refine heading text to be compelling and specific to ${businessType}. Make descriptions vivid but concise (2-3 sentences max).
5. **Visual Variety**: You MUST use variant props — TestimonialSection: variant "carousel", CTASection: variant "gradient", FeaturesGrid: cardStyle "elevated".
6. **Hover Effects**: You MUST set hoverEffect "lift" on FeaturesGrid and ProductCards.
7. **Background Alternation**: This is section ${position.index + 1} of ${position.total}. ${position.index % 2 === 0 ? 'Use light or gradient background.' : 'Use muted or dark background for contrast.'}
` : '';

  const requiredPropsBlock = requiredPropsForType ? `
## REQUIRED PROPS for ${sectionType}
You MUST include these props in your output: ${requiredPropsForType}
` : '';

  const systemMessageRaw = `You are generating section ${position.index + 1} of ${position.total} for a ${businessType} landing page.
${makeupRules}${requiredPropsBlock}
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
4. For images, you MUST use EXACT paths from this stock library — do NOT invent filenames:
${stockImageHint}
   If a path is not listed above, do NOT use it.
5. Return ONLY valid JSON. No markdown, no explanation, no code fences.`;

  const systemMessage = systemMessageRaw.replace(/{/g, '{{').replace(/}/g, '}}');

  return ChatPromptTemplate.fromMessages([
    ['system', systemMessage],
    ['human', '{input}'],
  ]);
}
