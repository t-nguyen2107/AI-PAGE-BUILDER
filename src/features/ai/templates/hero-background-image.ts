import { NodeType, SemanticTag, DisplayType, FlexDirection, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

/**
 * Generates a Hero section with a full-width background image and dark overlay.
 * Content is centered on top of the overlay. Ideal for restaurant, food, or
 * lifestyle landing pages.
 *
 * Props:
 *   heading?: string       - Main heading text (default: "Welcome to Our Restaurant")
 *   subtext?: string       - Subheading / paragraph text
 *   ctaText?: string       - Primary CTA button label (default: "Reserve a Table")
 *   ctaHref?: string       - Primary CTA button link (default: "#")
 *   backgroundUrl?: string - Background image URL (default: "/stock/food/meal-table.webp")
 */
export function generateHeroBackgroundImage(props?: Record<string, unknown>): SectionNode {
  const heading = (props?.heading as string) ?? 'Welcome to Our Restaurant';
  const subtext =
    (props?.subtext as string) ??
    'Experience culinary excellence in an atmosphere designed for unforgettable moments.';
  const ctaText = (props?.ctaText as string) ?? 'Reserve a Table';
  const ctaHref = (props?.ctaHref as string) ?? '#';
  const backgroundUrl = (props?.backgroundUrl as string) ?? 'https://picsum.photos/seed/food-meal-table/800/600';

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();

  // --- Text content component: heading + paragraph ---
  const textComponentId = generateId();
  const headingId = generateId();
  const paragraphId = generateId();

  const textComponent: ComponentNode = {
    id: textComponentId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'hero-text',
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      gap: '1.5rem',
    },
    children: [
      {
        id: headingId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.H1,
        className: 'pb-section-title',
        content: heading,
        typography: {
          fontSize: '3.75rem',
          fontWeight: '800',
          lineHeight: '1.08',
          color: '#ffffff',
          textAlign: TextAlign.CENTER,
          letterSpacing: '-0.03em',
        },
        meta: { createdAt: now, updatedAt: now },
      },
      {
        id: paragraphId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'pb-section-subtitle',
        content: subtext,
        typography: {
          fontSize: '1.25rem',
          lineHeight: '1.7',
          color: 'rgba(255,255,255,0.85)',
          textAlign: TextAlign.CENTER,
        },
        inlineStyles: {
          maxWidth: '600px',
        },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };

  // --- CTA buttons component: white primary + outline ---
  const ctaComponentId = generateId();
  const primaryBtnId = generateId();
  const outlineBtnId = generateId();

  const ctaComponent: ComponentNode = {
    id: ctaComponentId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'hero-cta-wrap',
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.ROW,
      justifyContent: 'center',
      alignItems: 'center',
      gap: '1rem',
      margin: '1.5rem 0 0 0',
    },
    meta: { createdAt: now, updatedAt: now },
    children: [
      {
        id: primaryBtnId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.BUTTON,
        className: 'pb-btn pb-btn-white',
        content: ctaText,
        attributes: { 'data-href': ctaHref },
        typography: { fontWeight: '600', fontSize: '1rem' },
        inlineStyles: {
          padding: '0.875rem 2.5rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        },
        meta: { createdAt: now, updatedAt: now },
      },
      {
        id: outlineBtnId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.BUTTON,
        className: 'pb-btn pb-btn-outline',
        content: 'View Menu',
        attributes: { 'data-href': '#menu' },
        typography: { fontWeight: '600', fontSize: '1rem', color: '#ffffff' },
        inlineStyles: {
          padding: '0.875rem 2.5rem',
          borderRadius: '0.75rem',
          border: '2px solid rgba(255,255,255,0.35)',
          background: 'transparent',
        },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'hero-section',
    meta: {
      createdAt: now,
      updatedAt: now,
      sectionName: 'Hero Background Image',
      aiGenerated: true,
    },
    children: [
      {
        id: containerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'hero-container',
        meta: { createdAt: now, updatedAt: now },
        children: [textComponent, ctaComponent],
        layout: {
          display: DisplayType.FLEX,
          flexDirection: FlexDirection.COLUMN,
          alignItems: 'center',
          gap: '0.5rem',
          maxWidth: '800px',
          margin: '0 auto',
          minHeight: '80vh',
          justifyContent: 'center',
        },
        inlineStyles: {
          background: 'rgba(0,0,0,0.5)',
          padding: '4rem 2rem',
        },
      },
    ],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      justifyContent: 'center',
    },
    background: {
      imageUrl: backgroundUrl,
      size: 'cover',
      position: 'center',
      repeat: 'no-repeat',
    },
  };
}
