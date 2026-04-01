import type { PageNode, DOMNode, ParentNode } from '@/types';
import { NodeType } from '@/types';
import { getNodeChildren } from '@/lib/tree-utils';

/**
 * Flattened representation of a tree node for DnD operations.
 * Used by @dnd-kit SortableContext which needs a flat list.
 */
export interface FlattenedItem {
  id: string;
  parentId: string | null;
  type: NodeType;
  depth: number;
  data: DOMNode;
  children: string[];
}

/**
 * Recursively flattens the DOM tree into a flat array of FlattenedItems.
 * Each item retains its parent reference, depth, and child IDs so
 * the tree can be reconstructed after DnD operations.
 *
 * @param tree - The root PageNode of the tree
 * @returns Flat array of all nodes in document order
 */
export function flattenTreeForDnD(tree: PageNode): FlattenedItem[] {
  const items: FlattenedItem[] = [];

  function walk(
    node: DOMNode,
    parentId: string | null,
    depth: number
  ): void {
    const children = getNodeChildren(node);
    const childIds = children.map((c) => c.id);

    items.push({
      id: node.id,
      parentId,
      type: node.type,
      depth,
      data: node,
      children: childIds,
    });

    for (const child of children) {
      walk(child, node.id, depth + 1);
    }
  }

  walk(tree, null, 0);
  return items;
}

/**
 * Get all descendant node IDs of a given node (excluding the node itself).
 */
export function getDescendantIds(
  flattened: FlattenedItem[],
  nodeId: string
): string[] {
  const descendants: string[] = [];
  const node = flattened.find((item) => item.id === nodeId);
  if (!node) return descendants;

  const childIds = new Set(node.children);

  for (const childId of childIds) {
    descendants.push(childId);
    descendants.push(...getDescendantIds(flattened, childId));
  }

  return descendants;
}

/**
 * Find the parent FlattenedItem for a given node ID.
 */
export function findParent(
  flattened: FlattenedItem[],
  nodeId: string
): FlattenedItem | null {
  const item = flattened.find((i) => i.id === nodeId);
  if (!item || !item.parentId) return null;
  return flattened.find((i) => i.id === item.parentId) ?? null;
}

/**
 * Check if targetId is a descendant of ancestorId in the flattened tree.
 * Prevents circular moves (dropping a parent into its own child).
 */
export function isDescendant(
  flattened: FlattenedItem[],
  ancestorId: string,
  targetId: string
): boolean {
  const descendants = getDescendantIds(flattened, ancestorId);
  return descendants.includes(targetId);
}

/**
 * Determine valid drop targets for a dragged node.
 * A node cannot be dropped into itself or any of its descendants.
 * A node can only be dropped into parent-capable nodes (not ItemNode).
 */
export function getValidDropTargets(
  flattened: FlattenedItem[],
  dragNodeId: string
): string[] {
  const descendants = new Set(getDescendantIds(flattened, dragNodeId));
  descendants.add(dragNodeId);

  return flattened
    .filter((item) => !descendants.has(item.id))
    .filter((item) => item.type !== NodeType.ITEM)
    .map((item) => item.id);
}
