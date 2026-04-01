import { NodeType, SemanticTag, DisplayType, FlexDirection, ComponentCategory, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

/**
 * Generates a Gallery section with image grid layout.
 *
 * Props:
 *   heading?: string       - Section heading (default: "Gallery")
 *   columns?: number       - Grid columns (2-4, default: 3)
 *   images?: GalleryImage[] - Array of { src, alt, caption? } objects
 */
export function generateGallerySection(props?: Record<string, unknown>): SectionNode {
  const heading = (props?.heading as string) ?? 'Gallery';
  const columns = Math.min(Math.max((props?.columns as number) ?? 3, 2), 4);
  const images = (props?.images as GalleryImage[]) ?? [
    { src: 'https://picsum.photos/seed/gallery1/600/400', alt: 'Project showcase 1', caption: 'Modern Design' },
    { src: 'https://picsum.photos/seed/gallery2/600/400', alt: 'Project showcase 2', caption: 'Creative Solution' },
    { src: 'https://picsum.photos/seed/gallery3/600/400', alt: 'Project showcase 3', caption: 'Bold Approach' },
    { src: 'https://picsum.photos/seed/gallery4/600/400', alt: 'Project showcase 4', caption: 'Clean Layout' },
    { src: 'https://picsum.photos/seed/gallery5/600/400', alt: 'Project showcase 5', caption: 'Dynamic UI' },
    { src: 'https://picsum.photos/seed/gallery6/600/400', alt: 'Project showcase 6', caption: 'Polished Details' },
  ];

  const now = new Date().toISOString();
  const sectionId = generateId();

  // Build gallery item components
  const galleryComponents: ComponentNode[] = images.map((image) => {
    const componentId = generateId();
    const imgId = generateId();

    const children: ElementNode[] = [
      {
        id: imgId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.IMG,
        className: 'gallery-image',
        src: image.src,
        content: '',
        inlineStyles: {
          width: '100%',
          height: 'auto',
          borderRadius: '8px',
          objectFit: 'cover',
        },
        meta: { createdAt: now, updatedAt: now },
      },
    ];

    if (image.caption) {
      children.push({
        id: generateId(),
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'gallery-caption',
        content: image.caption,
        typography: { fontSize: '0.875rem', color: '#6b7280', textAlign: TextAlign.CENTER },
        meta: { createdAt: now, updatedAt: now },
      });
    }

    return {
      id: componentId,
      type: NodeType.COMPONENT,
      tag: SemanticTag.FIGURE,
      className: 'gallery-item',
      category: ComponentCategory.GALLERY,
      meta: { createdAt: now, updatedAt: now, aiGenerated: true },
      children,
      layout: {
        display: DisplayType.FLEX,
        flexDirection: FlexDirection.COLUMN,
        gap: '0.5rem',
      },
    };
  });

  // Section has two containers: heading + grid
  // Container 1: heading
  const headingContainer: ContainerNode = {
    id: generateId(),
    type: NodeType.CONTAINER,
    tag: SemanticTag.DIV,
    className: 'gallery-heading-container',
    meta: { createdAt: now, updatedAt: now },
    children: [
      {
        id: generateId(),
        type: NodeType.COMPONENT,
        tag: SemanticTag.DIV,
        className: 'gallery-heading-wrapper',
        meta: { createdAt: now, updatedAt: now },
        layout: {
          display: DisplayType.FLEX,
          flexDirection: FlexDirection.COLUMN,
          alignItems: 'center',
        },
        children: [
          {
            id: generateId(),
            type: NodeType.ELEMENT,
            tag: SemanticTag.H2,
            className: 'gallery-heading',
            content: heading,
            typography: { fontSize: '2rem', fontWeight: '700', color: '#111827', textAlign: TextAlign.CENTER },
            meta: { createdAt: now, updatedAt: now },
          },
        ],
      },
    ],
    layout: {
      display: DisplayType.FLEX,
      justifyContent: 'center',
    },
  };

  // Container 2: grid of gallery items
  const gridContainer: ContainerNode = {
    id: generateId(),
    type: NodeType.CONTAINER,
    tag: SemanticTag.DIV,
    className: 'gallery-grid',
    meta: { createdAt: now, updatedAt: now },
    children: galleryComponents,
    layout: {
      display: DisplayType.GRID,
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '1.5rem',
      maxWidth: '1100px',
      margin: '0 auto',
    },
  };

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'gallery-section',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Gallery Section', aiGenerated: true },
    children: [headingContainer, gridContainer],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      gap: '2rem',
      padding: '4rem 2rem',
    },
    background: { color: '#ffffff' },
  };
}
