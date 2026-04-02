import { NodeType, SemanticTag, DisplayType, FlexDirection, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

/**
 * Generates a Hero section with heading, subtext, and CTA buttons.
 * Uses shadcn CSS variables for theming and pb-btn helper classes.
 *
 * Props:
 *   heading?: string   - Main heading text (default: "Welcome to Our Website")
 *   subtext?: string   - Subheading / paragraph text
 *   ctaText?: string   - CTA button label (default: "Get Started")
 *   ctaHref?: string   - CTA button link (default: "#")
 *   backgroundUrl?: string - Optional hero background image URL
 */
export function generateHeroSection(props?: Record<string, unknown>): SectionNode {
  const heading = (props?.heading as string) ?? 'Welcome to Our Website';
  const subtext = (props?.subtext as string) ?? 'Build something amazing with our platform. Fast, easy, and beautiful.';
  const ctaText = (props?.ctaText as string) ?? 'Get Started';
  const ctaHref = (props?.ctaHref as string) ?? '#';
  const backgroundUrl = props?.backgroundUrl as string | undefined;

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();

  // Badge element above the heading
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
      justifyContent: 'center',
    },
    children: [
      {
        id: badgeId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'pb-badge',
        content: 'New: AI-Powered Builder',
        typography: { fontSize: '0.8125rem', fontWeight: '600', letterSpacing: '0.03em', textTransform: 'uppercase' as const },
        inlineStyles: {
          background: 'rgba(255,255,255,0.15)',
          color: '#ffffff',
          padding: '0.375rem 1rem',
          borderRadius: '9999px',
          border: '1px solid rgba(255,255,255,0.2)',
        },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };

  // Text content component: wraps heading + paragraph
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

  // CTA buttons component: primary white + outline
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
        content: 'Learn More',
        attributes: { 'data-href': '#features' },
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
      sectionName: 'Hero Section',
      aiGenerated: true,
    },
    children: [
      {
        id: containerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'hero-container',
        meta: { createdAt: now, updatedAt: now },
        children: [badgeComponent, textComponent, ctaComponent],
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
      padding: '6rem 2rem',
      minHeight: '80vh',
    },
    background: backgroundUrl
      ? { imageUrl: backgroundUrl, size: 'cover', position: 'center', repeat: 'no-repeat' }
      : { gradient: 'var(--primary-gradient)' },
  };
}
