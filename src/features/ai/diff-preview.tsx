'use client';

import React, { useMemo } from 'react';
import { useBuilderStore } from '@/store';
import type { AIDiff } from '@/types';
import { AIAction } from '@/types/enums';
import type { DOMNode } from '@/types/dom-tree';

// ============================================================
// Action label map
// ============================================================

const ACTION_LABELS: Record<string, string> = {
  [AIAction.INSERT_SECTION]: 'Insert Section',
  [AIAction.INSERT_COMPONENT]: 'Insert Component',
  [AIAction.MODIFY_NODE]: 'Modify Node',
  [AIAction.DELETE_NODE]: 'Delete Node',
  [AIAction.REPLACE_NODE]: 'Replace Node',
  [AIAction.REORDER_CHILDREN]: 'Reorder Children',
  [AIAction.FULL_PAGE]: 'Full Page Replace',
};

// ============================================================
// DiffPreviewOverlay
// ============================================================

export function DiffPreviewOverlay() {
  const pendingAIDiff = useBuilderStore((s) => s.pendingAIDiff);
  const confirmAIDiff = useBuilderStore((s) => s.confirmAIDiff);
  const rejectAIDiff = useBuilderStore((s) => s.rejectAIDiff);

  if (!pendingAIDiff) return null;

  return (
    <>
      {/* Semi-transparent backdrop to signal preview mode */}
      <div className="fixed inset-0 bg-amber-500/5 pointer-events-none z-40" />

      {/* Highlight border around affected node */}
      <AffectedNodeHighlight targetNodeId={pendingAIDiff.targetNodeId} action={pendingAIDiff.action} />

      {/* Action bar at top of canvas */}
      <div className="fixed top-[72px] left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-2 shadow-lg">
        <span className="material-symbols-outlined text-amber-600 text-[18px]">preview</span>
        <span className="text-sm font-medium text-amber-900">
          Preview: {ACTION_LABELS[pendingAIDiff.action] || pendingAIDiff.action}
        </span>
        <NodeCountBadge diff={pendingAIDiff} />
        <button
          onClick={confirmAIDiff}
          className="px-3 py-1 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
        >
          Apply
        </button>
        <button
          onClick={rejectAIDiff}
          className="px-3 py-1 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
        >
          Reject
        </button>
      </div>
    </>
  );
}

// ============================================================
// AffectedNodeHighlight — amber border around target node
// ============================================================

function AffectedNodeHighlight({ targetNodeId, action }: { targetNodeId: string; action: AIAction }) {
  const tree = useBuilderStore((s) => s.tree);

  // For full_page, highlight the entire canvas area
  const isFullPage = action === AIAction.FULL_PAGE;

  // For delete actions, use red; for insert, use green; others use amber
  const borderColor = action === AIAction.DELETE_NODE
    ? 'border-red-400'
    : action === AIAction.INSERT_SECTION || action === AIAction.INSERT_COMPONENT
      ? 'border-green-400'
      : 'border-amber-400';

  if (isFullPage) {
    return (
      <style>{`
        [data-canvas-root] {
          outline: 2px dashed var(--color-amber-400, #fbbf24) !important;
          outline-offset: -2px;
        }
      `}</style>
    );
  }

  // Use CSS to target the node via data attribute
  return (
    <style>{`
      [data-node-id="${targetNodeId}"] {
        outline: 2px dashed ${action === AIAction.DELETE_NODE ? '#f87171' : action === AIAction.INSERT_SECTION || action === AIAction.INSERT_COMPONENT ? '#4ade80' : '#fbbf24'} !important;
        outline-offset: 2px;
        position: relative;
      }
    `}</style>
  );
}

// ============================================================
// NodeCountBadge — shows how many nodes are affected
// ============================================================

function NodeCountBadge({ diff }: { diff: AIDiff }) {
  const count = useMemo(() => {
    if (Array.isArray(diff.payload)) {
      return diff.payload.length;
    }
    if (diff.action === AIAction.FULL_PAGE) {
      // Count top-level children
      const payload = diff.payload as DOMNode;
      return payload?.children?.length ?? 1;
    }
    return 1;
  }, [diff]);

  if (count <= 1) return null;

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-200/80 text-amber-800 px-2 py-0.5 rounded-md">
      {count} node{count > 1 ? 's' : ''}
    </span>
  );
}
