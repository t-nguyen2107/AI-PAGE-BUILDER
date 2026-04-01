import { NodeType, SemanticTag, DisplayType, FlexDirection, ComponentCategory, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

interface TestimonialData {
  quote: string;
  author: string;
  role?: string;
  avatarUrl?: string;
}

const DEFAULT_TESTIMONIALS: TestimonialData[] = [
  { quote: 'This platform transformed our workflow. We shipped twice as fast.', author: 'Sarah Johnson', role: 'CTO, TechCorp' },
  { quote: 'The best builder experience I have ever used. Intuitive and powerful.', author: 'Mike Chen', role: 'Designer, StartupXYZ' },
  { quote: 'Our conversion rates improved by 40% after switching to pages built here.', author: 'Emily Davis', role: 'Marketing Lead, GrowthCo' },
];

function generateTestimonialCard(data: TestimonialData, now: string): ComponentNode {
  const cardId = generateId();
  const quoteId = generateId();
  const authorId = generateId();

  const children: ElementNode[] = [];

  if (data.avatarUrl) {
    const avatarId = generateId();
    children.push({
      id: avatarId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.IMG,
      className: 'testimonial-avatar',
      src: data.avatarUrl,
      attributes: { alt: `${data.author} avatar` },
      inlineStyles: { width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' },
      meta: { createdAt: now, updatedAt: now },
    });
  }

  children.push(
    {
      id: quoteId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.P,
      className: 'testimonial-quote',
      content: `"${data.quote}"`,
      typography: { fontSize: '1.05rem', lineHeight: '1.7', color: '#374151' },
      meta: { createdAt: now, updatedAt: now },
    },
    {
      id: authorId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.P,
      className: 'testimonial-author',
      content: data.role ? `${data.author}, ${data.role}` : data.author,
      typography: { fontWeight: '600', fontSize: '0.9rem', color: '#374151' },
      meta: { createdAt: now, updatedAt: now },
    },
  );

  return {
    id: cardId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'testimonial-card',
    category: ComponentCategory.TESTIMONIAL,
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      gap: '1rem',
      padding: '2rem',
    },
    inlineStyles: {
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
    },
    meta: { createdAt: now, updatedAt: now, aiGenerated: true },
    children,
  };
}

/**
 * Generates a Testimonial section with quote cards.
 *
 * Props:
 *   quotes?: number            - Number of testimonials (1-6, default: 3)
 *   testimonialData?: TestimonialData[] - Custom testimonial data
 */
export function generateTestimonialSection(props?: Record<string, unknown>): SectionNode {
  const count = Math.max(1, Math.min(6, (props?.quotes as number) ?? (props?.count as number) ?? 3));
  const customData = props?.testimonialData as TestimonialData[] | undefined;

  const testimonials: TestimonialData[] = customData
    ? customData.slice(0, count)
    : DEFAULT_TESTIMONIALS.slice(0, count);

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();
  const titleComponentId = generateId();
  const titleElementId = generateId();

  const cards = testimonials.map((t) => generateTestimonialCard(t, now));
  const colCount = Math.min(cards.length, 3);

  // Title wrapped in a ComponentNode since it's a direct child of ContainerNode
  const titleComponent: ComponentNode = {
    id: titleComponentId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'testimonial-title-wrap',
    meta: { createdAt: now, updatedAt: now },
    layout: { display: DisplayType.FLEX, justifyContent: 'center' },
    children: [
      {
        id: titleElementId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.H2,
        className: 'testimonial-title',
        content: 'What Our Customers Say',
        typography: { fontSize: '2rem', fontWeight: '700', textAlign: TextAlign.CENTER },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'testimonial-section',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Testimonial Section', aiGenerated: true },
    children: [
      {
        id: containerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'testimonial-container',
        meta: { createdAt: now, updatedAt: now },
        children: [titleComponent, ...cards],
        layout: {
          display: DisplayType.GRID,
          gridTemplateColumns: `repeat(${colCount}, 1fr)`,
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
        },
      },
    ],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      padding: '4rem 0',
    },
    background: { color: '#f8fafc' },
  };
}
