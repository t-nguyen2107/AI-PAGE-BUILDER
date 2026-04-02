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
  {
    quote: "This platform has completely transformed how we build products. The components are beautifully designed and incredibly easy to customize.",
    author: "Sarah Johnson",
    role: "Product Designer",
    avatarUrl: "/stock/team/1.jpg",
  },
  {
    quote: "We've increased our conversion rate by 40% since implementing these components. The attention to detail is remarkable.",
    author: "Michael Chen",
    role: "Startup Founder",
    avatarUrl: "/stock/team/2.jpg",
  },
  {
    quote: "The best investment we've made for our development team. Clean code, excellent documentation, and outstanding support.",
    author: "Emily Rodriguez",
    role: "Engineering Manager",
    avatarUrl: "/stock/team/3.jpg",
  },
];

function generateTestimonialCard(data: TestimonialData, now: string): ComponentNode {
  const cardId = generateId();

  const children: ElementNode[] = [];

  // Star rating — 5 stars as text "★★★★★"
  children.push({
    id: generateId(),
    type: NodeType.ELEMENT,
    tag: SemanticTag.P,
    className: 'testimonial-stars',
    content: '★★★★★',
    typography: {
      fontSize: '1.25rem',
      color: '#fbbf24', // yellow-400
      letterSpacing: '0.125rem',
    },
    inlineStyles: { marginBottom: '1rem', marginTop: '0' },
    meta: { createdAt: now, updatedAt: now },
  });

  // Quote in blockquote
  children.push({
    id: generateId(),
    type: NodeType.ELEMENT,
    tag: SemanticTag.P,
    className: 'testimonial-quote',
    content: data.quote,
    typography: {
      fontSize: '1rem',
      lineHeight: '1.625',
      color: 'var(--card-foreground)',
    },
    meta: { createdAt: now, updatedAt: now },
  });

  // Footer with avatar and author info
  // Avatar image
  if (data.avatarUrl) {
    children.push({
      id: generateId(),
      type: NodeType.ELEMENT,
      tag: SemanticTag.IMG,
      className: 'pb-avatar',
      src: data.avatarUrl,
      attributes: { alt: `${data.author} avatar` },
      inlineStyles: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        objectFit: 'cover',
        marginRight: '1rem',
      },
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
    typography: {
      fontWeight: '600',
      color: 'var(--foreground)',
    },
    inlineStyles: { margin: '0' },
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
      typography: {
        fontSize: '0.875rem',
        color: 'var(--muted-foreground)',
      },
      inlineStyles: { margin: '0' },
      meta: { createdAt: now, updatedAt: now },
    });
  }

  return {
    id: cardId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.ARTICLE,
    className: 'pb-card testimonial-card',
    category: ComponentCategory.TESTIMONIAL,
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      gap: '0',
      padding: '1.5rem',
    },
    effects: {
      borderRadius: '0.5rem',
      borderWidth: '1px',
      borderColor: 'var(--border)',
      borderStyle: 'solid',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    },
    meta: { createdAt: now, updatedAt: now, aiGenerated: true },
    children,
  };
}

/**
 * Generates a Testimonial section with 3-column grid of cards featuring star ratings.
 * Based on HyperUI testimonials/1.html design.
 *
 * Props:
 *   quotes?: number            - Number of testimonials (1-6, default: 3)
 *   testimonialData?: TestimonialData[] - Custom testimonial data
 */
export function generateTestimonial3ColStars(props?: Record<string, unknown>): SectionNode {
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
  const headingWrapperId = generateId();
  const titleElementId = generateId();
  const subtitleId = generateId();
  const gridId = generateId();

  const cards = testimonials.map((t) => generateTestimonialCard(t, now));

  const headingWrapperComponent: ComponentNode = {
    id: headingWrapperId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'section-header',
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      gap: '1rem',
      margin: '0 0 3rem 0',
    },
    children: [
      {
        id: titleElementId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.H2,
        className: 'pb-section-title',
        content: 'Loved by thousands of developers',
        typography: {
          fontSize: '1.5rem',
          fontWeight: '500',
          textAlign: TextAlign.CENTER,
          color: 'var(--foreground)',
        },
        meta: { createdAt: now, updatedAt: now },
      },
      {
        id: subtitleId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'pb-section-subtitle',
        content: 'See what our customers have to say about their experience with our platform.',
        typography: {
          textAlign: TextAlign.CENTER,
          color: 'var(--muted-foreground)',
        },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'testimonial-section testimonial-3col-stars',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Testimonial 3-Column with Stars', aiGenerated: true },
    children: [
      {
        id: containerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'testimonial-container',
        meta: { createdAt: now, updatedAt: now },
        children: [headingWrapperComponent, ...cards],
        layout: {
          display: DisplayType.GRID,
          gridTemplateColumns: 'repeat(1, 1fr)',
          gap: '2rem',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem',
        },
      },
    ],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      padding: '4rem 0',
    },
    background: { color: 'var(--background)' },
  };
}
