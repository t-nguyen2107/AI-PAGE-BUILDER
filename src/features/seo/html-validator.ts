/**
 * HTML Validator — validates page structure for Puck-based pages.
 *
 * Since Puck uses a flat component array instead of a deep DOMNode tree,
 * structural checks focus on component presence, ordering, and content.
 */

import type { Data, ComponentData } from '@puckeditor/core';
import type { SEOIssue } from '@/types/seo';

// ─── Helpers ─────────────────────────────────────────────────────────

function getProps(component: ComponentData): Record<string, unknown> {
  return (component.props ?? {}) as Record<string, unknown>;
}

function getId(component: ComponentData): string {
  return String(getProps(component).id ?? component.type);
}

// ─── Individual checks ───────────────────────────────────────────────

/** Check that HeaderNav has navigation links. */
function checkNavHasLinks(component: ComponentData, issues: SEOIssue[]): void {
  if (component.type !== 'HeaderNav') return;
  const props = getProps(component);
  const links = props.links as Record<string, unknown>[] | undefined;
  if (!links || links.length === 0) {
    issues.push({
      severity: 'warning',
      category: 'semantic-html',
      nodeId: getId(component),
      message: 'Navigation (HeaderNav) has no links.',
      suggestion: 'Add navigation links to the header for accessibility and SEO.',
    });
  }
}

/** Check that FooterSection has content. */
function checkFooterHasContent(component: ComponentData, issues: SEOIssue[]): void {
  if (component.type !== 'FooterSection') return;
  const props = getProps(component);
  const hasLinkGroups = Array.isArray(props.linkGroups) && props.linkGroups.length > 0;
  const hasCopyright = typeof props.copyright === 'string' && props.copyright.trim().length > 0;
  const hasDescription = typeof props.description === 'string' && props.description.trim().length > 0;

  if (!hasLinkGroups && !hasCopyright && !hasDescription) {
    issues.push({
      severity: 'warning',
      category: 'semantic-html',
      nodeId: getId(component),
      message: 'Footer section has no content (no links, copyright, or description).',
      suggestion: 'Add link groups, copyright text, or a description to the footer.',
    });
  }
}

/** Check that sections have a heading. */
function checkSectionHasHeading(component: ComponentData, issues: SEOIssue[]): void {
  const sectionTypes = new Set([
    'FeaturesGrid', 'PricingTable', 'TestimonialSection', 'CTASection',
    'FAQSection', 'StatsSection', 'TeamSection', 'BlogSection', 'LogoGrid',
    'ContactForm', 'Gallery', 'SocialProof', 'ComparisonTable',
    'ProductCards', 'FeatureShowcase', 'NewsletterSignup', 'CountdownTimer',
  ]);
  if (!sectionTypes.has(component.type)) return;

  const props = getProps(component);
  const heading = props.heading as string | undefined;
  if (!heading || heading.trim().length === 0) {
    issues.push({
      severity: 'info',
      category: 'semantic-html',
      nodeId: getId(component),
      message: `${component.type} section does not have a heading.`,
      suggestion: 'Adding a heading to sections improves accessibility and SEO.',
    });
  }
}

// ─── Public API ─────────────────────────────────────────────────────

/**
 * Validates page structure and semantic HTML usage for Puck page data.
 *
 * Checks performed:
 * 1. Navigation has links
 * 2. Footer has content
 * 3. Content sections have headings
 * 4. Page has a header (HeaderNav)
 * 5. Page has a footer (FooterSection)
 * 6. Only one hero/banner component
 */
export function validateSemanticHTML(data: Data): SEOIssue[] {
  const issues: SEOIssue[] = [];

  let headerCount = 0;
  let footerCount = 0;
  let heroCount = 0;

  for (const component of data.content) {
    checkNavHasLinks(component, issues);
    checkFooterHasContent(component, issues);
    checkSectionHasHeading(component, issues);

    if (component.type === 'HeaderNav') headerCount++;
    if (component.type === 'FooterSection') footerCount++;
    if (component.type === 'HeroSection' || component.type === 'Banner') heroCount++;
  }

  // Missing header
  if (headerCount === 0) {
    issues.push({
      severity: 'warning',
      category: 'semantic-html',
      message: 'Page does not have a header/navigation component.',
      suggestion: 'Add a HeaderNav component for proper page structure.',
    });
  }

  // Missing footer
  if (footerCount === 0) {
    issues.push({
      severity: 'info',
      category: 'semantic-html',
      message: 'Page does not have a footer component.',
      suggestion: 'Add a FooterSection for proper page structure.',
    });
  }

  // Multiple heroes
  if (heroCount > 1) {
    issues.push({
      severity: 'error',
      category: 'semantic-html',
      message: `Multiple hero/banner components found (${heroCount}). Use only one primary hero per page.`,
      suggestion: 'Keep only one HeroSection or Banner component.',
    });
  }

  return issues;
}
