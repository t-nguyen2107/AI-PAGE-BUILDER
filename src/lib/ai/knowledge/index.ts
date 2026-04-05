/**
 * AI Design Knowledge — module re-exports.
 *
 * Provides static design constants and lookup helpers for prompt enrichment.
 */

export {
  PRODUCT_COLOR_PALETTES,
  DESIGN_STYLES,
  LANDING_PATTERNS,
  TYPOGRAPHY_PAIRINGS,
  PRODUCT_REASONING,
  resolveDesignGuidance,
  formatDesignGuidance,
  type ColorPalette,
  type DesignStyle,
  type LandingPattern,
  type FontPairing,
  type ProductReasoning,
  type DesignGuidance,
} from './design-knowledge';

export {
  seedDesignKnowledge,
  type SeedResult,
} from './seed-knowledge';

export {
  searchDesignKnowledge,
  isKnowledgeSeeded,
  type KnowledgeSearchOpts,
  type KnowledgeSearchResult,
} from './knowledge-search';

export {
  generateStyleguideFromBusinessType,
  isDefaultStyleguide,
  autoUpdateStyleguide,
  type AutoStyleguideResult,
} from './auto-styleguide';
