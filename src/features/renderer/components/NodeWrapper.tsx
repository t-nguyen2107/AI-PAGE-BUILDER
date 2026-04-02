'use client';

import React, { memo, useCallback, useRef, useState, type CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDndContext } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useBuilderStore } from '@/store';
import { NodeType } from '@/types';
import type { BaseNode } from '@/types';

interface NodeWrapperProps {
  nodeId: string;
  nodeType: NodeType;
  node: BaseNode;
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
const NodeWrapperInner: React.FC<NodeWrapperProps> = ({ nodeId, nodeType, node, children }) => {
  const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
  const hoveredNodeId = useBuilderStore((s) => s.hoveredNodeId);
  const selectNode = useBuilderStore((s) => s.selectNode);
  const hoverNode = useBuilderStore((s) => s.hoverNode);
  const isDraggingGlobal = useBuilderStore((s) => s.isDragging);

  const isSelected = selectedNodeId === nodeId;
  const isHovered = hoveredNodeId === nodeId;
  const isHidden = node.meta?.hidden === true;

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Track cursor Y position relative to this node for drop position calculation
  const [cursorRelativeY, setCursorRelativeY] = useState<number | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: nodeId,
    data: {
      type: nodeType,
    },
  });

  // Access the global DnD context to know if a drag is active
  const { active } = useDndContext();

  // Determine drop position: "before" (top half) or "after" (bottom half)
  const isDragActive = active !== null;
  const showDropIndicator = isDragActive && isOver && !isDragging;

  let dropPosition: 'before' | 'after' | null = null;
  if (showDropIndicator && wrapperRef.current && cursorRelativeY !== null) {
    const rect = wrapperRef.current.getBoundingClientRect();
    const midpoint = rect.height / 2;
    dropPosition = cursorRelativeY < midpoint ? 'before' : 'after';
  }

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : isHidden ? 0.35 : 1,
    position: 'relative',
    outline: isSelected
      ? '2px solid var(--primary-container)'
      : isHidden
        ? '1px dashed var(--on-surface-outline)'
        : isHovered
          ? '2px dashed var(--primary-fixed)'
          : 'none',
    outlineOffset: '-1px',
    cursor: isHovered || isSelected ? 'grab' : 'default',
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
      setCursorRelativeY(null);
    },
    [hoverNode]
  );

  // Track cursor Y position relative to this node when dragging over it
  const handleDragOverMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragActive || !isOver) return;
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;
      setCursorRelativeY(e.clientY - rect.top);
    },
    [isDragActive, isOver]
  );

  // Combine refs: useSortable ref + local ref for rect measurement
  const setCombinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      wrapperRef.current = node;
    },
    [setNodeRef]
  );

  return (
    <div
      ref={setCombinedRef}
      style={style}
      data-node-id={nodeId}
      data-node-type={nodeType}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleDragOverMove}
      {...attributes}
      {...listeners}
    >
      {children}

      {/* Drop indicator line — thin blue bar showing where the node will land */}
      {showDropIndicator && dropPosition && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '2px',
            background: '#3b82f6',
            borderRadius: '1px',
            top: dropPosition === 'before' ? -1 : undefined,
            bottom: dropPosition === 'after' ? -1 : undefined,
            zIndex: 20,
            pointerEvents: 'none',
            transition: 'opacity 0.15s ease',
            opacity: 1,
            boxShadow: '0 0 4px rgba(59, 130, 246, 0.5)',
          }}
        >
          {/* Small circle at the left edge for a polished look */}
          <div
            style={{
              position: 'absolute',
              left: -3,
              top: -2,
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#3b82f6',
            }}
          />
        </div>
      )}

      {/* Node type label badge — visible on hover or selection */}
      {(isHovered || isSelected) && !isDragging && (
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: isHidden ? 48 : 0,
            transform: 'translate(0, -100%)',
            fontSize: '10px',
            lineHeight: '14px',
            padding: '1px 6px',
            backgroundColor: isSelected ? 'var(--primary-container)' : 'var(--primary-fixed)',
            color: isSelected ? 'var(--on-primary-container)' : 'var(--primary-container)',
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

      {/* Hidden badge — always visible when node is hidden */}
      {isHidden && !isDragging && (
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: 'translate(0, -100%)',
            fontSize: '10px',
            lineHeight: '14px',
            padding: '1px 6px',
            backgroundColor: 'var(--error-container)',
            color: 'var(--on-error-container)',
            borderRadius: '3px 3px 0 0',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 10,
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          Hidden
        </span>
      )}
    </div>
  );
};

export const NodeWrapper = memo(NodeWrapperInner);
