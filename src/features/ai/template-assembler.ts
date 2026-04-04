/**
 * Template Assembler — builds a full page from AI's template selections.
 *
 * @deprecated This module is no longer used by the main pipeline.
 * AI now outputs Puck ComponentData directly (see template-prompt.ts).
 * Kept for potential future use or manual page assembly.
 *
 * Old flow (now bypassed):
 * 1. AI returns { sections: [{ templateId, content }] }
 * 2. Assembler looks up each template in the registry
 * 3. Merges AI content with template defaults
 * 4. Calls each template's generator (produces old SectionNode)
 * 5. Converts SectionNode → Puck ComponentData via adapter
 * 6. Auto-orders by section priority
 * 7. Returns AIGenerationResponse with Puck ComponentData[]
 */

import type { AIGenerationResponse } from '@/types/ai';
import { AIAction } from '@/types/enums';
import { getTemplate } from './template-registry';
import { initializeRegistry } from './registry-setup';
import { sectionToPuckComponent, orderPuckComponents } from '@/lib/ai/puck-adapter';
import type { ComponentData } from '@puckeditor/core';

// ─── Types ────────────────────────────────────────────────────────────────

export interface TemplateSelection {
  templateId: string;
  content: Record<string, unknown>;
}

export interface TemplatePagePlan {
  sections: TemplateSelection[];
}

// ─── Assembler ────────────────────────────────────────────────────────────

/**
 * Assemble a full page from a template selection plan.
 * Returns Puck ComponentData via the adapter.
 *
 * @param plan - AI's selection of templates + content
 * @param businessType - Optional business type for stock image fallback
 * @returns AIGenerationResponse with Puck ComponentData
 */
export function assemblePuckPage(
  plan: TemplatePagePlan,
  businessType?: string,
): AIGenerationResponse {
  // Ensure registry is populated
  initializeRegistry();

  const components: ComponentData[] = [];
  const warnings: string[] = [];

  for (const selection of plan.sections) {
    const template = getTemplate(selection.templateId);

    if (!template) {
      const msg = `Template not found: "${selection.templateId}"`;
      warnings.push(msg);
      console.warn(`[assembler] ${msg}`);
      continue;
    }

    // Merge: default content ← AI content (AI overrides defaults)
    const mergedContent = { ...template.defaultContent, ...selection.content };

    try {
      // Generate old SectionNode, then convert to Puck ComponentData
      const section = template.generate(mergedContent);
      const puckComponent = sectionToPuckComponent(section);
      components.push(puckComponent);
    } catch (err) {
      const msg = `Template "${selection.templateId}" generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
      warnings.push(msg);
      console.error(`[assembler] ${msg}`);
    }
  }

  // Auto-order by section priority
  const ordered = orderPuckComponents(components);

  return {
    action: AIAction.FULL_PAGE,
    components: ordered,
    message: `Generated page with ${ordered.length} sections${warnings.length > 0 ? `. Warnings: ${warnings.join('; ')}` : ''}`,
  };
}

/**
 * @deprecated Use assemblePuckPage instead. Kept for backward compat.
 */
export function assemblePage(
  plan: TemplatePagePlan,
  businessType?: string,
): AIGenerationResponse {
  return assemblePuckPage(plan, businessType);
}

/**
 * Parse a raw AI response into a TemplatePagePlan.
 */
export function parseTemplateResponse(raw: Record<string, unknown>): TemplatePagePlan | null {
  // Try strict format: { sections: [...] }
  if (Array.isArray(raw.sections)) {
    const sections: TemplateSelection[] = (raw.sections as unknown[])
      .filter((s): s is Record<string, unknown> => s !== null && typeof s === 'object')
      .map((s) => ({
        templateId: String(s.templateId ?? ''),
        content: (s.content ?? {}) as Record<string, unknown>,
      }))
      .filter((s) => s.templateId.length > 0);

    if (sections.length > 0) return { sections };
  }

  // Try loose format: { templateId, content } (single section)
  if (typeof raw.templateId === 'string' && raw.templateId.length > 0) {
    return {
      sections: [{
        templateId: raw.templateId,
        content: (raw.content ?? {}) as Record<string, unknown>,
      }],
    };
  }

  return null;
}
