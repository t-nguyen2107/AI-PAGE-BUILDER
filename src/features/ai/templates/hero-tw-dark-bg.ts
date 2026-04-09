import { NodeType, SemanticTag, ComponentCategory } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

/**
 * Hero — Dark background with image overlay, badge, heading, subtext, 2 CTAs, stats bar.
 * Based on HyperUI hero-sections/1.html
 *
 * Props (via Record<string, unknown>):
 *   heading, subtext?, badge?, ctaText?, ctaHref?, ctaSecondaryText?, backgroundUrl?,
 *   stats?: Array<{ value: string; label: string }>
 */
export function generateHeroTWDarkBg(props?: Record<string, unknown>): SectionNode {
  const heading = (props?.heading as string) ?? 'Design Without Limits';
  const subtext = (props?.subtext as string) ?? 'Create stunning, responsive websites with our comprehensive collection of professionally designed components.';
  const badge = (props?.badge as string) ?? 'New Release';
  const ctaText = (props?.ctaText as string) ?? 'Get Started';
  const ctaHref = (props?.ctaHref as string) ?? '#';
  const ctaSecondaryText = (props?.ctaSecondaryText as string) ?? 'Learn More';
  const backgroundUrl = (props?.backgroundUrl as string) ?? 'https://picsum.photos/seed/hero-tech-dark/1200/800';
  const rawStats = props?.stats as Array<{ value: string; label: string }> | undefined;
  const stats = rawStats ?? [
    { value: '500+', label: 'Components' },
    { value: '50k+', label: 'Users' },
    { value: '99%', label: 'Satisfaction' },
  ];

  const now = new Date().toISOString();

  // Build stat items
  const statItems: ComponentNode[] = stats.map((stat) => ({
    id: generateId(),
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'text-center',
    meta: { createdAt: now, updatedAt: now },
    children: [
      {
        id: generateId(),
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'text-3xl font-bold text-white',
        content: stat.value,
        meta: { createdAt: now, updatedAt: now },
      },
      {
        id: generateId(),
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'mt-1 text-sm text-gray-400',
        content: stat.label,
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  }));

  // CTA buttons
  const ctaChildren: ElementNode[] = [
    {
      id: generateId(),
      type: NodeType.ELEMENT,
      tag: SemanticTag.A,
      className: 'inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100',
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
      className: 'inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-8 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10',
      content: ctaSecondaryText,
      href: '#',
      meta: { createdAt: now, updatedAt: now },
    });
  }

  return {
    id: generateId(),
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'relative min-h-screen overflow-hidden bg-gray-900',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Hero Dark BG', aiGenerated: true },
    layout: {},
    children: [
      // Background image overlay
      {
        id: generateId(),
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'absolute inset-0',
        meta: { createdAt: now, updatedAt: now },
        layout: {},
        children: [
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'size-full',
            meta: { createdAt: now, updatedAt: now },
            children: [
              {
                id: generateId(),
                type: NodeType.ELEMENT,
                tag: SemanticTag.IMG,
                className: 'size-full object-cover opacity-40',
                src: backgroundUrl,
                attributes: { alt: '' },
                meta: { createdAt: now, updatedAt: now },
              },
            ],
          },
        ],
      } as ContainerNode,
      // Main content
      {
        id: generateId(),
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'relative flex min-h-screen items-center px-4 py-16 sm:px-6 lg:px-8',
        meta: { createdAt: now, updatedAt: now },
        layout: {},
        children: [
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'mx-auto max-w-4xl text-center',
            category: ComponentCategory.HERO,
            meta: { createdAt: now, updatedAt: now },
            children: [
              // Badge
              {
                id: generateId(),
                type: NodeType.ELEMENT,
                tag: SemanticTag.P,
                className: 'inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm',
                content: badge,
                meta: { createdAt: now, updatedAt: now },
              },
              // Heading
              {
                id: generateId(),
                type: NodeType.ELEMENT,
                tag: SemanticTag.H1,
                className: 'mt-8 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl',
                content: heading,
                meta: { createdAt: now, updatedAt: now },
              },
              // Subtext
              {
                id: generateId(),
                type: NodeType.ELEMENT,
                tag: SemanticTag.P,
                className: 'mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-300',
                content: subtext,
                meta: { createdAt: now, updatedAt: now },
              },
              // CTA buttons wrapper
              {
                id: generateId(),
                type: NodeType.COMPONENT,
                tag: SemanticTag.DIV,
                className: 'mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row',
                meta: { createdAt: now, updatedAt: now },
                children: ctaChildren,
              },
              // Stats bar
              {
                id: generateId(),
                type: NodeType.COMPONENT,
                tag: SemanticTag.DIV,
                className: 'mt-12 grid grid-cols-3 gap-8 border-t border-white/10 pt-8',
                meta: { createdAt: now, updatedAt: now },
                children: statItems,
              },
            ],
          },
        ],
      } as ContainerNode,
    ],
  };
}
