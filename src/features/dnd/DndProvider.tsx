'use client';

import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useBuilderStore } from '@/store';
import type { PageNode, DOMNode } from '@/types';
import { NodeType } from '@/types';
import { flattenTreeForDnD, getDescendantIds } from './dnd-utils';

interface DndProviderProps {
  children: React.ReactNode;
  tree: PageNode;
}

/**
 * Wraps the builder canvas with @dnd-kit DndContext.
 *
 * Handles:
 * - onDragStart: sets drag state in store, captures the dragged node
 * - onDragOver: updates drop target as the user moves over nodes
 * - onDragEnd: computes new position and calls store.moveNode
 * - DragOverlay for visual drag feedback
 *
 * Uses closestCenter collision detection and PointerSensor for
 * mouse/touch interaction. The SortableContext uses vertical list
 * sorting strategy as the primary layout direction.
 */
// ============================================================
// DragPreview — content-aware overlay shown during drag
// ============================================================
const NODE_ICONS: Record<string, React.ReactNode> = {
  [NodeType.PAGE]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
      <path fillRule="evenodd" d="M3.75 2A1.75 1.75 0 0 0 2 3.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0 0 14 12.25v-8.5A1.75 1.75 0 0 0 12.25 2h-8.5ZM4.75 3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h6.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25h-6.5Z" clipRule="evenodd" />
    </svg>
  ),
  [NodeType.SECTION]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
      <path fillRule="evenodd" d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13ZM1 3.5A.5.5 0 0 1 1.5 3h13a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9ZM3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5Z" clipRule="evenodd" />
    </svg>
  ),
  [NodeType.CONTAINER]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
      <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9ZM3.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-9Z" />
      <path d="M5 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5ZM5 8a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5A.5.5 0 0 1 5 8Zm0 2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5Z" />
    </svg>
  ),
  [NodeType.COMPONENT]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
      <path fillRule="evenodd" d="M3.5 2A1.5 1.5 0 0 0 2 3.5v2A1.5 1.5 0 0 0 3.5 7h2A1.5 1.5 0 0 0 7 5.5v-2A1.5 1.5 0 0 0 5.5 2h-2Zm0 7A1.5 1.5 0 0 0 2 10.5v2A1.5 1.5 0 0 0 3.5 14h2A1.5 1.5 0 0 0 7 12.5v-2A1.5 1.5 0 0 0 5.5 9h-2ZM9 3.5A1.5 1.5 0 0 1 10.5 2h2A1.5 1.5 0 0 1 14 3.5v2A1.5 1.5 0 0 1 12.5 7h-2A1.5 1.5 0 0 1 9 5.5v-2ZM10.5 9A1.5 1.5 0 0 0 9 10.5v2a1.5 1.5 0 0 0 1.5 1.5h2a1.5 1.5 0 0 0 1.5-1.5v-2A1.5 1.5 0 0 0 12.5 9h-2Z" clipRule="evenodd" />
    </svg>
  ),
  [NodeType.ELEMENT]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
      <path fillRule="evenodd" d="M11.5 2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-1 0v-11a.5.5 0 0 1 .5-.5Zm-7 0a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-1 0v-11a.5.5 0 0 1 .5-.5ZM3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5Z" clipRule="evenodd" />
    </svg>
  ),
  [NodeType.ITEM]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
      <circle cx="8" cy="8" r="3" />
    </svg>
  ),
};

