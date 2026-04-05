/**
 * Template Selection Prompt — compact prompt for AI to output Puck ComponentData directly.
 *
 * AI returns { components: [{ type: "HeroSection", props: {...} }] } format.
 * No DOM node generation or adapter conversion needed.
 */

import { ChatPromptTemplate } from '@langchain/core/prompts';
import { COMPONENT_CATALOG } from './component-catalog';

export interface TemplatePromptContext {
  businessType?: string;
  businessStyle?: string;
  language?: string;
  stockImages?: Record<string, string[]>;
  styleguideData?: { colors?: string; typography?: string };
  /** Compact design guidance text from knowledge base */
  designContext?: string;
}

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
  if (_ctx?.styleguideData?.colors) extraRules.push(`9. Project colors: ${_ctx.styleguideData.colors}`);

  // Design guidance block — injected when knowledge base resolves a business type
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
