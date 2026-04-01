import { describe, it, expect } from 'vitest';
import {
  flattenTreeForDnD,
  getDescendantIds,
  findParent,
  isDescendant,
  getValidDropTargets,
} from '../dnd-utils';
import type {
  PageNode,
  SectionNode,
  ContainerNode,
  ComponentNode,
  ElementNode,
  ItemNode,
} from '@/types/dom-tree';
import { NodeType, SemanticTag } from '@/types/enums';

// ===========================================
// TEST DATA FACTORIES
// ===========================================

function createItemNode(overrides: Partial<ItemNode> = {}): ItemNode {
  return {
    id: 'item-1',
    type: NodeType.ITEM,
    tag: SemanticTag.SPAN,
    content: 'Hello',
    meta: {
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    ...overrides,
  };
}

function createElementNode(overrides: Partial<ElementNode> = {}): ElementNode {
  return {
    id: 'elem-1',
    type: NodeType.ELEMENT,
    tag: SemanticTag.H1,
    content: 'Title',
    meta: {
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    ...overrides,
  };
}

function createComponentNode(overrides: Partial<ComponentNode> = {}): ComponentNode {
  return {
    id: 'comp-1',
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    children: [],
    meta: {
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    ...overrides,
  };
}

function createContainerNode(overrides: Partial<ContainerNode> = {}): ContainerNode {
  return {
    id: 'cont-1',
    type: NodeType.CONTAINER,
    tag: SemanticTag.DIV,
    children: [],
    layout: {},
    meta: {
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    ...overrides,
  };
}

function createSectionNode(overrides: Partial<SectionNode> = {}): SectionNode {
  return {
    id: 'sec-1',
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    children: [],
    layout: {},
    meta: {
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    ...overrides,
  };
}

/**
 * Creates a 4-level tree:
 * page-1 -> sec-1 -> cont-1 -> comp-1 -> elem-1 -> item-1
 */
function createSampleTree(): PageNode {
  const itemNode = createItemNode({ id: 'item-1' });
  const elemNode = createElementNode({ id: 'elem-1', children: [itemNode] });
  const compNode = createComponentNode({ id: 'comp-1', children: [elemNode] });
  const contNode = createContainerNode({ id: 'cont-1', children: [compNode] });
  const section = createSectionNode({ id: 'sec-1', children: [contNode] });

  return {
    id: 'page-1',
    type: NodeType.PAGE,
    tag: SemanticTag.MAIN,
    children: [section],
    styleguideId: 'sg-1',
    globalSectionIds: [],
    meta: {
      title: 'Test Page',
      slug: 'test-page',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  };
}

/**
 * Creates a wider tree for more thorough tests:
 * page-1 -> [sec-1, sec-2]
 *   sec-1 -> [cont-1, cont-2]
 *     cont-1 -> [comp-1]
 *       comp-1 -> [elem-1]
 *     cont-2 -> []
 *   sec-2 -> [cont-3]
 *     cont-3 -> [comp-2]
 */
function createWideTree(): PageNode {
  const elem1 = createElementNode({ id: 'elem-1' });
  const comp1 = createComponentNode({ id: 'comp-1', children: [elem1] });
  const cont1 = createContainerNode({ id: 'cont-1', children: [comp1] });
  const cont2 = createContainerNode({ id: 'cont-2', children: [] });

  const comp2 = createComponentNode({ id: 'comp-2', children: [] });
  const cont3 = createContainerNode({ id: 'cont-3', children: [comp2] });

  const sec1 = createSectionNode({ id: 'sec-1', children: [cont1, cont2] });
  const sec2 = createSectionNode({ id: 'sec-2', children: [cont3] });

  return {
    id: 'page-1',
    type: NodeType.PAGE,
    tag: SemanticTag.MAIN,
    children: [sec1, sec2],
    styleguideId: 'sg-1',
    globalSectionIds: [],
    meta: {
      title: 'Wide Tree',
      slug: 'wide-tree',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  };
}

// ===========================================
// FLATTEN TREE TESTS
// ===========================================

describe('flattenTreeForDnD', () => {
  it('flattens a single-node tree (page only)', () => {
    const tree: PageNode = {
      id: 'page-1',
      type: NodeType.PAGE,
      tag: SemanticTag.MAIN,
      children: [],
      styleguideId: 'sg-1',
      globalSectionIds: [],
      meta: {
        title: 'Empty Page',
        slug: 'empty',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    };

    const result = flattenTreeForDnD(tree);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('page-1');
    expect(result[0].parentId).toBeNull();
    expect(result[0].depth).toBe(0);
    expect(result[0].type).toBe(NodeType.PAGE);
    expect(result[0].children).toEqual([]);
  });

  it('flattens a multi-level tree in document order', () => {
    const tree = createSampleTree();
    const result = flattenTreeForDnD(tree);

    // page-1, sec-1, cont-1, comp-1, elem-1, item-1
    expect(result).toHaveLength(6);
    const ids = result.map((item) => item.id);
    expect(ids).toEqual(['page-1', 'sec-1', 'cont-1', 'comp-1', 'elem-1', 'item-1']);
  });

  it('assigns correct parent references', () => {
    const tree = createSampleTree();
    const result = flattenTreeForDnD(tree);

    const byId = Object.fromEntries(result.map((item) => [item.id, item]));

    expect(byId['page-1'].parentId).toBeNull();
    expect(byId['sec-1'].parentId).toBe('page-1');
    expect(byId['cont-1'].parentId).toBe('sec-1');
    expect(byId['comp-1'].parentId).toBe('cont-1');
    expect(byId['elem-1'].parentId).toBe('comp-1');
    expect(byId['item-1'].parentId).toBe('elem-1');
  });

  it('assigns correct depth values', () => {
    const tree = createSampleTree();
    const result = flattenTreeForDnD(tree);

    const byId = Object.fromEntries(result.map((item) => [item.id, item]));

    expect(byId['page-1'].depth).toBe(0);
    expect(byId['sec-1'].depth).toBe(1);
    expect(byId['cont-1'].depth).toBe(2);
    expect(byId['comp-1'].depth).toBe(3);
    expect(byId['elem-1'].depth).toBe(4);
    expect(byId['item-1'].depth).toBe(5);
  });

  it('assigns correct children arrays', () => {
    const tree = createWideTree();
    const result = flattenTreeForDnD(tree);

    const byId = Object.fromEntries(result.map((item) => [item.id, item]));

    expect(byId['page-1'].children).toEqual(['sec-1', 'sec-2']);
    expect(byId['sec-1'].children).toEqual(['cont-1', 'cont-2']);
    expect(byId['sec-2'].children).toEqual(['cont-3']);
    expect(byId['cont-2'].children).toEqual([]);
    expect(byId['comp-2'].children).toEqual([]);
  });

  it('preserves node type and data reference', () => {
    const tree = createSampleTree();
    const result = flattenTreeForDnD(tree);

    const byId = Object.fromEntries(result.map((item) => [item.id, item]));

    expect(byId['page-1'].type).toBe(NodeType.PAGE);
    expect(byId['sec-1'].type).toBe(NodeType.SECTION);
    expect(byId['item-1'].type).toBe(NodeType.ITEM);
    expect(byId['sec-1'].data).toBe(tree.children[0]);
  });

  it('flattens a wide tree with siblings in correct order', () => {
    const tree = createWideTree();
    const result = flattenTreeForDnD(tree);

    const ids = result.map((item) => item.id);
    // page-1 -> sec-1 -> cont-1 -> comp-1 -> elem-1, then cont-2, then sec-2 -> cont-3 -> comp-2
    expect(ids).toEqual([
      'page-1',
      'sec-1',
      'cont-1',
      'comp-1',
      'elem-1',
      'cont-2',
      'sec-2',
      'cont-3',
      'comp-2',
    ]);
  });
});

// ===========================================
// GET DESCENDANT IDS TESTS
// ===========================================

describe('getDescendantIds', () => {
  it('returns all descendant IDs for a deep node', () => {
    const tree = createSampleTree();
    const flat = flattenTreeForDnD(tree);

    const descendants = getDescendantIds(flat, 'sec-1');

    // sec-1 -> cont-1 -> comp-1 -> elem-1 -> item-1
    expect(descendants).toEqual(['cont-1', 'comp-1', 'elem-1', 'item-1']);
  });

  it('returns only direct children for a leaf-adjacent node', () => {
    const tree = createSampleTree();
    const flat = flattenTreeForDnD(tree);

    const descendants = getDescendantIds(flat, 'elem-1');

    expect(descendants).toEqual(['item-1']);
  });

  it('returns empty array for a leaf node', () => {
    const tree = createSampleTree();
    const flat = flattenTreeForDnD(tree);

    const descendants = getDescendantIds(flat, 'item-1');

    expect(descendants).toEqual([]);
  });

  it('returns empty array for a non-existent node', () => {
    const tree = createSampleTree();
    const flat = flattenTreeForDnD(tree);

    const descendants = getDescendantIds(flat, 'nonexistent');

    expect(descendants).toEqual([]);
  });

  it('returns all descendants for root node', () => {
    const tree = createWideTree();
    const flat = flattenTreeForDnD(tree);

    const descendants = getDescendantIds(flat, 'page-1');

    expect(descendants).toEqual([
      'sec-1',
      'cont-1',
      'comp-1',
      'elem-1',
      'cont-2',
      'sec-2',
      'cont-3',
      'comp-2',
    ]);
  });

  it('returns children of a node with multiple children', () => {
    const tree = createWideTree();
    const flat = flattenTreeForDnD(tree);

    const descendants = getDescendantIds(flat, 'sec-1');

    // sec-1 -> [cont-1 -> comp-1 -> elem-1, cont-2]
    expect(descendants).toEqual(['cont-1', 'comp-1', 'elem-1', 'cont-2']);
  });
});

// ===========================================
// FIND PARENT TESTS
// ===========================================

describe('findParent', () => {
  it('returns null for root node', () => {
    const tree = createSampleTree();
    const flat = flattenTreeForDnD(tree);

    expect(findParent(flat, 'page-1')).toBeNull();
  });

  it('returns the parent of a direct child', () => {
    const tree = createSampleTree();
    const flat = flattenTreeForDnD(tree);

    const parent = findParent(flat, 'sec-1');

    expect(parent).not.toBeNull();
    expect(parent!.id).toBe('page-1');
  });

  it('returns the parent of a deeply nested node', () => {
    const tree = createSampleTree();
    const flat = flattenTreeForDnD(tree);

    const parent = findParent(flat, 'item-1');

    expect(parent).not.toBeNull();
    expect(parent!.id).toBe('elem-1');
  });

  it('returns null for a non-existent node', () => {
    const tree = createSampleTree();
    const flat = flattenTreeForDnD(tree);

    expect(findParent(flat, 'nonexistent')).toBeNull();
  });

  it('returns correct parent for siblings', () => {
    const tree = createWideTree();
    const flat = flattenTreeForDnD(tree);

    expect(findParent(flat, 'sec-1')!.id).toBe('page-1');
    expect(findParent(flat, 'sec-2')!.id).toBe('page-1');
    expect(findParent(flat, 'cont-1')!.id).toBe('sec-1');
    expect(findParent(flat, 'cont-2')!.id).toBe('sec-1');
  });
});

// ===========================================
// IS DESCENDANT TESTS
// ===========================================

describe('isDescendant', () => {
  it('returns true for a direct child', () => {
    const tree = createSampleTree();
    const flat = flattenTreeForDnD(tree);

    expect(isDescendant(flat, 'sec-1', 'cont-1')).toBe(true);
  });

  it('returns true for a deeply nested descendant', () => {
    const tree = createSampleTree();
    const flat = flattenTreeForDnD(tree);

    expect(isDescendant(flat, 'page-1', 'item-1')).toBe(true);
  });

  it('returns false when target is an ancestor', () => {
    const tree = createSampleTree();
    const flat = flattenTreeForDnD(tree);

    expect(isDescendant(flat, 'cont-1', 'sec-1')).toBe(false);
  });

  it('returns false for siblings', () => {
    const tree = createWideTree();
    const flat = flattenTreeForDnD(tree);

    expect(isDescendant(flat, 'sec-1', 'sec-2')).toBe(false);
    expect(isDescendant(flat, 'cont-1', 'cont-2')).toBe(false);
  });

  it('returns false for the same node', () => {
    const tree = createSampleTree();
    const flat = flattenTreeForDnD(tree);

    expect(isDescendant(flat, 'sec-1', 'sec-1')).toBe(false);
  });
});

// ===========================================
// GET VALID DROP TARGETS TESTS
// ===========================================

describe('getValidDropTargets', () => {
  it('excludes the dragged node and its descendants', () => {
    const tree = createSampleTree();
    const flat = flattenTreeForDnD(tree);

    // Dragging sec-1 should exclude sec-1 and all its descendants
    const targets = getValidDropTargets(flat, 'sec-1');

    expect(targets).not.toContain('sec-1');
    expect(targets).not.toContain('cont-1');
    expect(targets).not.toContain('comp-1');
    expect(targets).not.toContain('elem-1');
    expect(targets).not.toContain('item-1');
    // Only page-1 should remain
    expect(targets).toEqual(['page-1']);
  });

  it('excludes ItemNode types from valid targets', () => {
    const tree = createWideTree();
    const flat = flattenTreeForDnD(tree);

    // Dragging comp-2: excludes comp-2, but item nodes in the tree should not appear
    const targets = getValidDropTargets(flat, 'comp-2');

    // No ITEM nodes in the tree for the wide tree, so just check comp-2 is excluded
    expect(targets).not.toContain('comp-2');
  });

  it('allows dropping into ancestor nodes', () => {
    const tree = createSampleTree();
    const flat = flattenTreeForDnD(tree);

    // Dragging item-1: page-1, sec-1, cont-1, comp-1, elem-1 are ancestors
    const targets = getValidDropTargets(flat, 'item-1');

    expect(targets).toContain('page-1');
    expect(targets).toContain('sec-1');
    expect(targets).toContain('cont-1');
    expect(targets).toContain('comp-1');
    expect(targets).toContain('elem-1');
    // item-1 itself excluded
    expect(targets).not.toContain('item-1');
  });

  it('allows dropping into sibling nodes', () => {
    const tree = createWideTree();
    const flat = flattenTreeForDnD(tree);

    // Dragging cont-1 should allow sec-2, cont-3, etc.
    const targets = getValidDropTargets(flat, 'cont-1');

    expect(targets).toContain('page-1');
    expect(targets).toContain('sec-2');
    expect(targets).toContain('cont-2'); // sibling in sec-1
    expect(targets).toContain('cont-3');
    // Exclude cont-1 and its descendants
    expect(targets).not.toContain('cont-1');
    expect(targets).not.toContain('comp-1');
    expect(targets).not.toContain('elem-1');
  });

  it('dragging the root node only excludes itself', () => {
    const tree = createWideTree();
    const flat = flattenTreeForDnD(tree);

    const targets = getValidDropTargets(flat, 'page-1');

    // page-1 and all descendants excluded, nothing left
    expect(targets).toEqual([]);
  });

  it('returns all non-item nodes when dragging a leaf item', () => {
    const tree = createSampleTree();
    const flat = flattenTreeForDnD(tree);

    const targets = getValidDropTargets(flat, 'item-1');

    // All nodes except item-1 (leaf, no descendants)
    // All are parent-capable (not ITEM type)
    expect(targets).toHaveLength(5);
    expect(targets).toContain('page-1');
    expect(targets).toContain('sec-1');
    expect(targets).toContain('cont-1');
    expect(targets).toContain('comp-1');
    expect(targets).toContain('elem-1');
  });
});
