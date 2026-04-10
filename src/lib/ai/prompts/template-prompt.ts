import { ChatPromptTemplate } from '@langchain/core/prompts';
import { COMPONENT_CATALOG } from './component-catalog';
import { buildUnifiedDesignTokensBlock, type MinimalStyleguideTokens } from './prompt-utils';
import type { DesignGuidance } from '../knowledge/design-knowledge';
import { LANDING_PATTERNS, PRODUCT_REASONING } from '../knowledge/design-knowledge';

export interface TemplatePromptContext {
  businessType?: string;
  businessStyle?: string;
  language?: string;
  stockImages?: Record<string, string[]>;
  styleguideData?: MinimalStyleguideTokens;
  /** Compact design guidance object from knowledge base */
  designGuidance?: DesignGuidance;
  /** RAG context string */
  designContext?: string;
}

// ---------------------------------------------------------------------------
// Variant tip extraction
// ---------------------------------------------------------------------------

/**
 * Resolve the recommended landing pattern sectionOrder for a business type.
 * Falls back to the default hero_features_cta pattern if no match found.
 */
function resolvePatternOrder(businessType?: string): { order: string[]; patternName: string } {
  if (businessType) {
    // Find matching PRODUCT_REASONING entry
    for (const [key, reasoning] of Object.entries(PRODUCT_REASONING)) {
      if (businessType.toLowerCase().includes(key.toLowerCase())) {
        const pattern = LANDING_PATTERNS[reasoning.recommendedPattern];
        if (pattern) return { order: pattern.sectionOrder, patternName: reasoning.recommendedPattern };
      }
    }
  }
  const defaultPattern = LANDING_PATTERNS['hero_features_cta'];
  return { order: defaultPattern.sectionOrder, patternName: 'hero_features_cta' };
}

/**
 * Build the compact Phase 1 (Planning) Puck component selection prompt.
 */
export function buildTemplatePrompt(_ctx?: TemplatePromptContext): ChatPromptTemplate {
  const extraRules: string[] = [];
  if (_ctx?.businessType) extraRules.push(`7. Business type: "${_ctx.businessType}". Tailor ALL content to this business.`);
  if (_ctx?.businessStyle) extraRules.push(`8. Visual style: ${_ctx.businessStyle}`);

  // Use the unified block builder
  const designTokensBlock = buildUnifiedDesignTokensBlock(_ctx?.designGuidance, _ctx?.styleguideData);

  // Resolve landing pattern for this business type
  const { order: patternOrder, patternName } = resolvePatternOrder(_ctx?.businessType);

  // Build skeleton component type reference (skipping heavy props)
  const componentRef = Object.entries(COMPONENT_CATALOG)
    .map(([name, info]) => {
      const entry = `- **${name}**: ${info.description}`;
      return entry;
    })
    .join('\n');

  const systemMessageRaw = `You are a Phase 1 structural page planner. Output an array of Puck UI components as a structural skeleton.
Do NOT output deep visual props like padding, animations, colors, or variants. Those will be handled by Phase 2.

## Available Components:
${componentRef}

## Response Format
Return JSON with this exact skeleton structure:
{ "components": [ { "type": "HeaderNav", "props": { "purpose": "Main navigation" } }, { "type": "HeroSection", "props": { "heading": "Main bold headline" } } ] }

## Content Rules
1. Pick 8-12 components per page. ALWAYS include HeaderNav and FooterSection.
2. Follow this recommended section order for "${patternName}" pattern: ${patternOrder.join(' → ')}
   - You MAY add or swap components to better fit the business (e.g., add Gallery for restaurants, ProductCards for e-commerce, CountdownTimer for events).
   - You MAY insert AnnouncementBar at the top if there is a promotion or urgency message.
   - Do NOT remove HeaderNav or FooterSection.
3. Provide a "heading" or "purpose" in props so Phase 2 understands what this section is for.
4. Use the USER'S LANGUAGE for visible text.
5. COMPOSITION: Vary section structures. Mix centered heroes with grid features, split showcases with full-width CTAs. Avoid 3+ consecutive sections with the same layout pattern (all centered, all split, or all grid).
6. TEXT BALANCE: Do not place more than 2 text-heavy sections (FAQ, TextBlock, BlogSection) next to each other. Insert a visual section (Gallery, StatsSection, LogoGrid) between them.
${extraRules.join('\n')}

${designTokensBlock}
${_ctx?.designContext ? `\n## Design Intelligence\n${_ctx.designContext}` : ''}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, no code fences.`;

  const systemMessage = systemMessageRaw.replace(/{/g, '{{').replace(/}/g, '}}');

  return ChatPromptTemplate.fromMessages([
    ['system', systemMessage],
    ['human', '{input}'],
  ]);
}
