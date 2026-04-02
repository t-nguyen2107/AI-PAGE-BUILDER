'use client';

import React, { memo } from 'react';
import type { ContainerNode, ComponentNode } from '@/types';
import { NodeType } from '@/types';
import { NodeWrapper } from './NodeWrapper';
import { ComponentRenderer } from './ComponentRenderer';
import { useSemanticTag } from '../hooks/use-semantic-tag';
import { renderElement } from '../utils/render-element';
import {
  layoutToStyles,
  inlineStylesToCSS,
  mergeStyles,
} from '../utils/layout-to-styles';

interface ContainerRendererProps {
  node: ContainerNode;
}

/**
 * Renders a ContainerNode — a layout wrapper with flex/grid properties.
 *
 * Applies LayoutProperties as inline styles and renders ComponentNode
 * children recursively.
 */
const ContainerRendererInner: React.FC<ContainerRendererProps> = ({ node }) => {
  const tag = useSemanticTag(node);

  const layoutStyle = layoutToStyles(node.layout);
  const inlineStyle = inlineStylesToCSS(node.inlineStyles);
  const style = mergeStyles(layoutStyle, inlineStyle);

  const children = (node.children ?? []) as ComponentNode[];
  const hasChildren = children.length > 0;

  return (
    <NodeWrapper nodeId={node.id} nodeType={NodeType.CONTAINER} node={node}>
      {renderElement(
        tag,
        {
          className: node.className,
          style: Object.keys(style).length > 0 ? style : undefined,
          ...node.attributes,
        },
        hasChildren
          ? children.map((child: ComponentNode) => (
              <ComponentRenderer key={child.id} node={child} />
            ))
          : [<span key="empty" className="empty-node-placeholder">
              <span className="material-symbols-outlined text-on-surface-outline mr-1" style={{ fontSize: 14 }}>dashboards</span>
              Empty Container
            </span>]
      )}
    </NodeWrapper>
  );
};

export const ContainerRenderer = memo(ContainerRendererInner);
