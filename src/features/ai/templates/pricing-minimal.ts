import { NodeType, SemanticTag, DisplayType, FlexDirection, ComponentCategory, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode, ItemNode } from '@/types/dom-tree';

interface MinimalTierData {
  name: string;
  price: string;
  description: string;
  features: string[];
  ctaText?: string;
  highlighted?: boolean;
}

const DEFAULT_TIERS: MinimalTierData[] = [
  {
    name: 'Starter',
    price: '$19',
    description: 'Perfect for individuals and small projects.',
    features: ['1 User', '3 Projects', '1GB Storage', 'Email Support'],
    ctaText: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$49',
    description: 'Best for growing teams and businesses.',
    features: ['5 Users', 'Unlimited Projects', '25GB Storage', 'Priority Support', 'Custom Domain'],
    ctaText: 'Start Free Trial',
    highlighted: true,
  },
];

function generateMinimalTierCard(tier: MinimalTierData, now: string): ComponentNode {
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
    content: feature,
    typography: { fontSize: '0.95rem', color: 'var(--foreground)', lineHeight: '1.8' },
    meta: { createdAt: now, updatedAt: now },
  }));

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
      padding: '2.5rem',
    },
    meta: { createdAt: now, updatedAt: now, aiGenerated: true },
    children: [
      {
        id: headingId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.H3,
        className: 'minimal-tier-name',
        content: tier.name,
        typography: { fontSize: '1.25rem', fontWeight: '600', color: 'var(--foreground)' },
        meta: { createdAt: now, updatedAt: now },
      },
      {
        id: priceId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'minimal-tier-price',
        content: tier.price,
        typography: { fontSize: '2.5rem', fontWeight: '800', color: 'var(--foreground)' },
        meta: { createdAt: now, updatedAt: now },
      },
      {
        id: descId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'minimal-tier-description',
        content: tier.description,
        typography: { fontSize: '0.95rem', color: 'var(--muted-foreground)' },
        meta: { createdAt: now, updatedAt: now },
      },
      {
        id: listId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.UL,
        className: 'minimal-tier-features',
        meta: { createdAt: now, updatedAt: now },
        children: listItems,
      },
      {
        id: btnId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.BUTTON,
        className: tier.highlighted ? 'pb-btn pb-btn-primary' : 'pb-btn pb-btn-outline',
        content: tier.ctaText ?? (tier.highlighted ? 'Get Started' : 'Choose Plan'),
        meta: { createdAt: now, updatedAt: now },
      },
    ],
    effects: tier.highlighted
      ? { borderWidth: '2px', borderColor: 'var(--primary-container)', borderStyle: 'solid' }
      : undefined,
  };
}

/**
 * Generates a minimal 2-tier pricing section with clean cards.
 *
 * Props:
 *   tiers?: MinimalTierData[] - Custom tier data (max 2)
 */
export function generatePricingMinimal(props?: Record<string, unknown>): SectionNode {
  const customTiers = props?.tiers as MinimalTierData[] | undefined;

  const tiers: MinimalTierData[] = customTiers
    ? customTiers.slice(0, 2)
    : DEFAULT_TIERS;

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();
  const titleId = generateId();
  const subtitleId = generateId();

  const tierCards = tiers.map((tier) => generateMinimalTierCard(tier, now));

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'pricing-minimal-section',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Pricing Minimal Section', aiGenerated: true },
    children: [
      {
        id: containerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'minimal-pricing-container',
        meta: { createdAt: now, updatedAt: now },
        children: [
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'minimal-pricing-title-wrap',
            meta: { createdAt: now, updatedAt: now },
            layout: { display: DisplayType.FLEX, flexDirection: FlexDirection.COLUMN, alignItems: 'center', gap: '0.5rem' },
            children: [
              {
                id: titleId,
                type: NodeType.ELEMENT,
                tag: SemanticTag.H2,
                className: 'pb-section-title',
                content: 'Simple Pricing',
                typography: { fontSize: '2rem', fontWeight: '700', textAlign: TextAlign.CENTER },
                meta: { createdAt: now, updatedAt: now },
              },
              {
                id: subtitleId,
                type: NodeType.ELEMENT,
                tag: SemanticTag.P,
                className: 'pb-section-subtitle',
                content: 'No hidden fees. Pick a plan and get started today.',
                typography: { fontSize: '1.1rem', textAlign: TextAlign.CENTER, color: 'var(--muted-foreground)' },
                meta: { createdAt: now, updatedAt: now },
              },
            ],
          },
          ...tierCards,
        ],
        layout: {
          display: DisplayType.GRID,
          gridTemplateColumns: `repeat(${tiers.length}, 1fr)`,
          gap: '2rem',
          maxWidth: '800px',
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
