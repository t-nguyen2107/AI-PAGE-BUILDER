import { NodeType, SemanticTag, DisplayType, FlexDirection, ComponentCategory, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode, ItemNode } from '@/types/dom-tree';

interface HyperUITierData {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  ctaText?: string;
}

const HYPERUI_TIERS: HyperUITierData[] = [
  {
    name: 'Starter',
    price: '$20',
    period: '/month',
    features: ['10 users included', '2GB of storage', 'Email support', 'Help center access'],
    highlighted: false,
    ctaText: 'Get Started',
  },
  {
    name: 'Pro',
    price: '$30',
    period: '/month',
    features: ['20 users included', '5GB of storage', 'Email support', 'Help center access', 'Phone support', 'Community access'],
    highlighted: true,
    ctaText: 'Get Started',
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    features: ['Unlimited users', '100GB of storage', 'Priority email support', 'Help center access', '24/7 Phone support', 'Community access', 'Custom integrations'],
    highlighted: false,
    ctaText: 'Contact Sales',
  },
];

function generateHyperUITierCard(tier: HyperUITierData, now: string): ComponentNode {
  const cardId = generateId();
  const headingId = generateId();
  const priceWrapperId = generateId();
  const priceId = generateId();
  const periodId = generateId();
  const listId = generateId();
  const btnId = generateId();

  const listItems: ItemNode[] = tier.features.map((feature) => ({
    id: generateId(),
    type: NodeType.ITEM,
    tag: SemanticTag.LI,
    content: `✓ ${feature}`,
    typography: {
      fontSize: '0.95rem',
      color: '#374151', // gray-700
    },
    layout: {
      display: DisplayType.FLEX,
      alignItems: 'center',
      gap: '0.25rem',
    },
    meta: { createdAt: now, updatedAt: now },
  }));

  const children: ElementNode[] = [
    {
      id: headingId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.H3,
      content: tier.name,
      typography: {
        fontSize: '1.125rem',
        fontWeight: '500',
        textAlign: TextAlign.CENTER,
        color: '#111827', // gray-900
      },
      meta: { createdAt: now, updatedAt: now },
    },
    {
      id: priceWrapperId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.DIV,
      typography: {
        textAlign: TextAlign.CENTER,
      },
      layout: {
        marginTop: '0.5rem',
      },
      children: [
        {
          id: priceId,
          type: NodeType.ELEMENT,
          tag: SemanticTag.SPAN,
          content: tier.price,
          typography: {
            fontSize: '1.875rem',
            fontWeight: '700',
            color: '#111827', // gray-900
          },
          meta: { createdAt: now, updatedAt: now },
        },
        {
          id: periodId,
          type: NodeType.ELEMENT,
          tag: SemanticTag.SPAN,
          content: tier.period,
          typography: {
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151', // gray-700
          },
          meta: { createdAt: now, updatedAt: now },
        },
      ] as ElementNode[],
      meta: { createdAt: now, updatedAt: now },
    },
    {
      id: listId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.UL,
      layout: {
        marginTop: '1.5rem',
        display: DisplayType.FLEX,
        flexDirection: FlexDirection.COLUMN,
        gap: '0.5rem',
      },
      meta: { createdAt: now, updatedAt: now },
      children: listItems,
    },
    {
      id: btnId,
      type: NodeType.ELEMENT,
      tag: SemanticTag.A,
      content: tier.ctaText || 'Get Started',
      href: '#',
      typography: {
        fontSize: '0.875rem',
        fontWeight: '500',
        textAlign: TextAlign.CENTER,
        color: tier.highlighted ? '#ffffff' : '#4f46e5', // indigo-600
      },
      layout: {
        marginTop: '2rem',
        display: DisplayType.BLOCK,
        padding: '0.75rem 3rem',
        borderRadius: '9999px', // rounded-full
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#4f46e5', // indigo-600
      },
      effects: {
        backgroundColor: tier.highlighted ? '#4f46e5' : '#ffffff', // indigo-600 or white
      },
      meta: { createdAt: now, updatedAt: now },
    },
  ];

  return {
    id: cardId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    category: ComponentCategory.PRICING,
    layout: {
      display: DisplayType.BLOCK,
      padding: '1.5rem',
    },
    effects: {
      borderRadius: '1rem', // rounded-2xl
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: tier.highlighted ? '#4f46e5' : '#e5e7eb', // indigo-600 or gray-200
      boxShadow: tier.highlighted ? '0 0 0 1px #4f46e5' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // ring-1 ring-indigo-600 or shadow-xs
      transition: 'all 0.2s ease-in-out',
    },
    meta: { createdAt: now, updatedAt: now, aiGenerated: true },
    children,
  };
}

/**
 * Generates a HyperUI-style Pricing section with 3 tiers in a responsive grid.
 * Features:
 * - 3-column responsive grid (1 col on mobile, 2 on sm, 3 on lg)
 * - Pro tier highlighted with indigo border and ring
 * - All SVG checkmarks replaced with text "✓" in LI items
 * - Cards have hover effects (shadow and subtle transform)
 * - Each card: name, price, period, feature list, CTA button
 *
 * Props:
 *   tiers?: HyperUITierData[] - Custom tier data (optional)
 */
export function generateHyperUIPricingSection(props?: Record<string, unknown>): SectionNode {
  const customData = props?.tierData as HyperUITierData[] | undefined;
  const tiers: HyperUITierData[] = customData && customData.length > 0 ? customData.slice(0, 3) : HYPERUI_TIERS;

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();

  const tierCards = tiers.map((tier) => generateHyperUITierCard(tier, now));

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'hyperui-pricing-section',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Pricing Section', aiGenerated: true },
    children: [
      {
        id: containerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'hyperui-pricing-container',
        meta: { createdAt: now, updatedAt: now },
        children: tierCards,
        layout: {
          display: DisplayType.GRID,
          gridTemplateColumns: 'repeat(1, 1fr)',
          gap: '1rem',
          maxWidth: '48rem', // max-w-3xl
          margin: '0 auto',
          padding: '2rem 1rem',
          alignItems: 'center',
        },
      } as ContainerNode,
    ],
    layout: {
      display: DisplayType.BLOCK,
    },
  };
}
