import { NodeType, SemanticTag, ComponentCategory } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

/**
 * Testimonial -- 3-column cards with star ratings, quotes, and author info.
 * Based on HyperUI testimonials/1.html
 *
 * Props:
 *   heading?, subtitle?,
 *   quotes?: Array<{ quote: string; author: string; role?: string; avatarUrl?: string }>
 */
export function generateTestimonialTWStars(props?: Record<string, unknown>): SectionNode {
  const heading = (props?.heading as string) ?? 'Loved by thousands of developers';
  const subtitle = (props?.subtitle as string) ?? 'See what our customers have to say about their experience with our platform.';
  const rawQuotes = props?.quotes as Array<{
    quote: string;
    author: string;
    role?: string;
    avatarUrl?: string;
  }> | undefined;
  const quotes = rawQuotes ?? [
    { quote: 'This platform has completely transformed how we build products. The components are beautifully designed and incredibly easy to customize.', author: 'Sarah Johnson', role: 'Product Designer', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
    { quote: "We've increased our conversion rate by 40% since implementing these components. The attention to detail is remarkable.", author: 'Michael Chen', role: 'Startup Founder', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
    { quote: 'The best investment we have made for our development team. Clean code, excellent documentation, and outstanding support.', author: 'Emily Rodriguez', role: 'Engineering Manager', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200' },
  ];

  const now = new Date().toISOString();

  // Build star rating element (5 stars)
  const starElement: ElementNode = {
    id: generateId(),
    type: NodeType.ELEMENT,
    tag: SemanticTag.P,
    className: 'text-yellow-400',
    content: '\u2605\u2605\u2605\u2605\u2605',
    meta: { createdAt: now, updatedAt: now },
  };

  // Build testimonial cards
  const cardComponents: ComponentNode[] = quotes.map((q) => ({
    id: generateId(),
    type: NodeType.COMPONENT,
    tag: SemanticTag.ARTICLE,
    className: 'rounded-lg border border-gray-200 bg-white p-6 shadow-sm',
    category: ComponentCategory.TESTIMONIAL,
    meta: { createdAt: now, updatedAt: now },
    children: [
      // Stars
      {
        id: generateId(),
        type: NodeType.COMPONENT,
        tag: SemanticTag.DIV,
        className: 'mb-4 flex items-center gap-1',
        meta: { createdAt: now, updatedAt: now },
        children: [starElement],
      },
      // Quote
      {
        id: generateId(),
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'text-gray-700',
        content: q.quote,
        meta: { createdAt: now, updatedAt: now },
      },
      // Author footer
      {
        id: generateId(),
        type: NodeType.COMPONENT,
        tag: SemanticTag.DIV,
        className: 'mt-6 flex items-center gap-4',
        meta: { createdAt: now, updatedAt: now },
        children: [
          // Avatar
          ...(q.avatarUrl
            ? [{
                id: generateId(),
                type: NodeType.ELEMENT,
                tag: SemanticTag.IMG,
                className: 'size-12 rounded-full object-cover',
                src: q.avatarUrl,
                attributes: { alt: q.author },
                meta: { createdAt: now, updatedAt: now },
              } as ElementNode]
            : []),
          // Name + role
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            meta: { createdAt: now, updatedAt: now },
            children: [
              {
                id: generateId(),
                type: NodeType.ELEMENT,
                tag: SemanticTag.P,
                className: 'font-medium text-gray-900',
                content: q.author,
                meta: { createdAt: now, updatedAt: now },
              },
              ...(q.role
                ? [{
                    id: generateId(),
                    type: NodeType.ELEMENT,
                    tag: SemanticTag.P,
                    className: 'text-sm text-gray-500',
                    content: q.role,
                    meta: { createdAt: now, updatedAt: now },
                  } as ElementNode]
                : []),
            ],
          },
        ],
      },
    ],
  }));

  return {
    id: generateId(),
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'bg-white px-4 py-16',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Testimonial Stars', aiGenerated: true },
    layout: {},
    children: [
      {
        id: generateId(),
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'mx-auto max-w-7xl',
        meta: { createdAt: now, updatedAt: now },
        layout: {},
        children: [
          // Header
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'mb-12 text-center',
            meta: { createdAt: now, updatedAt: now },
            children: [
              {
                id: generateId(),
                type: NodeType.ELEMENT,
                tag: SemanticTag.H2,
                className: 'text-2xl font-medium text-gray-900 md:text-3xl',
                content: heading,
                meta: { createdAt: now, updatedAt: now },
              },
              {
                id: generateId(),
                type: NodeType.ELEMENT,
                tag: SemanticTag.P,
                className: 'mx-auto mt-4 max-w-2xl text-gray-700',
                content: subtitle,
                meta: { createdAt: now, updatedAt: now },
              },
            ],
          },
          // Cards grid
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'grid grid-cols-1 gap-8 md:grid-cols-3',
            meta: { createdAt: now, updatedAt: now },
            children: cardComponents,
          },
        ],
      } as ContainerNode,
    ],
  };
}
