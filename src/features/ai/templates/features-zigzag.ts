import { NodeType, SemanticTag, DisplayType, FlexDirection, ComponentCategory, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

interface ZigzagFeatureItem {
  title: string;
  description: string;
  imageUrl?: string;
}

const DEFAULT_ITEMS: ZigzagFeatureItem[] = [
  { title: 'Blazing Fast', description: 'Optimized for speed with lightning-fast load times and zero lag interactions that keep your users engaged.', imageUrl: 'https://picsum.photos/seed/features-analytics/800/600' },
  { title: 'Bank-Grade Security', description: 'Enterprise-level encryption and security protocols to protect your data around the clock.', imageUrl: 'https://picsum.photos/seed/features-data-charts/800/600' },
  { title: 'Seamless Integration', description: 'Connect with your favorite tools and workflows in minutes, not days.', imageUrl: 'https://picsum.photos/seed/features-collaboration/800/600' },
];

function generateZigzagBlock(item: ZigzagFeatureItem, index: number, now: string): ComponentNode {
  const blockId = generateId();
  const imageId = generateId();
  const textWrapperId = generateId();
  const titleId = generateId();
  const descId = generateId();

  const isReversed = index % 2 === 1;

  const imageElement: ElementNode = {
    id: imageId,
    type: NodeType.ELEMENT,
    tag: SemanticTag.IMG,
    className: 'zigzag-image',
    src: item.imageUrl ?? 'https://picsum.photos/seed/features-analytics/800/600',
    attributes: { alt: item.title, loading: 'lazy' },
    meta: { createdAt: now, updatedAt: now },
  };

  const textWrapper: ComponentNode = {
    id: textWrapperId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'zigzag-text',
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      justifyContent: 'center',
      gap: '1rem',
      padding: '1rem 0',
    },
    meta: { createdAt: now, updatedAt: now },
    children: [
      {
        id: titleId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.H3,
        className: 'zigzag-feature-title',
        content: item.title,
        typography: { fontSize: '1.5rem', fontWeight: '700', color: 'var(--foreground)' },
        meta: { createdAt: now, updatedAt: now },
      },
      {
        id: descId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'zigzag-feature-description',
        content: item.description,
        typography: { fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--muted-foreground)' },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };

  return {
    id: blockId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'zigzag-block',
    category: ComponentCategory.FEATURES,
    layout: {
      display: DisplayType.FLEX,
      flexDirection: isReversed ? FlexDirection.ROW_REVERSE : FlexDirection.ROW,
      alignItems: 'center',
      gap: '3rem',
    },
    meta: { createdAt: now, updatedAt: now, aiGenerated: true },
    children: [imageElement, textWrapper] as any,
  };
}

/**
 * Generates a Features zigzag section with alternating image-text blocks.
 *
 * Props:
 *   heading?: string              - Section heading (default: 'Why Choose Us')
 *   subtitle?: string             - Section subtitle
 *   items?: ZigzagFeatureItem[]   - Custom feature items with title, description, imageUrl
 */
export function generateFeaturesZigzag(props?: Record<string, unknown>): SectionNode {
  const heading = (props?.heading as string) ?? 'Why Choose Us';
  const subtitle = (props?.subtitle as string) ?? 'Discover what makes our platform stand out from the rest.';
  const customItems = props?.items as ZigzagFeatureItem[] | undefined;

  const items: ZigzagFeatureItem[] = customItems
    ? customItems.slice(0, 6)
    : DEFAULT_ITEMS;

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();
  const titleId = generateId();
  const subtitleId = generateId();

  const zigzagBlocks = items.map((item, index) => generateZigzagBlock(item, index, now));

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'features-zigzag-section',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Features Zigzag Section', aiGenerated: true },
    children: [
      {
        id: containerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'zigzag-container',
        meta: { createdAt: now, updatedAt: now },
        children: [
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'zigzag-title-wrap',
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
          ...zigzagBlocks,
        ],
        layout: {
          display: DisplayType.FLEX,
          flexDirection: FlexDirection.COLUMN,
          gap: '4rem',
          maxWidth: '1200px',
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
