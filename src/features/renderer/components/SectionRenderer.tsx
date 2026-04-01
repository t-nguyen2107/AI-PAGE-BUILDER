'use client';

import React, { memo } from 'react';
import type { SectionNode, ContainerNode } from '@/types';
import { NodeType } from '@/types';
import { NodeWrapper } from './NodeWrapper';
import { ContainerRenderer } from './ContainerRenderer';
import { useSemanticTag } from '../hooks/use-semantic-tag';
import { renderElement } from '../utils/render-element';
import {
  layoutToStyles,
  backgroundToStyles,
  inlineStylesToCSS,
  mergeStyles,
} from '../utils/layout-to-styles';

interface SectionRendererProps {
  node: SectionNode;
}

/**
 * Renders a SectionNode — a top-level content block (section/header/footer/nav).
 *
 * Applies layout and background properties as inline styles, and renders
 * ContainerNode children recursively.
 */
const SectionRendererInner: React.FC<SectionRendererProps> = ({ node }) => {
  const tag = useSemanticTag(node);

  const layoutStyle = layoutToStyles(node.layout);
  const bgStyle = backgroundToStyles(node.background);
  const inlineStyle = inlineStylesToCSS(node.inlineStyles);
  const style = mergeStyles(layoutStyle, bgStyle, inlineStyle);

  return (
    <NodeWrapper nodeId={node.id} nodeType={NodeType.SECTION}>
      {renderElement(
        tag,
        {
          className: node.className,
          style: Object.keys(style).length > 0 ? style : undefined,
          'data-section-name': node.meta?.sectionName,
          ...node.attributes,
        },
        (node.children ?? []).map((child: ContainerNode) => (
          <ContainerRenderer key={child.id} node={child} />
        ))
      )}
    </NodeWrapper>
  );
};

export const SectionRenderer = memo(SectionRendererInner);
