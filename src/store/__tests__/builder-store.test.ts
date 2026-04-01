import { describe, it, expect, beforeEach } from 'vitest';
import { useBuilderStore } from '../builder-store';
import type {
  PageNode,
  SectionNode,
  ContainerNode,
  ComponentNode,
  ElementNode,
  ItemNode,
} from '@/types/dom-tree';
import { NodeType, SemanticTag } from '@/types/enums';
import type { Styleguide } from '@/types/styleguide';
import type { GlobalSection } from '@/types/project';

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

function createSampleTree(): PageNode {
  const itemNode = createItemNode({ id: 'item-1', content: 'Hello World' });
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

function createSampleStyleguide(): Styleguide {
  return {
    id: 'sg-1',
    projectId: 'proj-1',
    name: 'Default',
    colors: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
      textMuted: '#64748b',
      border: '#e2e8f0',
      error: '#ef4444',
      success: '#22c55e',
      warning: '#f97316',
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      monoFont: 'Fira Code',
      fontSizes: { sm: '14px', base: '16px', lg: '18px' },
      fontWeights: { normal: '400', bold: '700' },
    },
    spacing: { values: { sm: '8px', md: '16px', lg: '24px' } },
    componentVariants: [],
    cssVariables: { '--radius': '8px' },
  };
}

function createSampleGlobalSection(): GlobalSection {
  return {
    id: 'gs-1',
    projectId: 'proj-1',
    sectionType: 'header',
    sectionName: 'Main Header',
    treeData: createSectionNode({ id: 'gs-sec-1', tag: SemanticTag.HEADER }),
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };
}

// ===========================================
// RESET HELPER
// ===========================================

function resetStore(tree?: PageNode) {
  useBuilderStore.setState({
    currentPageId: tree ? 'page-1' : null,
    tree: tree ?? null,
    isDirty: false,
    lastSavedAt: null,
    selectedNodeId: null,
    hoveredNodeId: null,
    activeStyleguide: null,
    globalSections: [],
    leftPanelOpen: true,
    rightPanelOpen: true,
    activePanel: 'layers',
    isDragging: false,
    showAI: false,
    zoom: 100,
    dragNodeId: null,
    dragNodeType: null,
    dropTargetId: null,
    dropPosition: null,
  });
  // Clear temporal history
  useBuilderStore.temporal.getState().clear();
}

// ===========================================
// TREE SLICE TESTS
// ===========================================

