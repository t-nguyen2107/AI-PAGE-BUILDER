import { NodeType, SemanticTag, DisplayType, FlexDirection } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ComponentNode, ElementNode, ItemNode } from '@/types/dom-tree';

/**
 * Generates a dark-background navigation header with logo, nav links, and CTA button.
 *
 * Props:
 *   siteName?: string   - Logo / site name text (default: "MyWebsite")
 *   links?: string[]    - Navigation link labels (default: ["Home", "About", "Services", "Contact"])
 *   ctaText?: string    - CTA button text (default: "Get Started")
 */
export function generateHeaderDark(props?: Record<string, unknown>): SectionNode {
  const siteName = (props?.siteName as string) ?? 'MyWebsite';
  const links = (props?.links as string[]) ?? ['Home', 'About', 'Services', 'Contact'];
  const ctaText = (props?.ctaText as string) ?? 'Get Started';

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();

  // Logo component
  const logoComponent: ComponentNode = {
    id: generateId(),
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'header-logo-wrap',
    meta: { createdAt: now, updatedAt: now },
    children: [
      {
        id: generateId(),
        type: NodeType.ELEMENT,
        tag: SemanticTag.A,
        className: 'header-logo',
        href: '/',
        content: siteName,
        typography: {
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#ffffff',
          letterSpacing: '-0.025em',
        },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };

  // Nav items as LI ItemNodes
  const navItems: ItemNode[] = links.map((label) => ({
    id: generateId(),
    type: NodeType.ITEM,
    tag: SemanticTag.LI,
    className: 'nav-item',
    content: label,
    attributes: { 'data-href': `/${label.toLowerCase().replace(/\s+/g, '-')}` },
    typography: {
      fontSize: '0.9375rem',
      fontWeight: '500',
      color: 'rgba(255,255,255,0.7)',
      letterSpacing: '0.01em',
    },
    meta: { createdAt: now, updatedAt: now },
  }));

  // Nav component with UL
  const navComponent: ComponentNode = {
    id: generateId(),
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'header-nav-wrap',
    meta: { createdAt: now, updatedAt: now },
    children: [
      {
        id: generateId(),
        type: NodeType.ELEMENT,
        tag: SemanticTag.UL,
        className: 'header-nav-list',
        children: navItems,
        inlineStyles: {
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          listStyle: 'none',
          margin: '0',
          padding: '0',
        },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };

  // CTA button component
  const ctaButtonComponent: ComponentNode = {
    id: generateId(),
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'header-cta-wrap',
    meta: { createdAt: now, updatedAt: now },
    children: [
      {
        id: generateId(),
        type: NodeType.ELEMENT,
        tag: SemanticTag.BUTTON,
        className: 'pb-btn',
        content: ctaText,
        attributes: { 'data-href': '/signup' },
        typography: { fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' },
        inlineStyles: {
          padding: '0.5rem 1.25rem',
          borderRadius: '0.5rem',
          border: '1px solid rgba(255,255,255,0.3)',
          background: 'transparent',
        },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.HEADER,
    meta: { createdAt: now, updatedAt: now, sectionName: 'Header Dark', aiGenerated: true },
    children: [
      {
        id: containerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'header-inner',
        meta: { createdAt: now, updatedAt: now },
        children: [logoComponent, navComponent, ctaButtonComponent],
        layout: {
          display: DisplayType.FLEX,
          flexDirection: FlexDirection.ROW,
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
        },
      },
    ],
    layout: {
      display: DisplayType.FLEX,
      alignItems: 'center',
      padding: '0.875rem 0',
      position: 'sticky',
    },
    inlineStyles: {
      background: 'var(--inverse-surface)',
      zIndex: '50',
      top: '0',
    },
  };
}
