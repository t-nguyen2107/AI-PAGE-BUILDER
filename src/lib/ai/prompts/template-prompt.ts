/**
 * Template Selection Prompt — compact prompt for AI to output Puck ComponentData directly.
 *
 * AI returns { components: [{ type: "HeroSection", props: {...} }] } format.
 * No DOM node generation or adapter conversion needed.
 */

import { ChatPromptTemplate } from '@langchain/core/prompts';

export interface TemplatePromptContext {
  businessType?: string;
  businessStyle?: string;
  language?: string;
  stockImages?: Record<string, string[]>;
  styleguideData?: { colors?: string; typography?: string };
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

  // Build system message with regular braces — we escape them all at the end
  const systemMessageRaw = `You are a website page assembler. Given a user request, output an array of Puck UI components with their props filled in.

## Available Component Types and Their Props

### HeaderNav
Props: { "logo": string, "links": [{ "label": string, "href": string }], "ctaText"?: string, "ctaHref"?: string, "sticky": boolean }

### HeroSection
Props: { "heading": string, "subtext": string, "badge"?: string, "ctaText": string, "ctaHref": string, "ctaSecondaryText"?: string, "ctaSecondaryHref"?: string, "align": "left"|"center", "backgroundUrl"?: string, "backgroundOverlay": boolean, "padding": string }

### FeaturesGrid
Props: { "heading": string, "subtext"?: string, "columns": 2|3|4, "features": [{ "title": string, "description": string, "icon"?: string }] }

### StatsSection
Props: { "heading"?: string, "stats": [{ "value": string, "label": string }], "columns": 2|3|4 }

### LogoGrid
Props: { "heading"?: string, "logos": [{ "name": string, "imageUrl": string }] }

### TestimonialSection
Props: { "heading"?: string, "testimonials": [{ "quote": string, "author": string, "role": string, "avatarUrl"?: string }] }

### PricingTable
Props: { "heading": string, "subtext"?: string, "plans": [{ "name": string, "price": string, "period": string, "description": string, "features": [{ "value": string }], "ctaText": string, "ctaHref": string, "highlighted": boolean }] }

### FAQSection
Props: { "heading": string, "subtext"?: string, "items": [{ "question": string, "answer": string }] }

### BlogSection
Props: { "heading": string, "posts": [{ "title": string, "excerpt": string, "imageUrl"?: string, "date": string, "href": string }], "columns": 2|3 }

### CTASection
Props: { "heading": string, "subtext"?: string, "ctaText": string, "ctaHref": string, "backgroundUrl"?: string }

### TeamSection
Props: { "heading": string, "subtext"?: string, "members": [{ "name": string, "role": string, "avatarUrl"?: string }] }

### ContactForm
Props: { "heading": string, "subtext"?: string, "showPhone": boolean, "showCompany": boolean, "buttonText": string }

### NewsletterSignup
Props: { "heading": string, "subtext"?: string, "placeholder": string, "buttonText": string, "layout": "centered"|"split", "backgroundUrl"?: string }

### Gallery
Props: { "heading"?: string, "columns": 2|3|4, "images": [{ "src": string, "alt": string, "caption"?: string }] }

### SocialProof
Props: { "heading"?: string, "stats": [{ "value": string, "label": string }], "logos": [{ "name": string, "imageUrl": string }], "showAvatars": boolean, "avatarCount": number, "testimonialText"?: string }

### ComparisonTable
Props: { "heading"?: string, "plans": [{ "name": string, "highlighted": boolean }], "features": [{ "name": string, "values": string[] }] }

### ProductCards
Props: { "heading"?: string, "columns": 2|3|4, "products": [{ "name": string, "price": string, "originalPrice"?: string, "imageUrl"?: string, "description"?: string, "badge"?: string, "href": string }] }

### FeatureShowcase
Props: { "heading": string, "subtext"?: string, "imageUrl": string, "features": [{ "title": string, "description": string }], "imagePosition": "left"|"right", "ctaText"?: string, "ctaHref"?: string }

### CountdownTimer
Props: { "heading": string, "subtext"?: string, "endDate": string, "ctaText"?: string, "ctaHref"?: string, "showDays": boolean, "showHours": boolean }

### AnnouncementBar
Props: { "message": string, "ctaText"?: string, "ctaHref"?: string, "bgColor": "primary"|"dark"|"accent", "dismissible": boolean }

### Banner
Props: { "heading": string, "subtext"?: string, "ctaText": string, "ctaHref": string, "variant": "gradient"|"image"|"solid", "backgroundUrl"?: string, "align": "left"|"center" }

### FooterSection
Props: { "logo"?: string, "description"?: string, "linkGroups": [{ "title": string, "links": [{ "label": string, "href": string }] }], "copyright"?: string }

### TextBlock
Props: { "content": "<p>HTML content</p>", "align": "left"|"center"|"right", "maxWidth": "sm"|"md"|"lg"|"xl"|"full" }

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