describe('BuilderStore - Tree Slice', () => {
  beforeEach(() => {
    resetStore(createSampleTree());
  });

  it('loadTree loads a page tree and resets dirty flag', () => {
    const newTree = createSampleTree();
    newTree.id = 'page-2';
    newTree.meta.title = 'Second Page';

    useBuilderStore.getState().loadTree('page-2', newTree);

    const state = useBuilderStore.getState();
    expect(state.currentPageId).toBe('page-2');
    expect(state.tree).not.toBeNull();
    expect(state.tree!.meta.title).toBe('Second Page');
    expect(state.isDirty).toBe(false);
    expect(state.lastSavedAt).not.toBeNull();
  });

  it('resetTree clears all tree state', () => {
    useBuilderStore.getState().resetTree();

    const state = useBuilderStore.getState();
    expect(state.currentPageId).toBeNull();
    expect(state.tree).toBeNull();
    expect(state.isDirty).toBe(false);
    expect(state.lastSavedAt).toBeNull();
  });

  it('addNode appends a section to the page', () => {
    const newSection = createSectionNode({ id: 'sec-new', tag: SemanticTag.HEADER });

    useBuilderStore.getState().addNode('page-1', newSection);

    const tree = useBuilderStore.getState().tree!;
    expect(tree.children).toHaveLength(2);
    expect(tree.children[1].id).toBe('sec-new');
    expect(useBuilderStore.getState().isDirty).toBe(true);
  });

  it('addNode inserts a node at a specific position', () => {
    const newSection = createSectionNode({ id: 'sec-new' });

    useBuilderStore.getState().addNode('page-1', newSection, 0);

    const tree = useBuilderStore.getState().tree!;
    expect(tree.children).toHaveLength(2);
    expect(tree.children[0].id).toBe('sec-new');
  });

  it('addNode adds a container into a section', () => {
    const newContainer = createContainerNode({ id: 'cont-new' });

    useBuilderStore.getState().addNode('sec-1', newContainer);

    const tree = useBuilderStore.getState().tree!;
    const section = tree.children[0];
    expect(section.children).toHaveLength(2);
    expect(section.children[1].id).toBe('cont-new');
  });

  it('removeNode removes a node from the tree', () => {
    useBuilderStore.getState().removeNode('cont-1');

    const tree = useBuilderStore.getState().tree!;
    const section = tree.children[0];
    expect(section.children).toHaveLength(0);
    expect(useBuilderStore.getState().isDirty).toBe(true);
  });

  it('removeNode on non-existent node does not crash', () => {
    const treeBefore = useBuilderStore.getState().tree!;

    useBuilderStore.getState().removeNode('nonexistent');

    const treeAfter = useBuilderStore.getState().tree!;
    expect(treeAfter.children).toHaveLength(treeBefore.children.length);
  });

  it('updateNode updates node properties', () => {
    useBuilderStore.getState().updateNode('elem-1', { content: 'Updated Title' });

    const tree = useBuilderStore.getState().tree!;
    // page -> sec-1 -> cont-1 -> comp-1 -> elem-1
    const elem = tree.children[0].children[0].children[0].children[0];
    expect(elem).toBeDefined();
    expect((elem as ElementNode).content).toBe('Updated Title');
    expect(useBuilderStore.getState().isDirty).toBe(true);
  });

  it('updateNode on non-existent node does not crash', () => {
    const treeBefore = useBuilderStore.getState().tree!;

    useBuilderStore.getState().updateNode('nonexistent', { content: 'noop' });

    // Tree should still be the same (root unchanged at minimum)
    expect(useBuilderStore.getState().tree!.id).toBe(treeBefore.id);
  });

  it('moveNode moves a node to a different parent', () => {
    // Add a second section to move the container into
    const secondSection = createSectionNode({ id: 'sec-2', children: [] });
    useBuilderStore.getState().addNode('page-1', secondSection);

    // Move cont-1 from sec-1 to sec-2
    useBuilderStore.getState().moveNode('cont-1', 'sec-2', 0);

    const tree = useBuilderStore.getState().tree!;
    expect(tree.children[0].children).toHaveLength(0); // sec-1 now empty
    expect(tree.children[1].children).toHaveLength(1); // sec-2 has cont-1
    expect(tree.children[1].children[0].id).toBe('cont-1');
  });

  it('duplicateNode clones a node next to its sibling', () => {
    useBuilderStore.getState().duplicateNode('sec-1');

    const tree = useBuilderStore.getState().tree!;
    expect(tree.children).toHaveLength(2);
    // The original should still be at index 0
    expect(tree.children[0].id).toBe('sec-1');
    // The clone should have a different id
    expect(tree.children[1].id).not.toBe('sec-1');
  });

  it('duplicateNode on non-existent node does nothing', () => {
    useBuilderStore.getState().duplicateNode('nonexistent');

    const tree = useBuilderStore.getState().tree!;
    expect(tree.children).toHaveLength(1);
  });

  it('replaceNode replaces a node entirely', () => {
    const replacement = createSectionNode({ id: 'sec-1', tag: SemanticTag.HEADER });

    useBuilderStore.getState().replaceNode('sec-1', replacement);

    const tree = useBuilderStore.getState().tree!;
    expect(tree.children[0].tag).toBe(SemanticTag.HEADER);
  });

  it('reorderChildren changes child order', () => {
    // Add a second section so we can reorder
    const secondSection = createSectionNode({ id: 'sec-2' });
    useBuilderStore.getState().addNode('page-1', secondSection);

    // Reverse the order
    useBuilderStore.getState().reorderChildren('page-1', ['sec-2', 'sec-1']);

    const tree = useBuilderStore.getState().tree!;
    expect(tree.children[0].id).toBe('sec-2');
    expect(tree.children[1].id).toBe('sec-1');
  });

  it('markSaved clears isDirty and sets lastSavedAt', () => {
    // Make dirty first
    useBuilderStore.getState().addNode('page-1', createSectionNode({ id: 'sec-new' }));
    expect(useBuilderStore.getState().isDirty).toBe(true);

    useBuilderStore.getState().markSaved();

    const state = useBuilderStore.getState();
    expect(state.isDirty).toBe(false);
    expect(state.lastSavedAt).not.toBeNull();
  });
});

