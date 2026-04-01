import { describe, it, expect } from 'vitest';
import { NodeType, SemanticTag } from '@/types/enums';
import type {
  PageNode,
  SectionNode,
  ContainerNode,
  ComponentNode,
  ElementNode,
  NodeMeta,
} from '@/types/dom-tree';
import { validateSemanticHTML } from '../html-validator';

// ---- Helpers ----

const nodeMeta: NodeMeta = {
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function makeElementNode(
  overrides: Partial<ElementNode> & { id: string; tag: ElementNode['tag'] },
): ElementNode {
  return {
    type: NodeType.ELEMENT,
    className: '',
    meta: nodeMeta,
    ...overrides,
  } as ElementNode;
}

function makeComponentNode(
  overrides: Partial<ComponentNode> & { id: string },
  children: ElementNode[] = [],
): ComponentNode {
  return {
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: '',
    meta: nodeMeta,
    children,
    ...overrides,
  } as ComponentNode;
}

function makeContainerNode(
  overrides: Partial<ContainerNode> & { id: string },
  children: ComponentNode[] = [],
): ContainerNode {
  return {
    type: NodeType.CONTAINER,
    tag: SemanticTag.DIV,
    className: '',
    meta: nodeMeta,
    children,
    layout: {},
    ...overrides,
  } as ContainerNode;
}

function makeSectionNode(
  overrides: Partial<SectionNode> & { id: string },
  children: ContainerNode[] = [],
): SectionNode {
  return {
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: '',
    meta: { ...nodeMeta },
    children,
    layout: {},
    ...overrides,
  } as SectionNode;
}

function makePageNode(
  overrides: Partial<PageNode> & { id: string },
  children: SectionNode[] = [],
): PageNode {
  return {
    type: NodeType.PAGE,
    tag: SemanticTag.MAIN,
    className: '',
    meta: {
      ...nodeMeta,
      title: 'Test Page',
      slug: 'test-page',
    },
    styleguideId: 'sg-1',
    globalSectionIds: [],
    children,
    ...overrides,
  } as PageNode;
}

// ---- Tests ----

describe('validateSemanticHTML', () => {
  // Rule 1: Section without heading -> warning
  it('reports a warning when a section has no heading', () => {
    const p = makeElementNode({ id: 'p-1', tag: SemanticTag.P, content: 'Some text' });
    const comp = makeComponentNode({ id: 'comp-1' }, [p]);
    const container = makeContainerNode({ id: 'cnt-1' }, [comp]);
    const section = makeSectionNode({ id: 'sec-1', tag: SemanticTag.SECTION }, [container]);
    const page = makePageNode({ id: 'page-1' }, [section]);

    const issues = validateSemanticHTML(page);

    const sectionIssue = issues.find(
      (i) => i.message.includes('<section>') && i.message.includes('heading'),
    );
    expect(sectionIssue).toBeDefined();
    expect(sectionIssue?.severity).toBe('warning');
    expect(sectionIssue?.category).toBe('semantic-html');
  });

  it('does not report a warning when a section has a heading', () => {
    const h2 = makeElementNode({ id: 'h2-1', tag: SemanticTag.H2, content: 'Section Title' });
    const comp = makeComponentNode({ id: 'comp-1' }, [h2]);
    const container = makeContainerNode({ id: 'cnt-1' }, [comp]);
    const section = makeSectionNode({ id: 'sec-1', tag: SemanticTag.SECTION }, [container]);
    const page = makePageNode({ id: 'page-1' }, [section]);

    const issues = validateSemanticHTML(page);

    const sectionIssue = issues.find(
      (i) => i.nodeId === 'sec-1' && i.message.includes('<section>') && i.message.includes('heading'),
    );
    expect(sectionIssue).toBeUndefined();
  });

  // Rule 2: Article without heading -> warning
  it('reports a warning when an article has no heading', () => {
    const p = makeElementNode({ id: 'p-1', tag: SemanticTag.P, content: 'Article body' });
    const article = makeComponentNode({ id: 'comp-1', tag: SemanticTag.ARTICLE }, [p]);
    const container = makeContainerNode({ id: 'cnt-1' }, [article]);
    const section = makeSectionNode({ id: 'sec-1', tag: SemanticTag.SECTION }, [container]);
    const page = makePageNode({ id: 'page-1' }, [section]);

    const issues = validateSemanticHTML(page);

    const articleIssue = issues.find(
      (i) => i.message.includes('<article>') && i.message.includes('heading'),
    );
    expect(articleIssue).toBeDefined();
    expect(articleIssue?.severity).toBe('warning');
  });

  it('does not report a warning when an article has a heading', () => {
    const h2 = makeElementNode({ id: 'h2-1', tag: SemanticTag.H2, content: 'Article Title' });
    const p = makeElementNode({ id: 'p-1', tag: SemanticTag.P, content: 'Article body' });
    const article = makeComponentNode({ id: 'comp-1', tag: SemanticTag.ARTICLE }, [h2, p]);
    const container = makeContainerNode({ id: 'cnt-1' }, [article]);
    const section = makeSectionNode({ id: 'sec-1', tag: SemanticTag.SECTION }, [container]);
    const page = makePageNode({ id: 'page-1' }, [section]);

    const issues = validateSemanticHTML(page);

    const articleIssue = issues.find(
      (i) => i.nodeId === 'comp-1' && i.message.includes('<article>'),
    );
    expect(articleIssue).toBeUndefined();
  });

  // Rule 3: Nav without links -> warning
  it('reports a warning when a nav has no links', () => {
    const p = makeElementNode({ id: 'p-1', tag: SemanticTag.P, content: 'Navigation text' });
    const comp = makeComponentNode({ id: 'comp-1' }, [p]);
    const container = makeContainerNode({ id: 'cnt-1' }, [comp]);
    const nav = makeSectionNode({ id: 'nav-1', tag: SemanticTag.NAV }, [container]);
    const page = makePageNode({ id: 'page-1' }, [nav]);

    const issues = validateSemanticHTML(page);

    const navIssue = issues.find(
      (i) => i.message.includes('<nav>') && i.message.includes('link'),
    );
    expect(navIssue).toBeDefined();
    expect(navIssue?.severity).toBe('warning');
  });

  it('does not report a warning when a nav contains links', () => {
    const link = makeElementNode({ id: 'a-1', tag: SemanticTag.A, content: 'Home', href: '/' });
    const comp = makeComponentNode({ id: 'comp-1' }, [link]);
    const container = makeContainerNode({ id: 'cnt-1' }, [comp]);
    const nav = makeSectionNode({ id: 'nav-1', tag: SemanticTag.NAV }, [container]);
    const page = makePageNode({ id: 'page-1' }, [nav]);

    const issues = validateSemanticHTML(page);

    const navIssue = issues.find(
      (i) => i.nodeId === 'nav-1' && i.message.includes('<nav>'),
    );
    expect(navIssue).toBeUndefined();
  });

  // Rule 4: Aside outside main/article -> warning
  it('reports a warning when aside is not inside main or article', () => {
    // Create a page whose root tag is NOT main, and place an aside section outside main
    const p = makeElementNode({ id: 'p-1', tag: SemanticTag.P, content: 'Sidebar content' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const comp = makeComponentNode({ id: 'comp-1', tag: SemanticTag.ASIDE } as any, [p]);
    const container = makeContainerNode({ id: 'cnt-1' }, [comp]);
    const section = makeSectionNode({ id: 'sec-1', tag: SemanticTag.SECTION }, [container]);
    const issues = validateSemanticHTML(section);

    const asideIssue = issues.find(
      (i) => i.message.includes('<aside>') && i.message.includes('not inside'),
    );
    expect(asideIssue).toBeDefined();
    expect(asideIssue?.severity).toBe('warning');
  });

  it('does not report a warning when aside is inside main', () => {
    const p = makeElementNode({ id: 'p-1', tag: SemanticTag.P, content: 'Sidebar' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const comp = makeComponentNode({ id: 'comp-1', tag: SemanticTag.ASIDE } as any, [p]);
    const container = makeContainerNode({ id: 'cnt-1' }, [comp]);
    const section = makeSectionNode({ id: 'sec-1', tag: SemanticTag.SECTION }, [container]);
    // PageNode has tag SemanticTag.MAIN, so aside is inside main
    const page = makePageNode({ id: 'page-1' }, [section]);

    const issues = validateSemanticHTML(page);

    const asideIssue = issues.find(
      (i) => i.message.includes('<aside>') && i.message.includes('not inside'),
    );
    expect(asideIssue).toBeUndefined();
  });

  // Rule 5: Nested header -> error
  it('reports an error when a header contains a nested header', () => {
    // Create inner header as a section with tag HEADER
    const innerP = makeElementNode({ id: 'p-inner', tag: SemanticTag.P, content: 'Inner' });
    const innerComp = makeComponentNode({ id: 'comp-inner' }, [innerP]);
    const innerContainer = makeContainerNode({ id: 'cnt-inner' }, [innerComp]);
    const innerHeader = makeSectionNode(
      { id: 'header-inner', tag: SemanticTag.HEADER },
      [innerContainer],
    );

    // Outer header wrapping inner header
    const outerContainer = makeContainerNode({ id: 'cnt-outer' }, []);
    // We need the inner header to be a child of the outer header.
    // But SectionNode children are ContainerNode[], not SectionNode[].
    // So we'll place innerHeader inside a container by validating the outer header directly.
    const outerHeader = makeSectionNode(
      { id: 'header-outer', tag: SemanticTag.HEADER },
      [outerContainer, innerContainer],
    );
    // Manually add the inner header section to the outer header's children array
    // by creating a mixed array — this is for testing the validator, not type safety
    (outerHeader.children as unknown as SectionNode[]).push(innerHeader);

    const issues = validateSemanticHTML(outerHeader);

    const nestedHeaderIssue = issues.find(
      (i) => i.message.includes('nested <header>'),
    );
    expect(nestedHeaderIssue).toBeDefined();
    expect(nestedHeaderIssue?.severity).toBe('error');
  });

  it('does not report an error when header has no nested header', () => {
    const h1 = makeElementNode({ id: 'h1-1', tag: SemanticTag.H1, content: 'Site Title' });
    const comp = makeComponentNode({ id: 'comp-1' }, [h1]);
    const container = makeContainerNode({ id: 'cnt-1' }, [comp]);
    const header = makeSectionNode({ id: 'header-1', tag: SemanticTag.HEADER }, [container]);
    const page = makePageNode({ id: 'page-1' }, [header]);

    const issues = validateSemanticHTML(page);

    const nestedIssue = issues.find(
      (i) => i.nodeId === 'header-1' && i.message.includes('nested <header>'),
    );
    expect(nestedIssue).toBeUndefined();
  });

  // Rule 6: Nested footer -> error
  it('reports an error when a footer contains a nested footer', () => {
    const innerP = makeElementNode({ id: 'p-inner', tag: SemanticTag.P, content: 'Inner' });
    const innerComp = makeComponentNode({ id: 'comp-inner' }, [innerP]);
    const innerContainer = makeContainerNode({ id: 'cnt-inner' }, [innerComp]);
    const innerFooter = makeSectionNode(
      { id: 'footer-inner', tag: SemanticTag.FOOTER },
      [innerContainer],
    );

    const outerContainer = makeContainerNode({ id: 'cnt-outer' }, []);
    const outerFooter = makeSectionNode(
      { id: 'footer-outer', tag: SemanticTag.FOOTER },
      [outerContainer],
    );
    (outerFooter.children as unknown as SectionNode[]).push(innerFooter);

    const issues = validateSemanticHTML(outerFooter);

    const nestedFooterIssue = issues.find(
      (i) => i.message.includes('nested <footer>'),
    );
    expect(nestedFooterIssue).toBeDefined();
    expect(nestedFooterIssue?.severity).toBe('error');
  });

  it('does not report an error when footer has no nested footer', () => {
    const p = makeElementNode({ id: 'p-1', tag: SemanticTag.P, content: 'Footer text' });
    const comp = makeComponentNode({ id: 'comp-1' }, [p]);
    const container = makeContainerNode({ id: 'cnt-1' }, [comp]);
    const footer = makeSectionNode({ id: 'footer-1', tag: SemanticTag.FOOTER }, [container]);
    const page = makePageNode({ id: 'page-1' }, [footer]);

    const issues = validateSemanticHTML(page);

    const nestedIssue = issues.find(
      (i) => i.nodeId === 'footer-1' && i.message.includes('nested <footer>'),
    );
    expect(nestedIssue).toBeUndefined();
  });

  // Rule 7: Multiple main elements -> error
  it('reports an error when multiple main elements exist', () => {
    const p1 = makeElementNode({ id: 'p-1', tag: SemanticTag.P, content: 'Main 1' });
    const comp1 = makeComponentNode({ id: 'comp-1' }, [p1]);
    const cnt1 = makeContainerNode({ id: 'cnt-1' }, [comp1]);
    const sec1 = makeSectionNode({ id: 'sec-1', tag: SemanticTag.SECTION }, [cnt1]);

    const p2 = makeElementNode({ id: 'p-2', tag: SemanticTag.P, content: 'Main 2' });
    const comp2 = makeComponentNode({ id: 'comp-2' }, [p2]);
    const cnt2 = makeContainerNode({ id: 'cnt-2' }, [comp2]);
    makeSectionNode({ id: 'sec-2', tag: SemanticTag.SECTION }, [cnt2]);

    // PageNode root is tag=MAIN. We add a second main-tagged section as a child.
    // The validator walks all descendants counting main tags.
    // We need a second node with tag MAIN inside the tree.
    // Use a section with tag MAIN (cast since SectionNode.tag allows specific values)
    const mainSection = makeSectionNode(
      { id: 'main-2', tag: SemanticTag.MAIN as unknown as SemanticTag.SECTION },
      [cnt2],
    );
    const page = makePageNode({ id: 'page-1' }, [sec1, mainSection]);

    const issues = validateSemanticHTML(page);

    const multiMainIssue = issues.find(
      (i) => i.message.includes('Multiple <main>'),
    );
    expect(multiMainIssue).toBeDefined();
    expect(multiMainIssue?.severity).toBe('error');
  });

  it('does not report an error when only one main element exists', () => {
    const p = makeElementNode({ id: 'p-1', tag: SemanticTag.P, content: 'Content' });
    const comp = makeComponentNode({ id: 'comp-1' }, [p]);
    const cnt = makeContainerNode({ id: 'cnt-1' }, [comp]);
    const section = makeSectionNode({ id: 'sec-1', tag: SemanticTag.SECTION }, [cnt]);
    const page = makePageNode({ id: 'page-1' }, [section]);

    const issues = validateSemanticHTML(page);

    const multiMainIssue = issues.find(
      (i) => i.message.includes('Multiple <main>'),
    );
    expect(multiMainIssue).toBeUndefined();
  });

  // Rule 8: Heading level skip -> warning
  it('reports a warning when heading levels are skipped', () => {
    const h1 = makeElementNode({ id: 'h1-1', tag: SemanticTag.H1, content: 'Title' });
    const h3 = makeElementNode({ id: 'h3-1', tag: SemanticTag.H3, content: 'Skipped' });
    const comp = makeComponentNode({ id: 'comp-1' }, [h1, h3]);
    const container = makeContainerNode({ id: 'cnt-1' }, [comp]);
    const section = makeSectionNode({ id: 'sec-1', tag: SemanticTag.SECTION }, [container]);
    const page = makePageNode({ id: 'page-1' }, [section]);

    const issues = validateSemanticHTML(page);

    const skipIssue = issues.find(
      (i) => i.message.includes('skipped') || i.message.includes('Skip'),
    );
    expect(skipIssue).toBeDefined();
    expect(skipIssue?.severity).toBe('warning');
  });

  it('does not report a warning when heading levels are sequential', () => {
    const h1 = makeElementNode({ id: 'h1-1', tag: SemanticTag.H1, content: 'Title' });
    const h2 = makeElementNode({ id: 'h2-1', tag: SemanticTag.H2, content: 'Subtitle' });
    const comp = makeComponentNode({ id: 'comp-1' }, [h1, h2]);
    const container = makeContainerNode({ id: 'cnt-1' }, [comp]);
    const section = makeSectionNode({ id: 'sec-1', tag: SemanticTag.SECTION }, [container]);
    const page = makePageNode({ id: 'page-1' }, [section]);

    const issues = validateSemanticHTML(page);

    const skipIssue = issues.find(
      (i) => i.message.includes('Heading level skipped'),
    );
    expect(skipIssue).toBeUndefined();
  });
});
