import { NodeType, SemanticTag, ComponentCategory } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

/**
 * Hero -- Split layout: left text with checkmark items + right image.
 * Based on HyperUI hero-sections/3.html
 *
 * Props:
 *   heading, subtext?, ctaText?, ctaHref?, ctaSecondaryText?, imageUrl?,
 *   features?: Array<{ title: string; description: string }>
 */
export function generateHeroTWSplit(props?: Record<string, unknown>): SectionNode {
  const heading = (props?.heading as string) ?? 'Launch Your Project in Minutes';
  const subtext = (props?.subtext as string) ?? 'Skip the design phase and start building immediately. Our components are production-ready, fully responsive, and built with accessibility in mind.';
  const ctaText = (props?.ctaText as string) ?? 'Browse Components';
  const ctaHref = (props?.ctaHref as string) ?? '#';
  const ctaSecondaryText = (props?.ctaSecondaryText as string) ?? 'View on GitHub';
  const imageUrl = (props?.imageUrl as string) ?? 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=2070';
  const rawFeatures = props?.features as Array<{ title: string; description: string }> | undefined;
  const features = rawFeatures ?? [
    { title: 'Copy & Paste Ready', description: 'No installation required. Just copy the code and use it.' },
    { title: 'Fully Customizable', description: 'Adapt every component to match your brand.' },
    { title: 'Always Free', description: 'Open source and free forever. No subscriptions.' },
  ];

  const now = new Date().toISOString();

  // Feature check items
  const featureComponents: ComponentNode[] = features.map((feat) => ({
    id: generateId(),
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'flex items-start gap-3',
    meta: { createdAt: now, updatedAt: now },
    children: [
      {
        id: generateId(),
        type: NodeType.COMPONENT,
        tag: SemanticTag.DIV,
        className: 'flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-900',
        meta: { createdAt: now, updatedAt: now },
        children: [
          {
            id: generateId(),
            type: NodeType.ELEMENT,
            tag: SemanticTag.P,
            className: 'text-xs text-white font-bold',
            content: '\u2713',
            meta: { createdAt: now, updatedAt: now },
          },
        ],
      },
      {
        id: generateId(),
        type: NodeType.COMPONENT,
        tag: SemanticTag.DIV,
        meta: { createdAt: now, updatedAt: now },
        children: [
          {
            id: generateId(),
            type: NodeType.ELEMENT,
            tag: SemanticTag.H3,
            className: 'font-medium text-gray-900',
            content: feat.title,
            meta: { createdAt: now, updatedAt: now },
          },
          {
            id: generateId(),
            type: NodeType.ELEMENT,
            tag: SemanticTag.P,
            className: 'mt-1 text-sm text-gray-600',
            content: feat.description,
            meta: { createdAt: now, updatedAt: now },
          },
        ],
      },
    ],
  }));

  // CTA buttons
  const ctaChildren: ElementNode[] = [
    {
      id: generateId(),
      type: NodeType.ELEMENT,
      tag: SemanticTag.A,
      className: 'inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800',
      content: ctaText,
      href: ctaHref,
      meta: { createdAt: now, updatedAt: now },
    },
  ];

  if (ctaSecondaryText) {
    ctaChildren.push({
      id: generateId(),
      type: NodeType.ELEMENT,
      tag: SemanticTag.A,
      className: 'inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50',
      content: ctaSecondaryText,
      href: '#',
      meta: { createdAt: now, updatedAt: now },
    });
  }

  return {
    id: generateId(),
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'bg-white',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Hero Split', aiGenerated: true },
    layout: {},
    children: [
      {
        id: generateId(),
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'grid min-h-screen lg:grid-cols-2',
        meta: { createdAt: now, updatedAt: now },
        layout: {},
        children: [
          // Left: text content
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'flex items-center px-4 py-16 sm:px-6 lg:px-12 xl:px-20',
            meta: { createdAt: now, updatedAt: now },
            children: [
              {
                id: generateId(),
                type: NodeType.COMPONENT,
                tag: SemanticTag.DIV,
                className: 'mx-auto max-w-xl',
                category: ComponentCategory.HERO,
                meta: { createdAt: now, updatedAt: now },
                children: [
                  // Heading
                  {
                    id: generateId(),
                    type: NodeType.ELEMENT,
                    tag: SemanticTag.H1,
                    className: 'text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl',
                    content: heading,
                    meta: { createdAt: now, updatedAt: now },
                  },
                  // Subtext
                  {
                    id: generateId(),
                    type: NodeType.ELEMENT,
                    tag: SemanticTag.P,
                    className: 'mt-6 text-lg leading-relaxed text-gray-700',
                    content: subtext,
                    meta: { createdAt: now, updatedAt: now },
                  },
                  // Feature items
                  {
                    id: generateId(),
                    type: NodeType.COMPONENT,
                    tag: SemanticTag.DIV,
                    className: 'mt-8 space-y-4',
                    meta: { createdAt: now, updatedAt: now },
                    children: featureComponents,
                  },
                  // CTA buttons
                  {
                    id: generateId(),
                    type: NodeType.COMPONENT,
                    tag: SemanticTag.DIV,
                    className: 'mt-10 flex flex-col gap-4 sm:flex-row',
                    meta: { createdAt: now, updatedAt: now },
                    children: ctaChildren,
                  },
                ],
              },
            ],
          },
          // Right: image
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'relative bg-gray-100 lg:block',
            meta: { createdAt: now, updatedAt: now },
            children: [
              {
                id: generateId(),
                type: NodeType.COMPONENT,
                tag: SemanticTag.DIV,
                className: 'absolute inset-0 size-full',
                meta: { createdAt: now, updatedAt: now },
                children: [
                  {
                    id: generateId(),
                    type: NodeType.ELEMENT,
                    tag: SemanticTag.IMG,
                    className: 'absolute inset-0 size-full object-cover',
                    src: imageUrl,
                    attributes: { alt: '' },
                    meta: { createdAt: now, updatedAt: now },
                  },
                ],
              },
            ],
          },
        ],
      } as ContainerNode,
    ],
  };
}
