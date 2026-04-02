import { NodeType, SemanticTag, ComponentCategory } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

/**
 * Pricing -- 2-tier with highlighted Pro card.
 * Based on HyperUI pricing/1.html
 *
 * Props (via Record<string, unknown>):
 *   tiers?: Array<{ name: string; price: string; period?: string;
 *            features: string[]; ctaText?: string; highlighted?: boolean }>
 */
export function generatePricingTW2Tier(props?: Record<string, unknown>): SectionNode {
  const rawTiers = props?.tiers as Array<{
    name: string;
    price: string;
    period?: string;
    features: string[];
    ctaText?: string;
    highlighted?: boolean;
  }> | undefined;

  const tiers = rawTiers ?? [
    {
      name: 'Starter',
      price: '$20',
      period: '/month',
      features: ['10 users included', '2GB of storage', 'Email support', 'Help center access'],
      ctaText: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$30',
      period: '/month',
      features: ['20 users included', '5GB of storage', 'Email support', 'Help center access', 'Phone support', 'Community access'],
      ctaText: 'Get Started',
      highlighted: true,
    },
  ];

  const now = new Date().toISOString();

  // Build tier cards
  const tierCards: ComponentNode[] = tiers.map((tier) => {
    const isHighlighted = tier.highlighted ?? false;

    // Feature items as P elements
    const featureElements: ElementNode[] = tier.features.map((feat) => ({
      id: generateId(),
      type: NodeType.ELEMENT,
      tag: SemanticTag.P,
      className: 'flex items-center gap-1 text-gray-700',
      content: '\u2713 ' + feat,
      meta: { createdAt: now, updatedAt: now },
    }));

    // CTA button class based on highlight state
    const ctaClass = isHighlighted
      ? 'mt-8 block rounded-full border border-indigo-600 bg-indigo-600 px-12 py-3 text-center text-sm font-medium text-white hover:bg-indigo-700 hover:ring-1 hover:ring-indigo-700'
      : 'mt-8 block rounded-full border border-indigo-600 bg-white px-12 py-3 text-center text-sm font-medium text-indigo-600 hover:ring-1 hover:ring-indigo-600';

    return {
      id: generateId(),
      type: NodeType.COMPONENT,
      tag: SemanticTag.DIV,
      className: isHighlighted
        ? 'rounded-2xl border border-indigo-600 p-6 shadow-xs ring-1 ring-indigo-600 sm:order-last sm:px-8 lg:p-12'
        : 'rounded-2xl border border-gray-200 p-6 shadow-xs sm:px-8 lg:p-12',
      category: ComponentCategory.PRICING,
      meta: { createdAt: now, updatedAt: now },
      children: [
        // Tier header (name + price)
        {
          id: generateId(),
          type: NodeType.COMPONENT,
          tag: SemanticTag.DIV,
          className: 'text-center',
          meta: { createdAt: now, updatedAt: now },
          children: [
            {
              id: generateId(),
              type: NodeType.ELEMENT,
              tag: SemanticTag.H2,
              className: 'text-lg font-medium text-gray-900',
              content: tier.name,
              meta: { createdAt: now, updatedAt: now },
            },
            {
              id: generateId(),
              type: NodeType.ELEMENT,
              tag: SemanticTag.P,
              className: 'mt-2 sm:mt-4',
              content: tier.price + ' ' + (tier.period ?? '/month'),
              meta: { createdAt: now, updatedAt: now },
            },
          ],
        },
        // Features list wrapper
        {
          id: generateId(),
          type: NodeType.COMPONENT,
          tag: SemanticTag.DIV,
          className: 'mt-6 space-y-2',
          meta: { createdAt: now, updatedAt: now },
          children: featureElements,
        },
        // CTA button
        {
          id: generateId(),
          type: NodeType.ELEMENT,
          tag: SemanticTag.A,
          className: ctaClass,
          content: tier.ctaText ?? 'Get Started',
          href: '#',
          meta: { createdAt: now, updatedAt: now },
        },
      ],
    };
  });

  return {
    id: generateId(),
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'bg-white',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Pricing 2-Tier', aiGenerated: true },
    layout: {},
    children: [
      {
        id: generateId(),
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8',
        meta: { createdAt: now, updatedAt: now },
        layout: {},
        children: [
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-center md:gap-8',
            meta: { createdAt: now, updatedAt: now },
            children: tierCards,
          },
        ],
      } as ContainerNode,
    ],
  };
}
