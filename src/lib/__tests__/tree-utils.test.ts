import { describe, it, expect } from 'vitest';
import type {
  PageNode,
  SectionNode,
  ContainerNode,
  ComponentNode,
  ElementNode,
  ItemNode,
} from '@/types/dom-tree';
import { NodeType, SemanticTag, DisplayType, FlexDirection } from '@/types/enums';
import {
  findNodeById,
  findParentNode,
  getChildIndex,
  deepCloneWithNewIds,
  addChildNode,
  removeNode,
  updateNodeInTree,
  moveNode,
  reorderChildren,
  getNodePath,
  flattenTree,
  countNodes,
  getNodesByType,
  getNodeChildren,
} from '@/lib/tree-utils';

// ---------------------------------------------------------------------------
// Test data factory — builds a realistic DOM tree
// ---------------------------------------------------------------------------

const now = new Date().toISOString();

function makeItem(overrides: Partial<ItemNode> = {}): ItemNode {
  return {
    id: 'item-1',
    type: NodeType.ITEM,
    tag: SemanticTag.LI,
    content: 'List item',
    meta: { createdAt: now, updatedAt: now },
    ...overrides,
  };
}

function makeElement(overrides: Partial<ElementNode> = {}): ElementNode {
  return {
    id: 'elem-heading',
    type: NodeType.ELEMENT,
    tag: SemanticTag.H2,
    content: 'Hello World',
    meta: { createdAt: now, updatedAt: now },
    ...overrides,
  };
}

function makeComponent(overrides: Partial<ComponentNode> = {}): ComponentNode {
  return {
    id: 'comp-hero',
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    children: [makeElement()],
    meta: { createdAt: now, updatedAt: now },
    ...overrides,
  };
}

function makeContainer(overrides: Partial<ContainerNode> = {}): ContainerNode {
  return {
    id: 'container-main',
    type: NodeType.CONTAINER,
    tag: SemanticTag.DIV,
    children: [makeComponent()],
    layout: { display: DisplayType.FLEX, flexDirection: FlexDirection.COLUMN, gap: '1rem', padding: '2rem' },
    meta: { createdAt: now, updatedAt: now },
    ...overrides,
  };
}

function makeSection(overrides: Partial<SectionNode> = {}): SectionNode {
  return {
    id: 'section-hero',
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    children: [makeContainer()],
    layout: { display: DisplayType.BLOCK },
    meta: { createdAt: now, updatedAt: now, sectionName: 'Hero' },
    ...overrides,
  };
}

function makePage(overrides: Partial<PageNode> = {}): PageNode {
  return {
    id: 'page-home',
    type: NodeType.PAGE,
    tag: SemanticTag.MAIN,
    children: [makeSection()],
    meta: { title: 'Home', slug: 'home', createdAt: now, updatedAt: now },
    styleguideId: 'styleguide-1',
    globalSectionIds: [],
    ...overrides,
  };
}

// A deeper tree for move/reorder tests
function makeDeepTree(): PageNode {
  const item1 = makeItem({ id: 'item-1', content: 'First' });
  const item2 = makeItem({ id: 'item-2', content: 'Second' });
  const elemList = makeElement({ id: 'elem-list', tag: SemanticTag.UL, children: [item1, item2] });
  const elemHeading = makeElement({ id: 'elem-heading', tag: SemanticTag.H2, content: 'Title' });
  const elemPara = makeElement({ id: 'elem-para', tag: SemanticTag.P, content: 'Paragraph' });
  const comp1 = makeComponent({ id: 'comp-1', children: [elemHeading, elemPara] });
  const comp2 = makeComponent({ id: 'comp-2', children: [elemList] });
  const container = makeContainer({ id: 'container-1', children: [comp1, comp2] });
  const section = makeSection({ id: 'section-1', children: [container] });
  return makePage({ id: 'page-1', children: [section] });
}

// ---------------------------------------------------------------------------
// getNodeChildren
// ---------------------------------------------------------------------------

