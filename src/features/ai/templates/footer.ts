import { NodeType, SemanticTag, DisplayType, FlexDirection } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode, ItemNode } from '@/types/dom-tree';

interface FooterColumn {
  title: string;
  links: string[];
}

const DEFAULT_COLUMNS: FooterColumn[] = [
  { title: 'Product', links: ['Features', 'Pricing', 'Documentation', 'API Reference'] },
  { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
  { title: 'Support', links: ['Help Center', 'Contact Us', 'Status', 'Terms of Service'] },
];

/**
 * Generates a Footer section with columns of links.
 *
 * Props:
 *   siteName?: string       - Site name for footer branding (default: "MyWebsite")
 *   copyright?: string      - Copyright text (default: auto-generated with current year)
 *   columns?: FooterColumn[] - Custom column data
 */
export function generateFooter(props?: Record<string, unknown>): SectionNode {
  const siteName = (props?.siteName as string) ?? 'MyWebsite';
  const year = new Date().getFullYear();
  const copyright = (props?.copyright as string) ?? `© ${year} ${siteName}. All rights reserved.`;
  const columns = (props?.columns as FooterColumn[]) ?? DEFAULT_COLUMNS;

  const now = new Date().toISOString();
  const sectionId = generateId();
  const gridContainerId = generateId();

  // Generate a brand column
  const brandColId = generateId();
  const brandNameId = generateId();
  const brandDescId = generateId();

  const brandColumn: ComponentNode = {
    id: brandColId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'footer-brand',
    meta: { createdAt: now, updatedAt: now },
    layout: { display: DisplayType.FLEX, flexDirection: FlexDirection.COLUMN, gap: '0.75rem' },
    children: [
      {
        id: brandNameId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'footer-brand-name',
        content: siteName,
        typography: { fontSize: '1.25rem', fontWeight: '700' },
        meta: { createdAt: now, updatedAt: now },
      },
      {
        id: brandDescId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'footer-brand-description',
        content: 'Building the future of the web, one page at a time.',
        typography: { fontSize: '0.875rem', color: '#94a3b8' },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };

  // Generate link columns
  const linkColumns: ComponentNode[] = columns.map((col) => {
    const colId = generateId();
    const colTitleId = generateId();
    const colListId = generateId();

    // ItemNode has children?: never, so we use content for the link text
    const listItems: ItemNode[] = col.links.map((label) => ({
      id: generateId(),
      type: NodeType.ITEM,
      tag: SemanticTag.LI,
      className: 'footer-link-item',
      content: label,
      attributes: { 'data-href': `/${label.toLowerCase().replace(/\s+/g, '-')}` },
      typography: { fontSize: '0.875rem', color: '#94a3b8' },
      meta: { createdAt: now, updatedAt: now },
    }));

    return {
      id: colId,
      type: NodeType.COMPONENT,
      tag: SemanticTag.DIV,
      className: 'footer-column',
      meta: { createdAt: now, updatedAt: now },
      layout: { display: DisplayType.FLEX, flexDirection: FlexDirection.COLUMN, gap: '0.5rem' },
      children: [
        {
          id: colTitleId,
          type: NodeType.ELEMENT,
          tag: SemanticTag.H4,
          className: 'footer-column-title',
          content: col.title,
          typography: { fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' },
          meta: { createdAt: now, updatedAt: now },
        },
        {
          id: colListId,
          type: NodeType.ELEMENT,
          tag: SemanticTag.UL,
          className: 'footer-column-links',
          children: listItems,
          meta: { createdAt: now, updatedAt: now },
        },
      ],
    };
  });

  // Copyright bar: wrap the paragraph element in a component so it's a valid ContainerNode child
  const copyrightBarId = generateId();
  const copyrightTextId = generateId();
  const copyrightComponentId = generateId();
  const dividerContainerId = generateId();

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.FOOTER,
    className: 'footer-section',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Footer', aiGenerated: true },
    children: [
      {
        id: gridContainerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'footer-grid',
        meta: { createdAt: now, updatedAt: now },
        children: [brandColumn, ...linkColumns],
        layout: {
          display: DisplayType.GRID,
          gridTemplateColumns: `repeat(${linkColumns.length + 1}, 1fr)`,
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '3rem 2rem',
        },
      },
      {
        id: dividerContainerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'footer-divider',
        inlineStyles: { borderTop: '1px solid #334155', maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' },
        meta: { createdAt: now, updatedAt: now },
        children: [],
        layout: {},
      },
      {
        id: copyrightBarId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'footer-copyright-bar',
        meta: { createdAt: now, updatedAt: now },
        children: [
          {
            id: copyrightComponentId,
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'footer-copyright-wrap',
            meta: { createdAt: now, updatedAt: now },
            children: [
              {
                id: copyrightTextId,
                type: NodeType.ELEMENT,
                tag: SemanticTag.P,
                className: 'footer-copyright',
                content: copyright,
                typography: { fontSize: '0.8125rem', color: '#64748b' },
                meta: { createdAt: now, updatedAt: now },
              },
            ],
          },
        ],
        layout: {
          display: DisplayType.FLEX,
          justifyContent: 'center',
          padding: '1.5rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto',
        },
      },
    ],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      padding: '0',
    },
    background: { color: '#0f172a' },
    inlineStyles: { color: '#e2e8f0' },
  };
}
