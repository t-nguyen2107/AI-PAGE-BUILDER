import { NodeType, SemanticTag, DisplayType, FlexDirection } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ComponentNode, ElementNode, ItemNode } from '@/types/dom-tree';

/**
 * Generates a Navigation Header with logo and links.
 * Uses shadcn CSS variables for theming and pb-nav-glass for glassmorphism.
 *
 * Props:
 *   siteName?: string   - Logo / site name text (default: "MyWebsite")
 *   links?: string[]    - Navigation link labels (default: ["Home", "About", "Services", "Contact"])
 */
export function generateHeaderNav(props?: Record<string, unknown>): SectionNode {
  const siteName = (props?.siteName as string) ?? 'MyWebsite';
  const links = (props?.links as string[]) ?? ['Home', 'About', 'Services', 'Contact'];

  const now = new Date().toISOString();
  const sectionId = generateId();
  const innerContainerId = generateId();

  // Logo component wrapping the anchor element
  const logoComponentId = generateId();
  const logoAnchorId = generateId();

  const logoComponent: ComponentNode = {
    id: logoComponentId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'header-logo-wrap',
    meta: { createdAt: now, updatedAt: now },
    children: [
      {
        id: logoAnchorId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.A,
        className: 'header-logo',
        href: '/',
        content: siteName,
        typography: {
          fontSize: '1.5rem',
          fontWeight: '700',
          color: 'var(--foreground)',
          letterSpacing: '-0.025em',
        },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };

  // Nav list component wrapping the UL element
  const navComponentId = generateId();
  const navListId = generateId();

  const navItems: ItemNode[] = links.map((label) => {
    const itemId = generateId();
    const href = `/${label.toLowerCase().replace(/\s+/g, '-')}`;
    return {
      id: itemId,
      type: NodeType.ITEM,
      tag: SemanticTag.LI,
      className: 'nav-item',
      content: label,
      attributes: { 'data-href': href },
      typography: {
        fontSize: '0.9375rem',
        fontWeight: '500',
        color: 'var(--muted-foreground)',
        letterSpacing: '0.01em',
      },
      meta: { createdAt: now, updatedAt: now },
    };
  });

  const navComponent: ComponentNode = {
    id: navComponentId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'header-nav-wrap',
    meta: { createdAt: now, updatedAt: now },
    children: [
      {
        id: navListId,
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

  // CTA button in nav (e.g. "Get Started")
  const ctaButtonComponentId = generateId();
  const ctaButtonId = generateId();

  const ctaButtonComponent: ComponentNode = {
    id: ctaButtonComponentId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'header-cta-wrap',
    meta: { createdAt: now, updatedAt: now },
    children: [
      {
        id: ctaButtonId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.BUTTON,
        className: 'pb-btn pb-btn-primary',
        content: 'Get Started',
        attributes: { 'data-href': '/signup' },
        typography: { fontSize: '0.875rem', fontWeight: '600', color: 'var(--on-primary-container)' },
        inlineStyles: {
          padding: '0.5rem 1.25rem',
          borderRadius: '0.5rem',
        },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.HEADER,
    className: 'pb-nav-glass',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Header Navigation', aiGenerated: true },
    children: [
      {
        id: innerContainerId,
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
      zIndex: '50',
      top: '0',
    },
    background: { color: 'var(--background)' },
  };
}
