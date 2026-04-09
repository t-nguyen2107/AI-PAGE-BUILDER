import { ChatPromptTemplate } from '@langchain/core/prompts';
import { COMPONENT_CATALOG } from './component-catalog';
import { buildUnifiedDesignTokensBlock, type MinimalStyleguideTokens } from './prompt-utils';
import type { DesignGuidance } from '../knowledge/design-knowledge';

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
 * Build the compact Phase 1 (Planning) Puck component selection prompt.
 */
export function buildTemplatePrompt(_ctx?: TemplatePromptContext): ChatPromptTemplate {
  const extraRules: string[] = [];
  if (_ctx?.businessType) extraRules.push(`7. Business type: "${_ctx.businessType}". Tailor ALL content to this business.`);
  if (_ctx?.businessStyle) extraRules.push(`8. Visual style: ${_ctx.businessStyle}`);

  // Use the unified block builder
  const designTokensBlock = buildUnifiedDesignTokensBlock(_ctx?.designGuidance, _ctx?.styleguideData);

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
1. Pick 8-10 components per page. ALWAYS include HeaderNav and FooterSection. Typical order: AnnouncementBar (opt), HeaderNav, HeroSection, FeaturesGrid, StatsSection, TestimonialSection, PricingTable, CTASection, FooterSection.
2. Provide a "heading" or "purpose" in props so Phase 2 understands what this section is for.
3. Use the USER'S LANGUAGE for visible text.
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
