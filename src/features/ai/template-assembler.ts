/**
 * Template Assembler — builds a full page from AI's template selections.
 *
 * Flow:
 * 1. AI returns { sections: [{ templateId, content }] }
 * 2. Assembler looks up each template in the registry
 * 3. Merges AI content with template defaults
 * 4. Calls each template's generator
 * 5. Auto-orders sections (header → hero → features → ... → footer)
 * 6. Returns AIGenerationResponse (same format as current AI pipeline)
 */

import type { DOMNode } from '@/types/dom-tree';
import type { AIGenerationResponse } from '@/types/ai';
import { AIAction } from '@/types/enums';
import { getTemplate } from './template-registry';
import { initializeRegistry } from './registry-setup';

// ─── Section ordering priority ────────────────────────────────────────────

const SECTION_ORDER: Record<string, number> = {
  'header-nav': 0,
  'hero': 1,
  'features': 2,
  'stats': 3,
  'logo-grid': 4,
  'testimonial': 5,
  'pricing': 6,
  'faq': 7,
  'blog': 8,
  'gallery': 9,
  'cta': 10,
  'contact': 11,
  'footer': 12,
};

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
 *
 * @param plan - AI's selection of templates + content
 * @param businessType - Optional business type for stock image fallback
 * @returns AIGenerationResponse compatible with the existing pipeline
 */
export function assemblePage(
  plan: TemplatePagePlan,
  businessType?: string,
): AIGenerationResponse {
  // Ensure registry is populated
  initializeRegistry();

  const nodes: DOMNode[] = [];
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
      const section = template.generate(mergedContent);
      nodes.push(section);
    } catch (err) {
      const msg = `Template "${selection.templateId}" generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
      warnings.push(msg);
      console.error(`[assembler] ${msg}`);
    }
  }

  // Auto-order sections by category priority
  const ordered = [...nodes].sort((a, b) => {
    const catA = getCategoryFromNode(a);
    const catB = getCategoryFromNode(b);
    return (SECTION_ORDER[catA] ?? 99) - (SECTION_ORDER[catB] ?? 99);
  });

  return {
    action: AIAction.FULL_PAGE,
    nodes: ordered,
    targetNodeId: undefined,
    position: 0,
    message: `Generated page with ${ordered.length} sections${warnings.length > 0 ? `. Warnings: ${warnings.join('; ')}` : ''}`,
  };
}

/**
 * Parse a raw AI response into a TemplatePagePlan.
 * Handles both strict and loose formats.
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

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Extract category from a section node (via className or template registry) */
function getCategoryFromNode(node: DOMNode): string {
  if (node.type !== 'section') return 'unknown';

  // Try to find the template that generated this node
  const className = node.className ?? '';

  // Map common class names to categories
  const classMap: Record<string, string> = {
    'hero-section': 'hero',
    'features-section': 'features',
    'pricing-section': 'pricing',
    'testimonial-section': 'testimonial',
    'pb-section-gradient': 'cta',
    'faq-section': 'faq',
    'contact-section': 'contact',
    'gallery-section': 'gallery',
    'stats-section': 'stats',
    'team-section': 'team',
    'blog-section': 'blog',
  };

  for (const [cls, category] of Object.entries(classMap)) {
    if (className.includes(cls)) return category;
  }

  // Check tag for header/footer
  if (node.tag === 'header' || className.includes('nav')) return 'header-nav';
  if (node.tag === 'footer') return 'footer';

  return 'unknown';
}
