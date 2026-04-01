'use client';

import React, { memo } from 'react';
import type { ComponentNode, ElementNode } from '@/types';
import { NodeType } from '@/types';
import { NodeWrapper } from './NodeWrapper';
import { ElementRenderer } from './ElementRenderer';
import { useSemanticTag } from '../hooks/use-semantic-tag';
import { renderElement } from '../utils/render-element';
import {
  layoutToStyles,
  inlineStylesToCSS,
  mergeStyles,
} from '../utils/layout-to-styles';

interface ComponentRendererProps {
  node: ComponentNode;
}

/**
 * Renders a ComponentNode — a meaningful UI unit (hero, pricing card, etc.).
 *
 * Renders as a div/article/figure (based on SemanticTag) wrapping
 * ElementNode children. Supports optional layout properties and
 * component category metadata.
 */
const ComponentRendererInner: React.FC<ComponentRendererProps> = ({ node }) => {
  const tag = useSemanticTag(node);

  const layoutStyle = layoutToStyles(node.layout);
  const inlineStyle = inlineStylesToCSS(node.inlineStyles);
  const style = mergeStyles(layoutStyle, inlineStyle);

  return (
    <NodeWrapper nodeId={node.id} nodeType={NodeType.COMPONENT}>
      {renderElement(
        tag,
        {
          className: node.className,
          style: Object.keys(style).length > 0 ? style : undefined,
          'data-category': node.category,
          ...node.attributes,
        },
        (node.children ?? []).map((child: ElementNode) => (
          <ElementRenderer key={child.id} node={child} />
        ))
      )}
    </NodeWrapper>
  );
};

export const ComponentRenderer = memo(ComponentRendererInner);
