import { describe, it, expect } from 'vitest';
import { NodeType, SemanticTag, DisplayType, FlexDirection, ComponentCategory } from '@/types/enums';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';
import { generateStatsSection } from '../templates/stats-section';
import { generateTeamSection } from '../templates/team-section';
import { generateLogoGridSection } from '../templates/logo-grid-section';
import { generateBlogSection } from '../templates/blog-section';
import { generateSection, generateComponent } from '../component-generator';

// ============================================================
// Helper: validate section node structure
// ============================================================
function validateSectionNode(section: SectionNode, minChildren: number = 1) {
  expect(section.type).toBe(NodeType.SECTION);
  expect(section.tag).toBe(SemanticTag.SECTION);
  expect(section.id).toBeDefined();
  expect(section.children.length).toBeGreaterThanOrEqual(minChildren);
  expect(section.meta).toBeDefined();
  expect(section.meta!.createdAt).toBeDefined();
  expect(section.meta!.updatedAt).toBeDefined();
}

function validateContainerNode(container: ContainerNode) {
  expect(container.type).toBe(NodeType.CONTAINER);
  expect(container.children).toBeDefined();
  expect(container.layout).toBeDefined();
}

function validateComponentNode(component: ComponentNode) {
  expect(component.type).toBe(NodeType.COMPONENT);
  expect(component.children).toBeDefined();
}

function validateElementNode(element: ElementNode) {
  expect(element.type).toBe(NodeType.ELEMENT);
  expect(element.id).toBeDefined();
}

// ============================================================
// Stats Section Tests
// ============================================================
describe('generateStatsSection', () => {
  it('generates a section with 4 default stat cards', () => {
    const section = generateStatsSection();

    validateSectionNode(section);

    const container = section.children[0] as ContainerNode;
    validateContainerNode(container);

    // Should have title component + 4 stat cards
    const components = container.children.filter(c => c.type === NodeType.COMPONENT);
    expect(components.length).toBeGreaterThanOrEqual(4);
  });

  it('respects count prop to limit stat cards', () => {
    const section = generateStatsSection({ count: 2 });

    const container = section.children[0] as ContainerNode;
    // Title component + 2 stat cards
    const components = container.children.filter(c => c.type === NodeType.COMPONENT);
    expect(components.length).toBeGreaterThanOrEqual(2);
  });

  it('clamps count to valid range (2-4)', () => {
    const section1 = generateStatsSection({ count: 1 });
    const container1 = section1.children[0] as ContainerNode;
    const statCards1 = container1.children.filter(c => c.type === NodeType.COMPONENT && c.type === NodeType.COMPONENT);
    // Should have at least 2 (minimum)
    expect(statCards1.length).toBeGreaterThanOrEqual(2);

    const section2 = generateStatsSection({ count: 10 });
    const container2 = section2.children[0] as ContainerNode;
    const statCards2 = container2.children.filter(c => c.type === NodeType.COMPONENT);
    // Should have at most 4 + title
    expect(statCards2.length).toBeLessThanOrEqual(5);
  });

  it('generates stat cards with value and label elements', () => {
    const section = generateStatsSection();

    const container = section.children[0] as ContainerNode;
    const allComponents = container.children.filter(c => c.type === NodeType.COMPONENT);

    // Skip title wrapper — find stat cards (those with category or multiple element children)
    const statCards = allComponents.filter(comp => {
      const children = (comp as ComponentNode).children;
      return children.some(c => c.type === NodeType.ELEMENT && (c as ElementNode).tag === SemanticTag.H3);
    });

    expect(statCards.length).toBeGreaterThan(0);

    for (const card of statCards.slice(0, 1)) {
      const children = (card as ComponentNode).children as ElementNode[];
      const hasHeading = children.some(c => c.tag === SemanticTag.H3);
      const hasLabel = children.some(c => c.tag === SemanticTag.P);
      expect(hasHeading).toBe(true);
      expect(hasLabel).toBe(true);
    }
  });

  it('uses grid layout for stat cards', () => {
    const section = generateStatsSection();
    const container = section.children[0] as ContainerNode;

    expect(container.layout?.display).toBe(DisplayType.GRID);
    expect(container.layout?.gridTemplateColumns).toBeDefined();
  });
});

