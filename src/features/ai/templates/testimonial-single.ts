import { NodeType, SemanticTag, DisplayType, FlexDirection, ComponentCategory, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ComponentNode, ElementNode } from '@/types/dom-tree';

interface TestimonialData {
  quote: string;
  author: string;
  role?: string;
  avatarUrl?: string;
}

const DEFAULT_TESTIMONIAL: TestimonialData = {
  quote: 'This platform completely transformed how our team approaches web design. What used to take weeks now takes hours. The AI-powered builder understands exactly what we need and delivers stunning results every time.',
  author: 'Sarah Johnson',
  role: 'CTO, TechCorp',
  avatarUrl: '/stock/testimonials/avatar-1.webp',
};

/**
 * Generates a single featured testimonial with avatar, centered layout.
 * Displays one large quote in a card with quote mark decoration.
 *
 * Props:
 *   quotes?: Array<{ quote, author, role, avatarUrl }> - Testimonial data (uses first item only)
 */
export function generateTestimonialSingle(props?: Record<string, unknown>): SectionNode {
  const quotes = (props?.quotes as TestimonialData[]) ?? [DEFAULT_TESTIMONIAL];
  const data = quotes[0] ?? DEFAULT_TESTIMONIAL;

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();

  // Build card children
  const cardChildren: ElementNode[] = [];

  // Large quote mark
  cardChildren.push({
    id: generateId(),
    type: NodeType.ELEMENT,
    tag: SemanticTag.P,
    className: 'pb-quote',
    content: '\u201C',
    typography: { fontSize: '3rem', color: 'var(--primary-container)' },
    meta: { createdAt: now, updatedAt: now },
  });

  // Quote text — italic
  cardChildren.push({
    id: generateId(),
    type: NodeType.ELEMENT,
    tag: SemanticTag.P,
    content: data.quote,
    typography: {
      fontSize: '1.25rem',
      lineHeight: '1.7',
      color: 'var(--foreground)',
      textAlign: TextAlign.CENTER,
    },
    inlineStyles: { fontStyle: 'italic' },
    meta: { createdAt: now, updatedAt: now },
  });

  // Avatar image
  if (data.avatarUrl) {
    cardChildren.push({
      id: generateId(),
      type: NodeType.ELEMENT,
      tag: SemanticTag.IMG,
      className: 'pb-avatar',
      src: data.avatarUrl,
      attributes: { alt: `${data.author} avatar` },
      inlineStyles: { width: '64px', height: '64px', objectFit: 'cover' },
      meta: { createdAt: now, updatedAt: now },
    });
  }

  // Author name
  cardChildren.push({
    id: generateId(),
    type: NodeType.ELEMENT,
    tag: SemanticTag.P,
    content: data.author,
    typography: { fontWeight: '700', fontSize: '1rem', color: 'var(--foreground)' },
    meta: { createdAt: now, updatedAt: now },
  });

  // Author role
  if (data.role) {
    cardChildren.push({
      id: generateId(),
      type: NodeType.ELEMENT,
      tag: SemanticTag.P,
      content: data.role,
      typography: { fontSize: '0.875rem', color: 'var(--muted-foreground)' },
      meta: { createdAt: now, updatedAt: now },
    });
  }

  // Card component
  const cardComponent: ComponentNode = {
    id: generateId(),
    type: NodeType.COMPONENT,
    tag: SemanticTag.ARTICLE,
    className: 'pb-card',
    category: ComponentCategory.TESTIMONIAL,
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      gap: '1rem',
      padding: '3rem',
    },
    meta: { createdAt: now, updatedAt: now, aiGenerated: true },
    children: cardChildren,
  };

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    meta: { createdAt: now, updatedAt: now, sectionName: 'Testimonial Single', aiGenerated: true },
    children: [
      {
        id: containerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        meta: { createdAt: now, updatedAt: now },
        children: [cardComponent],
        layout: {
          display: DisplayType.FLEX,
          flexDirection: FlexDirection.COLUMN,
          alignItems: 'center',
          maxWidth: '700px',
          margin: '0 auto',
        },
      },
    ],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      padding: '4rem 2rem',
    },
    background: { color: 'var(--background)' },
  };
}
