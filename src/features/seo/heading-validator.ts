/**
 * Heading Validator — validates heading hierarchy in Puck page data.
 *
 * In the Puck model, headings are implicit in component props rather than
 * explicit DOM elements. Each component type maps to a heading level:
 *   HeroSection / Banner  → h1
 *   Section components     → h2
 *   Items within sections  → h3
 */

import type { Data, ComponentData } from '@puckeditor/core';
import type { HeadingIssue } from '@/types/seo';

/** Component types that produce an h1-level heading. */
const H1_COMPONENTS = new Set(['HeroSection', 'Banner']);

/** Component types that produce an h2-level heading. */
const H2_COMPONENTS = new Set([
  'FeaturesGrid', 'PricingTable', 'TestimonialSection', 'CTASection',
  'FAQSection', 'StatsSection', 'TeamSection', 'BlogSection', 'LogoGrid',
  'ContactForm', 'NewsletterSignup', 'Gallery', 'SocialProof',
  'ComparisonTable', 'ProductCards', 'FeatureShowcase', 'CountdownTimer',
]);

/** Components that don't produce headings. */
const NO_HEADING_COMPONENTS = new Set([
  'HeaderNav', 'FooterSection', 'TextBlock', 'ImageBlock', 'Spacer',
  'ColumnsLayout', 'AnnouncementBar',
]);

// ─── Heading extraction ─────────────────────────────────────────────

interface HeadingEntry {
  componentId: string;
  level: number;
  text: string;
  componentType: string;
}

function getProps(component: ComponentData): Record<string, unknown> {
  return (component.props ?? {}) as Record<string, unknown>;
}

function getId(component: ComponentData): string {
  return String(getProps(component).id ?? component.type);
}

/** Extract the main heading text from a component's props. */
function extractHeadingText(component: ComponentData): string {
  const props = getProps(component);
  if (typeof props.heading === 'string') return props.heading.trim();
  if (typeof props.title === 'string') return props.title.trim();
  return '';
}

/** Get heading level for a component type (0 = no heading). */
function getHeadingLevel(type: string): number {
  if (H1_COMPONENTS.has(type)) return 1;
  if (H2_COMPONENTS.has(type)) return 2;
  return 0;
}

/** Extract sub-item headings (h3 level) from array props. */
function extractSubItemHeadings(component: ComponentData): string[] {
  const props = getProps(component);
  const headings: string[] = [];

  // Generic: look for common array prop names with title/question/name fields
  const arrayProps = ['items', 'features', 'plans', 'testimonials', 'posts', 'members', 'products', 'questions'];
  const textFieldPriority = ['title', 'question', 'name', 'headline', 'label'];

  for (const arrayKey of arrayProps) {
    const arr = props[arrayKey];
    if (!Array.isArray(arr)) continue;

    for (const item of arr as Record<string, unknown>[]) {
      if (typeof item !== 'object' || item === null) continue;
      for (const field of textFieldPriority) {
        if (typeof item[field] === 'string' && (item[field] as string).trim()) {
          headings.push((item[field] as string).trim());
          break;
        }
      }
    }
  }

  return headings;
}

// ─── Public API ─────────────────────────────────────────────────────

/**
 * Collect all headings from Puck data in document order.
 */
export function collectHeadings(data: Data): HeadingEntry[] {
  const headings: HeadingEntry[] = [];

  for (const component of data.content) {
    const level = getHeadingLevel(component.type);
    if (!level) continue;

    const text = extractHeadingText(component);
    const id = getId(component);

    // Main heading (h1 or h2)
    if (text) {
      headings.push({ componentId: id, level, text, componentType: component.type });
    }

    // Sub-item headings (h3)
    const subItems = extractSubItemHeadings(component);
    for (const subText of subItems) {
      headings.push({ componentId: id, level: 3, text: subText, componentType: component.type });
    }
  }

  return headings;
}

/**
 * Validates heading hierarchy across Puck page content.
 *
 * Rules enforced:
 * - Only one h1 per page
 * - No skipping levels (e.g., h1 -> h3 without h2)
 * - No empty headings
 */
export function validateHeadingHierarchy(data: Data): HeadingIssue[] {
  const issues: HeadingIssue[] = [];
  const headings = collectHeadings(data);

  let h1Count = 0;
  let lastLevel = 0;

  for (const heading of headings) {
    // Multiple h1 check
    if (heading.level === 1) {
      h1Count++;
      if (h1Count > 1) {
        issues.push({
          nodeId: heading.componentId,
          level: heading.level,
          issue: 'multiple_h1',
          message: `Multiple h1-level components found. Each page should have exactly one hero/banner. (Found ${h1Count})`,
        });
      }
    }

    // Empty heading check
    if (heading.text.length === 0) {
      issues.push({
        nodeId: heading.componentId,
        level: heading.level,
        issue: 'empty_heading',
        message: `h${heading.level} heading in ${heading.componentType} is empty.`,
      });
    }

    // Skipped level check
    if (lastLevel > 0 && heading.level > lastLevel + 1) {
      issues.push({
        nodeId: heading.componentId,
        level: heading.level,
        issue: 'skipped_level',
        message: `Heading level skipped: h${lastLevel} is followed by h${heading.level}. Expected h${lastLevel + 1}.`,
      });
    }

    lastLevel = heading.level;
  }

  return issues;
}
