'use client';

import React, { memo, type CSSProperties } from 'react';
import type {
  PageNode,
  SectionNode,
  ContainerNode,
  ComponentNode,
  ElementNode,
  ItemNode,
  DOMNode,
} from '@/types';
import { NodeType, SemanticTag } from '@/types';
import { resolveSemanticTag } from '../hooks/use-semantic-tag';
import { renderElement } from '../utils/render-element';
import {
  layoutToStyles,
  typographyToStyles,
  backgroundToStyles,
  inlineStylesToCSS,
  mergeStyles,
} from '../utils/layout-to-styles';

// ===========================================
// Tag helpers
// ===========================================

const VOID_TAGS = new Set<string>([SemanticTag.INPUT, 'br', 'hr']);

// ===========================================
// Item — leaf node
// ===========================================

interface PreviewItemProps {
  node: ItemNode;
}

const PreviewItem: React.FC<PreviewItemProps> = memo(({ node }) => {
  const tag = resolveSemanticTag(node);
  const style = mergeStyles(
    typographyToStyles(node.typography),
    inlineStylesToCSS(node.inlineStyles)
  );

  return renderElement(tag, {
    className: node.className || undefined,
    style: hasKeys(style) ? style : undefined,
    ...node.attributes,
  }, node.content ?? null);
});

PreviewItem.displayName = 'PreviewItem';

// ===========================================
// Element — atomic content element
// ===========================================

interface PreviewElementProps {
  node: ElementNode;
}

const PreviewElement: React.FC<PreviewElementProps> = memo(({ node }) => {
  const tag = resolveSemanticTag(node);
  const tagString = node.tag as string;

  const style = mergeStyles(
    typographyToStyles(node.typography),
    inlineStylesToCSS(node.inlineStyles)
  );
  const styleProp = hasKeys(style) ? style : undefined;

  // Build child elements
  const childElements = node.children?.map((child) => {
    if (child.type === NodeType.ITEM) {
      return <PreviewItem key={child.id} node={child as ItemNode} />;
    }
    return <PreviewElement key={child.id} node={child as ElementNode} />;
  });

  // Void elements — self-closing, no children
  if (VOID_TAGS.has(tagString)) {
    const isInput = tagString === SemanticTag.INPUT;
    return renderElement(tag, {
      className: node.className || undefined,
      style: styleProp,
      ...node.attributes,
      ...(isInput ? { type: (node.attributes?.type as string) ?? 'text', value: node.content } : {}),
    });
  }

  // Image
  if (tagString === SemanticTag.IMG) {
    return renderElement(tag, {
      src: node.src,
      alt: node.content ?? '',
      className: node.className || undefined,
      style: styleProp,
      loading: 'lazy' as const,
      ...node.attributes,
    });
  }

  // Link
  if (tagString === SemanticTag.A) {
    return renderElement(tag, {
      href: node.href,
      className: node.className || undefined,
      style: styleProp,
      ...node.attributes,
    }, node.content, childElements);
  }

  // Form
  if (tagString === SemanticTag.FORM) {
    return renderElement(tag, {
      className: node.className || undefined,
      style: styleProp,
      ...node.attributes,
    }, node.content, childElements);
  }

  // Generic text / list elements
  return renderElement(tag, {
    className: node.className || undefined,
    style: styleProp,
    ...node.attributes,
  }, node.content, childElements);
});

PreviewElement.displayName = 'PreviewElement';

// ===========================================
// Component — meaningful UI unit
// ===========================================

interface PreviewComponentProps {
  node: ComponentNode;
}

const PreviewComponent: React.FC<PreviewComponentProps> = memo(({ node }) => {
  const tag = resolveSemanticTag(node);

  const style = mergeStyles(
    layoutToStyles(node.layout),
    inlineStylesToCSS(node.inlineStyles)
  );

  return renderElement(tag, {
    className: node.className || undefined,
    style: hasKeys(style) ? style : undefined,
    ...node.attributes,
  }, ...(node.children ?? []).map((child: ElementNode) => (
    <PreviewElement key={child.id} node={child} />
  )));
});

PreviewComponent.displayName = 'PreviewComponent';

// ===========================================
// Container — layout wrapper
// ===========================================

interface PreviewContainerProps {
  node: ContainerNode;
}

