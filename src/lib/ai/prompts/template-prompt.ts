/**
 * Template Selection Prompt — compact prompt for AI template selection mode.
 *
 * Much smaller than the full system prompt (~80 lines vs ~300) because
 * templates handle layout/CSS/hierarchy — AI only picks templates + fills content.
 */

import { ChatPromptTemplate } from '@langchain/core/prompts';
import type { BaseMessage } from '@langchain/core/messages';
import { getTemplateCatalog } from '@/features/ai/template-registry';
import { initializeRegistry } from '@/features/ai/registry-setup';

export interface TemplatePromptContext {
  businessType?: string;
  businessStyle?: string;
  language?: string;
  stockImages?: Record<string, string[]>;
  styleguideData?: { colors?: string; typography?: string };
}

/**
 * Build the compact template selection prompt.
 */
export function buildTemplatePrompt(_ctx?: TemplatePromptContext): ChatPromptTemplate {
  // Ensure registry is populated
  initializeRegistry();

  const catalog = getTemplateCatalog();

  // Build template list for system prompt
  const templateLines: string[] = [];
  for (const [category, templates] of Object.entries(catalog)) {
    templateLines.push(`### ${category}`);
    for (const t of templates) {
      templateLines.push(`- **${t.id}**: ${t.description}`);
    }
    templateLines.push('');
  }

  const templateList = templateLines.join('\n');

  const stockImagesHint = _ctx?.stockImages
    ? JSON.stringify(_ctx.stockImages)
    : '/stock/hero/*.webp, /stock/food/*.webp, /stock/team/*.webp, etc.';

  const extraRules: string[] = [];
  if (_ctx?.businessType) extraRules.push(`7. Business type detected: ${_ctx.businessType}. Choose templates and content accordingly.`);
  if (_ctx?.businessStyle) extraRules.push(`8. Visual style: ${_ctx.businessStyle}`);
  if (_ctx?.styleguideData?.colors) extraRules.push(`9. Project colors: ${_ctx.styleguideData.colors}`);

  // Build system message with regular braces — we escape them all at the end
  const systemMessageRaw = `You are a website page assembler. Given a user request, select appropriate section templates and fill in content.

## Available Templates

${templateList}

## Response Format

Return JSON with this exact structure:
{ "sections": [ { "templateId": "header_glass_sticky", "content": { "siteName": "...", "links": ["..."] } }, { "templateId": "hero_gradient_centered", "content": { "heading": "...", "subtext": "...", "ctaText": "..." } }, { "templateId": "footer_multi_column", "content": { "siteName": "...", "copyright": "..." } } ] }

## Content Rules

1. Pick 5-8 sections per page. Typical order: header, hero, features/stats, testimonial/logo-grid, pricing, CTA, footer
2. Content must be professional — no emojis, no placeholder text (no "Lorem ipsum")
3. Use English for templateId and structural fields. Use the USER'S LANGUAGE for visible content (headings, descriptions, button labels, etc.)
4. For images, use paths from the stock library: ${stockImagesHint}
5. Tailor content to the user's business/industry. Be specific, not generic.
6. Provide realistic data: real-seeming names, believable prices, relevant feature descriptions
${extraRules.join('\n')}

## Stock Image Paths (use in content where applicable)
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
    // History placeholder (conversation context)
    ...(Array.isArray(_ctx) ? [] : []),
    ['human', '{input}'],
  ]);
}
