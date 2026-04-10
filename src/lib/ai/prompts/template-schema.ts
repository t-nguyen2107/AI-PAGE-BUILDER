/**
 * Puck Component Schema — validates AI response for template selection mode.
 *
 * Expected AI response:
 * {
 *   "components": [
 *     { "type": "HeroSection", "props": { "heading": "...", ... } },
 *     { "type": "FeaturesGrid", "props": { ... } },
 *     ...
 *   ]
 * }
 */

/** Valid Puck component type names */
import { VALID_COMPONENT_TYPES, normalizeComponentType } from './component-catalog';

/** Validated component from AI response */
export interface PuckComponentRaw {
  type: string;
  props: Record<string, unknown>;
}

/** Validated AI response */
export interface PuckComponentPlanRaw {
  components: PuckComponentRaw[];
}

/** Validate a Puck component response from AI */
export function validateTemplateResponse(raw: unknown): { data: PuckComponentPlanRaw | null; error: string | null } {
  if (!raw || typeof raw !== 'object') {
    return { data: null, error: 'Response must be a JSON object' };
  }

  const obj = raw as Record<string, unknown>;

  // Must have components array
  if (!Array.isArray(obj.components)) {
    // Backward compat: also accept "sections" key
    if (Array.isArray(obj.sections)) {
      return convertLegacySections(obj.sections as Record<string, unknown>[]);
    }
    return { data: null, error: 'Response must have a "components" array' };
  }

  if (obj.components.length === 0) {
    return { data: null, error: 'components array cannot be empty' };
  }

  if (obj.components.length > 12) {
    return { data: null, error: 'Too many components (max 12)' };
  }

  // Validate each component
  const components: PuckComponentRaw[] = [];
  for (let i = 0; i < obj.components.length; i++) {
    const comp = obj.components[i];

    if (!comp || typeof comp !== 'object') {
      return { data: null, error: `components[${i}] must be an object` };
    }

    const c = comp as Record<string, unknown>;

    if (typeof c.type !== 'string' || c.type.length === 0) {
      return { data: null, error: `components[${i}].type is required` };
    }

    let componentType: string = normalizeComponentType(c.type);

    if (!VALID_COMPONENT_TYPES.has(componentType)) {
      return { data: null, error: `Unknown component type "${c.type}" at index ${i}. Valid types: ${[...VALID_COMPONENT_TYPES].join(', ')}` };
    }

    // props is optional but must be an object if present
    const props = c.props !== undefined ? c.props : {};
    if (typeof props !== 'object' || props === null) {
      return { data: null, error: `components[${i}].props must be an object` };
    }

    components.push({
      type: componentType,
      props: props as Record<string, unknown>,
    });
  }

  return { data: { components }, error: null };
}

/**
 * Convert legacy { sections: [{ templateId, content }] } to { components: [{ type, props }] }.
 * Uses template ID → Puck component type mapping from puck-adapter.
 */
