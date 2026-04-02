import { NodeType, SemanticTag, ComponentCategory } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode } from '@/types/dom-tree';

/**
 * Features -- 3-column bordered cards with icon placeholders.
 * Based on HyperUI feature-grids/1.html
 *
 * Props:
 *   heading?, subtitle?,
 *   items?: Array<{ title: string; description: string; icon?: string }>
 */
export function generateFeaturesTWCards(props?: Record<string, unknown>): SectionNode {
  const heading = (props?.heading as string) ?? 'Features for growth';
  const subtitle = (props?.subtitle as string) ?? 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Veritatis tenetur, nemo quam voluptas sunt impedit dolorem asperiores aliquid doloribus fugit.';
  const rawItems = props?.items as Array<{ title: string; description: string; icon?: string }> | undefined;
  const items = rawItems ?? [
    { title: 'High performance', description: 'Lightning-quick load times optimized for every device' },
    { title: 'Enterprise security', description: 'Enterprise-grade security built into every layer' },
    { title: 'Highly configurable', description: 'Adapt every aspect to match your brand and needs' },
  ];

  const now = new Date().toISOString();

  // Feature cards
  const cardComponents: ComponentNode[] = items.map((item) => ({
    id: generateId(),
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'rounded-lg border border-gray-200 p-6',
    meta: { createdAt: now, updatedAt: now },
    children: [
      // Icon placeholder
      {
        id: generateId(),
        type: NodeType.COMPONENT,
        tag: SemanticTag.DIV,
        className: 'inline-flex rounded-lg bg-gray-100 p-3 text-gray-700',
        meta: { createdAt: now, updatedAt: now },
        children: [
          {
            id: generateId(),
            type: NodeType.ELEMENT,
            tag: SemanticTag.P,
            className: 'text-lg font-bold',
            content: (item.icon ?? item.title).charAt(0),
            meta: { createdAt: now, updatedAt: now },
          },
        ],
      },
      // Title
      {
        id: generateId(),
        type: NodeType.ELEMENT,
        tag: SemanticTag.H3,
        className: 'mt-4 text-lg font-semibold text-gray-900',
        content: item.title,
        meta: { createdAt: now, updatedAt: now },
      },
      // Description
      {
        id: generateId(),
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'mt-2 text-pretty text-gray-700',
        content: item.description,
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  }));

  return {
    id: generateId(),
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'bg-white',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Features Cards', aiGenerated: true },
    layout: {},
    children: [
      {
        id: generateId(),
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8',
        meta: { createdAt: now, updatedAt: now },
        layout: {},
        children: [
          // Header
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'mx-auto max-w-lg text-center',
            category: ComponentCategory.FEATURES,
            meta: { createdAt: now, updatedAt: now },
            children: [
              {
                id: generateId(),
                type: NodeType.ELEMENT,
                tag: SemanticTag.H2,
                className: 'text-3xl/tight font-bold text-gray-900 sm:text-4xl',
                content: heading,
                meta: { createdAt: now, updatedAt: now },
              },
              {
                id: generateId(),
                type: NodeType.ELEMENT,
                tag: SemanticTag.P,
                className: 'mt-4 text-lg text-pretty text-gray-700',
                content: subtitle,
                meta: { createdAt: now, updatedAt: now },
              },
            ],
          },
          // Cards grid
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'mt-8 grid grid-cols-1 gap-8 md:grid-cols-3',
            meta: { createdAt: now, updatedAt: now },
            children: cardComponents,
          },
        ],
      } as ContainerNode,
    ],
  };
}