// ===========================================
// SELECTION SLICE TESTS
// ===========================================

describe('BuilderStore - Selection Slice', () => {
  beforeEach(() => {
    resetStore(createSampleTree());
  });

  it('selectNode sets selectedNodeId', () => {
    useBuilderStore.getState().selectNode('sec-1');

    expect(useBuilderStore.getState().selectedNodeId).toBe('sec-1');
  });

  it('selectNode with null clears selection', () => {
    useBuilderStore.getState().selectNode('sec-1');
    useBuilderStore.getState().selectNode(null);

    expect(useBuilderStore.getState().selectedNodeId).toBeNull();
  });

  it('hoverNode sets hoveredNodeId', () => {
    useBuilderStore.getState().hoverNode('cont-1');

    expect(useBuilderStore.getState().hoveredNodeId).toBe('cont-1');
  });

  it('clearSelection resets both selectedNodeId and hoveredNodeId', () => {
    useBuilderStore.getState().selectNode('sec-1');
    useBuilderStore.getState().hoverNode('cont-1');

    useBuilderStore.getState().clearSelection();

    expect(useBuilderStore.getState().selectedNodeId).toBeNull();
    expect(useBuilderStore.getState().hoveredNodeId).toBeNull();
  });
});

// ===========================================
// STYLEGUIDE SLICE TESTS
// ===========================================

describe('BuilderStore - Styleguide Slice', () => {
  beforeEach(() => {
    resetStore(createSampleTree());
  });

  it('loadStyleguide loads a styleguide into the store', () => {
    const sg = createSampleStyleguide();
    useBuilderStore.getState().loadStyleguide(sg);

    expect(useBuilderStore.getState().activeStyleguide).not.toBeNull();
    expect(useBuilderStore.getState().activeStyleguide!.name).toBe('Default');
  });

  it('updateColors merges color values', () => {
    const sg = createSampleStyleguide();
    useBuilderStore.getState().loadStyleguide(sg);

    useBuilderStore.getState().updateColors({ primary: '#ff0000' });

    expect(useBuilderStore.getState().activeStyleguide!.colors.primary).toBe('#ff0000');
    // Other colors preserved
    expect(useBuilderStore.getState().activeStyleguide!.colors.secondary).toBe('#6366f1');
  });

  it('updateTypography merges typography values', () => {
    const sg = createSampleStyleguide();
    useBuilderStore.getState().loadStyleguide(sg);

    useBuilderStore.getState().updateTypography({ headingFont: 'Roboto' });

    expect(useBuilderStore.getState().activeStyleguide!.typography.headingFont).toBe('Roboto');
    expect(useBuilderStore.getState().activeStyleguide!.typography.bodyFont).toBe('Inter');
  });

  it('updateCSSVariables merges CSS variables', () => {
    const sg = createSampleStyleguide();
    useBuilderStore.getState().loadStyleguide(sg);

    useBuilderStore.getState().updateCSSVariables({ '--new-var': '10px' });

    expect(useBuilderStore.getState().activeStyleguide!.cssVariables['--new-var']).toBe('10px');
    expect(useBuilderStore.getState().activeStyleguide!.cssVariables['--radius']).toBe('8px');
  });

  it('clearStyleguide removes the active styleguide', () => {
    const sg = createSampleStyleguide();
    useBuilderStore.getState().loadStyleguide(sg);

    useBuilderStore.getState().clearStyleguide();

    expect(useBuilderStore.getState().activeStyleguide).toBeNull();
  });

  it('updateColors when no styleguide loaded does nothing harmful', () => {
    useBuilderStore.getState().updateColors({ primary: '#ff0000' });

    expect(useBuilderStore.getState().activeStyleguide).toBeNull();
  });
});

