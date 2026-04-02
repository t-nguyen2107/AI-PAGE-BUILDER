import { NodeType, SemanticTag, DisplayType, FlexDirection, ComponentCategory, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

interface FeatureItem {
  title: string;
  description: string;
  icon?: string;
}

const DEFAULT_FEATURES: FeatureItem[] = [
  { title: 'Fast Performance', description: 'Optimized for speed with lightning-fast load times and smooth interactions.' },
  { title: 'Secure & Reliable', description: 'Enterprise-grade security with 99.9% uptime guarantee.' },
  { title: 'Easy Integration', description: 'Seamlessly connect with your existing tools and workflows.' },
  { title: '24/7 Support', description: 'Our dedicated team is always available to help you succeed.' },
  { title: 'Customizable', description: 'Tailor every aspect to match your brand and requirements.' },
  { title: 'Analytics Dashboard', description: 'Real-time insights and metrics to drive informed decisions.' },
];

function generateFeatureCard(feature: FeatureItem, now: string): ComponentNode {
  const cardId = generateId();
  const titleId = generateId();
  const descId = generateId();

  const children: ElementNode[] = [];

  // Icon image with pb-icon-box class for the boxed container effect
  if (feature.icon) {
    children.push({
      id: generateId(),
      type: NodeType.ELEMENT,
      tag: SemanticTag.IMG,
      className: 'pb-icon-box',
      src: feature.icon,
      attributes: { alt: `${feature.title} icon` },
      inlineStyles: { width: '24px', height: '24px' },
      meta: { createdAt: now, updatedAt: now },
    });
  }

  children.push(
    {
      id: titleId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.H3,
      className: 'feature-card-title',
      content: feature.title,
      typography: { fontSize: '1.125rem', fontWeight: '600', color: 'var(--foreground)' },
      meta: { createdAt: now, updatedAt: now },
    },
    {
      id: descId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.P,
      className: 'feature-card-description',
      content: feature.description,
      typography: { fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--muted-foreground)' },
      meta: { createdAt: now, updatedAt: now },
    },
  );

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
      padding: '1.5rem',
    },
    meta: { createdAt: now, updatedAt: now, aiGenerated: true },
    children,
  };
}

/**
 * Generates a Features grid section with configurable columns (2-4).
 *
 * Props:
 *   columns?: number   - Number of columns in the grid (2-4, default: 3)
 *   items?: number      - Number of feature items to display
 *   featureData?: FeatureItem[] - Custom feature data
 */
export function generateFeaturesGrid(props?: Record<string, unknown>): SectionNode {
  // Handle items being either an array (data from defaultContent/AI) or a number (count)
  let customData: FeatureItem[] | undefined = props?.featureData as FeatureItem[] | undefined;
  if (Array.isArray(props?.items) && (props.items as unknown[]).length > 0 && typeof (props.items as unknown[])[0] === 'object') {
    customData = props.items as FeatureItem[];
  }
  const columns = Math.max(2, Math.min(4, (props?.columns as number) ?? 3));
  const itemCount = customData
    ? customData.length
    : (props?.items as number) ?? columns * 2;

  const features: FeatureItem[] = customData
    ? customData.slice(0, itemCount)
    : DEFAULT_FEATURES.slice(0, Math.min(itemCount, DEFAULT_FEATURES.length));

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();
  const titleId = generateId();
  const subtitleId = generateId();

  const featureCards = features.map((f) => generateFeatureCard(f, now));

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'features-section',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Features Section', aiGenerated: true },
    children: [
      {
        id: containerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'features-container',
        meta: { createdAt: now, updatedAt: now },
        children: [
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'features-title-wrap',
            meta: { createdAt: now, updatedAt: now },
            layout: { display: DisplayType.FLEX, flexDirection: FlexDirection.COLUMN, alignItems: 'center', gap: '0.5rem', gridColumn: '1 / -1' },
            children: [
              {
                id: titleId,
                type: NodeType.ELEMENT,
                tag: SemanticTag.H2,
                className: 'pb-section-title',
                content: 'Features',
                typography: { textAlign: TextAlign.CENTER },
                meta: { createdAt: now, updatedAt: now },
              },
              {
                id: subtitleId,
                type: NodeType.ELEMENT,
                tag: SemanticTag.P,
                className: 'pb-section-subtitle',
                content: 'Everything you need to build amazing websites',
                typography: { textAlign: TextAlign.CENTER },
                meta: { createdAt: now, updatedAt: now },
              },
            ],
          },
          ...featureCards,
        ],
        layout: {
          display: DisplayType.GRID,
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '2rem',
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