const PreviewContainer: React.FC<PreviewContainerProps> = memo(({ node }) => {
  const tag = resolveSemanticTag(node);

  const style = mergeStyles(
    layoutToStyles(node.layout),
    inlineStylesToCSS(node.inlineStyles)
  );

  return renderElement(tag, {
    className: node.className || undefined,
    style: hasKeys(style) ? style : undefined,
    ...node.attributes,
  }, ...(node.children ?? []).map((child: ComponentNode) => (
    <PreviewComponent key={child.id} node={child} />
  )));
});

PreviewContainer.displayName = 'PreviewContainer';

// ===========================================
// Section — top-level content block
// ===========================================

interface PreviewSectionProps {
  node: SectionNode;
}

const PreviewSection: React.FC<PreviewSectionProps> = memo(({ node }) => {
  const tag = resolveSemanticTag(node);

  const style = mergeStyles(
    layoutToStyles(node.layout),
    backgroundToStyles(node.background),
    inlineStylesToCSS(node.inlineStyles)
  );

  return renderElement(tag, {
    className: node.className || undefined,
    style: hasKeys(style) ? style : undefined,
    ...node.attributes,
  }, ...(node.children ?? []).map((child: ContainerNode) => (
    <PreviewContainer key={child.id} node={child} />
  )));
});

PreviewSection.displayName = 'PreviewSection';

// ===========================================
// Page — root renderer
// ===========================================

export interface PreviewRendererProps {
  node: PageNode;
  globalHeaderSections?: SectionNode[];
  globalFooterSections?: SectionNode[];
}

/**
 * Lightweight page renderer for preview/publish.
 *
 * Renders the full DOM tree as pure semantic HTML without any builder chrome:
 * - No NodeWrapper (no selection outlines, hover effects)
 * - No DndProvider (no drag-and-drop)
 * - No click handlers for selection
 * - No Zustand store dependency
 *
 * Injects global header/footer sections around the main content.
 */
export const PreviewRenderer: React.FC<PreviewRendererProps> = memo(({
  node,
  globalHeaderSections = [],
  globalFooterSections = [],
}) => {
  const tag = resolveSemanticTag(node);
  const inlineStyle = inlineStylesToCSS(node.inlineStyles);

  const hasExplicitGlobals =
    globalHeaderSections.length > 0 || globalFooterSections.length > 0;

  const children = node.children ?? [];

  let headerSections: SectionNode[];
  let mainSections: SectionNode[];
  let footerSections: SectionNode[];

  if (hasExplicitGlobals) {
    headerSections = globalHeaderSections;
    footerSections = globalFooterSections;
    mainSections = children;
  } else {
    headerSections = children.filter(
      (s) => s.tag === SemanticTag.HEADER || s.tag === SemanticTag.NAV
    );
    footerSections = children.filter(
      (s) => s.tag === SemanticTag.FOOTER
    );
    mainSections = children.filter(
      (s) =>
        s.tag !== SemanticTag.HEADER &&
        s.tag !== SemanticTag.NAV &&
        s.tag !== SemanticTag.FOOTER
    );
  }

  return renderElement(tag, {
    className: node.className || undefined,
    style: hasKeys(inlineStyle) ? inlineStyle : undefined,
    ...node.attributes,
  },
    headerSections.map((s) => <PreviewSection key={s.id} node={s} />),
    mainSections.map((s) => <PreviewSection key={s.id} node={s} />),
    footerSections.map((s) => <PreviewSection key={s.id} node={s} />),
  );
});

PreviewRenderer.displayName = 'PreviewRenderer';

// ===========================================
// Generic node renderer — dispatches by NodeType
// ===========================================

interface PreviewNodeProps {
  node: DOMNode;
}

/**
 * Generic dispatcher that renders any DOMNode by its type.
 * Useful when you have a mixed array of nodes.
 */
export const PreviewNode: React.FC<PreviewNodeProps> = memo(({ node }) => {
  switch (node.type) {
    case NodeType.PAGE:
      return <PreviewRenderer node={node as PageNode} />;
    case NodeType.SECTION:
      return <PreviewSection node={node as SectionNode} />;
    case NodeType.CONTAINER:
      return <PreviewContainer node={node as ContainerNode} />;
    case NodeType.COMPONENT:
      return <PreviewComponent node={node as ComponentNode} />;
    case NodeType.ELEMENT:
      return <PreviewElement node={node as ElementNode} />;
    case NodeType.ITEM:
      return <PreviewItem node={node as ItemNode} />;
    default:
      return null;
  }
});

PreviewNode.displayName = 'PreviewNode';

// ===========================================
// Utilities
// ===========================================

function hasKeys(obj: CSSProperties | undefined): boolean {
  return !!obj && Object.keys(obj).length > 0;
}