// ===========================================
// GLOBAL SECTIONS SLICE TESTS
// ===========================================

describe('BuilderStore - Global Sections Slice', () => {
  beforeEach(() => {
    resetStore(createSampleTree());
  });

  it('setGlobalSections stores global sections', () => {
    const gs = createSampleGlobalSection();
    useBuilderStore.getState().setGlobalSections([gs]);

    expect(useBuilderStore.getState().globalSections).toHaveLength(1);
    expect(useBuilderStore.getState().globalSections[0].id).toBe('gs-1');
  });

  it('setGlobalSections replaces existing sections', () => {
    const gs1 = createSampleGlobalSection();
    const gs2 = { ...createSampleGlobalSection(), id: 'gs-2', sectionName: 'Footer' };
    useBuilderStore.getState().setGlobalSections([gs1]);
    useBuilderStore.getState().setGlobalSections([gs2]);

    expect(useBuilderStore.getState().globalSections).toHaveLength(1);
    expect(useBuilderStore.getState().globalSections[0].id).toBe('gs-2');
  });

  it('setGlobalSections with empty array clears sections', () => {
    const gs = createSampleGlobalSection();
    useBuilderStore.getState().setGlobalSections([gs]);
    useBuilderStore.getState().setGlobalSections([]);

    expect(useBuilderStore.getState().globalSections).toHaveLength(0);
  });
});

// ===========================================
// UI SLICE TESTS
// ===========================================

describe('BuilderStore - UI Slice', () => {
  beforeEach(() => {
    resetStore(createSampleTree());
  });

  it('toggleLeftPanel flips the state', () => {
    expect(useBuilderStore.getState().leftPanelOpen).toBe(true);
    useBuilderStore.getState().toggleLeftPanel();
    expect(useBuilderStore.getState().leftPanelOpen).toBe(false);
    useBuilderStore.getState().toggleLeftPanel();
    expect(useBuilderStore.getState().leftPanelOpen).toBe(true);
  });

  it('toggleRightPanel flips the state', () => {
    expect(useBuilderStore.getState().rightPanelOpen).toBe(true);
    useBuilderStore.getState().toggleRightPanel();
    expect(useBuilderStore.getState().rightPanelOpen).toBe(false);
  });

  it('setActivePanel changes active panel', () => {
    useBuilderStore.getState().setActivePanel('pages');
    expect(useBuilderStore.getState().activePanel).toBe('pages');
  });

  it('setDragging sets isDragging', () => {
    useBuilderStore.getState().setDragging(true);
    expect(useBuilderStore.getState().isDragging).toBe(true);
  });

  it('toggleAI flips showAI', () => {
    expect(useBuilderStore.getState().showAI).toBe(false);
    useBuilderStore.getState().toggleAI();
    expect(useBuilderStore.getState().showAI).toBe(true);
  });

  it('setZoom clamps between 25 and 200', () => {
    useBuilderStore.getState().setZoom(150);
    expect(useBuilderStore.getState().zoom).toBe(150);

    useBuilderStore.getState().setZoom(10);
    expect(useBuilderStore.getState().zoom).toBe(25);

    useBuilderStore.getState().setZoom(300);
    expect(useBuilderStore.getState().zoom).toBe(200);
  });
});

