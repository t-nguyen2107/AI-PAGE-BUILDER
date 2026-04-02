import { ComponentCategory, NodeType, SemanticTag, DisplayType, FlexDirection } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ComponentNode } from '@/types/dom-tree';
import { generateHeroSection } from './templates/hero-section';
import { generateHeroSplitSection } from './templates/hero-split';
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
 * Generates a full SectionNode tree for a given component category.
 * Delegates to the appropriate template generator function.
 *
 * @param category - The component category to generate
 * @param props - Optional properties to customize the generated section
 * @returns A fully structured SectionNode
 */
export function generateSection(
  category: ComponentCategory,
  props?: Record<string, unknown>
): SectionNode {
  const generator = SECTION_GENERATORS[category];
  if (generator) {
    return generator(props);
  }

  // Fallback: generate a generic section using the hero template as base
  return generateHeroSection({ heading: category, ...props });
}

/**
 * Generates a ComponentNode for a given category.
 * Extracts the first component node from the generated section.
 *
 * @param category - The component category to generate
 * @param props - Optional properties to customize the generated component
 * @returns A ComponentNode with proper structure
 */
export function generateComponent(
  category: ComponentCategory,
  props?: Record<string, unknown>
): ComponentNode {
  const section = generateSection(category, props);

  // Find the first ComponentNode in the generated section
  for (const container of section.children) {
    for (const child of container.children) {
      if (child.type === NodeType.COMPONENT) {
        return child as ComponentNode;
      }
    }
  }

  // Fallback: return a basic component
  const now = new Date().toISOString();
  return {
    id: generateId(),
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: `component-${category}`,
    category,
    meta: { createdAt: now, updatedAt: now, aiGenerated: true },
    children: [],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      gap: '1rem',
      padding: '1.5rem',
    },
  };
}

// Export individual template generators for direct use
export { generateHeroSplitSection };
