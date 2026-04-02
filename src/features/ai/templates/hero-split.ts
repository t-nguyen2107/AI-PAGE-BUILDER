import { NodeType, SemanticTag, DisplayType, FlexDirection, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

/**
 * Generates a split layout hero section with left text column (heading, subtext, checkmarks, CTA) and right image column.
 * Based on HyperUI hero-sections/3.html pattern.
 *
 * Props:
 *   heading?: string   - Main heading text (default: "Launch Your Project in Minutes")
 *   subtext?: string   - Subheading / paragraph text
 *   checkmarks?: array<{title: string, description: string}> - List of checkmark items
 *   primaryCta?: {text: string, href: string} - Primary button config
 *   secondaryCta?: {text: string, href: string} - Secondary button config
 *   imageUrl?: string - Right column image URL
 */
export function generateHeroSplitSection(props?: Record<string, unknown>): SectionNode {
  const heading = (props?.heading as string) ?? 'Launch Your Project in Minutes';
  const subtext = (props?.subtext as string) ??
    'Skip the design phase and start building immediately. Our components are production-ready, fully responsive, and built with accessibility in mind.';

  const checkmarks = (props?.checkmarks as Array<{title: string, description: string}>) ?? [
    { title: 'Copy & Paste Ready', description: 'No installation required. Just copy the code and use it.' },
    { title: 'Fully Customizable', description: 'Adapt every component to match your brand.' },
    { title: 'Always Free', description: 'Open source and free forever. No subscriptions.' },
  ];

  const primaryCta = (props?.primaryCta as {text: string, href: string}) ?? { text: 'Browse Components', href: '#' };
  const secondaryCta = (props?.secondaryCta as {text: string, href: string}) ?? { text: 'View on GitHub', href: '#' };
  const imageUrl = (props?.imageUrl as string) ?? 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=2070';

  const now = new Date().toISOString();
  const sectionId = generateId();
  const gridContainerId = generateId();
  const leftColumnId = generateId();
  const rightColumnId = generateId();

  // Left column wrapper
  const leftColumn: ContainerNode = {
    id: leftColumnId,
    type: NodeType.CONTAINER,
    tag: SemanticTag.DIV,
    className: 'hero-split-left',
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '4rem 2rem',
    },
    children: [],
  };

  // Heading component
  const headingId = generateId();
  const headingComponent: ComponentNode = {
    id: generateId(),
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'hero-heading-wrap',
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.BLOCK,
      margin: '0 0 1.5rem 0',
    },
    children: [
      {
        id: headingId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.H1,
        className: 'pb-heading-xl',
        content: heading,
        typography: {
          fontSize: '2.5rem',
          fontWeight: '800',
          lineHeight: '1.2',
          color: '#111827',
          textAlign: TextAlign.LEFT,
          letterSpacing: '-0.025em',
        },
        inlineStyles: {
          maxWidth: '600px',
        },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };
  leftColumn.children!.push(headingComponent);

  // Subtext paragraph component
  const subtextId = generateId();
  const subtextComponent: ComponentNode = {
    id: generateId(),
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'hero-subtext-wrap',
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.BLOCK,
      margin: '0 0 2rem 0',
    },
    children: [
      {
        id: subtextId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'pb-text-lg',
        content: subtext,
        typography: {
          fontSize: '1.125rem',
          lineHeight: '1.75',
          color: '#374151',
          textAlign: TextAlign.LEFT,
        },
        inlineStyles: {
          maxWidth: '540px',
        },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };
  leftColumn.children!.push(subtextComponent);

  // Checkmarks list component
  const checkmarksComponentId = generateId();
  const checkmarkItems: ElementNode[] = [];

  checkmarks.forEach((item, index) => {
    const checkmarkComponentId = generateId();
    const iconId = generateId();
    const titleId = generateId();
    const descId = generateId();

    const checkmarkComponent: ComponentNode = {
      id: checkmarkComponentId,
      type: NodeType.COMPONENT,
      tag: SemanticTag.DIV,
      className: 'hero-checkmark-item',
      meta: { createdAt: now, updatedAt: now },
      layout: {
        display: DisplayType.FLEX,
        flexDirection: FlexDirection.ROW,
        alignItems: 'flex-start',
        gap: '0.75rem',
        margin: index > 0 ? '1rem 0 0 0' : '0',
      },
      children: [
        // Green circle with check icon
        {
          id: iconId,
          type: NodeType.ELEMENT,
          tag: SemanticTag.DIV,
          className: 'hero-check-icon',
          inlineStyles: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '1.5rem',
            height: '1.5rem',
            borderRadius: '9999px',
            backgroundColor: '#111827',
            flexShrink: '0',
            marginTop: '0.125rem',
          },
          meta: { createdAt: now, updatedAt: now },
        },
        // Text content wrapper
        {
          id: generateId(),
          type: NodeType.COMPONENT,
          tag: SemanticTag.DIV,
          className: 'hero-checkmark-text',
          meta: { createdAt: now, updatedAt: now },
          layout: {
            display: DisplayType.FLEX,
            flexDirection: FlexDirection.COLUMN,
            gap: '0.25rem',
          },
          children: [
            {
              id: titleId,
              type: NodeType.ELEMENT,
              tag: SemanticTag.H3,
              className: 'pb-heading-sm',
              content: item.title,
              typography: {
                fontSize: '1rem',
                fontWeight: '500',
                lineHeight: '1.5',
                color: '#111827',
              },
              meta: { createdAt: now, updatedAt: now },
            },
            {
              id: descId,
              type: NodeType.ELEMENT,
              tag: SemanticTag.P,
              className: 'pb-text-sm',
              content: item.description,
              typography: {
                fontSize: '0.875rem',
                lineHeight: '1.5',
                color: '#4B5563',
              },
              meta: { createdAt: now, updatedAt: now },
            },
          ],
        } as ComponentNode,
      ],
    };
    checkmarkItems.push(checkmarkComponent as unknown as ElementNode);
  });

  const checkmarksComponent: ComponentNode = {
    id: checkmarksComponentId,
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'hero-checkmarks-wrap',
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      margin: '0 0 2.5rem 0',
    },
    children: checkmarkItems,
  };
  leftColumn.children!.push(checkmarksComponent);

  // CTA buttons component
  const ctaComponentId = generateId();
  const primaryBtnId = generateId();
  const secondaryBtnId = generateId();

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
      flexWrap: 'wrap',
    },
    meta: { createdAt: now, updatedAt: now },
    children: [
      {
        id: primaryBtnId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.BUTTON,
        className: 'pb-btn pb-btn-primary',
        content: primaryCta.text,
        attributes: { 'data-href': primaryCta.href },
        typography: { fontWeight: '500', fontSize: '0.875rem', color: '#ffffff' },
        inlineStyles: {
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          backgroundColor: '#111827',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        },
        meta: { createdAt: now, updatedAt: now },
      },
      {
        id: secondaryBtnId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.BUTTON,
        className: 'pb-btn pb-btn-outline',
        content: secondaryCta.text,
        attributes: { 'data-href': secondaryCta.href },
        typography: { fontWeight: '500', fontSize: '0.875rem', color: '#111827' },
        inlineStyles: {
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          backgroundColor: '#ffffff',
          border: '1px solid #D1D5DB',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };
  leftColumn.children!.push(ctaComponent);

  // Right column with image
  const imageId = generateId();
  const rightColumn: ContainerNode = {
    id: rightColumnId,
    type: NodeType.CONTAINER,
    tag: SemanticTag.DIV,
    className: 'hero-split-right',
    meta: { createdAt: now, updatedAt: now },
    layout: {
      display: DisplayType.BLOCK,
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: '#F3F4F6',
    },
    background: {
      imageUrl,
      size: 'cover',
      position: 'center',
      repeat: 'no-repeat',
    },
    children: [
      {
        id: imageId,
        type: NodeType.ELEMENT,
        tag: SemanticTag.IMG,
        className: 'hero-split-image',
        attributes: {
          src: imageUrl,
          alt: '',
        },
        inlineStyles: {
          position: 'absolute',
          inset: '0',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        },
        meta: { createdAt: now, updatedAt: now },
      },
    ],
  };

  return {
    id: sectionId,
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'hero-split-section',
    meta: {
      createdAt: now,
      updatedAt: now,
      sectionName: 'Hero Split Section',
      aiGenerated: true,
    },
    children: [
      {
        id: gridContainerId,
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'hero-split-grid',
        meta: { createdAt: now, updatedAt: now },
        children: [leftColumn, rightColumn],
        layout: {
          display: DisplayType.GRID,
          gridTemplateColumns: '1fr',
          minHeight: '100vh',
        },
        responsive: {
          lg: {
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          },
        },
      },
    ],
    layout: {
      display: DisplayType.BLOCK,
    },
    background: {
      color: '#ffffff',
    },
  };
}
