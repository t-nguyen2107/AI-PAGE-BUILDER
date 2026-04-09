import { NodeType, SemanticTag, DisplayType, FlexDirection, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

/**
 * Generates a Hero section with a split layout: left text (60%) + right image (40%).
 * Clean, professional, shadcn-inspired design on a white/light background.
 *
 * Props:
 *   heading?: string       - Main heading text (default: "Build Your Dream Website")
 *   subtext?: string       - Subheading / paragraph text
 *   ctaText?: string       - Primary CTA button label (default: "Get Started")
 *   ctaHref?: string       - Primary CTA button link (default: "#")
 *   backgroundUrl?: string - Right-side image URL (default: "/stock/hero/office-modern.webp")
 */
export function generateHeroSplitImage(props?: Record<string, unknown>): SectionNode {
  const heading = (props?.heading as string) ?? 'Build Your Dream Website';
  const subtext =
    (props?.subtext as string) ??
    'Create stunning, responsive websites with our intuitive drag-and-drop builder. No coding required.';
  const ctaText = (props?.ctaText as string) ?? 'Get Started';
  const ctaHref = (props?.ctaHref as string) ?? '#';
  const backgroundUrl = (props?.backgroundUrl as string) ?? 'https://picsum.photos/seed/hero-office-modern/1200/800';

  const now = new Date().toISOString();
  const sectionId = generateId();

  // --- Badge component (above heading) ---
  const badgeComponentId = generateId();
  const badgeId = generateId();

  const badgeComponent: ComponentNode = {
    id: badgeComponentId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'hero-badge-wrap',
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.FLEX,
      justifyContent: 'flex-start',
    },
    children: [
      {
        id: badgeId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'pb-badge',
        content: 'New: AI-Powered Builder',
        typography: {
          fontSize: '0.8125rem',
          fontWeight: '600',
          letterSpacing: '0.03em',
          textTransform: 'uppercase' as const,
        },
        inlineStyles: {
          background: 'var(--primary-container)',
          color: 'var(--on-primary-container)',
          padding: '0.375rem 1rem',
          borderRadius: '9999px',
          border: '1px solid var(--border)',
        },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };

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
      alignItems: 'flex-start',
      gap: '1.25rem',
    },
    children: [
      {
        id: headingId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.H1,
        className: 'pb-section-title',
        content: heading,
        typography: {
          fontSize: '3.25rem',
          fontWeight: '800',
          lineHeight: '1.1',
          color: 'var(--foreground)',
          textAlign: TextAlign.LEFT,
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
          fontSize: '1.125rem',
          lineHeight: '1.7',
          color: 'var(--muted-foreground)',
          textAlign: TextAlign.LEFT,
        },
        inlineStyles: {
          maxWidth: '520px',
        },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };

  // --- CTA buttons component: primary + outline ---
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
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: '1rem',
      margin: '1rem 0 0 0',
    },
    meta: { createdAt: now, updatedAt: now },
    children: [
      {
        id: primaryBtnId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.BUTTON,
        className: 'pb-btn pb-btn-primary',
        content: ctaText,
        attributes: { 'data-href': ctaHref },
        typography: { fontWeight: '600', fontSize: '1rem' },
        inlineStyles: {
          padding: '0.875rem 2.25rem',
          borderRadius: '0.75rem',
        },
        meta: { createdAt: now, updatedAt: now },
      },
      {
        id: outlineBtnId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.BUTTON,
        className: 'pb-btn pb-btn-outline',
        content: 'Learn More',
        attributes: { 'data-href': '#features' },
        typography: { fontWeight: '600', fontSize: '1rem' },
        inlineStyles: {
          padding: '0.875rem 2.25rem',
          borderRadius: '0.75rem',
        },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };

  // --- Left column container: badge + text + CTA ---
  const leftColumnId = generateId();

  const leftColumn: ContainerNode = {
    id: leftColumnId,
    type: NodeType.CONTAINER,
    tag: SemanticTag.DIV,
    className: 'hero-split-left',
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      gap: '1.5rem',
      width: '60%',
      padding: '0 2rem 0 0',
    },
    children: [badgeComponent, textComponent, ctaComponent],
  };

  // --- Right column container: image component ---
  const rightColumnId = generateId();
  const imageComponentId = generateId();
  const imageId = generateId();

  const rightColumn: ContainerNode = {
    id: rightColumnId,
    type: NodeType.CONTAINER,
    tag: SemanticTag.DIV,
    className: 'hero-split-right',
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.FLEX,
      width: '40%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    children: [
      {
        id: imageComponentId,
        type: NodeType.COMPONENT,
        tag: SemanticTag.FIGURE,
        className: 'hero-split-image-wrap',
        meta: { createdAt: now, updatedAt: now },
        children: [
          {
            id: imageId,
            type: NodeType.ELEMENT,
            tag: SemanticTag.IMG,
            className: 'hero-split-image',
            src: backgroundUrl,
            attributes: { alt: heading, loading: 'lazy' },
            inlineStyles: {
              width: '100%',
              height: 'auto',
              borderRadius: '1rem',
              objectFit: 'cover',
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            },
            meta: { createdAt: now, updatedAt: now },
          },
        ],
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
      sectionName: 'Hero Split Image',
      aiGenerated: true,
    },
    children: [leftColumn, rightColumn],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.ROW,
      alignItems: 'center',
      gap: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '4rem 2rem',
    },
    background: {
      color: 'var(--background)',
    },
  };
}
