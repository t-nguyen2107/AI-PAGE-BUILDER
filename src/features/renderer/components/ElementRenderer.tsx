'use client';

import React, { memo } from 'react';
import type { ElementNode, ItemNode } from '@/types';
import { NodeType, SemanticTag } from '@/types';
import { NodeWrapper } from './NodeWrapper';
import { ItemRenderer } from './ItemRenderer';
import { useSemanticTag } from '../hooks/use-semantic-tag';
import { renderElement } from '../utils/render-element';
import {
  typographyToStyles,
  inlineStylesToCSS,
  mergeStyles,
} from '../utils/layout-to-styles';

interface ElementRendererProps {
  node: ElementNode;
}

/** Tags that render child items (ul/ol -> li children). */
const LIST_TAGS = new Set<string>([SemanticTag.UL, SemanticTag.OL]);

/** Void elements that cannot have children/content. */
const VOID_TAGS = new Set<string>([SemanticTag.INPUT, 'br', 'hr']);

/**
 * Renders an ElementNode — atomic content element.
 *
 * Handles:
 * - Text elements (h1-h6, p, button): renders `content` as text
 * - Image (img): renders <img> with src/alt, lazy loading
 * - Link (a): renders <a> with href
 * - List (ul/ol): renders children (ItemNode[])
 * - Form (form): renders children with submit prevention
 * - Void elements (input, br, hr): self-closing, no children
 */
const ElementRendererInner: React.FC<ElementRendererProps> = ({ node }) => {
  const tag = useSemanticTag(node);
  const tagString = node.tag;

  const typographyStyle = typographyToStyles(node.typography);
  const inlineStyle = inlineStylesToCSS(node.inlineStyles);
  const style = mergeStyles(typographyStyle, inlineStyle);

  const styleProp = Object.keys(style).length > 0 ? style : undefined;

  // Build children from node.children array
  const childElements = node.children?.map((child) => {
    if (child.type === NodeType.ITEM) {
      return <ItemRenderer key={child.id} node={child as ItemNode} />;
    }
    return <ElementRenderer key={child.id} node={child as ElementNode} />;
  });

  // --- Void elements (input, br, hr) — self-closing, no children ---
  if (VOID_TAGS.has(tagString)) {
    const isInput = (tagString as string) === 'input';
    return (
      <NodeWrapper nodeId={node.id} nodeType={NodeType.ELEMENT}>
        {renderElement(tag, {
          className: node.className,
          style: styleProp,
          ...node.attributes,
          ...(isInput ? { type: (node.attributes?.type as string) ?? 'text', value: node.content } : {}),
        })}
      </NodeWrapper>
    );
  }

  // --- Image element ---
  if (tagString === SemanticTag.IMG) {
    return (
      <NodeWrapper nodeId={node.id} nodeType={NodeType.ELEMENT}>
        {renderElement(tag, {
          src: node.src,
          alt: node.content ?? '',
          className: node.className,
          style: styleProp,
          loading: 'lazy',
          ...node.attributes,
        })}
      </NodeWrapper>
    );
  }

  // --- Link element ---
  if (tagString === SemanticTag.A) {
    return (
      <NodeWrapper nodeId={node.id} nodeType={NodeType.ELEMENT}>
        {renderElement(
          tag,
          {
            href: node.href,
            className: node.className,
            style: styleProp,
            ...node.attributes,
          },
          node.content,
          childElements
        )}
      </NodeWrapper>
    );
  }

  // --- Form element — prevent default submit ---
  if (tagString === SemanticTag.FORM) {
    return (
      <NodeWrapper nodeId={node.id} nodeType={NodeType.ELEMENT}>
        {renderElement(
          tag,
          {
            className: node.className,
            style: styleProp,
            onSubmit: (e: React.FormEvent) => e.preventDefault(),
            ...node.attributes,
          },
          node.content,
          childElements
        )}
      </NodeWrapper>
    );
  }

  // --- List elements (ul/ol) and generic text elements ---
  return (
    <NodeWrapper nodeId={node.id} nodeType={NodeType.ELEMENT}>
      {renderElement(
        tag,
        {
          className: node.className,
          style: styleProp,
          ...node.attributes,
        },
        node.content,
        childElements
      )}
    </NodeWrapper>
  );
};

export const ElementRenderer = memo(ElementRendererInner);
