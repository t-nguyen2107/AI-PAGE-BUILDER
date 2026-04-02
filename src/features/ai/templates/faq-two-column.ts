import { NodeType, SemanticTag, DisplayType, FlexDirection, ComponentCategory, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode, ItemNode } from '@/types/dom-tree';

interface FaqItem {
  question: string;
  answer: string;
}

const DEFAULT_ITEMS: FaqItem[] = [
  { question: 'How does it work?', answer: 'Our platform uses AI to generate beautiful websites from simple text descriptions. Just describe what you want and we handle the rest.' },
  { question: 'Is there a free plan?', answer: 'Yes! We offer a generous free tier that includes up to 3 projects with full access to all basic features.' },
  { question: 'Can I export my website?', answer: 'Absolutely. You can export your website as clean HTML, CSS, and JavaScript files at any time.' },
  { question: 'Do you offer custom domains?', answer: 'Yes, all paid plans include custom domain support with free SSL certificates and automatic HTTPS.' },
];

/**
 * Generates a 2-column FAQ grid section.
 *
 * Props:
 *   heading?: string    - Section heading (default: "Frequently Asked Questions")
 *   subtitle?: string   - Subtitle text
 *   items?: FaqItem[]   - Array of { question, answer } objects (default: 4 items)
 */
export function generateFaqTwoColumn(props?: Record<string, unknown>): SectionNode {
  const heading = (props?.heading as string) ?? 'Frequently Asked Questions';
  const subtitle = (props?.subtitle as string) ?? 'Find answers to the most common questions about our platform and services.';
  const items = (props?.items as FaqItem[]) ?? DEFAULT_ITEMS;

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();

  // Heading element
  const headingElement: ElementNode = {
    id: generateId(),
    type: NodeType.ELEMENT,
    tag: SemanticTag.H2,
    content: heading,
    typography: {
      fontSize: '2rem',
      fontWeight: '700',
      textAlign: TextAlign.CENTER,
      color: 'var(--foreground)',
    },
    meta: { createdAt: now, updatedAt: now },
  };

  // Subtitle element
  const subtitleElement: ElementNode = {
    id: generateId(),
    type: NodeType.ELEMENT,
    tag: SemanticTag.P,
    className: 'pb-section-subtitle',
    content: subtitle,
    typography: {
      fontSize: '1.1rem',
      textAlign: TextAlign.CENTER,
      color: 'var(--muted-foreground)',
    },
    meta: { createdAt: now, updatedAt: now },
  };

  // Header component
  const headingComponent: ComponentNode = {
    id: generateId(),
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      gap: '0.5rem',
    },
    children: [headingElement, subtitleElement],
  };

  // Build FAQ components
  const faqComponents: ComponentNode[] = items.map((item) => {
    const questionElement: ElementNode = {
      id: generateId(),
      type: NodeType.ELEMENT,
      tag: SemanticTag.H3,
      content: item.question,
      typography: { fontSize: '1.125rem', fontWeight: '600', color: 'var(--foreground)' },
      meta: { createdAt: now, updatedAt: now },
    };

    const answerSpan: ItemNode = {
      id: generateId(),
      type: NodeType.ITEM,
      tag: SemanticTag.SPAN,
      content: item.answer,
      typography: { fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--muted-foreground)' },
      meta: { createdAt: now, updatedAt: now },
    };

    const answerElement: ElementNode = {
      id: generateId(),
      type: NodeType.ELEMENT,
      tag: SemanticTag.P,
      children: [answerSpan],
      meta: { createdAt: now, updatedAt: now },
    };

    return {
      id: generateId(),
      type: NodeType.COMPONENT,
      tag: SemanticTag.DIV,
      className: 'pb-faq-item',
      category: ComponentCategory.FAQ,
      meta: { createdAt: now, updatedAt: now, aiGenerated: true },
      layout: {
        display: DisplayType.FLEX,
        flexDirection: FlexDirection.COLUMN,
        gap: '0.5rem',
        padding: '1.25rem 1.5rem',
      },
      children: [questionElement, answerElement],
    };
  });

  // Heading container
  const headingContainer: ContainerNode = {
    id: containerId,
    type: NodeType.CONTAINER,
    tag: SemanticTag.DIV,
    meta: { createdAt: now, updatedAt: now },
    children: [headingComponent],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      maxWidth: '1000px',
      margin: '0 auto',
    },
  };

  // Grid container — wraps FAQ items in a 2-column grid
  const gridContainerId = generateId();
  const gridContainer: ContainerNode = {
    id: gridContainerId,
    type: NodeType.CONTAINER,
    tag: SemanticTag.DIV,
    meta: { createdAt: now, updatedAt: now },
    children: faqComponents as any,
    layout: {
      display: DisplayType.GRID,
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1.5rem',
      maxWidth: '1000px',
      margin: '0 auto',
    },
  };

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    meta: { createdAt: now, updatedAt: now, sectionName: 'FAQ Two Column', aiGenerated: true },
    children: [headingContainer, gridContainer],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      gap: '2rem',
      padding: '4rem 2rem',
    },
    background: { color: 'var(--background)' },
  };
}