// ===========================================
// DRAG SLICE TESTS
// ===========================================

describe('BuilderStore - Drag Slice', () => {
  beforeEach(() => {
    resetStore(createSampleTree());
  });

  it('startDrag sets dragNodeId and dragNodeType', () => {
    useBuilderStore.getState().startDrag('sec-1', NodeType.SECTION);

    const state = useBuilderStore.getState();
    expect(state.dragNodeId).toBe('sec-1');
    expect(state.dragNodeType).toBe(NodeType.SECTION);
  });

  it('setDropTarget sets target and position', () => {
    useBuilderStore.getState().setDropTarget('page-1', 2);

    const state = useBuilderStore.getState();
    expect(state.dropTargetId).toBe('page-1');
    expect(state.dropPosition).toBe(2);
  });

  it('endDrag clears all drag state', () => {
    useBuilderStore.getState().startDrag('sec-1', NodeType.SECTION);
    useBuilderStore.getState().setDropTarget('page-1', 0);
    useBuilderStore.getState().endDrag();

    const state = useBuilderStore.getState();
    expect(state.dragNodeId).toBeNull();
    expect(state.dragNodeType).toBeNull();
    expect(state.dropTargetId).toBeNull();
    expect(state.dropPosition).toBeNull();
  });
});

// ===========================================
// UNDO/REDO TESTS
// ===========================================

describe('BuilderStore - Undo/Redo', () => {
  beforeEach(() => {
    resetStore(createSampleTree());
  });

  it('can undo an addNode operation', async () => {
    const originalChildCount = useBuilderStore.getState().tree!.children.length;

    useBuilderStore.getState().addNode('page-1', createSectionNode({ id: 'sec-new' }));
    expect(useBuilderStore.getState().tree!.children).toHaveLength(originalChildCount + 1);

    // Wait for temporal debounce (300ms) then undo
    await new Promise((r) => setTimeout(r, 400));
    useBuilderStore.temporal.getState().undo();

    expect(useBuilderStore.getState().tree!.children).toHaveLength(originalChildCount);
  });

  it('can redo an undone operation', async () => {
    const originalChildCount = useBuilderStore.getState().tree!.children.length;

    useBuilderStore.getState().addNode('page-1', createSectionNode({ id: 'sec-new' }));

    await new Promise((r) => setTimeout(r, 400));
    useBuilderStore.temporal.getState().undo();
    expect(useBuilderStore.getState().tree!.children).toHaveLength(originalChildCount);

    useBuilderStore.temporal.getState().redo();
    expect(useBuilderStore.getState().tree!.children).toHaveLength(originalChildCount + 1);
  });

  it('can undo a removeNode operation', async () => {
    const originalChildCount = useBuilderStore.getState().tree!.children.length;

    useBuilderStore.getState().removeNode('sec-1');
    expect(useBuilderStore.getState().tree!.children).toHaveLength(originalChildCount - 1);

    await new Promise((r) => setTimeout(r, 400));
    useBuilderStore.temporal.getState().undo();

    expect(useBuilderStore.getState().tree!.children).toHaveLength(originalChildCount);
    expect(useBuilderStore.getState().tree!.children[0].id).toBe('sec-1');
  });

  it('can undo an updateNode operation', async () => {
    useBuilderStore.getState().updateNode('elem-1', { content: 'Changed' });
    const tree = useBuilderStore.getState().tree!;
    const elem = tree.children[0].children[0].children[0].children[0] as ElementNode;
    expect(elem.content).toBe('Changed');

    await new Promise((r) => setTimeout(r, 400));
    useBuilderStore.temporal.getState().undo();

    const treeAfterUndo = useBuilderStore.getState().tree!;
    const elemAfterUndo = treeAfterUndo.children[0].children[0].children[0].children[0] as ElementNode;
    expect(elemAfterUndo.content).toBe('Title');
  });
});
