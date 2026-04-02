'use client';

import React, { memo } from 'react';
import type { ItemNode } from '@/types';
import { NodeType } from '@/types';
import { NodeWrapper } from './NodeWrapper';
import { useSemanticTag } from '../hooks/use-semantic-tag';
import { renderElement } from '../utils/render-element';
import {
  typographyToStyles,
  inlineStylesToCSS,
  mergeStyles,
} from '../utils/layout-to-styles';

interface ItemRendererProps {
  node: ItemNode;
}

/**
 * Renders an ItemNode (leaf level) — li, span, figcaption, div with content.
 * ItemNodes are the terminal leaves of the DOM tree and carry text content
 * and optional typography styling.
 */
const ItemRendererInner: React.FC<ItemRendererProps> = ({ node }) => {
  const tag = useSemanticTag(node);

  const style = mergeStyles(
    typographyToStyles(node.typography),
    inlineStylesToCSS(node.inlineStyles)
  );

  const hasContent = node.content !== undefined && node.content !== null;

  return (
    <NodeWrapper nodeId={node.id} nodeType={NodeType.ITEM} node={node}>
      {renderElement(
        tag,
        {
          className: node.className,
          style: Object.keys(style).length > 0 ? style : undefined,
          ...node.attributes,
        },
        hasContent ? node.content : null
      )}
    </NodeWrapper>
  );
};

export const ItemRenderer = memo(ItemRendererInner);
