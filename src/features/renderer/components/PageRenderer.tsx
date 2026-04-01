'use client';

import React, { memo, useCallback } from 'react';
import type { PageNode, SectionNode } from '@/types';
import { NodeType, SemanticTag } from '@/types';
import { useBuilderStore } from '@/store';
import { SectionRenderer } from './SectionRenderer';
import { useSemanticTag } from '../hooks/use-semantic-tag';
import { renderElement } from '../utils/render-element';
import { inlineStylesToCSS } from '../utils/layout-to-styles';

interface PageRendererProps {
  node: PageNode;
  /** Global sections to inject before main content (e.g. header, nav). */
  globalHeaderSections?: SectionNode[];
  /** Global sections to inject after main content (e.g. footer). */
  globalFooterSections?: SectionNode[];
}

/**
 * Top-level renderer for PageNode.
 *
 * Renders the page as a <main> element. Global sections (header, footer)
 * are injected before/after the page's own content sections. Clicking on
 * the page background clears the current selection.
 */
const PageRendererInner: React.FC<PageRendererProps> = ({
  node,
  globalHeaderSections = [],
  globalFooterSections = [],
}) => {
  const tag = useSemanticTag(node);
  const clearSelection = useBuilderStore((s) => s.clearSelection);

  const inlineStyle = inlineStylesToCSS(node.inlineStyles);

  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent) => {
      // Only clear selection when clicking the page background itself,
      // not when clicking a child node (those calls stopPropagation).
      if (e.target === e.currentTarget) {
        clearSelection();
      }
    },
    [clearSelection]
  );

  // Check if explicit global sections are provided
  const hasExplicitGlobals =
    globalHeaderSections.length > 0 || globalFooterSections.length > 0;

  // When global sections are explicitly provided, separate content from globals
  let headerSections: SectionNode[];
  let mainSections: SectionNode[];
  let footerSections: SectionNode[];

  const children = node.children ?? [];

  if (hasExplicitGlobals) {
    headerSections = globalHeaderSections;
    footerSections = globalFooterSections;
    // Render all children as main sections when globals are injected separately
    mainSections = children;
  } else {
    // No explicit globals — auto-separate based on semantic tags
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

  return renderElement(
    tag,
    {
      className: node.className,
      style: Object.keys(inlineStyle).length > 0 ? inlineStyle : undefined,
      onClick: handleBackgroundClick,
      ...node.attributes,
    },
    <>
      {/* Global header/nav sections */}
      {headerSections.map((section) => (
        <SectionRenderer key={section.id} node={section} />
      ))}

      {/* Main content sections */}
      {mainSections.map((section) => (
        <SectionRenderer key={section.id} node={section} />
      ))}

      {/* Global footer sections */}
      {footerSections.map((section) => (
        <SectionRenderer key={section.id} node={section} />
      ))}
    </>
  );
};

export const PageRenderer = memo(PageRendererInner);