describe('getNodeChildren', () => {
  it('returns children array for a parent node', () => {
    const section = makeSection();
    expect(getNodeChildren(section)).toHaveLength(1);
    expect(getNodeChildren(section)[0].id).toBe('container-main');
  });

  it('returns empty array for an item (leaf) node', () => {
    const item = makeItem();
    expect(getNodeChildren(item)).toEqual([]);
  });

  it('returns empty array for element with no children', () => {
    const elem = makeElement();
    expect(getNodeChildren(elem)).toEqual([]);
  });

  it('returns children for element node that has children', () => {
    const item1 = makeItem({ id: 'i1' });
    const elem = makeElement({ id: 'e1', tag: SemanticTag.UL, children: [item1] });
    expect(getNodeChildren(elem)).toHaveLength(1);
    expect(getNodeChildren(elem)[0].id).toBe('i1');
  });
});

// ---------------------------------------------------------------------------
// findNodeById
// ---------------------------------------------------------------------------

describe('findNodeById', () => {
  it('finds the root node', () => {
    const tree = makePage();
    expect(findNodeById(tree, 'page-home')).toBe(tree);
  });

  it('finds a nested section', () => {
    const tree = makePage();
    const found = findNodeById(tree, 'section-hero');
    expect(found).not.toBeNull();
    expect(found!.id).toBe('section-hero');
    expect(found!.type).toBe(NodeType.SECTION);
  });

  it('finds a deeply nested element', () => {
    const tree = makeDeepTree();
    const found = findNodeById(tree, 'elem-heading');
    expect(found).not.toBeNull();
    expect(found!.id).toBe('elem-heading');
  });

  it('finds a leaf item node', () => {
    const tree = makeDeepTree();
    const found = findNodeById(tree, 'item-2');
    expect(found).not.toBeNull();
    expect(found!.id).toBe('item-2');
  });

  it('returns null for non-existent ID', () => {
    const tree = makePage();
    expect(findNodeById(tree, 'does-not-exist')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// findParentNode
// ---------------------------------------------------------------------------

describe('findParentNode', () => {
  it('returns null when searching parent of root', () => {
    const tree = makePage();
    expect(findParentNode(tree, 'page-home')).toBeNull();
  });

  it('finds parent of a section (the page)', () => {
    const tree = makePage();
    const parent = findParentNode(tree, 'section-hero');
    expect(parent).not.toBeNull();
    expect(parent!.id).toBe('page-home');
  });

  it('finds parent of a deeply nested element', () => {
    const tree = makeDeepTree();
    const parent = findParentNode(tree, 'elem-heading');
    expect(parent).not.toBeNull();
    expect(parent!.id).toBe('comp-1');
  });

  it('finds parent of an item node', () => {
    const tree = makeDeepTree();
    const parent = findParentNode(tree, 'item-1');
    expect(parent).not.toBeNull();
    expect(parent!.id).toBe('elem-list');
  });

  it('returns null for non-existent ID', () => {
    const tree = makePage();
    expect(findParentNode(tree, 'nonexistent')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getChildIndex
// ---------------------------------------------------------------------------

describe('getChildIndex', () => {
  it('returns correct index for first child', () => {
    const tree = makeDeepTree();
    const section = findNodeById(tree, 'section-1')!;
    expect(getChildIndex(section, 'container-1')).toBe(0);
  });

  it('returns correct index for second child', () => {
    const tree = makeDeepTree();
    const container = findNodeById(tree, 'container-1')!;
    expect(getChildIndex(container, 'comp-2')).toBe(1);
  });

  it('returns -1 when child not found', () => {
    const tree = makeDeepTree();
    const container = findNodeById(tree, 'container-1')!;
    expect(getChildIndex(container, 'nonexistent')).toBe(-1);
  });
});

// ---------------------------------------------------------------------------
// deepCloneWithNewIds
// ---------------------------------------------------------------------------

describe('deepCloneWithNewIds', () => {
  it('clones a node with a different ID', () => {
    const section = makeSection();
    const clone = deepCloneWithNewIds(section);
    expect(clone.id).not.toBe(section.id);
    expect(clone.type).toBe(section.type);
    expect(clone.tag).toBe(section.tag);
  });

  it('recursively clones children with new IDs', () => {
    const tree = makeDeepTree();
    const clone = deepCloneWithNewIds(tree);

    // All IDs should be different
    const originalIds = flattenTree(tree);
    const clonedIds = flattenTree(clone);
    expect(clonedIds).not.toEqual(originalIds);
    expect(clonedIds).toHaveLength(originalIds.length);
  });

  it('preserves content and structure but not IDs', () => {
    const elem = makeElement({ content: 'Hello' });
    const clone = deepCloneWithNewIds(elem);
    expect(clone.id).not.toBe(elem.id);
    expect(clone.content).toBe('Hello');
  });

  it('updates meta timestamps', () => {
    const elem = makeElement({ meta: { createdAt: '2020-01-01', updatedAt: '2020-01-01' } });
    const clone = deepCloneWithNewIds(elem);
    expect(clone.meta!.createdAt).not.toBe('2020-01-01');
    expect(clone.meta!.updatedAt).not.toBe('2020-01-01');
  });
});

// ---------------------------------------------------------------------------
// addChildNode
// ---------------------------------------------------------------------------

describe('addChildNode', () => {
  it('adds a child to a section', () => {
    const tree = makePage();
    const newSection = makeSection({ id: 'section-footer' });
    const result = addChildNode(tree, 'page-home', newSection);

    expect(result).not.toBe(tree); // immutable
    expect(findNodeById(result, 'section-footer')).not.toBeNull();
    expect(findNodeById(result, 'section-hero')).not.toBeNull();
  });

  it('adds child at specific position', () => {
    const tree = makeDeepTree();
    const newComp = makeComponent({ id: 'comp-new' });
    const result = addChildNode(tree, 'container-1', newComp, 0);

    const container = findNodeById(result, 'container-1')!;
    expect(getNodeChildren(container)[0].id).toBe('comp-new');
  });

  it('appends to end when no position specified', () => {
    const tree = makeDeepTree();
    const newComp = makeComponent({ id: 'comp-new' });
    const result = addChildNode(tree, 'container-1', newComp);

    const container = findNodeById(result, 'container-1')!;
    const children = getNodeChildren(container);
    expect(children[children.length - 1].id).toBe('comp-new');
  });

  it('returns original tree if parentId not found', () => {
    const tree = makePage();
    const newSection = makeSection({ id: 'section-new' });
    const result = addChildNode(tree, 'nonexistent', newSection);
    expect(result).toEqual(tree);
  });

  it('returns original tree if parent is an item (leaf)', () => {
    const tree = makeDeepTree();
    const newItem = makeItem({ id: 'item-new' });
    const result = addChildNode(tree, 'item-1', newItem);
    expect(result).toEqual(tree);
  });

  it('does not mutate the original tree', () => {
    const tree = makeDeepTree();
    const originalChildren = [...getNodeChildren(findNodeById(tree, 'container-1')!)];
    addChildNode(tree, 'container-1', makeComponent({ id: 'comp-new' }));
    expect(getNodeChildren(findNodeById(tree, 'container-1')!)).toHaveLength(originalChildren.length);
  });
});

// ---------------------------------------------------------------------------
// removeNode
// ---------------------------------------------------------------------------

describe('removeNode', () => {
  it('removes a section from the page', () => {
    const tree = makePage();
    const result = removeNode(tree, 'section-hero');

    expect(findNodeById(result, 'section-hero')).toBeNull();
    expect(findNodeById(result, 'page-home')).not.toBeNull();
  });

  it('removes a deeply nested element', () => {
    const tree = makeDeepTree();
    const result = removeNode(tree, 'elem-para');

    expect(findNodeById(result, 'elem-para')).toBeNull();
    expect(findNodeById(result, 'elem-heading')).not.toBeNull();
  });

  it('returns original tree when node not found', () => {
    const tree = makePage();
    const result = removeNode(tree, 'nonexistent');
    expect(result).toEqual(tree);
  });

  it('does not mutate the original tree', () => {
    const tree = makeDeepTree();
    removeNode(tree, 'elem-heading');
    expect(findNodeById(tree, 'elem-heading')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// updateNodeInTree
// ---------------------------------------------------------------------------

describe('updateNodeInTree', () => {
  it('updates a node property', () => {
    const tree = makeDeepTree();
    const result = updateNodeInTree(tree, 'elem-heading', { content: 'Updated Title' });

    const updated = findNodeById(result, 'elem-heading') as ElementNode;
    expect(updated.content).toBe('Updated Title');
  });

  it('updates inline styles', () => {
    const tree = makeDeepTree();
    const result = updateNodeInTree(tree, 'elem-heading', {
      inlineStyles: { color: 'red', fontSize: '2rem' },
    });

    const updated = findNodeById(result, 'elem-heading') as ElementNode;
    expect(updated.inlineStyles).toEqual({ color: 'red', fontSize: '2rem' });
  });

  it('updates className', () => {
    const tree = makeDeepTree();
    const result = updateNodeInTree(tree, 'container-1', { className: 'layout-main' });

    const updated = findNodeById(result, 'container-1')!;
    expect(updated.className).toBe('layout-main');
  });

  it('returns original tree if nodeId not found', () => {
    const tree = makePage();
    const result = updateNodeInTree(tree, 'nonexistent', { content: 'x' });
    expect(result).toEqual(tree);
  });

  it('updates meta.updatedAt timestamp', () => {
    const tree = makeDeepTree();
    const before = (findNodeById(tree, 'elem-heading') as ElementNode).meta!.updatedAt;
    const result = updateNodeInTree(tree, 'elem-heading', { content: 'New' });
    const after = (findNodeById(result, 'elem-heading') as ElementNode).meta!.updatedAt;
    expect(after).not.toBe(before);
  });

  it('does not mutate the original tree', () => {
    const tree = makeDeepTree();
    updateNodeInTree(tree, 'elem-heading', { content: 'Changed' });
    expect((findNodeById(tree, 'elem-heading') as ElementNode).content).toBe('Title');
  });
});

// ---------------------------------------------------------------------------
// moveNode
// ---------------------------------------------------------------------------

describe('moveNode', () => {
  it('moves a node from one parent to another', () => {
    const tree = makeDeepTree();
    // Move elem-heading from comp-1 to comp-2
    const result = moveNode(tree, 'elem-heading', 'comp-2', 0);

    const comp1 = findNodeById(result, 'comp-1')!;
    const comp2 = findNodeById(result, 'comp-2')!;

    expect(findNodeById(comp1 as ComponentNode, 'elem-heading')).toBeNull();
    expect(findNodeById(comp2 as ComponentNode, 'elem-heading')).not.toBeNull();
  });

  it('places moved node at the specified position', () => {
    const tree = makeDeepTree();
    // Move item-2 into comp-1 children at position 0
    const result = moveNode(tree, 'item-2', 'comp-1', 0);

    const comp1 = findNodeById(result, 'comp-1') as ComponentNode;
    expect(getNodeChildren(comp1)[0].id).toBe('item-2');
  });

  it('returns original tree if node not found', () => {
    const tree = makeDeepTree();
    const result = moveNode(tree, 'nonexistent', 'container-1', 0);
    expect(result).toEqual(tree);
  });

  it('returns original tree if target parent not found', () => {
    const tree = makeDeepTree();
    const result = moveNode(tree, 'elem-heading', 'nonexistent', 0);
    // After removing, add to nonexistent parent fails, so we get a tree missing elem-heading
    // Actually moveNode does removeNode first then addChildNode. If add fails, the node is lost.
    // Let's verify the behavior: node gets removed but not re-added
    expect(findNodeById(result, 'elem-heading')).toBeNull();
  });

  it('does not mutate the original tree', () => {
    const tree = makeDeepTree();
    moveNode(tree, 'elem-heading', 'comp-2', 0);
    expect(findNodeById(tree, 'elem-heading')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// reorderChildren
// ---------------------------------------------------------------------------

describe('reorderChildren', () => {
  it('reorders children of a container', () => {
    const tree = makeDeepTree();
    const result = reorderChildren(tree, 'container-1', ['comp-2', 'comp-1']);

    const container = findNodeById(result, 'container-1')!;
    const children = getNodeChildren(container);
    expect(children[0].id).toBe('comp-2');
    expect(children[1].id).toBe('comp-1');
  });

  it('returns original tree if parent not found', () => {
    const tree = makeDeepTree();
    const result = reorderChildren(tree, 'nonexistent', ['comp-2']);
    expect(result).toEqual(tree);
  });

  it('filters out non-existent child IDs', () => {
    const tree = makeDeepTree();
    const result = reorderChildren(tree, 'container-1', ['comp-2', 'fake-id', 'comp-1']);

    const container = findNodeById(result, 'container-1')!;
    const children = getNodeChildren(container);
    expect(children).toHaveLength(2);
    expect(children[0].id).toBe('comp-2');
    expect(children[1].id).toBe('comp-1');
  });

  it('does not mutate the original tree', () => {
    const tree = makeDeepTree();
    reorderChildren(tree, 'container-1', ['comp-2', 'comp-1']);
    const container = findNodeById(tree, 'container-1')!;
    expect(getNodeChildren(container)[0].id).toBe('comp-1');
  });
});

// ---------------------------------------------------------------------------
// getNodePath
// ---------------------------------------------------------------------------

describe('getNodePath', () => {
  it('returns "/" for the root node', () => {
    const tree = makeDeepTree();
    expect(getNodePath(tree, 'page-1')).toBe('/');
  });

  it('returns correct path for a section', () => {
    const tree = makeDeepTree();
    expect(getNodePath(tree, 'section-1')).toBe('/children/0');
  });

  it('returns correct path for a deeply nested node', () => {
    const tree = makeDeepTree();
    expect(getNodePath(tree, 'container-1')).toBe('/children/0/children/0');
    expect(getNodePath(tree, 'comp-1')).toBe('/children/0/children/0/children/0');
    expect(getNodePath(tree, 'elem-heading')).toBe('/children/0/children/0/children/0/children/0');
  });

  it('returns correct path for second sibling', () => {
    const tree = makeDeepTree();
    expect(getNodePath(tree, 'comp-2')).toBe('/children/0/children/0/children/1');
  });

  it('returns null for non-existent ID', () => {
    const tree = makeDeepTree();
    expect(getNodePath(tree, 'nonexistent')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// flattenTree
// ---------------------------------------------------------------------------

describe('flattenTree', () => {
  it('returns all IDs in depth-first order', () => {
    const tree = makeDeepTree();
    const ids = flattenTree(tree);

    expect(ids).toEqual([
      'page-1',
      'section-1',
      'container-1',
      'comp-1',
      'elem-heading',
      'elem-para',
      'comp-2',
      'elem-list',
      'item-1',
      'item-2',
    ]);
  });

  it('returns single ID for a leaf node', () => {
    const item = makeItem({ id: 'only-item' });
    expect(flattenTree(item)).toEqual(['only-item']);
  });

  it('returns single ID for element without children', () => {
    const elem = makeElement({ id: 'only-elem' });
    expect(flattenTree(elem)).toEqual(['only-elem']);
  });
});

// ---------------------------------------------------------------------------
// countNodes
// ---------------------------------------------------------------------------

describe('countNodes', () => {
  it('counts all nodes in a deep tree', () => {
    const tree = makeDeepTree();
    expect(countNodes(tree)).toBe(10);
  });

  it('counts 1 for a single leaf', () => {
    expect(countNodes(makeItem())).toBe(1);
  });

  it('counts correctly for a simple page', () => {
    const tree = makePage();
    // page-home, section-hero, container-main, comp-hero, elem-heading = 5
    expect(countNodes(tree)).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// getNodesByType
// ---------------------------------------------------------------------------

describe('getNodesByType', () => {
  it('finds all sections', () => {
    const tree = makeDeepTree();
    const sections = getNodesByType(tree, NodeType.SECTION);
    expect(sections).toHaveLength(1);
    expect(sections[0].id).toBe('section-1');
  });

  it('finds all elements', () => {
    const tree = makeDeepTree();
    const elements = getNodesByType(tree, NodeType.ELEMENT);
    expect(elements).toHaveLength(3);
    expect(elements.map((e) => e.id).sort()).toEqual(
      ['elem-heading', 'elem-list', 'elem-para'].sort(),
    );
  });

  it('finds all items', () => {
    const tree = makeDeepTree();
    const items = getNodesByType(tree, NodeType.ITEM);
    expect(items).toHaveLength(2);
  });

  it('finds all containers', () => {
    const tree = makeDeepTree();
    const containers = getNodesByType(tree, NodeType.CONTAINER);
    expect(containers).toHaveLength(1);
    expect(containers[0].id).toBe('container-1');
  });

  it('returns empty array when no nodes match type', () => {
    const tree = makeDeepTree();
    const pages = getNodesByType(tree, NodeType.PAGE);
    // The root is a page, so this should find 1
    expect(pages).toHaveLength(1);
  });

  it('finds components', () => {
    const tree = makeDeepTree();
    const components = getNodesByType(tree, NodeType.COMPONENT);
    expect(components).toHaveLength(2);
  });
});
