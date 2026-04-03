/**
 * SEO Audit — full audit on Puck page data.
 *
 * Checks:
 * - Heading hierarchy (single h1, no skipped levels, no empties)
 * - Semantic HTML structure (header, footer, nav links, section headings)
 * - Meta title and description
 * - All images have alt text
 * - All links have href
 * - No empty page
 */

import type { Data, ComponentData } from '@puckeditor/core';
import type { SEOIssue, SEOAuditResult, SEOMeta } from '@/types/seo';
import { validateHeadingHierarchy } from './heading-validator';
import { generateMetaFromPage } from './meta-generator';
import { validateSemanticHTML } from './html-validator';

// ─── Helpers ─────────────────────────────────────────────────────────

function getProps(component: ComponentData): Record<string, unknown> {
  return (component.props ?? {}) as Record<string, unknown>;
}

function getId(component: ComponentData): string {
  return String(getProps(component).id ?? component.type);
}

// ─── Image alt-text checker ──────────────────────────────────────────

function checkImageAltText(data: Data): SEOIssue[] {
  const issues: SEOIssue[] = [];

  for (const component of data.content) {
    const props = getProps(component);
    const id = getId(component);

    // Direct image components
    if (component.type === 'ImageBlock') {
      const alt = (props.alt as string)?.trim();
      if (!alt) {
        issues.push({
          severity: 'error',
          category: 'accessibility',
          nodeId: id,
          message: 'ImageBlock is missing alt text.',
          suggestion: 'Add descriptive alt text for accessibility and SEO.',
        });
      }
    }

    // Background images (HeroSection, Banner, CTASection, etc.)
    if (typeof props.backgroundUrl === 'string' && props.backgroundUrl.trim()) {
      // Background images don't require alt text per se, but we note if they're decorative
      // Only flag if the component has no heading/subtext (the bg image IS the content)
      if (!props.heading && !props.subtext && !props.title) {
        issues.push({
          severity: 'info',
          category: 'accessibility',
          nodeId: id,
          message: `${component.type} has a background image but no text content. Screen readers won't perceive the image.`,
          suggestion: 'Add heading or subtext to provide context for the background image.',
        });
      }
    }

    // Gallery images
    if (Array.isArray(props.images)) {
      for (let i = 0; i < props.images.length; i++) {
        const img = props.images[i] as Record<string, unknown>;
        const alt = (img.alt as string)?.trim();
        if (!alt) {
          issues.push({
            severity: 'error',
            category: 'accessibility',
            nodeId: `${id}-img-${i}`,
            message: `Gallery image ${i + 1} is missing alt text.`,
            suggestion: 'Add alt text to all gallery images.',
          });
        }
      }
    }

    // Logo grid images — logos are decorative by nature, light check
    if (Array.isArray(props.logos)) {
      for (let i = 0; i < props.logos.length; i++) {
        const logo = props.logos[i] as Record<string, unknown>;
        const name = (logo.name as string)?.trim();
        if (!name) {
          issues.push({
            severity: 'warning',
            category: 'accessibility',
            nodeId: `${id}-logo-${i}`,
            message: `Logo ${i + 1} is missing a name (used as alt text).`,
            suggestion: 'Add a name for each logo to serve as accessible text.',
          });
        }
      }
    }

    // Product card images
    if (Array.isArray(props.products)) {
      for (let i = 0; i < props.products.length; i++) {
        const product = props.products[i] as Record<string, unknown>;
        // Products need a name at minimum
        if (!(product.name as string)?.trim()) {
          issues.push({
            severity: 'warning',
            category: 'accessibility',
            nodeId: `${id}-product-${i}`,
            message: `Product card ${i + 1} is missing a name.`,
            suggestion: 'Add a product name for accessibility.',
          });
        }
      }
    }
  }

  return issues;
}

// ─── Link href checker ───────────────────────────────────────────────

function checkLinksHref(data: Data): SEOIssue[] {
  const issues: SEOIssue[] = [];

  for (const component of data.content) {
    const props = getProps(component);
    const id = getId(component);

    // CTA links
    const ctaFields = [
      { hrefProp: 'ctaHref', textProp: 'ctaText' },
      { hrefProp: 'ctaSecondaryHref', textProp: 'ctaSecondaryText' },
    ];
    for (const { hrefProp, textProp } of ctaFields) {
      const text = (props[textProp] as string)?.trim();
      const href = (props[hrefProp] as string)?.trim();
      if (text && !href) {
        issues.push({
          severity: 'warning',
          category: 'accessibility',
          nodeId: id,
          message: `CTA "${textProp}" has text but no href.`,
          suggestion: 'Add a valid URL to the CTA button.',
        });
      }
    }

    // HeaderNav links
    if (Array.isArray(props.links)) {
      for (let i = 0; i < props.links.length; i++) {
        const link = props.links[i] as Record<string, unknown>;
        const label = (link.label as string)?.trim();
        const href = (link.href as string)?.trim();
        if (label && !href) {
          issues.push({
            severity: 'warning',
            category: 'accessibility',
            nodeId: `${id}-nav-${i}`,
            message: `Navigation link "${label}" has no href.`,
            suggestion: 'Add a valid URL to all navigation links.',
          });
        }
      }
    }

    // FooterSection link groups
    if (Array.isArray(props.linkGroups)) {
      for (const group of props.linkGroups as Record<string, unknown>[]) {
        if (!Array.isArray(group.links)) continue;
        for (let i = 0; i < group.links.length; i++) {
          const link = group.links[i] as Record<string, unknown>;
          const label = (link.label as string)?.trim();
          const href = (link.href as string)?.trim();
          if (label && !href) {
            issues.push({
              severity: 'warning',
              category: 'accessibility',
              nodeId: `${id}-footer-${i}`,
              message: `Footer link "${label}" has no href.`,
              suggestion: 'Add a valid URL to all footer links.',
            });
          }
        }
      }
    }

    // Pricing plan CTAs
    if (Array.isArray(props.plans)) {
      for (let i = 0; i < props.plans.length; i++) {
        const plan = props.plans[i] as Record<string, unknown>;
        const ctaText = (plan.ctaText as string)?.trim();
        const ctaHref = (plan.ctaHref as string)?.trim();
        if (ctaText && !ctaHref) {
          issues.push({
            severity: 'warning',
            category: 'accessibility',
            nodeId: `${id}-plan-${i}`,
            message: `Pricing plan "${plan.name}" has CTA text but no href.`,
            suggestion: 'Add a valid URL to the pricing plan CTA.',
          });
        }
      }
    }

    // Blog post links
    if (Array.isArray(props.posts)) {
      for (let i = 0; i < props.posts.length; i++) {
        const post = props.posts[i] as Record<string, unknown>;
        const title = (post.title as string)?.trim();
        const href = (post.href as string)?.trim();
        if (title && !href) {
          issues.push({
            severity: 'warning',
            category: 'accessibility',
            nodeId: `${id}-post-${i}`,
            message: `Blog post "${title}" has no link.`,
            suggestion: 'Add a URL to each blog post card.',
          });
        }
      }
    }
  }

  return issues;
}

