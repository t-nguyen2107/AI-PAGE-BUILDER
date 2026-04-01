'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useBuilderStore } from '@/store';
import { apiClient } from '@/lib/api-client';
import type { AIGenerationResponse, DOMNode } from '@/types';
import { NodeType, SemanticTag } from '@/types/enums';

interface ToolbarPosition {
  top: number;
  left: number;
}

// ============================================================
// SelectionToolbar — floating AI actions on selected elements
// ============================================================
export function SelectionToolbar({ projectId }: { projectId: string }) {
  const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
  const tree = useBuilderStore((s) => s.tree);
  const currentPageId = useBuilderStore((s) => s.currentPageId);
  const applyAIDiff = useBuilderStore((s) => s.applyAIDiff);
  const removeNode = useBuilderStore((s) => s.removeNode);
  const clearSelection = useBuilderStore((s) => s.clearSelection);

  const [position, setPosition] = useState<ToolbarPosition | null>(null);
  const [loading, setLoading] = useState(false);

  // Compute position from the selected DOM element
  useEffect(() => {
    if (!selectedNodeId) {
      setPosition(null);
      return;
    }

    const el = document.querySelector(`[data-node-id="${selectedNodeId}"]`);
    if (!el) {
      setPosition(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    const toolbarWidth = 280;
    const canvasRect = document.querySelector('.canvas-dot-grid')?.getBoundingClientRect();

    let left = rect.left + rect.width / 2 - toolbarWidth / 2;
    let top = rect.top - 44;

    // Clamp within canvas bounds
    if (canvasRect) {
      left = Math.max(canvasRect.left + 8, Math.min(left, canvasRect.right - toolbarWidth - 8));
    }
    if (top < 8) top = rect.bottom + 8;

    setPosition({ top, left });
  }, [selectedNodeId, tree]);

  const selectedNode = selectedNodeId && tree
    ? (function findNode(node: DOMNode): DOMNode | null {
        if (node.id === selectedNodeId) return node;
        if ('children' in node && Array.isArray((node as { children?: DOMNode[] }).children)) {
          for (const child of (node as { children: DOMNode[] }).children) {
            const found = findNode(child);
            if (found) return found;
          }
        }
        return null;
      })(tree)
    : null;

  const isTextElement = selectedNode?.type === NodeType.ELEMENT || selectedNode?.type === NodeType.ITEM;

  const handleAIAction = useCallback(
    async (prompt: string) => {
      if (!selectedNodeId || !currentPageId || loading) return;
      setLoading(true);

      try {
        const res = await apiClient.generateFromPrompt({
          prompt,
          projectId,
          pageId: currentPageId,
          targetNodeId: selectedNodeId,
          styleguideId: tree?.styleguideId ?? '',
        });

        if (res.success && res.data && res.data.action !== 'clarify') {
          if (res.data.action === 'full_page' && res.data.nodes.length > 0 && res.data.nodes[0].type !== NodeType.PAGE) {
            const pageNode = {
              id: tree?.id ?? `page_${Date.now()}`,
              type: NodeType.PAGE,
              tag: SemanticTag.MAIN,
              className: '',
              children: res.data.nodes,
              meta: tree?.meta ?? { title: 'Untitled Page', slug: 'untitled', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              styleguideId: tree?.styleguideId ?? '',
              globalSectionIds: tree?.globalSectionIds ?? [],
            };
            applyAIDiff({ action: res.data.action, targetNodeId: tree?.id ?? '', payload: pageNode as DOMNode, position: res.data.position });
          } else {
            applyAIDiff({
              action: res.data.action,
              targetNodeId: res.data.targetNodeId ?? selectedNodeId,
              payload: res.data.nodes.length === 1 ? res.data.nodes[0] : res.data.nodes,
              position: res.data.position,
            });
          }
        }
      } catch {
        // Silently fail — toolbar actions are quick edits
      } finally {
        setLoading(false);
      }
    },
    [selectedNodeId, projectId, currentPageId, tree, loading, applyAIDiff],
  );

  const handleDelete = useCallback(() => {
    if (!selectedNodeId) return;
    removeNode(selectedNodeId);
    clearSelection();
  }, [selectedNodeId, removeNode, clearSelection]);

  if (!position || !selectedNodeId) return null;

  const toolbar = (
    <div
      className="fixed z-50 flex items-center gap-1 bg-white/90 backdrop-blur-xl rounded-xl px-2 py-1.5 shadow-xl border border-outline-variant/20"
      style={{ top: position.top, left: position.left }}
    >
      {isTextElement && (
        <ToolbarButton
          icon="auto_fix_high"
          label="Rewrite"
          loading={loading}
          onClick={() => handleAIAction('Rewrite this text to be more engaging and professional')}
        />
      )}
      <ToolbarButton
        icon="palette"
        label="Style"
        loading={loading}
        onClick={() => handleAIAction('Improve the visual styling of this element')}
      />
      <ToolbarButton
        icon="content_copy"
        label="Variant"
        loading={loading}
        onClick={() => handleAIAction('Create a variation of this element with different content')}
      />
      <div className="w-px h-5 bg-outline-variant/20 mx-0.5" />
      <ToolbarButton
        icon="delete"
        label="Delete"
        loading={false}
        danger
        onClick={handleDelete}
      />
    </div>
  );

  return createPortal(toolbar, document.body);
}

// ============================================================
// Toolbar Button
// ============================================================
function ToolbarButton({
  icon,
  label,
  loading,
  danger,
  onClick,
}: {
  icon: string;
  label: string;
  loading: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      title={label}
      className={`
        flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all
        ${danger
          ? 'text-error hover:bg-error-container/20'
          : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
        }
        disabled:opacity-40 disabled:cursor-wait
      `}
    >
      <span className={`material-symbols-outlined text-[14px] ${loading ? 'animate-ai-pulse' : ''}`}>
        {loading ? 'hourglass_top' : icon}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
