/**
 * Template Selection Schema — validates AI response for template selection mode.
 *
 * Expected AI response:
 * {
 *   "sections": [
 *     { "templateId": "hero_gradient_centered", "content": { "heading": "...", ... } },
 *     { "templateId": "features_card_grid_3col", "content": { ... } },
 *     ...
 *   ]
 * }
 */

/** Validate a template selection response from AI */
export function validateTemplateResponse(raw: unknown): { data: TemplatePagePlanRaw | null; error: string | null } {
  if (!raw || typeof raw !== 'object') {
    return { data: null, error: 'Response must be a JSON object' };
  }

  const obj = raw as Record<string, unknown>;

  // Must have sections array
  if (!Array.isArray(obj.sections)) {
    return { data: null, error: 'Response must have a "sections" array' };
  }

  if (obj.sections.length === 0) {
    return { data: null, error: 'sections array cannot be empty' };
  }

  if (obj.sections.length > 10) {
    return { data: null, error: 'Too many sections (max 10)' };
  }

  // Validate each section
  for (let i = 0; i < obj.sections.length; i++) {
    const section = obj.sections[i];

    if (!section || typeof section !== 'object') {
      return { data: null, error: `sections[${i}] must be an object` };
    }

    const s = section as Record<string, unknown>;

    if (typeof s.templateId !== 'string' || s.templateId.length === 0) {
      return { data: null, error: `sections[${i}].templateId is required` };
    }

    // content is optional but must be an object if present
    if (s.content !== undefined && (typeof s.content !== 'object' || s.content === null)) {
      return { data: null, error: `sections[${i}].content must be an object` };
    }
  }

  return {
    data: {
      sections: (obj.sections as Record<string, unknown>[]).map((s) => ({
        templateId: String(s.templateId),
        content: (s.content ?? {}) as Record<string, unknown>,
      })),
    },
    error: null,
  };
}

export interface TemplatePagePlanRaw {
  sections: Array<{
    templateId: string;
    content: Record<string, unknown>;
  }>;
}
