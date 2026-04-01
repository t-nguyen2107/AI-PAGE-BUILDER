import { NodeType, SemanticTag } from '@/types/enums';
import type { DOMNode, SectionNode, ComponentNode } from '@/types/dom-tree';
import type { SEOIssue } from '@/types/seo';

/** Heading tags mapped to their numeric level. */
const HEADING_LEVELS: Record<string, number> = {
  [SemanticTag.H1]: 1,
  [SemanticTag.H2]: 2,
  [SemanticTag.H3]: 3,
  [SemanticTag.H4]: 4,
  [SemanticTag.H5]: 5,
  [SemanticTag.H6]: 6,
};

/** Set of all heading tag values for fast lookup. */
const HEADING_TAGS = new Set(Object.keys(HEADING_LEVELS));

// ---- Tree helpers ----

/** Collect all semantic tags present in a subtree. */
function collectTagsInSubtree(node: DOMNode): Set<string> {
  const tags = new Set<string>();
  walkChildren(node, (child) => {
    tags.add(child.tag);
  });
  return tags;
}

/** Walk all descendant nodes (not the root itself). */
function walkChildren(node: DOMNode, visitor: (n: DOMNode) => void): void {
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children as DOMNode[]) {
      visitor(child);
      walkChildren(child, visitor);
    }
  }
}

/** Build a path string like "section > container > component". */
function buildNodePath(node: DOMNode, ancestors: DOMNode[]): string {
  const segments = [...ancestors, node].map((n) => n.tag);
  return segments.join(' > ');
}

// ---- Individual content model checks ----

/** SECTION should contain at least one heading. */
function checkSectionHasHeading(
  node: SectionNode,
  path: string,
): SEOIssue | null {
  if (node.tag !== SemanticTag.SECTION) return null;
  const tags = collectTagsInSubtree(node);
  const hasHeading = [...HEADING_TAGS].some((t) => tags.has(t));
  if (!hasHeading) {
    return {
      severity: 'warning',
      category: 'semantic-html',
      nodeId: node.id,
      message: `<section> at "${path}" does not contain a heading element (h1-h6).`,
      suggestion:
        'Add a heading (h2-h6) inside the section to provide an accessible name.',
    };
  }
  return null;
}

/** ARTICLE should have a title/heading element. */
function checkArticleHasHeading(
  node: ComponentNode,
  path: string,
): SEOIssue | null {
  if (node.tag !== SemanticTag.ARTICLE) return null;
  const tags = collectTagsInSubtree(node);
  const hasHeading = [...HEADING_TAGS].some((t) => tags.has(t));
  if (!hasHeading) {
    return {
      severity: 'warning',
      category: 'semantic-html',
      nodeId: node.id,
      message: `<article> at "${path}" does not contain a heading element.`,
      suggestion:
        'Give each article a heading (h2-h6) so assistive technologies can identify it.',
    };
  }
  return null;
}

/** NAV should contain link (<a>) elements. */
function checkNavHasLinks(
  node: SectionNode,
  path: string,
): SEOIssue | null {
  if (node.tag !== SemanticTag.NAV) return null;
  const tags = collectTagsInSubtree(node);
  if (!tags.has(SemanticTag.A)) {
    return {
      severity: 'warning',
      category: 'semantic-html',
      nodeId: node.id,
      message: `<nav> at "${path}" does not contain any link (<a>) elements.`,
      suggestion:
        'Navigation landmarks should contain links. Add anchor elements or consider using a different tag.',
    };
  }
  return null;
}

/** HEADER must not nest another HEADER. */
function checkHeaderNoNestedHeader(
  node: SectionNode,
  path: string,
): SEOIssue | null {
  if (node.tag !== SemanticTag.HEADER) return null;
  const tags = collectTagsInSubtree(node);
  if (tags.has(SemanticTag.HEADER)) {
    return {
      severity: 'error',
      category: 'semantic-html',
      nodeId: node.id,
      message: `<header> at "${path}" contains a nested <header>.`,
      suggestion: 'Remove the nested <header>. Only one <header> is allowed per sectioning root.',
    };
  }
  return null;
}

/** FOOTER must not nest another FOOTER. */
function checkFooterNoNestedFooter(
  node: SectionNode,
  path: string,
): SEOIssue | null {
  if (node.tag !== SemanticTag.FOOTER) return null;
  const tags = collectTagsInSubtree(node);
  if (tags.has(SemanticTag.FOOTER)) {
    return {
      severity: 'error',
      category: 'semantic-html',
      nodeId: node.id,
      message: `<footer> at "${path}" contains a nested <footer>.`,
      suggestion: 'Remove the nested <footer>. Only one <footer> is allowed per sectioning root.',
    };
  }
  return null;
}

