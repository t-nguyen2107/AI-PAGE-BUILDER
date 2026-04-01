import type {
  DOMNode,
  PageNode,
  SectionNode,
  ContainerNode,
  ComponentNode,
  ElementNode,
  ItemNode,
  ParentNode,
} from '@/types/dom-tree';
import { NodeType } from '@/types/enums';
import { generateId } from './id';

/** Check if a node can have children */
function isParentNode(node: DOMNode): node is ParentNode {
  return node.type !== NodeType.ITEM;
}

/** Get children array of a parent node */
export function getNodeChildren(node: DOMNode): DOMNode[] {
  if (!isParentNode(node)) return [];
  const parent = node as ParentNode;
  return (parent.children ?? []) as DOMNode[];
}

/** Find a node by ID recursively */
export function findNodeById(tree: DOMNode, nodeId: string): DOMNode | null {
  if (tree.id === nodeId) return tree;
  const children = getNodeChildren(tree);
  for (const child of children) {
    const found = findNodeById(child, nodeId);
    if (found) return found;
  }
  return null;
}

/** Find parent of a node by child ID */
export function findParentNode(tree: DOMNode, nodeId: string): DOMNode | null {
  const children = getNodeChildren(tree);
  for (const child of children) {
    if (child.id === nodeId) return tree;
    const found = findParentNode(child, nodeId);
    if (found) return found;
  }
  return null;
}

/** Get index of a child in parent's children array */
export function getChildIndex(parent: DOMNode, childId: string): number {
  const children = getNodeChildren(parent);
  return children.findIndex((c) => c.id === childId);
}

/** Deep clone a node tree with new IDs */
export function deepCloneWithNewIds<T extends DOMNode>(node: T): T {
  const clone = { ...node, id: generateId() };

  if (clone.meta) {
    clone.meta = { ...clone.meta, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }

  const children = getNodeChildren(node);
  if (children.length > 0) {
    (clone as ParentNode).children = children.map((child) =>
      deepCloneWithNewIds(child)
    ) as ParentNode['children'];
  }

  return clone as T;
}

/** Add a child node at a specific position — returns new tree (immutable) */
export function addChildNode(
  tree: PageNode,
  parentId: string,
  child: DOMNode,
  position?: number
): PageNode {
  const newTree = structuredClone(tree);
  const parent = findNodeById(newTree, parentId);
  if (!parent || !isParentNode(parent)) return tree;

  const children = getNodeChildren(parent);
  const pos = position ?? children.length;
  children.splice(pos, 0, child);
  (parent as ParentNode).children = children as ParentNode['children'];

  return newTree;
}

/** Remove a node by ID — returns new tree */
export function removeNode(tree: PageNode, nodeId: string): PageNode {
  const newTree = structuredClone(tree);
  const parent = findParentNode(newTree, nodeId);
  if (!parent) return tree;

  const children = getNodeChildren(parent);
  (parent as ParentNode).children = children.filter(
    (c) => c.id !== nodeId
  ) as ParentNode['children'];

  return newTree;
}

/** Update a node by ID with partial data — returns new tree */
export function updateNodeInTree(
  tree: PageNode,
  nodeId: string,
  partial: Partial<DOMNode>
): PageNode {
  const newTree = structuredClone(tree);
  const node = findNodeById(newTree, nodeId);
  if (!node) return tree;

  Object.assign(node, partial);

  if (node.meta) {
    node.meta = { ...node.meta, updatedAt: new Date().toISOString() };
  }

  return newTree;
}

/** Move a node from one parent to another — returns new tree */
export function moveNode(
  tree: PageNode,
  nodeId: string,
  newParentId: string,
  position: number
): PageNode {
  // First find the node to move (deep clone it)
  const nodeToMove = findNodeById(tree, nodeId);
  if (!nodeToMove) return tree;

  // Remove from old location, then add to new location
  let newTree = removeNode(tree, nodeId);
  newTree = addChildNode(newTree, newParentId, structuredClone(nodeToMove), position);

  return newTree;
}

/** Reorder children of a parent node by providing ordered child IDs */
export function reorderChildren(
  tree: PageNode,
  parentId: string,
  childIds: string[]
): PageNode {
  const newTree = structuredClone(tree);
  const parent = findNodeById(newTree, parentId);
  if (!parent || !isParentNode(parent)) return tree;

  const children = getNodeChildren(parent);
  const childMap = new Map(children.map((c) => [c.id, c]));

  const reordered = childIds
    .map((id) => childMap.get(id))
    .filter(Boolean) as DOMNode[];

  (parent as ParentNode).children = reordered as ParentNode['children'];

  return newTree;
}

/** Get path to a node as JSON Pointer (RFC 6901) */
export function getNodePath(tree: DOMNode, nodeId: string, path = ''): string | null {
  if (tree.id === nodeId) return path || '/';
  const children = getNodeChildren(tree);
  for (let i = 0; i < children.length; i++) {
    const childPath = `${path}/children/${i}`;
    const result = getNodePath(children[i], nodeId, childPath);
    if (result !== null) return result;
  }
  return null;
}

/** Get flat list of all node IDs in tree order */
export function flattenTree(tree: DOMNode): string[] {
  const ids: string[] = [tree.id];
  const children = getNodeChildren(tree);
  for (const child of children) {
    ids.push(...flattenTree(child));
  }
  return ids;
}

/** Count total nodes in tree */
export function countNodes(tree: DOMNode): number {
  let count = 1;
  const children = getNodeChildren(tree);
  for (const child of children) {
    count += countNodes(child);
  }
  return count;
}

/** Get all nodes of a specific type */
export function getNodesByType(tree: DOMNode, type: NodeType): DOMNode[] {
  const results: DOMNode[] = [];
  if (tree.type === type) results.push(tree);
  const children = getNodeChildren(tree);
  for (const child of children) {
    results.push(...getNodesByType(child, type));
  }
  return results;
}

/** Find a node by searching its content, tag, className, or type against a text query */
export function findNodeByText(tree: DOMNode, query: string): DOMNode | null {
  const q = query.toLowerCase();
  const el = tree as unknown as Record<string, unknown>;
  const searchable = [
    el['content'],
    el['tag'],
    el['className'],
    tree.type,
  ].filter((v): v is string => typeof v === 'string');

  if (searchable.some((v) => v.toLowerCase().includes(q))) return tree;

  const children = getNodeChildren(tree);
  for (const child of children) {
    const found = findNodeByText(child, query);
    if (found) return found;
  }
  return null;
}
