import { NodeType, SemanticTag, DisplayType, FlexDirection, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

/**
 * Generates a CTA section with split layout: left text column + right image column.
 * Based on HyperUI ctas/1.html template.
 *
 * Features:
 * - Grid-based split layout (2 columns on sm+ screens)
 * - Left column: centered heading, paragraph, and emerald CTA button
 * - Right column: full-height image with object-cover
 * - Gray-50 background
 * - Responsive text alignment (center on mobile, left on sm+)
 *
 * Props:
 *   heading?: string       - Main heading (default: "Lorem, ipsum dolor sit amet...")
 *   subtext?: string       - Description paragraph
 *   ctaText?: string       - Button label (default: "Get Started Today")
 *   ctaHref?: string       - Button link (default: "#")
 *   imageUrl?: string      - Right column image URL
 */
export function generateCtaSplitImage(props?: Record<string, unknown>): SectionNode {
  const heading =
    (props?.heading as string) ?? 'Lorem, ipsum dolor sit amet consectetur adipisicing elit';
  const subtext =
    (props?.subtext as string) ??
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Et, egestas tempus tellus etiam sed. Quam a scelerisque amet ullamcorper eu enim et fermentum, augue.';
  const ctaText = (props?.ctaText as string) ?? 'Get Started Today';
  const ctaHref = (props?.ctaHref as string) ?? '#';
  const imageUrl =
    (props?.imageUrl as string) ?? 'https://images.unsplash.com/photo-1464582883107-8adf2dca8a9f?auto=format&fit=crop&q=80&w=1160';

  const now = new Date().toISOString();
  const sectionId = generateId();

  // --- Left column: heading + subtext + CTA button ---
  const leftColumnId = generateId();
  const headingId = generateId();
  const subtextId = generateId();
  const ctaButtonId = generateId();

  // Content wrapper (max-w-xl, responsive text alignment)
  const contentWrapperId = generateId();
  const contentWrapper: ComponentNode = {
    id: contentWrapperId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'cta-split-content',
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      gap: '1rem',
      maxWidth: '36rem', // max-w-xl
      margin: '0 auto',
    },
    children: [
      {
        id: headingId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.H2,
        className: 'cta-split-heading',
        content: heading,
        typography: {
          fontSize: '1.5rem', // text-2xl
          fontWeight: '700', // font-bold
          lineHeight: '1.3',
          color: '#111827', // text-gray-900
          textAlign: TextAlign.CENTER,
        },
        inlineStyles: {
          maxWidth: '100%',
        },
        meta: { createdAt: now, updatedAt: now },
      },
      {
        id: subtextId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'cta-split-subtext',
        content: subtext,
        typography: {
          fontSize: '1rem',
          lineHeight: '1.6',
          color: '#6b7280', // text-gray-500
          textAlign: TextAlign.CENTER,
        },
        inlineStyles: {
          display: 'none', // hidden on mobile
        },
        attributes: {
          'data-hidden-mobile': 'true',
          'data-show-md': 'true',
        },
        meta: { createdAt: now, updatedAt: now },
      },
      {
        id: ctaButtonId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.A,
        className: 'cta-split-button',
        content: ctaText,
        href: ctaHref,
        typography: {
          fontSize: '0.875rem', // text-sm
          fontWeight: '500', // font-medium
          color: '#ffffff',
          textAlign: TextAlign.CENTER,
        },
        inlineStyles: {
          display: 'inline-block',
          padding: '0.75rem 3rem', // px-12 py-3
          borderRadius: '0.125rem', // rounded-sm
          backgroundColor: '#059669', // bg-emerald-600
          textDecoration: 'none',
          transition: 'background-color 0.2s',
        },
        attributes: {
          'data-hover-bg': '#047857', // hover:bg-emerald-700
        },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };

  const leftColumn: ContainerNode = {
    id: leftColumnId,
    type: NodeType.CONTAINER,
    tag: SemanticTag.DIV,
    className: 'cta-split-left',
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.FLEX,
      padding: '2rem', // p-8
      maxWidth: '100%',
    },
    children: [contentWrapper],
  };

  // --- Right column: image ---
  const rightColumnId = generateId();
  const imageComponentId = generateId();
  const imageId = generateId();

  const imageComponent: ComponentNode = {
    id: imageComponentId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.FIGURE,
    className: 'cta-split-image-wrap',
    meta: { createdAt: now, updatedAt: now },
    children: [
      {
        id: imageId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.IMG,
        className: 'cta-split-image',
        src: imageUrl,
        attributes: {
          alt: '',
          loading: 'lazy',
        },
        inlineStyles: {
          width: '100%',
          height: '14rem', // h-56 on mobile
          objectFit: 'cover',
          display: 'block',
        },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };

  const rightColumn: ContainerNode = {
    id: rightColumnId,
    type: NodeType.CONTAINER,
    tag: SemanticTag.DIV,
    className: 'cta-split-right',
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.BLOCK,
      overflow: 'hidden',
    },
    children: [imageComponent],
  };

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'cta-split-section',
    meta: {
      createdAt: now,
      updatedAt: now,
      sectionName: 'CTA Split Image',
      aiGenerated: true,
    },
    children: [leftColumn, rightColumn],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.ROW,
      flexWrap: 'wrap',
      overflow: 'hidden',
    },
    background: {
      color: '#f9fafb', // bg-gray-50
    },
  };
}
