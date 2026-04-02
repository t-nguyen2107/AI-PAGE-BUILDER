import { NodeType, SemanticTag, DisplayType, FlexDirection, ComponentCategory, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ComponentNode, ElementNode } from '@/types/dom-tree';

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

  const children: ElementNode[] = [];

  // Quote mark element — P tag with pb-quote class
  children.push({
    id: generateId(),
    type: NodeType.ELEMENT,
    tag: SemanticTag.P,
    className: 'pb-quote',
    content: '"',
    typography: { fontSize: '2rem' },
    meta: { createdAt: now, updatedAt: now },
  });

  // Quote text
  children.push({
    id: generateId(),
    type: NodeType.ELEMENT,
    tag: SemanticTag.P,
    className: 'testimonial-quote',
    content: data.quote,
    typography: { fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--card-foreground)' },
    inlineStyles: { fontStyle: 'italic' },
    meta: { createdAt: now, updatedAt: now },
  });

  // Avatar image with pb-avatar class (flat, not wrapped in DIV)
  if (data.avatarUrl) {
    children.push({
      id: generateId(),
      type: NodeType.ELEMENT,
      tag: SemanticTag.IMG,
      className: 'pb-avatar',
      src: data.avatarUrl,
      attributes: { alt: `${data.author} avatar` },
      inlineStyles: { width: '48px', height: '48px', objectFit: 'cover' },
      meta: { createdAt: now, updatedAt: now },
    });
  }

  // Author name
  children.push({
    id: generateId(),
    type: NodeType.ELEMENT,
    tag: SemanticTag.P,
    className: 'testimonial-author',
    content: data.author,
    typography: { fontWeight: '600', color: 'var(--foreground)' },
    meta: { createdAt: now, updatedAt: now },
  });

  // Author role
  if (data.role) {
    children.push({
      id: generateId(),
      type: NodeType.ELEMENT,
      tag: SemanticTag.P,
      className: 'testimonial-role',
      content: data.role,
      typography: { fontSize: '0.85rem', color: 'var(--muted-foreground)' },
      meta: { createdAt: now, updatedAt: now },
    });
  }

  return {
    id: cardId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.ARTICLE,
    className: 'pb-card',
    category: ComponentCategory.TESTIMONIAL,
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      gap: '1rem',
      padding: '2rem',
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
  // Handle quotes being either an array (data from defaultContent/AI) or a number (count)
  let customData: TestimonialData[] | undefined = props?.testimonialData as TestimonialData[] | undefined;
  if (Array.isArray(props?.quotes) && (props.quotes as unknown[]).length > 0 && typeof (props.quotes as unknown[])[0] === 'object') {
    customData = props.quotes as TestimonialData[];
  }
  const count = customData
    ? Math.min(customData.length, 6)
    : Math.max(1, Math.min(6, (props?.quotes as number) ?? (props?.count as number) ?? 3));

  const testimonials: TestimonialData[] = customData
    ? customData.slice(0, count)
    : DEFAULT_TESTIMONIALS.slice(0, count);

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();
  const titleComponentId = generateId();
  const titleElementId = generateId();
  const subtitleId = generateId();

  const cards = testimonials.map((t) => generateTestimonialCard(t, now));
  const colCount = Math.min(cards.length, 3);

  const titleComponent: ComponentNode = {
    id: titleComponentId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'testimonial-title-wrap',
    meta: { createdAt: now, updatedAt: now },
    layout: { display: DisplayType.FLEX, flexDirection: FlexDirection.COLUMN, alignItems: 'center', gap: '0.5rem', gridColumn: '1 / -1' },
    children: [
      {
        id: titleElementId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.H2,
        className: 'pb-section-title',
        content: 'What Our Customers Say',
        typography: { textAlign: TextAlign.CENTER },
        meta: { createdAt: now, updatedAt: now },
      },
      {
        id: subtitleId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'pb-section-subtitle',
        content: 'Trusted by thousands of teams worldwide',
        typography: { textAlign: TextAlign.CENTER },
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
    background: { color: 'var(--muted)' },
  };
}
