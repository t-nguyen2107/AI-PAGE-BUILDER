'use client';

import React, { memo, useCallback, type CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBuilderStore } from '@/store';
import { NodeType } from '@/types';
import type { BaseNode } from '@/types';

interface NodeWrapperProps {
  nodeId: string;
  nodeType: NodeType;
  children: React.ReactNode;
}

const NODE_TYPE_LABELS: Record<NodeType, string> = {
  [NodeType.PAGE]: 'Page',
  [NodeType.SECTION]: 'Section',
  [NodeType.CONTAINER]: 'Container',
  [NodeType.COMPONENT]: 'Component',
  [NodeType.ELEMENT]: 'Element',
  [NodeType.ITEM]: 'Item',
};

/**
 * Wrapper component for all rendered nodes that provides:
 * - Click-to-select (calls store.selectNode)
 * - Hover highlight (calls store.hoverNode)
 * - Visual selection border (blue outline)
 * - Visual hover border (lighter outline)
 * - Drag-and-drop support via @dnd-kit useSortable
 * - Node type label badge on hover
 */
const NodeWrapperInner: React.FC<NodeWrapperProps> = ({ nodeId, nodeType, children }) => {
  const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
  const hoveredNodeId = useBuilderStore((s) => s.hoveredNodeId);
  const selectNode = useBuilderStore((s) => s.selectNode);
  const hoverNode = useBuilderStore((s) => s.hoverNode);
  const isDraggingGlobal = useBuilderStore((s) => s.isDragging);

  const isSelected = selectedNodeId === nodeId;
  const isHovered = hoveredNodeId === nodeId;

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: nodeId,
    data: {
      type: nodeType,
    },
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative',
    outline: isSelected
      ? '2px solid #3b82f6'
      : isHovered
        ? '2px dashed #93c5fd'
        : 'none',
    outlineOffset: isSelected ? '-1px' : '-1px',
    cursor: 'grab',
    boxSizing: 'border-box',
  };

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectNode(nodeId);
    },
    [selectNode, nodeId]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      hoverNode(nodeId);
    },
    [hoverNode, nodeId]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      hoverNode(null);
    },
    [hoverNode]
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-node-id={nodeId}
      data-node-type={nodeType}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...attributes}
      {...listeners}
    >
      {children}

      {/* Node type label badge — visible on hover or selection */}
      {(isHovered || isSelected) && !isDragging && (
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: 'translate(0, -100%)',
            fontSize: '10px',
            lineHeight: '14px',
            padding: '1px 6px',
            backgroundColor: isSelected ? '#3b82f6' : '#93c5fd',
            color: isSelected ? '#ffffff' : '#1e3a5f',
            borderRadius: '3px 3px 0 0',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 10,
            fontFamily: 'ui-monospace, monospace',
            letterSpacing: '0.02em',
          }}
        >
          {NODE_TYPE_LABELS[nodeType]}
        </span>
      )}
    </div>
  );
};

export const NodeWrapper = memo(NodeWrapperInner);