/** ASIDE should ideally be inside main or article for proper relationship. */
function checkAsideContext(
  tag: string,
  nodeId: string,
  ancestors: DOMNode[],
  path: string,
): SEOIssue | null {
  if (tag !== SemanticTag.ASIDE) return null;
  const parentTags = ancestors.map((a) => a.tag);
  const insideMain = parentTags.includes(SemanticTag.MAIN);
  const insideArticle = parentTags.includes(SemanticTag.ARTICLE);
  if (!insideMain && !insideArticle) {
    return {
      severity: 'warning',
      category: 'semantic-html',
      nodeId,
      message: `<aside> at "${path}" is not inside <main> or <article>.`,
      suggestion:
        'Place <aside> inside <main> or <article> to establish a clear relationship with surrounding content.',
    };
  }
  return null;
}

/**
 * Validates HTML5 content model rules on a DOM tree.
 *
 * Checks performed:
 * 1. Section elements contain at least one heading
 * 2. Article elements have a heading
 * 3. Nav elements contain links
 * 4. Aside elements are within main/article
 * 5. Header does not nest another header
 * 6. Footer does not nest another footer
 * 7. Only one main element exists
 * 8. Headings do not skip levels
 */
export function validateSemanticHTML(root: DOMNode): SEOIssue[] {
  const issues: SEOIssue[] = [];

  // --- Track across full tree ---
  let mainCount = 0;
  let lastHeadingLevel = 0;
  const mainNodeIds: string[] = [];

  // First pass: count <main> elements
  walkChildren(root, (node) => {
    if (node.tag === SemanticTag.MAIN) {
      mainCount++;
      mainNodeIds.push(node.id);
    }
  });
  // The root itself might be main
  if (root.tag === SemanticTag.MAIN) {
    mainCount++;
    mainNodeIds.push(root.id);
  }

  if (mainCount > 1) {
    issues.push({
      severity: 'error',
      category: 'semantic-html',
      nodeId: mainNodeIds[1],
      message: `Multiple <main> elements found (${mainCount}). Only one <main> is allowed per document.`,
      suggestion: 'Remove extra <main> elements. A document must have exactly one main landmark.',
    });
  }

  // Second pass: recursive content model checks
  function validateNode(node: DOMNode, ancestors: DOMNode[]): void {
    const path = buildNodePath(node, ancestors);

    // Section-level checks (SectionNode)
    if (node.type === NodeType.SECTION) {
      const section = node as SectionNode;
      const sectionChecks = [
        checkSectionHasHeading(section, path),
        checkNavHasLinks(section, path),
        checkHeaderNoNestedHeader(section, path),
        checkFooterNoNestedFooter(section, path),
      ];
      for (const issue of sectionChecks) {
        if (issue !== null) {
          issues.push(issue);
        }
      }
    }

    // Aside context check (applies to any node with tag=aside)
    const asideIssue = checkAsideContext(node.tag, node.id, ancestors, path);
    if (asideIssue !== null) {
      issues.push(asideIssue);
    }

    // Component-level checks (ComponentNode)
    if (node.type === NodeType.COMPONENT) {
      const component = node as ComponentNode;
      const articleIssue = checkArticleHasHeading(component, path);
      if (articleIssue !== null) {
        issues.push(articleIssue);
      }
    }

    // Heading hierarchy check (ElementNode)
    if (node.type === NodeType.ELEMENT && node.tag in HEADING_LEVELS) {
      const level = HEADING_LEVELS[node.tag];
      if (lastHeadingLevel > 0 && level > lastHeadingLevel + 1) {
        issues.push({
          severity: 'warning',
          category: 'semantic-html',
          nodeId: node.id,
          message: `Heading level skipped in "${path}": h${lastHeadingLevel} is followed by h${level}.`,
          suggestion: `Use sequential heading levels. Expected h${lastHeadingLevel + 1} before h${level}.`,
        });
      }
      lastHeadingLevel = level;
    }

    // Recurse into children
    if ('children' in node && Array.isArray(node.children)) {
      for (const child of node.children as DOMNode[]) {
        validateNode(child, [...ancestors, node]);
      }
    }
  }

  validateNode(root, []);

  return issues;
}
