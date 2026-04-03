/**
 * Semantic Mapper — maps Puck component types to semantic HTML tags.
 *
 * Used for SEO recommendations and structured data hints.
 */

/** Maps Puck component types to recommended semantic HTML tags. */
export const COMPONENT_SEMANTIC_MAP: Record<string, string[]> = {
  HeroSection: ['section'],
  Banner: ['section'],
  FeaturesGrid: ['section'],
  PricingTable: ['section'],
  TestimonialSection: ['section'],
  CTASection: ['section'],
  FAQSection: ['section'],
  StatsSection: ['section'],
  TeamSection: ['section'],
  BlogSection: ['article', 'section'],
  LogoGrid: ['section'],
  ContactForm: ['section'],
  HeaderNav: ['header', 'nav'],
  FooterSection: ['footer'],
  TextBlock: ['article'],
  ImageBlock: ['figure'],
  Spacer: [],
  ColumnsLayout: ['section'],
  NewsletterSignup: ['section'],
  Gallery: ['section'],
  SocialProof: ['section'],
  ComparisonTable: ['section'],
  ProductCards: ['section'],
  FeatureShowcase: ['section'],
  CountdownTimer: ['section'],
  AnnouncementBar: ['aside'],
};

/**
 * Returns the primary recommended semantic tag for a Puck component type.
 * Falls back to 'section' if no mapping exists.
 */
export function getRecommendedTag(componentType: string): string {
  const tags = COMPONENT_SEMANTIC_MAP[componentType];
  if (tags && tags.length > 0) return tags[0];
  return 'section';
}

/**
 * Get all semantic tags applicable to a component type.
 */
export function getSemanticTags(componentType: string): string[] {
  return COMPONENT_SEMANTIC_MAP[componentType] ?? ['section'];
}
