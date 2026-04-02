import { NodeType, SemanticTag, DisplayType, FlexDirection, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

/**
 * Generates a minimal dark Hero section with a large heading, short paragraph,
 * and a single white CTA button. Clean, modern, no badge, no secondary button.
 *
 * Props:
 *   heading?: string   - Main heading text (default: "Simple. Powerful. Fast.")
 *   subtext?: string   - Short paragraph text
 *   ctaText?: string   - CTA button label (default: "Get Started")
 *   ctaHref?: string   - CTA button link (default: "#")
 */
export function generateHeroMinimalDark(props?: Record<string, unknown>): SectionNode {
  const heading = (props?.heading as string) ?? 'Simple. Powerful. Fast.';
  const subtext =
    (props?.subtext as string) ??
    'The modern platform that gets out of your way so you can focus on what matters.';
  const ctaText = (props?.ctaText as string) ?? 'Get Started';
  const ctaHref = (props?.ctaHref as string) ?? '#';

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
          fontSize: '4rem',
          fontWeight: '800',
          lineHeight: '1.05',
          color: '#ffffff',
          textAlign: TextAlign.CENTER,
          letterSpacing: '-0.04em',
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
          color: 'rgba(255,255,255,0.7)',
          textAlign: TextAlign.CENTER,
        },
        inlineStyles: {
          maxWidth: '520px',
        },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };

  // --- Single CTA button component ---
  const ctaComponentId = generateId();
  const primaryBtnId = generateId();

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
      margin: '2rem 0 0 0',
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
          padding: '0.875rem 2.75rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'hero-section pb-section-dark',
    meta: {
      createdAt: now,
      updatedAt: now,
      sectionName: 'Hero Minimal Dark',
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
        },
      },
    ],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '5rem 2rem',
      minHeight: '70vh',
    },
    background: {
      color: 'var(--foreground)',
    },
  };
}
