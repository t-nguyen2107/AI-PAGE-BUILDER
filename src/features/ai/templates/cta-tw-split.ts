import { NodeType, SemanticTag, ComponentCategory } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode } from '@/types/dom-tree';

/**
 * CTA -- Split layout with image on right, text + CTA on left.
 * Based on HyperUI ctas/1.html (hero-sections/3.html pattern)
 *
 * Props:
 *   heading, subtext?, ctaText?, ctaHref?, imageUrl?
 */
export function generateCtaTWSplit(props?: Record<string, unknown>): SectionNode {
  const heading = (props?.heading as string) ?? 'Lorem, ipsum dolor sit amet consectetur adipisicing elit';
  const subtext = (props?.subtext as string) ?? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Et, egestas tempus tellus etiam sed. Quam a scelerisque amet ullamcorper eu enim et fermentum, augue.';
  const ctaText = (props?.ctaText as string) ?? 'Get Started Today';
  const ctaHref = (props?.ctaHref as string) ?? '#';
  const imageUrl = (props?.imageUrl as string) ?? 'https://images.unsplash.com/photo-1464582883107-8adf2dca8a9f?auto=format&fit=crop&q=80&w=1160';

  const now = new Date().toISOString();

  return {
    id: generateId(),
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'overflow-hidden bg-gray-50 sm:grid sm:grid-cols-2',
    meta: { createdAt: now, updatedAt: now, sectionName: 'CTA Split', aiGenerated: true },
    layout: {},
    children: [
      // Left: text content
      {
        id: generateId(),
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'p-8 md:p-12 lg:px-16 lg:py-24',
        meta: { createdAt: now, updatedAt: now },
        layout: {},
        children: [
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'mx-auto max-w-xl text-center sm:text-left',
            category: ComponentCategory.CTA,
            meta: { createdAt: now, updatedAt: now },
            children: [
              // Heading
              {
                id: generateId(),
                type: NodeType.ELEMENT,
                tag: SemanticTag.H2,
                className: 'text-2xl font-bold text-gray-900 md:text-3xl',
                content: heading,
                meta: { createdAt: now, updatedAt: now },
              },
              // Subtext
              {
                id: generateId(),
                type: NodeType.ELEMENT,
                tag: SemanticTag.P,
                className: 'hidden text-gray-500 md:mt-4 md:block',
                content: subtext,
                meta: { createdAt: now, updatedAt: now },
              },
              // CTA button
              {
                id: generateId(),
                type: NodeType.COMPONENT,
                tag: SemanticTag.DIV,
                className: 'mt-4 md:mt-8',
                meta: { createdAt: now, updatedAt: now },
                children: [
                  {
                    id: generateId(),
                    type: NodeType.ELEMENT,
                    tag: SemanticTag.A,
                    className: 'inline-block rounded-sm bg-emerald-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 focus:ring-2 focus:ring-yellow-400 focus:outline-hidden',
                    content: ctaText,
                    href: ctaHref,
                    meta: { createdAt: now, updatedAt: now },
                  },
                ],
              },
            ],
          },
        ],
      } as ContainerNode,
      // Right: image
      {
        id: generateId(),
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'relative',
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
                className: 'h-56 w-full object-cover sm:h-full',
                src: imageUrl,
                attributes: { alt: '' },
                meta: { createdAt: now, updatedAt: now },
              },
            ],
          },
        ],
      } as ContainerNode,
    ],
  };
}
