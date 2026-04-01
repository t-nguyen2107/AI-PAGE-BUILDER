import { NodeType, SemanticTag, DisplayType, FlexDirection, ComponentCategory, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

interface TierData {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

const DEFAULT_TIERS: TierData[] = [
  { name: 'Basic', price: '$9', description: 'Perfect for getting started', features: ['1 User', '5 Projects', '1GB Storage'], highlighted: false },
  { name: 'Pro', price: '$29', description: 'Best for professionals', features: ['5 Users', '25 Projects', '10GB Storage', 'Priority Support'], highlighted: true },
  { name: 'Enterprise', price: '$99', description: 'For large organizations', features: ['Unlimited Users', 'Unlimited Projects', '100GB Storage', '24/7 Support', 'Custom Domain'], highlighted: false },
];

function generateTierCard(tier: TierData, now: string): ComponentNode {
  const cardId = generateId();
  const headingId = generateId();
  const priceId = generateId();
  const descId = generateId();
  const listId = generateId();

  const listItems = tier.features.map((feature) => ({
    id: generateId(),
    type: NodeType.ITEM as const,
    tag: SemanticTag.LI as const,
    content: feature,
    meta: { createdAt: now, updatedAt: now },
  }));

  return {
    id: cardId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: `pricing-card${tier.highlighted ? ' pricing-card--highlighted' : ''}`,
    category: ComponentCategory.PRICING,
    inlineStyles: {
      padding: '2rem',
      borderRadius: '12px',
      border: tier.highlighted ? '2px solid #3b82f6' : '1px solid #e2e8f0',
      textAlign: 'center',
      ...(tier.highlighted ? { boxShadow: '0 4px 24px rgba(59,130,246,0.15)' } : {}),
    },
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      gap: '1rem',
      alignItems: 'center',
    },
    meta: { createdAt: now, updatedAt: now, aiGenerated: true },
    children: [
      { id: headingId, type: NodeType.ELEMENT, tag: SemanticTag.H3, className: 'pricing-tier-name', content: tier.name, typography: { fontSize: '1.25rem', fontWeight: '600' }, meta: { createdAt: now, updatedAt: now } } as ElementNode,
      { id: priceId, type: NodeType.ELEMENT, tag: SemanticTag.P, className: 'pricing-price', content: tier.price, typography: { fontSize: '2.5rem', fontWeight: '700' }, meta: { createdAt: now, updatedAt: now } } as ElementNode,
      { id: descId, type: NodeType.ELEMENT, tag: SemanticTag.P, className: 'pricing-description', content: tier.description, typography: { fontSize: '0.95rem', color: '#64748b' }, meta: { createdAt: now, updatedAt: now } } as ElementNode,
      { id: listId, type: NodeType.ELEMENT, tag: SemanticTag.UL, className: 'pricing-features-list', meta: { createdAt: now, updatedAt: now }, children: listItems } as ElementNode,
    ],
  };
}

/**
 * Generates a Pricing section with configurable number of tiers (1-4).
 *
 * Props:
 *   tiers?: number      - Number of pricing tiers (1-4, default: 3)
 *   tierData?: TierData[] - Custom tier data
 */
export function generatePricingSection(props?: Record<string, unknown>): SectionNode {
  const tierCount = Math.max(1, Math.min(4, (props?.tiers as number) ?? (props?.count as number) ?? 3));
  const customData = props?.tierData as TierData[] | undefined;

  const tiers: TierData[] = customData
    ? customData.slice(0, tierCount)
    : DEFAULT_TIERS.slice(0, tierCount);

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();
  const titleId = generateId();

  const tierCards = tiers.map((tier) => generateTierCard(tier, now));

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'pricing-section',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Pricing Section', aiGenerated: true },
    children: [
      {
        id: containerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'pricing-container',
        meta: { createdAt: now, updatedAt: now },
        children: [
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'pricing-title-wrap',
            meta: { createdAt: now, updatedAt: now },
            layout: { display: DisplayType.FLEX, justifyContent: 'center' },
            children: [
              {
                id: titleId,
                type: NodeType.ELEMENT,
                tag: SemanticTag.H2,
                className: 'pricing-title',
                content: 'Pricing Plans',
                typography: { fontSize: '2rem', fontWeight: '700', textAlign: TextAlign.CENTER },
                meta: { createdAt: now, updatedAt: now },
              },
            ],
          },
          ...tierCards,
        ],
        layout: {
          display: DisplayType.GRID,
          gridTemplateColumns: `repeat(${tierCount}, 1fr)`,
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
