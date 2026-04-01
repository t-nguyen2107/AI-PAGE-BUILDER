import { NodeType, SemanticTag, DisplayType, FlexDirection, ComponentCategory, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

function generateLogoImage(seed: string, now: string): ComponentNode {
  const imgId = generateId();

  return {
    id: imgId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'logo-item',
    category: ComponentCategory.LOGO_GRID,
    layout: {
      display: DisplayType.FLEX,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
    },
    inlineStyles: {
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#ffffff',
    },
    meta: { createdAt: now, updatedAt: now, aiGenerated: true },
    children: [
      {
        id: generateId(),
        type: NodeType.ELEMENT,
        tag: SemanticTag.IMG,
        className: 'logo-image',
        src: `https://picsum.photos/seed/${seed}/150/80`,
        attributes: { alt: `Company logo ${seed}` },
        inlineStyles: { maxWidth: '120px', maxHeight: '60px', objectFit: 'contain' },
        meta: { createdAt: now, updatedAt: now },
      } as ElementNode,
    ],
  };
}

/**
 * Generates a Logo grid section with configurable columns and logo count.
 *
 * Props:
 *   columns?: number - Number of columns in the grid (2-4, default: 3)
 *   count?: number   - Number of logos to display (2-9, default: 6)
 */
export function generateLogoGridSection(props?: Record<string, unknown>): SectionNode {
  const columns = Math.max(2, Math.min(4, (props?.columns as number) ?? 3));
  const count = Math.max(2, Math.min(9, (props?.count as number) ?? 6));

  const now = new Date().toISOString();
  const sectionId = generateId();
  const containerId = generateId();
  const titleId = generateId();

  const logoImages = Array.from({ length: count }, (_, i) =>
    generateLogoImage(`logo-${i + 1}`, now)
  );

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'logo-grid-section',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Logo Grid Section', aiGenerated: true },
    children: [
      {
        id: containerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'logo-grid-container',
        meta: { createdAt: now, updatedAt: now },
        children: [
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'logo-grid-title-wrap',
            meta: { createdAt: now, updatedAt: now },
            layout: { display: DisplayType.FLEX, justifyContent: 'center' },
            children: [
              {
                id: titleId,
                type: NodeType.ELEMENT,
                tag: SemanticTag.H2,
                className: 'logo-grid-title',
                content: 'Trusted by Leading Companies',
                typography: { fontSize: '2rem', fontWeight: '700', textAlign: TextAlign.CENTER },
                meta: { createdAt: now, updatedAt: now },
              },
            ],
          },
          ...logoImages,
        ],
        layout: {
          display: DisplayType.GRID,
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
        },
      } as ContainerNode,
    ],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      padding: '4rem 0',
    },
    background: { color: '#f8fafc' },
  };
}
