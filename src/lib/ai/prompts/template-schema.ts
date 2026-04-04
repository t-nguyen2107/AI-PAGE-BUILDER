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
const VALID_COMPONENT_TYPES = new Set([
  'HeaderNav',
  'HeroSection',
  'FeaturesGrid',
  'FeatureShowcase',
  'StatsSection',
  'LogoGrid',
  'TestimonialSection',
  'PricingTable',
  'ComparisonTable',
  'FAQSection',
  'BlogSection',
  'CTASection',
  'TeamSection',
  'ContactForm',
  'NewsletterSignup',
  'Gallery',
  'SocialProof',
  'ProductCards',
  'CountdownTimer',
  'AnnouncementBar',
  'Banner',
  'FooterSection',
  'TextBlock',
  'ImageBlock',
  'Spacer',
  'ColumnsLayout',
  'CustomSection',
]);

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

    if (!VALID_COMPONENT_TYPES.has(c.type)) {
      // Don't reject — just warn. AI might output slightly different names.
      console.warn(`[template-schema] Unknown component type "${c.type}" at index ${i}`);
    }

    // props is optional but must be an object if present
    const props = c.props !== undefined ? c.props : {};
    if (typeof props !== 'object' || props === null) {
      return { data: null, error: `components[${i}].props must be an object` };
    }

    components.push({
      type: c.type,
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

/** @deprecated Use PuckComponentPlanRaw instead */
export type TemplatePagePlanRaw = PuckComponentPlanRaw;
