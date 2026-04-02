import { NodeType, SemanticTag, ComponentCategory } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

/**
 * Hero — Light background, centered heading with badge, 4 feature cards + CTA.
 * Based on HyperUI hero-sections/4.html
 *
 * Props (via Record<string, unknown>):
 *   heading, subtext?, badge?, bottomCtaText?, bottomCtaHref?,
 *   features?: Array<{ title: string; description: string }>
 */
export function generateHeroTWLightCentered(props?: Record<string, unknown>): SectionNode {
  const heading = (props?.heading as string) ?? 'The Complete UI Toolkit';
  const subtext = (props?.subtext as string) ?? 'Everything you need to build professional websites. From simple buttons to complex dashboards, we have got you covered.';
  const badge = (props?.badge as string) ?? 'Version 4.0 Now Available';
  const bottomCtaText = (props?.bottomCtaText as string) ?? 'Explore All Components';
  const bottomCtaHref = (props?.bottomCtaHref as string) ?? '#';
  const rawFeatures = props?.features as Array<{ title: string; description: string }> | undefined;
  const features = rawFeatures ?? [
    { title: 'Marketing UI', description: 'Hero sections, pricing tables, testimonials, and more for your landing pages.' },
    { title: 'Application UI', description: 'Dashboards, settings panels, data tables, and admin interfaces.' },
    { title: 'E-Commerce', description: 'Product cards, shopping carts, checkout flows, and order tracking.' },
    { title: 'Neobrutalism', description: 'Bold, playful designs with thick borders and hard shadows.' },
  ];

  const now = new Date().toISOString();

  // Build feature card components
  const featureCards: ComponentNode[] = features.map((feature) => ({
    id: generateId(),
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-lg hover:ring-gray-300',
    meta: { createdAt: now, updatedAt: now },
    children: [
      {
        id: generateId(),
        type: NodeType.COMPONENT,
        tag: SemanticTag.DIV,
        className: 'flex size-12 items-center justify-center rounded-xl bg-gray-900 text-white',
        meta: { createdAt: now, updatedAt: now },
        children: [],
      },
      {
        id: generateId(),
        type: NodeType.ELEMENT,
        tag: SemanticTag.H3,
        className: 'mt-4 font-semibold text-gray-900',
        content: feature.title,
        meta: { createdAt: now, updatedAt: now },
      },
      {
        id: generateId(),
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'mt-2 text-sm text-gray-600',
        content: feature.description,
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  }));

  return {
    id: generateId(),
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'bg-gray-50 px-4 py-16 sm:px-6 sm:py-24 lg:px-8',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Hero Light Centered', aiGenerated: true },
    layout: {},
    children: [
      {
        id: generateId(),
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'mx-auto max-w-7xl',
        meta: { createdAt: now, updatedAt: now },
        layout: {},
        children: [
          // Centered header content
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'text-center',
            category: ComponentCategory.HERO,
            meta: { createdAt: now, updatedAt: now },
            children: [
              // Badge
              {
                id: generateId(),
                type: NodeType.ELEMENT,
                tag: SemanticTag.SPAN,
                className: 'inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white',
                content: badge,
                meta: { createdAt: now, updatedAt: now },
              },
              // Heading
              {
                id: generateId(),
                type: NodeType.ELEMENT,
                tag: SemanticTag.H1,
                className: 'mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl',
                content: heading,
                meta: { createdAt: now, updatedAt: now },
              },
              // Subtext
              {
                id: generateId(),
                type: NodeType.ELEMENT,
                tag: SemanticTag.P,
                className: 'mx-auto mt-6 max-w-2xl text-lg text-gray-700',
                content: subtext,
                meta: { createdAt: now, updatedAt: now },
              },
            ],
          },
          // Feature cards grid
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4',
            meta: { createdAt: now, updatedAt: now },
            children: featureCards,
          },
          // Bottom CTA
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'mt-12 text-center',
            meta: { createdAt: now, updatedAt: now },
            children: [
              {
                id: generateId(),
                type: NodeType.ELEMENT,
                tag: SemanticTag.A,
                className: 'inline-flex items-center justify-center rounded-lg bg-gray-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800',
                content: bottomCtaText,
                href: bottomCtaHref,
                meta: { createdAt: now, updatedAt: now },
              },
            ],
          },
        ],
      } as ContainerNode,
    ],
  };
}