function convertLegacySections(sections: Record<string, unknown>[]): { data: PuckComponentPlanRaw | null; error: string | null } {
  const CATEGORY_MAP: Record<string, string> = {
    hero: 'HeroSection',
    features: 'FeaturesGrid',
    pricing: 'PricingTable',
    testimonial: 'TestimonialSection',
    cta: 'CTASection',
    faq: 'FAQSection',
    stats: 'StatsSection',
    team: 'TeamSection',
    blog: 'BlogSection',
    'logo-grid': 'LogoGrid',
    contact: 'ContactForm',
    'header-nav': 'HeaderNav',
    footer: 'FooterSection',
    gallery: 'TextBlock',
    custom: 'TextBlock',
  };

  // Map template IDs to component types
  const TEMPLATE_ID_MAP: Record<string, string> = {
    hero_gradient_centered: 'HeroSection',
    hero_split_image: 'HeroSection',
    hero_background_image: 'HeroSection',
    hero_minimal_dark: 'HeroSection',
    hero_tw_dark_bg: 'HeroSection',
    hero_tw_light_centered: 'HeroSection',
    hero_tw_split: 'HeroSection',
    features_card_grid_3col: 'FeaturesGrid',
    features_zigzag: 'FeaturesGrid',
    features_simple_2col: 'FeaturesGrid',
    features_tw_cards: 'FeaturesGrid',
    pricing_cards_3col: 'PricingTable',
    pricing_minimal: 'PricingTable',
    pricing_tw_2tier: 'PricingTable',
    testimonial_cards_3col: 'TestimonialSection',
    testimonial_single: 'TestimonialSection',
    testimonial_tw_stars: 'TestimonialSection',
    cta_gradient_bar: 'CTASection',
    cta_centered_simple: 'CTASection',
    cta_tw_split: 'CTASection',
    faq_accordion: 'FAQSection',
    faq_two_column: 'FAQSection',
    stats_bar: 'StatsSection',
    stats_grid_2x2: 'StatsSection',
    team_cards_4col: 'TeamSection',
    blog_cards_3col: 'BlogSection',
    logo_grid_gray: 'LogoGrid',
    contact_card_form: 'ContactForm',
    contact_minimal: 'ContactForm',
    header_glass_sticky: 'HeaderNav',
    header_dark: 'HeaderNav',
    footer_multi_column: 'FooterSection',
    footer_minimal: 'FooterSection',
    gallery_grid: 'TextBlock',
  };

  const components: PuckComponentRaw[] = [];

  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    const templateId = String(s.templateId ?? '');
    const content = (s.content ?? {}) as Record<string, unknown>;

    // Look up component type from template ID
    const type = TEMPLATE_ID_MAP[templateId] ?? 'TextBlock';

    // Try to map from category if template ID not found
    if (!TEMPLATE_ID_MAP[templateId]) {
      for (const [key, compType] of Object.entries(CATEGORY_MAP)) {
        if (templateId.includes(key)) {
          components.push({ type: compType, props: content });
          break;
        }
      }
      // If no category match, use TextBlock
      if (components.length <= i) {
        components.push({ type: 'TextBlock', props: { content: JSON.stringify(content), align: 'left', maxWidth: 'lg' } });
      }
    } else {
      components.push({ type, props: content });
    }
  }

  if (components.length === 0) {
    return { data: null, error: 'No valid components found in legacy format' };
  }

  return { data: { components }, error: null };
}

/**
 * Validate a single component from AI response.
 * Used by the two-pass streaming pipeline for per-section validation.
 */
export function validateSingleComponent(raw: unknown): { data: PuckComponentRaw | null; error: string | null } {
  if (!raw || typeof raw !== 'object') {
    return { data: null, error: 'Component must be a JSON object' };
  }

  const obj = raw as Record<string, unknown>;

  // If the AI wrapped it in { props: {...} }, unwrap it
  if (obj.props && typeof obj.props === 'object' && !obj.type) {
    // Per-section response format: { props: { heading: "...", ... } }
    // Reconstruct as { type: "unknown", props: {...} } — caller sets type
    return {
      data: {
        type: '',
        props: obj.props as Record<string, unknown>,
      },
      error: null,
    };
  }

  // Standard format: { type: "HeroSection", props: {...} }
  if (typeof obj.type !== 'string' || obj.type.length === 0) {
    return { data: null, error: 'Component must have a non-empty "type" field' };
  }

  const normalizedType = normalizeComponentType(obj.type as string);
  if (!VALID_COMPONENT_TYPES.has(normalizedType)) {
    console.warn(`[template-schema] Unknown component type "${obj.type}" in single validation`);
  }

  // Use normalized type if valid, otherwise keep original
  const finalType: string = VALID_COMPONENT_TYPES.has(normalizedType) ? normalizedType : (obj.type as string);

  const props = obj.props !== undefined ? obj.props : {};
  if (typeof props !== 'object' || props === null) {
    return { data: null, error: 'Component "props" must be an object' };
  }

  return {
    data: {
      type: finalType,
      props: props as Record<string, unknown>,
    },
    error: null,
  };
}

