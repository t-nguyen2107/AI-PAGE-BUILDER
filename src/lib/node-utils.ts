import { NodeType } from '@/types/enums';
import type { DOMNode } from '@/types';
import { getNodeChildren } from '@/lib/tree-utils';

/**
 * Human-readable label for a NodeType enum value.
 * Shared across Sidebar, Canvas, and InspectorPanel.
 */
export function getNodeTypeLabel(type: NodeType): string {
  switch (type) {
    case NodeType.PAGE: return 'Page';
    case NodeType.SECTION: return 'Section';
    case NodeType.CONTAINER: return 'Container';
    case NodeType.COMPONENT: return 'Component';
    case NodeType.ELEMENT: return 'Element';
    case NodeType.ITEM: return 'Item';
    default: return 'Node';
  }
}

/**
 * Compute the path from root to a target node.
 * Returns an array of DOMNodes from root to the target (inclusive).
 * Returns empty array if target not found.
 */
export function getNodePath(tree: DOMNode, targetId: string): DOMNode[] {
  if (tree.id === targetId) return [tree];
  const children = getNodeChildren(tree);
  for (const child of children) {
    const path = getNodePath(child, targetId);
    if (path.length > 0) return [tree, ...path];
  }
  return [];
}
