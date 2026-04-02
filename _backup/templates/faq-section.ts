import { NodeType, SemanticTag, DisplayType, FlexDirection, ComponentCategory, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode, ItemNode } from '@/types/dom-tree';

interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Generates an FAQ section with accordion-style layout.
 *
 * Props:
 *   heading?: string    - Section heading (default: "Frequently Asked Questions")
 *   items?: FaqItem[]   - Array of { question, answer } objects
 */
export function generateFaqSection(props?: Record<string, unknown>): SectionNode {
  const heading = (props?.heading as string) ?? 'Frequently Asked Questions';
  const items = (props?.items as FaqItem[]) ?? [
    { question: 'How does it work?', answer: 'Our platform uses AI to generate beautiful websites from simple text descriptions. Just describe what you want and we handle the rest.' },
    { question: 'Is there a free plan?', answer: 'Yes! We offer a generous free tier that includes up to 3 projects with full access to all basic features.' },
    { question: 'Can I export my website?', answer: 'Absolutely. You can export your website as clean HTML, CSS, and JavaScript files at any time.' },
    { question: 'Do you offer custom domains?', answer: 'Yes, all paid plans include custom domain support with free SSL certificates and automatic HTTPS.' },
  ];

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();

  // Build FAQ components
  const faqComponents: ComponentNode[] = items.map((item) => {
    const componentId = generateId();
    const questionId = generateId();
    const answerId = generateId();

    const questionElement: ElementNode = {
      id: questionId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.H3,
      className: 'faq-question',
      content: item.question,
      typography: { fontSize: '1.125rem', fontWeight: '600', color: 'var(--foreground)' },
      meta: { createdAt: now, updatedAt: now },
    };

    const answerItems: ItemNode[] = [
      {
        id: generateId(),
        type: NodeType.ITEM,
        tag: SemanticTag.SPAN,
        className: 'faq-answer',
        content: item.answer,
        typography: { fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--muted-foreground)' },
        meta: { createdAt: now, updatedAt: now },
      },
    ];

    const answerElement: ElementNode = {
      id: answerId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.P,
      className: 'faq-answer-wrapper',
      children: answerItems,
      typography: { fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--muted-foreground)' },
      meta: { createdAt: now, updatedAt: now },
    };

    return {
      id: componentId,
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

  // Heading element
  const headingElement: ElementNode = {
    id: generateId(),
    type: NodeType.ELEMENT,
    tag: SemanticTag.H2,
    className: 'pb-section-title',
    content: heading,
    typography: { fontSize: '2rem', fontWeight: '700', textAlign: TextAlign.CENTER },
    meta: { createdAt: now, updatedAt: now },
  };

  // Subtitle element
  const subtitleElement: ElementNode = {
    id: generateId(),
    type: NodeType.ELEMENT,
    tag: SemanticTag.P,
    className: 'pb-section-subtitle',
    content: 'Find answers to the most common questions about our platform and services.',
    typography: { fontSize: '1.1rem', textAlign: TextAlign.CENTER, color: 'var(--muted-foreground)' },
    meta: { createdAt: now, updatedAt: now },
  } as ElementNode;

  const headingComponent: ComponentNode = {
    id: generateId(),
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'faq-heading-wrapper',
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
    },
    children: [headingElement, subtitleElement],
  };

  const container: ContainerNode = {
    id: containerId,
    type: NodeType.CONTAINER,
    tag: SemanticTag.DIV,
    className: 'faq-container',
    meta: { createdAt: now, updatedAt: now },
    children: [headingComponent, ...faqComponents],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      gap: '1rem',
      maxWidth: '800px',
      margin: '0 auto',
    },
  };

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'faq-section',
    meta: { createdAt: now, updatedAt: now, sectionName: 'FAQ Section', aiGenerated: true },
    children: [container],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      padding: '4rem 2rem',
    },
    background: { color: 'var(--background)' },
  };
}