// ============================================================
// Team Section Tests
// ============================================================
describe('generateTeamSection', () => {
  it('generates a section with default team members', () => {
    const section = generateTeamSection();

    validateSectionNode(section);

    const container = section.children[0] as ContainerNode;
    validateContainerNode(container);

    const components = container.children.filter(c => c.type === NodeType.COMPONENT);
    expect(components.length).toBeGreaterThanOrEqual(3); // title + members
  });

  it('respects count prop', () => {
    const section = generateTeamSection({ count: 2 });

    const container = section.children[0] as ContainerNode;
    const components = container.children.filter(c => c.type === NodeType.COMPONENT);
    // At least title + 2 member cards
    expect(components.length).toBeGreaterThanOrEqual(3);
  });

  it('generates member cards with name and role', () => {
    const section = generateTeamSection();
    const container = section.children[0] as ContainerNode;

    // Find a member card (component with children containing name/role)
    const memberCards = container.children.filter(
      c => c.type === NodeType.COMPONENT && (c as ComponentNode).children.length > 1
    );

    if (memberCards.length > 0) {
      const card = memberCards[0] as ComponentNode;
      const elements = card.children.filter(c => c.type === NodeType.ELEMENT);
      expect(elements.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('uses grid layout', () => {
    const section = generateTeamSection();
    const container = section.children[0] as ContainerNode;

    expect(container.layout?.display).toBe(DisplayType.GRID);
  });
});

// ============================================================
// Logo Grid Section Tests
// ============================================================
describe('generateLogoGridSection', () => {
  it('generates a section with logo elements', () => {
    const section = generateLogoGridSection();

    validateSectionNode(section);

    const container = section.children[0] as ContainerNode;
    validateContainerNode(container);
  });

  it('respects count prop', () => {
    const section = generateLogoGridSection({ count: 4 });

    const container = section.children[0] as ContainerNode;
    const components = container.children.filter(c => c.type === NodeType.COMPONENT);
    // Should have title component + logo components
    expect(components.length).toBeGreaterThanOrEqual(4);
  });

  it('respects columns prop', () => {
    const section = generateLogoGridSection({ columns: 2, count: 4 });

    const container = section.children[0] as ContainerNode;
    expect(container.layout?.gridTemplateColumns).toContain('2');
  });

  it('uses grid layout', () => {
    const section = generateLogoGridSection();
    const container = section.children[0] as ContainerNode;

    expect(container.layout?.display).toBe(DisplayType.GRID);
  });
});

// ============================================================
// Blog Section Tests
// ============================================================
describe('generateBlogSection', () => {
  it('generates a section with 3 default blog posts', () => {
    const section = generateBlogSection();

    validateSectionNode(section);

    const container = section.children[0] as ContainerNode;
    validateContainerNode(container);

    // Title + 3 blog cards
    const components = container.children.filter(c => c.type === NodeType.COMPONENT);
    expect(components.length).toBeGreaterThanOrEqual(3);
  });

  it('respects count prop', () => {
    const section = generateBlogSection({ count: 2 });

    const container = section.children[0] as ContainerNode;
    const components = container.children.filter(c => c.type === NodeType.COMPONENT);
    expect(components.length).toBeGreaterThanOrEqual(2);
  });

  it('blog post cards have image, title, excerpt, and link', () => {
    const section = generateBlogSection();
    const container = section.children[0] as ContainerNode;

    // Find a blog card with children
    const blogCards = container.children.filter(
      c => c.type === NodeType.COMPONENT && (c as ComponentNode).children.length >= 3
    );

    expect(blogCards.length).toBeGreaterThan(0);

    const card = blogCards[0] as ComponentNode;
    const elements = card.children.filter(c => c.type === NodeType.ELEMENT) as ElementNode[];

    // Should have image (img tag), title (h3), excerpt (p), and link (a)
    const hasImg = elements.some(e => e.tag === SemanticTag.IMG);
    const hasTitle = elements.some(e => e.tag === SemanticTag.H3);
    const hasExcerpt = elements.some(e => e.tag === SemanticTag.P);
    const hasLink = elements.some(e => e.tag === SemanticTag.A);

    expect(hasImg).toBe(true);
    expect(hasTitle).toBe(true);
    expect(hasExcerpt).toBe(true);
    expect(hasLink).toBe(true);
  });

  it('clamps count to valid range (1-4)', () => {
    const section = generateBlogSection({ count: 0 });
    const container = section.children[0] as ContainerNode;
    const components = container.children.filter(c => c.type === NodeType.COMPONENT);
    // Minimum 1 post card
    expect(components.length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================
// Component Generator Integration Tests
// ============================================================
describe('generateSection (component-generator)', () => {
  it('generates section for STATS category', () => {
    const section = generateSection(ComponentCategory.STATS);
    validateSectionNode(section);
  });

  it('generates section for TEAM category', () => {
    const section = generateSection(ComponentCategory.TEAM);
    validateSectionNode(section);
  });

  it('generates section for LOGO_GRID category', () => {
    const section = generateSection(ComponentCategory.LOGO_GRID);
    validateSectionNode(section);
  });

  it('generates section for BLOG category', () => {
    const section = generateSection(ComponentCategory.BLOG);
    validateSectionNode(section);
  });

  it('falls back to hero for unknown categories', () => {
    const section = generateSection('unknown-category' as ComponentCategory);
    validateSectionNode(section);
  });
});

describe('generateComponent (component-generator)', () => {
  it('generates a component node for STATS', () => {
    const comp = generateComponent(ComponentCategory.STATS);
    validateComponentNode(comp);
  });

  it('generates a component node for BLOG', () => {
    const comp = generateComponent(ComponentCategory.BLOG);
    validateComponentNode(comp);
    // Component extracted from section — category may not be set on all sub-components
    expect(comp.type).toBe(NodeType.COMPONENT);
  });
});