// ─── Public API ─────────────────────────────────────────────────────

interface AuditPageMeta {
  title?: string;
  description?: string;
  keywords?: string[];
}

/**
 * Runs a full SEO audit on Puck page data.
 *
 * @param data - Puck Data object
 * @param pageMeta - Optional page metadata from DB (title, description, keywords)
 */
export function auditSEO(data: Data, pageMeta?: AuditPageMeta): SEOAuditResult {
  const issues: SEOIssue[] = [];
  let deduction = 0;

  // 1. Heading hierarchy
  const headingIssues = validateHeadingHierarchy(data);
  for (const hi of headingIssues) {
    const severity: SEOIssue['severity'] = hi.issue === 'empty_heading' ? 'warning' : 'error';
    issues.push({
      severity,
      category: 'heading',
      nodeId: hi.nodeId,
      message: hi.message,
      suggestion:
        hi.issue === 'multiple_h1'
          ? 'Keep only one hero/banner component per page.'
          : hi.issue === 'skipped_level'
            ? 'Use sequential heading levels to maintain a logical document outline.'
            : 'Add meaningful text to the component heading.',
    });
    deduction += severity === 'error' ? 10 : 5;
  }

  // 2. Semantic HTML structure
  const semanticIssues = validateSemanticHTML(data);
  for (const si of semanticIssues) {
    issues.push(si);
    deduction += si.severity === 'error' ? 10 : si.severity === 'warning' ? 5 : 2;
  }

  // 3. Meta title and description
  const meta: SEOMeta = generateMetaFromPage(data, undefined, pageMeta);

  if (pageMeta !== undefined && (!pageMeta.title || pageMeta.title.trim() === '')) {
    // pageMeta was explicitly provided but title is empty
    issues.push({
      severity: 'error',
      category: 'meta',
      message: 'Page is missing a title.',
      suggestion: 'Add a descriptive title to the page metadata or include a hero section with a heading.',
    });
    deduction += 10;
  } else if (pageMeta === undefined && meta.title === 'Untitled Page') {
    // No pageMeta provided and no heading found in content
    issues.push({
      severity: 'error',
      category: 'meta',
      message: 'Page is missing a title.',
      suggestion: 'Add a descriptive title to the page metadata or include a hero section with a heading.',
    });
    deduction += 10;
  } else if (pageMeta?.title && (pageMeta.title.length < 30 || pageMeta.title.length > 60)) {
    issues.push({
      severity: 'warning',
      category: 'meta',
      message: `Page title length (${pageMeta.title.length} chars) is outside the recommended 30-60 character range.`,
      suggestion: 'Aim for a title between 30 and 60 characters for optimal SERP display.',
    });
    deduction += 3;
  }

  if (!meta.description || meta.description.trim() === '') {
    issues.push({
      severity: 'error',
      category: 'meta',
      message: 'Page is missing a meta description.',
      suggestion: 'Add a concise description (120-160 characters) to the page metadata.',
    });
    deduction += 10;
  } else if (meta.description.length < 120) {
    issues.push({
      severity: 'info',
      category: 'meta',
      message: `Meta description is only ${meta.description.length} characters. Consider expanding to 120-160 characters.`,
      suggestion: 'Longer descriptions can improve click-through rates.',
    });
    deduction += 2;
  }

  // 4. Image alt text
  const imageIssues = checkImageAltText(data);
  for (const ii of imageIssues) {
    issues.push(ii);
    deduction += ii.severity === 'error' ? 5 : 2;
  }

  // 5. Links need href
  const linkIssues = checkLinksHref(data);
  for (const li of linkIssues) {
    issues.push(li);
    deduction += li.severity === 'error' ? 5 : 3;
  }

  // 6. Empty page
  if (data.content.length === 0) {
    issues.push({
      severity: 'warning',
      category: 'performance',
      message: 'Page has no content components.',
      suggestion: 'Add content sections to the page.',
    });
    deduction += 10;
  }

  // Compute score
  const score = Math.max(0, 100 - deduction);
  const passed = score >= 70;

  return { score, issues, passed };
}
