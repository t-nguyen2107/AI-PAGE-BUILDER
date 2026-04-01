import { NodeType, SemanticTag } from '@/types/enums';
import type { PageNode, DOMNode, ElementNode, SectionNode, ContainerNode, ComponentNode } from '@/types/dom-tree';
import type { HeadingIssue, SEOIssue, SEOAuditResult, SEOMeta } from '@/types/seo';
import { validateHeadingHierarchy } from './heading-validator';
import { generateMetaFromPage } from './meta-generator';

/** Semantic sectioning tags that are meaningful for SEO. */
const SEMANTIC_SECTION_TAGS = new Set<string>([
  SemanticTag.HEADER,
  SemanticTag.NAV,
  SemanticTag.MAIN,
  SemanticTag.SECTION,
  SemanticTag.ARTICLE,
  SemanticTag.ASIDE,
  SemanticTag.FOOTER,
]);

/** All heading tags. */
const HEADING_TAGS = new Set<string>([
  SemanticTag.H1, SemanticTag.H2, SemanticTag.H3,
  SemanticTag.H4, SemanticTag.H5, SemanticTag.H6,
]);

// ---- Recursive tree walkers ----

function walkTree(node: DOMNode, visitor: (n: DOMNode) => void): void {
  visitor(node);
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children as DOMNode[]) {
      walkTree(child, visitor);
    }
  }
}

interface ImageCheck {
  nodeId: string;
  hasAlt: boolean;
}

interface LinkCheck {
  nodeId: string;
  hasHref: boolean;
}

/**
 * Runs a full SEO audit on a page tree.
 *
 * Checks:
 * - Heading hierarchy (single h1, no skipped levels, no empties)
 * - Semantic HTML tags used properly
 * - All images have alt text
 * - All links have href
 * - Page has title and description
 * - No empty sections
 */
export function auditSEO(tree: PageNode): SEOAuditResult {
  const issues: SEOIssue[] = [];
  let deduction = 0;

  // ==============================
  // 1. Heading hierarchy
  // ==============================
  const headingIssues: HeadingIssue[] = validateHeadingHierarchy(tree);
  for (const hi of headingIssues) {
    const severity = hi.issue === 'empty_heading' ? 'warning' : 'error';
    issues.push({
      severity,
      category: 'heading',
      nodeId: hi.nodeId,
      message: hi.message,
      suggestion:
        hi.issue === 'multiple_h1'
          ? 'Keep only one h1 per page; convert extras to h2.'
          : hi.issue === 'skipped_level'
            ? 'Use sequential heading levels to maintain a logical document outline.'
            : 'Add meaningful text content to the heading element.',
    });
    deduction += severity === 'error' ? 10 : 5;
  }

  // ==============================
  // 2. Meta: title and description
  // ==============================
  const meta: SEOMeta = generateMetaFromPage(tree);
  if (!tree.meta.title || tree.meta.title.trim() === '') {
    issues.push({
      severity: 'error',
      category: 'meta',
      message: 'Page is missing a title.',
      suggestion: 'Add a descriptive title to the page metadata.',
    });
    deduction += 10;
  } else if (tree.meta.title.length < 30 || tree.meta.title.length > 60) {
    issues.push({
      severity: 'warning',
      category: 'meta',
      message: `Page title length (${tree.meta.title.length} chars) is outside the recommended 30-60 character range.`,
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

  // ==============================
  // 3. Semantic HTML tags
  // ==============================
  let sectionsChecked = 0;
  let sectionsWithSemanticTag = 0;

  walkTree(tree, (node) => {
    if (node.type === NodeType.SECTION) {
      sectionsChecked++;
      if (SEMANTIC_SECTION_TAGS.has(node.tag)) {
        sectionsWithSemanticTag++;
      }
    }
  });

  if (sectionsChecked > 0 && sectionsWithSemanticTag === 0) {
    issues.push({
      severity: 'warning',
      category: 'semantic',
      message: 'No semantic HTML5 sectioning elements found (header, nav, section, article, aside, footer).',
      suggestion: 'Use semantic tags instead of plain divs to improve accessibility and SEO.',
    });
    deduction += 8;
  } else if (sectionsChecked > 0) {
    const ratio = sectionsWithSemanticTag / sectionsChecked;
    if (ratio < 0.5) {
      issues.push({
        severity: 'info',
        category: 'semantic',
        message: `Only ${Math.round(ratio * 100)}% of sections use semantic HTML tags.`,
        suggestion: 'Consider using semantic sectioning elements for more of your sections.',
      });
      deduction += 3;
    }
  }

  // ==============================
  // 4. Images need alt text
  // ==============================
  const imageChecks: ImageCheck[] = [];
  walkTree(tree, (node) => {
    if (node.type === NodeType.ELEMENT && node.tag === SemanticTag.IMG) {
      const elem = node as ElementNode;
      const alt = elem.attributes?.alt ?? '';
      imageChecks.push({ nodeId: node.id, hasAlt: alt.trim().length > 0 });
    }
  });

  const imagesWithoutAlt = imageChecks.filter((ic) => !ic.hasAlt);
  for (const ic of imagesWithoutAlt) {
    issues.push({
      severity: 'error',
      category: 'accessibility',
      nodeId: ic.nodeId,
      message: 'Image is missing alt text.',
      suggestion: 'Add descriptive alt text to all images for accessibility and SEO.',
    });
    deduction += 5;
  }

  // ==============================
  // 5. Links need href
  // ==============================
  const linkChecks: LinkCheck[] = [];
  walkTree(tree, (node) => {
    if (node.type === NodeType.ELEMENT && node.tag === SemanticTag.A) {
      const elem = node as ElementNode;
      const href = elem.href ?? '';
      linkChecks.push({ nodeId: node.id, hasHref: href.trim().length > 0 });
    }
  });

  const linksWithoutHref = linkChecks.filter((lc) => !lc.hasHref);
  for (const lc of linksWithoutHref) {
    issues.push({
      severity: 'warning',
      category: 'accessibility',
      nodeId: lc.nodeId,
      message: 'Link is missing an href attribute.',
      suggestion: 'All anchor tags should have a valid href.',
    });
    deduction += 5;
  }

  // ==============================
  // 6. No empty sections
  // ==============================
  walkTree(tree, (node) => {
    if (node.type === NodeType.SECTION) {
      const section = node as SectionNode;
      if (!section.children || section.children.length === 0) {
        issues.push({
          severity: 'warning',
          category: 'performance',
          nodeId: section.id,
          message: 'Empty section detected with no children.',
          suggestion: 'Remove empty sections or add content to them.',
        });
        deduction += 3;
      }
    }
  });

  // ==============================
  // Compute score
  // ==============================
  const score = Math.max(0, 100 - deduction);
  const passed = score >= 70;

  return { score, issues, passed };
}
