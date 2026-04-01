import { NodeType, SemanticTag, DisplayType, FlexDirection, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

/**
 * Generates a Hero section with heading, subtext, and CTA button.
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
      gap: '1.25rem',
    },
    children: [
      {
        id: headingId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.H1,
        className: '',
        content: heading,
        typography: { fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.1', color: '#ffffff', textAlign: TextAlign.CENTER, letterSpacing: '-0.02em' },
        meta: { createdAt: now, updatedAt: now },
      },
      {
        id: paragraphId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: '',
        content: subtext,
        typography: { fontSize: '1.25rem', lineHeight: '1.7', color: '#94a3b8', textAlign: TextAlign.CENTER },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };

  // CTA button component
  const ctaComponentId = generateId();
  const buttonId = generateId();

  const ctaComponent: ComponentNode = {
    id: ctaComponentId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'hero-cta-wrap',
    layout: {
      display: DisplayType.FLEX,
      justifyContent: 'center',
      gap: '1rem',
      margin: '1rem 0 0 0',
    },
    meta: { createdAt: now, updatedAt: now },
    children: [
      {
        id: buttonId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.BUTTON,
        className: '',
        content: ctaText,
        attributes: { 'data-href': ctaHref },
        typography: { fontWeight: '600', fontSize: '1rem', color: '#ffffff' },
        inlineStyles: {
          backgroundColor: '#6366f1',
          padding: '0.875rem 2.5rem',
          borderRadius: '0.75rem',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
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
    inlineStyles: {
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      ...(backgroundUrl ? { backgroundImage: `url(${backgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
    },
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
        inlineStyles: { maxWidth: '800px', textAlign: 'center' },
        meta: { createdAt: now, updatedAt: now },
        children: [textComponent, ctaComponent],
        layout: {
          display: DisplayType.FLEX,
          flexDirection: FlexDirection.COLUMN,
          alignItems: 'center',
          gap: '1.5rem',
        },
      },
    ],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      minHeight: '80vh',
    },
    background: backgroundUrl
      ? { imageUrl: backgroundUrl, size: 'cover', position: 'center', repeat: 'no-repeat' }
      : { gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)' },
  };
}
