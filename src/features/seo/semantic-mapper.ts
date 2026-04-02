import { SemanticTag, ComponentCategory } from '@/types/enums';

/**
 * Maps ComponentCategory values to recommended SemanticTag arrays.
 * Used to suggest proper semantic HTML elements for each component type.
 */
export const CATEGORY_SEMANTIC_MAP: Record<string, SemanticTag[]> = {
  hero: [SemanticTag.SECTION],
  pricing: [SemanticTag.SECTION],
  features: [SemanticTag.SECTION],
  testimonial: [SemanticTag.SECTION],
  cta: [SemanticTag.SECTION],
  'header-nav': [SemanticTag.HEADER, SemanticTag.NAV],
  footer: [SemanticTag.FOOTER],
  contact: [SemanticTag.SECTION],
  faq: [SemanticTag.FIGURE],
  gallery: [SemanticTag.SECTION],
  stats: [SemanticTag.SECTION],
  team: [SemanticTag.SECTION],
  'logo-grid': [SemanticTag.SECTION],
  blog: [SemanticTag.ARTICLE, SemanticTag.SECTION],
};

/**
 * Returns the primary recommended semantic tag for a given component category.
 * Falls back to SemanticTag.SECTION if no mapping exists.
 */
export function getRecommendedTag(category: ComponentCategory): SemanticTag {
  const tags = CATEGORY_SEMANTIC_MAP[category];
  if (tags && tags.length > 0) {
    return tags[0];
  }
  return SemanticTag.SECTION;
}
