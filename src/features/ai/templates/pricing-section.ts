import { NodeType, SemanticTag, DisplayType, FlexDirection, ComponentCategory, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode, ItemNode } from '@/types/dom-tree';

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
  const btnId = generateId();

  const listItems: ItemNode[] = tier.features.map((feature) => ({
    id: generateId(),
    type: NodeType.ITEM,
    tag: SemanticTag.LI,
    content: `✓ ${feature}`,
    typography: { fontSize: '0.95rem', color: 'var(--foreground)' },
    meta: { createdAt: now, updatedAt: now },
  }));

  const children: ElementNode[] = [];

  // Add "Most Popular" badge for highlighted tier
  if (tier.highlighted) {
    children.push({
      id: generateId(),
      type: NodeType.ELEMENT,
      tag: SemanticTag.P,
      className: 'pb-badge',
      content: 'Most Popular',
      typography: { fontSize: '0.75rem', fontWeight: '600', textAlign: TextAlign.CENTER, color: 'var(--on-primary-container)' },
      inlineStyles: { display: 'inline-block' },
      meta: { createdAt: now, updatedAt: now },
    });
  }

  children.push(
    { id: headingId, type: NodeType.ELEMENT, tag: SemanticTag.H3, className: 'pricing-tier-name', content: tier.name, typography: { fontSize: '1.25rem', fontWeight: '600', color: 'var(--foreground)' }, meta: { createdAt: now, updatedAt: now } },
    { id: priceId, type: NodeType.ELEMENT, tag: SemanticTag.P, className: 'pricing-price', content: tier.price, typography: { fontSize: '2.5rem', fontWeight: '800', color: 'var(--foreground)' }, meta: { createdAt: now, updatedAt: now } },
    { id: descId, type: NodeType.ELEMENT, tag: SemanticTag.P, className: 'pricing-description', content: tier.description, typography: { fontSize: '0.95rem', color: 'var(--muted-foreground)' }, meta: { createdAt: now, updatedAt: now } },
    { id: listId, type: NodeType.ELEMENT, tag: SemanticTag.UL, className: 'pricing-features-list', meta: { createdAt: now, updatedAt: now }, children: listItems },
    { id: btnId, type: NodeType.ELEMENT, tag: SemanticTag.BUTTON, className: tier.highlighted ? 'pb-btn pb-btn-primary' : 'pb-btn pb-btn-outline', content: tier.highlighted ? 'Get Started' : 'Choose Plan', meta: { createdAt: now, updatedAt: now } },
  );

  return {
    id: cardId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: tier.highlighted ? 'pb-card-highlighted' : 'pb-card',
    category: ComponentCategory.PRICING,
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      gap: '1rem',
      alignItems: 'center',
      padding: '2rem',
    },
    meta: { createdAt: now, updatedAt: now, aiGenerated: true },
    children,
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
  // Handle tiers being either an array (data from defaultContent/AI) or a number (count)
  let customData: TierData[] | undefined = props?.tierData as TierData[] | undefined;
  if (Array.isArray(props?.tiers) && (props.tiers as unknown[]).length > 0 && typeof (props.tiers as unknown[])[0] === 'object') {
    customData = props.tiers as TierData[];
  }
  const tierCount = customData
    ? Math.min(customData.length, 4)
    : Math.max(1, Math.min(4, (props?.tiers as number) ?? (props?.count as number) ?? 3));

  const tiers: TierData[] = customData
    ? customData.slice(0, tierCount)
    : DEFAULT_TIERS.slice(0, tierCount);

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();
  const titleId = generateId();
  const subtitleId = generateId();

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
            layout: { display: DisplayType.FLEX, flexDirection: FlexDirection.COLUMN, alignItems: 'center', gap: '0.5rem', gridColumn: '1 / -1' },
            children: [
              {
                id: titleId,
                type: NodeType.ELEMENT,
                tag: SemanticTag.H2,
                className: 'pb-section-title',
                content: 'Pricing Plans',
                typography: { textAlign: TextAlign.CENTER },
                meta: { createdAt: now, updatedAt: now },
              },
              {
                id: subtitleId,
                type: NodeType.ELEMENT,
                tag: SemanticTag.P,
                className: 'pb-section-subtitle',
                content: 'Choose the plan that fits your needs',
                typography: { textAlign: TextAlign.CENTER },
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
    background: { color: 'var(--background)' },
  };
}
