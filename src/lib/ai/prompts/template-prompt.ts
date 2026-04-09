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

function extractBusinessVariantTip(businessType: string): string {
  const main = businessType.split('/')[0];
  return main.charAt(0).toUpperCase() + main.slice(1);
}

function extractVariantTipForBusiness(variantTips: string, businessLabel: string): string | null {
  const re = new RegExp(`${escapeRegExp(businessLabel)}\\s*:\\s*(.+?)(?=\\.\\s+[A-Z][a-z]+:|$)`, 'is');
  const match = variantTips.match(re);
  return match ? match[1].trim() : null;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

  const businessLabel = _ctx?.businessType ? extractBusinessVariantTip(_ctx?.businessType) : null;

  // Build skeleton component type reference (skipping heavy props)
  const componentRef = Object.entries(COMPONENT_CATALOG)
    .map(([name, info]) => {
      let entry = `- **${name}**: ${info.description}`;
      if (businessLabel && info.variantTips) {
        const tip = extractVariantTipForBusiness(info.variantTips, businessLabel);
        if (tip) entry += ` (Tip: ${tip})`;
      }
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
1. Pick 5-8 components per page. Typical order: AnnouncementBar (opt), HeaderNav, HeroSection, FeaturesGrid, TestimonialSection, CTASection, FooterSection.
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
