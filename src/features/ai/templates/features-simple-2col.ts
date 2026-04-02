import { NodeType, SemanticTag, DisplayType, FlexDirection, ComponentCategory, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

interface SimpleFeatureItem {
  title: string;
  description: string;
}

const DEFAULT_ITEMS: SimpleFeatureItem[] = [
  { title: 'Performance First', description: 'Built from the ground up for speed. Every millisecond counts when it comes to user experience.' },
  { title: 'Developer Friendly', description: 'Clean APIs, comprehensive docs, and intuitive tooling that developers love to work with.' },
  { title: 'Scalable Architecture', description: 'Grows with your business. From startup to enterprise, the platform adapts seamlessly.' },
  { title: 'Global CDN', description: 'Content delivered from edge locations worldwide for the fastest possible load times.' },
];

function generateSimpleCard(item: SimpleFeatureItem, now: string): ComponentNode {
  const cardId = generateId();
  const titleId = generateId();
  const descId = generateId();

  return {
    id: cardId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'pb-card',
    category: ComponentCategory.FEATURES,
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      gap: '0.75rem',
      padding: '2rem',
    },
    meta: { createdAt: now, updatedAt: now, aiGenerated: true },
    children: [
      {
        id: titleId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.H3,
        className: 'simple-feature-title',
        content: item.title,
        typography: { fontSize: '1.125rem', fontWeight: '600', color: 'var(--foreground)' },
        meta: { createdAt: now, updatedAt: now },
      },
      {
        id: descId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'simple-feature-description',
        content: item.description,
        typography: { fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--muted-foreground)' },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };
}

/**
 * Generates a simple 2-column features section with text-only cards.
 *
 * Props:
 *   heading?: string                - Section heading (default: 'Features')
 *   subtitle?: string               - Section subtitle
 *   items?: SimpleFeatureItem[]     - Custom feature items with title and description
 */
export function generateFeaturesSimple2Col(props?: Record<string, unknown>): SectionNode {
  const heading = (props?.heading as string) ?? 'Features';
  const subtitle = (props?.subtitle as string) ?? 'Everything you need, nothing you don\'t.';
  const customItems = props?.items as SimpleFeatureItem[] | undefined;

  const items: SimpleFeatureItem[] = customItems
    ? customItems.slice(0, 8)
    : DEFAULT_ITEMS;

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();
  const titleId = generateId();
  const subtitleId = generateId();

  const cards = items.map((item) => generateSimpleCard(item, now));

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'features-simple-2col-section',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Features Simple 2-Col Section', aiGenerated: true },
    children: [
      {
        id: containerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'simple-features-container',
        meta: { createdAt: now, updatedAt: now },
        children: [
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'simple-features-title-wrap',
            meta: { createdAt: now, updatedAt: now },
            layout: { display: DisplayType.FLEX, flexDirection: FlexDirection.COLUMN, alignItems: 'center', gap: '0.5rem' },
            children: [
              {
                id: titleId,
                type: NodeType.ELEMENT,
                tag: SemanticTag.H2,
                className: 'pb-section-title',
                content: heading,
                typography: { fontSize: '2rem', fontWeight: '700', textAlign: TextAlign.CENTER },
                meta: { createdAt: now, updatedAt: now },
              },
              {
                id: subtitleId,
                type: NodeType.ELEMENT,
                tag: SemanticTag.P,
                className: 'pb-section-subtitle',
                content: subtitle,
                typography: { fontSize: '1.1rem', textAlign: TextAlign.CENTER, color: 'var(--muted-foreground)' },
                meta: { createdAt: now, updatedAt: now },
              },
            ],
          },
          ...cards,
        ],
        layout: {
          display: DisplayType.GRID,
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '2rem',
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 2rem',
        },
      } as ContainerNode,
    ],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      padding: '4rem 0',
    },
    background: { color: 'var(--background)' },
  };
}
