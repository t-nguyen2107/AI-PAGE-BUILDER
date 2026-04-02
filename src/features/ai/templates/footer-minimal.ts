import { NodeType, SemanticTag, DisplayType, FlexDirection } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode, ItemNode } from '@/types/dom-tree';

/**
 * Generates a simple centered footer with site name, horizontal links, divider, and copyright.
 *
 * Props:
 *   siteName?: string   - Site name (default: "MyWebsite")
 *   copyright?: string  - Copyright text (default: auto-generated with current year)
 *   links?: string[]    - Footer link labels (default: ["Home", "About", "Services", "Contact"])
 */
export function generateFooterMinimal(props?: Record<string, unknown>): SectionNode {
  const siteName = (props?.siteName as string) ?? 'MyWebsite';
  const year = new Date().getFullYear();
  const copyright = (props?.copyright as string) ?? `\u00A9 ${year} ${siteName}. All rights reserved.`;
  const links = (props?.links as string[]) ?? ['Home', 'About', 'Services', 'Contact'];

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();

  // Site name element
  const siteNameElement: ElementNode = {
    id: generateId(),
    type: NodeType.ELEMENT,
    tag: SemanticTag.P,
    content: siteName,
    typography: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#ffffff',
    },
    meta: { createdAt: now, updatedAt: now },
  };

  // Site name component
  const siteNameComponent: ComponentNode = {
    id: generateId(),
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    meta: { createdAt: now, updatedAt: now },
    children: [siteNameElement],
  };

  // Horizontal links row — P element with SPAN ItemNodes separated by " | "
  const linkSpans: ItemNode[] = [];
  links.forEach((label, index) => {
    linkSpans.push({
      id: generateId(),
      type: NodeType.ITEM,
      tag: SemanticTag.SPAN,
      content: label,
      attributes: { 'data-href': `/${label.toLowerCase().replace(/\s+/g, '-')}` },
      typography: {
        fontSize: '0.875rem',
        color: 'rgba(255,255,255,0.6)',
      },
      meta: { createdAt: now, updatedAt: now },
    });
    // Add separator span between links
    if (index < links.length - 1) {
      linkSpans.push({
        id: generateId(),
        type: NodeType.ITEM,
        tag: SemanticTag.SPAN,
        content: ' | ',
        typography: {
          fontSize: '0.875rem',
          color: 'rgba(255,255,255,0.3)',
        },
        meta: { createdAt: now, updatedAt: now },
      });
    }
  });

  const linksElement: ElementNode = {
    id: generateId(),
    type: NodeType.ELEMENT,
    tag: SemanticTag.P,
    children: linkSpans,
    meta: { createdAt: now, updatedAt: now },
  };

  // Links component
  const linksComponent: ComponentNode = {
    id: generateId(),
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.FLEX,
      justifyContent: 'center',
    },
    children: [linksElement],
  };

  // Divider component
  const dividerComponent: ComponentNode = {
    id: generateId(),
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    meta: { createdAt: now, updatedAt: now },
    inlineStyles: {
      width: '100%',
      height: '1px',
      background: 'rgba(255,255,255,0.1)',
    },
    children: [],
  };

  // Copyright element
  const copyrightElement: ElementNode = {
    id: generateId(),
    type: NodeType.ELEMENT,
    tag: SemanticTag.P,
    content: copyright,
    typography: {
      fontSize: '0.8125rem',
      color: 'rgba(255,255,255,0.5)',
    },
    meta: { createdAt: now, updatedAt: now },
  };

  // Copyright component
  const copyrightComponent: ComponentNode = {
    id: generateId(),
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    meta: { createdAt: now, updatedAt: now },
    children: [copyrightElement],
  };

  const container: ContainerNode = {
    id: containerId,
    type: NodeType.CONTAINER,
    tag: SemanticTag.DIV,
    meta: { createdAt: now, updatedAt: now },
    children: [siteNameComponent, linksComponent, dividerComponent, copyrightComponent],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      gap: '1rem',
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
  };

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.FOOTER,
    className: 'pb-section-dark',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Footer Minimal', aiGenerated: true },
    children: [container],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      padding: '0',
    },
  };
}