function DragPreview({ node }: { node: DOMNode }) {
  const tag = 'tag' in node ? node.tag : '';
  const content = 'content' in node && typeof (node as { content?: string }).content === 'string'
    ? (node as { content: string }).content
    : '';
  const displayText = content.length > 40 ? content.slice(0, 40) + '...' : content || tag;

  return (
    <div
      style={{
        padding: '6px 10px',
        backgroundColor: 'rgba(255,255,255,0.95)',
        border: '1.5px solid #3b82f6',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        fontSize: '11px',
        fontFamily: 'ui-monospace, monospace',
        color: '#1e3a5f',
        maxWidth: '240px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transform: 'scale(0.9)',
        transformOrigin: 'top left',
      }}
    >
      <span style={{ fontSize: '12px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>{NODE_ICONS[node.type] ?? null}</span>
      <span style={{ opacity: 0.6 }}>{node.type.toLowerCase()}</span>
      <span style={{ opacity: 0.3 }}>·</span>
      <span style={{ fontWeight: 500 }}>{displayText}</span>
    </div>
  );
}

const DndProviderInner: React.FC<DndProviderProps> = ({ children, tree }) => {
  const startDrag = useBuilderStore((s) => s.startDrag);
  const endDrag = useBuilderStore((s) => s.endDrag);
  const setDropTarget = useBuilderStore((s) => s.setDropTarget);
  const setDragging = useBuilderStore((s) => s.setDragging);
  const moveNode = useBuilderStore((s) => s.moveNode);

  // Track the actively dragged node for the DragOverlay
  const [activeNode, setActiveNode] = useState<DOMNode | null>(null);

  // Flatten the tree for DnD operations
  const flattened = useMemo(() => flattenTreeForDnD(tree), [tree]);

  // Collect all sortable IDs for the SortableContext
  const sortableIds = useMemo(
    () => flattened.map((item) => item.id),
    [flattened]
  );

  // Configure pointer sensor with activation distance to prevent
  // accidental drags during regular clicks
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const activeId = String(active.id);
      const activeItem = flattened.find((item) => item.id === activeId);

      if (activeItem) {
        setActiveNode(activeItem.data);
        startDrag(activeId, activeItem.type);
        setDragging(true);
      }
    },
    [flattened, startDrag, setDragging]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over } = event;
      if (over) {
        setDropTarget(String(over.id), null);
      } else {
        setDropTarget(null, null);
      }
    },
    [setDropTarget]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveNode(null);
      setDragging(false);
      endDrag();

      if (!over || active.id === over.id) {
        return;
      }

      const activeId = String(active.id);
      const overId = String(over.id);

      // Prevent dropping a node into itself or its descendants
      const descendants = new Set(getDescendantIds(flattened, activeId));
      if (descendants.has(overId)) {
        return;
      }

      // Find the over item to determine the new parent and position
      const overItem = flattened.find((item) => item.id === overId);
      if (!overItem) return;

      // The new parent is the parent of the over item (drop into same parent)
      // If dropping on a non-Item parent node, drop as a child at position 0
      let newParentId: string;
      let position: number;

      if (overItem.type !== NodeType.ITEM && overItem.children.length === 0) {
        // Dropping onto an empty parent — make it a child at position 0
        newParentId = overId;
        position = 0;
      } else {
        // Dropping near an existing item — insert at the same level
        newParentId = overItem.parentId ?? tree.id;
        const parentItem = flattened.find((i) => i.id === newParentId);
        if (!parentItem) return;

        const siblings = parentItem.children;
        const overIndex = siblings.indexOf(overId);
        const activeIndex = siblings.indexOf(activeId);

        if (newParentId === (flattened.find((i) => i.id === activeId)?.parentId)) {
          // Reordering within the same parent
          // remove-then-insert semantics: forward drag needs adjusted index
          if (activeIndex < overIndex) {
            position = overIndex - 1;
          } else {
            position = overIndex;
          }
        } else {
          // Moving to a different parent — insert before the over item
          position = overIndex >= 0 ? overIndex : siblings.length;
        }
      }

      moveNode(activeId, newParentId, position);
    },
    [flattened, tree.id, moveNode, endDrag, setDragging]
  );

  const handleDragCancel = useCallback(() => {
    setActiveNode(null);
    setDragging(false);
    endDrag();
  }, [setDragging, endDrag]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>

      <DragOverlay adjustScale={false} dropAnimation={null}>
        {activeNode ? <DragPreview node={activeNode} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export const DndProvider = memo(DndProviderInner);
