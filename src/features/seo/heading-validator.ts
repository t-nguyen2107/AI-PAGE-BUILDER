import { NodeType, SemanticTag } from '@/types/enums';
import type { PageNode, DOMNode, ElementNode } from '@/types/dom-tree';
import type { HeadingIssue } from '@/types/seo';

/** Maps heading semantic tags to their numeric level. */
const HEADING_LEVELS: Record<string, number> = {
  [SemanticTag.H1]: 1,
  [SemanticTag.H2]: 2,
  [SemanticTag.H3]: 3,
  [SemanticTag.H4]: 4,
  [SemanticTag.H5]: 5,
  [SemanticTag.H6]: 6,
};

interface HeadingEntry {
  nodeId: string;
  level: number;
  text: string;
}

/**
 * Recursively collects all heading elements from a DOM tree.
 */
function collectHeadings(node: DOMNode): HeadingEntry[] {
  const headings: HeadingEntry[] = [];

  if (
    node.type === NodeType.ELEMENT &&
    node.tag in HEADING_LEVELS
  ) {
    const elem = node as ElementNode;
    headings.push({
      nodeId: node.id,
      level: HEADING_LEVELS[node.tag],
      text: elem.content?.trim() ?? '',
    });
  }

  // Recurse into children
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children as DOMNode[]) {
      headings.push(...collectHeadings(child));
    }
  }

  return headings;
}

/**
 * Validates heading hierarchy across a page tree.
 *
 * Rules enforced:
 * - Only one h1 per page
 * - No skipping levels (e.g., h1 -> h3 without h2)
 * - No empty headings
 */
export function validateHeadingHierarchy(tree: PageNode): HeadingIssue[] {
  const issues: HeadingIssue[] = [];
  const headings = collectHeadings(tree);

  let h1Count = 0;
  let lastLevel = 0;

  for (const heading of headings) {
    // Check for multiple h1
    if (heading.level === 1) {
      h1Count++;
      if (h1Count > 1) {
        issues.push({
          nodeId: heading.nodeId,
          level: heading.level,
          issue: 'multiple_h1',
          message: `Multiple h1 tags found. Each page should have exactly one h1. (Found ${h1Count})`,
        });
      }
    }

    // Check for empty headings
    if (heading.text.length === 0) {
      issues.push({
        nodeId: heading.nodeId,
        level: heading.level,
        issue: 'empty_heading',
        message: `h${heading.level} element is empty. Headings should contain meaningful text.`,
      });
    }

    // Check for skipped levels (skip for h1 since it resets)
    if (lastLevel > 0 && heading.level > lastLevel + 1) {
      issues.push({
        nodeId: heading.nodeId,
        level: heading.level,
        issue: 'skipped_level',
        message: `Heading level skipped: h${lastLevel} is followed by h${heading.level}. Expected h${lastLevel + 1}.`,
      });
    }

    lastLevel = heading.level;
  }

  return issues;
}
