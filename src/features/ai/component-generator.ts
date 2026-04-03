/**
 * Component Generator — generates Puck ComponentData from a category.
 *
 * Uses existing template generators to produce SectionNode trees,
 * then converts them to Puck ComponentData via the adapter.
 */

import { ComponentCategory } from '@/types/enums';
import type { ComponentData } from '@puckeditor/core';
import { sectionToPuckComponent } from '@/lib/ai/puck-adapter';
import type { SectionNode } from '@/types/dom-tree';
import { generateHeroSection } from './templates/hero-section';
import { generateHeroSplitImage } from './templates/hero-split-image';
import { generatePricingSection } from './templates/pricing-section';
import { generateFeaturesGrid } from './templates/features-grid';
import { generateTestimonialSection } from './templates/testimonial-section';
import { generateCtaSection } from './templates/cta-section';
import { generateHeaderNav } from './templates/header-nav';
import { generateFooter } from './templates/footer';
import { generateContactForm } from './templates/contact-form';
import { generateFaqSection } from './templates/faq-section';
import { generateGallerySection } from './templates/gallery-section';
import { generateStatsSection } from './templates/stats-section';
import { generateTeamSection } from './templates/team-section';
import { generateLogoGridSection } from './templates/logo-grid-section';
import { generateBlogSection } from './templates/blog-section';

/** Map of ComponentCategory to its template generator function. */
const SECTION_GENERATORS: Record<string, (props?: Record<string, unknown>) => SectionNode> = {
  [ComponentCategory.HERO]: generateHeroSection,
  [ComponentCategory.PRICING]: generatePricingSection,
  [ComponentCategory.FEATURES]: generateFeaturesGrid,
  [ComponentCategory.TESTIMONIAL]: generateTestimonialSection,
  [ComponentCategory.CTA]: generateCtaSection,
  [ComponentCategory.HEADER_NAV]: generateHeaderNav,
  [ComponentCategory.FOOTER]: generateFooter,
  [ComponentCategory.CONTACT]: generateContactForm,
  [ComponentCategory.FAQ]: generateFaqSection,
  [ComponentCategory.GALLERY]: generateGallerySection,
  [ComponentCategory.STATS]: generateStatsSection,
  [ComponentCategory.TEAM]: generateTeamSection,
  [ComponentCategory.LOGO_GRID]: generateLogoGridSection,
  [ComponentCategory.BLOG]: generateBlogSection,
};

/**
 * Generates a Puck ComponentData for a given component category.
 * Uses the template generator + adapter conversion.
 */
export function generatePuckComponent(
  category: ComponentCategory,
  props?: Record<string, unknown>,
): ComponentData {
  const generator = SECTION_GENERATORS[category];
  if (generator) {
    const section = generator(props);
    return sectionToPuckComponent(section);
  }

  // Fallback: generic hero
  const section = generateHeroSection({ heading: category, ...props });
  return sectionToPuckComponent(section);
}

/**
 * Generates a full SectionNode tree for a given component category.
 * @deprecated Use generatePuckComponent for Puck data.
 */
export function generateSection(
  category: ComponentCategory,
  props?: Record<string, unknown>,
): SectionNode {
  const generator = SECTION_GENERATORS[category];
  if (generator) {
    return generator(props);
  }

  // Fallback: generate a generic section using the hero template as base
  return generateHeroSection({ heading: category, ...props });
}

// Export individual template generators for direct use
export { generateHeroSplitImage as generateHeroSplitSection };
