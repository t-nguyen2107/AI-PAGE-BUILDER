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

  const children: ElementNode[] = [
    {
      id: titleId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.H3,
      className: 'feature-card-title',
      content: feature.title,
      typography: { fontSize: '1.125rem', fontWeight: '600' },
      meta: { createdAt: now, updatedAt: now },
    },
    {
      id: descId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.P,
      className: 'feature-card-description',
      content: feature.description,
      typography: { fontSize: '0.95rem', lineHeight: '1.6', color: '#64748b' },
      meta: { createdAt: now, updatedAt: now },
    },
  ];

  if (feature.icon) {
    const iconId = generateId();
    children.unshift({
      id: iconId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.IMG,
      className: 'feature-card-icon',
      src: feature.icon,
      attributes: { alt: `${feature.title} icon` },
      inlineStyles: { width: '48px', height: '48px' },
      meta: { createdAt: now, updatedAt: now },
    });
  }

  return {
    id: cardId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'feature-card',
    category: ComponentCategory.FEATURES,
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      gap: '0.75rem',
      padding: '1.5rem',
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
 * Generates a Features grid section with configurable columns (2-4).
 *
 * Props:
 *   columns?: number   - Number of columns in the grid (2-4, default: 3)
 *   items?: number      - Number of feature items to display
 *   featureData?: FeatureItem[] - Custom feature data
 */
export function generateFeaturesGrid(props?: Record<string, unknown>): SectionNode {
  const columns = Math.max(2, Math.min(4, (props?.columns as number) ?? 3));
  const itemCount = (props?.items as number) ?? columns * 2;
  const customData = props?.featureData as FeatureItem[] | undefined;

  const features: FeatureItem[] = customData
    ? customData.slice(0, itemCount)
    : DEFAULT_FEATURES.slice(0, Math.min(itemCount, DEFAULT_FEATURES.length));

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();
  const titleId = generateId();

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
            layout: { display: DisplayType.FLEX, justifyContent: 'center' },
            children: [
              {
                id: titleId,
                type: NodeType.ELEMENT,
                tag: SemanticTag.H2,
                className: 'features-title',
                content: 'Features',
                typography: { fontSize: '2rem', fontWeight: '700', textAlign: TextAlign.CENTER },
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
    background: { color: '#ffffff' },
  };
}
