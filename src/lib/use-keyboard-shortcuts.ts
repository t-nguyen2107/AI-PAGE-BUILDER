'use client';

import { useEffect } from 'react';
import { useBuilderStore, useHistory } from '@/store';
import { apiClient } from '@/lib/api-client';

/**
 * Register global keyboard shortcuts for the builder.
 * Must be called from a client component inside the builder layout.
 */
export function useKeyboardShortcuts(projectId: string) {
  const tree = useBuilderStore((s) => s.tree);
  const currentPageId = useBuilderStore((s) => s.currentPageId);
  const isDirty = useBuilderStore((s) => s.isDirty);
  const markSaved = useBuilderStore((s) => s.markSaved);
  const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
  const removeNode = useBuilderStore((s) => s.removeNode);
  const duplicateNode = useBuilderStore((s) => s.duplicateNode);
  const clearSelection = useBuilderStore((s) => s.clearSelection);

  const { undo, redo, canUndo, canRedo } = useHistory();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore shortcuts when typing in input/textarea/contenteditable
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      const ctrl = e.ctrlKey || e.metaKey;

      // Ctrl+Z — Undo
      if (ctrl && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        if (canUndo) undo();
        return;
      }

      // Ctrl+Shift+Z / Ctrl+Y — Redo
      if (ctrl && ((e.shiftKey && e.key === 'Z') || e.key === 'y')) {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }

      // Ctrl+S — Save
      if (ctrl && e.key === 's') {
        e.preventDefault();
        if (isDirty && tree && currentPageId) {
          apiClient.savePage(projectId, currentPageId, tree).then((res) => {
            if (res.success) markSaved();
          });
        }
        return;
      }

      // Ctrl+D — Duplicate selected node
      if (ctrl && e.key === 'd') {
        e.preventDefault();
        if (selectedNodeId) duplicateNode(selectedNodeId);
        return;
      }

      // Escape — Clear selection
      if (e.key === 'Escape') {
        clearSelection();
        return;
      }

      // Delete/Backspace — Delete selected node (not when typing)
      if (!isTyping && (e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        e.preventDefault();
        removeNode(selectedNodeId);
        clearSelection();
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    projectId, tree, currentPageId, isDirty, selectedNodeId,
    undo, redo, canUndo, canRedo,
    markSaved, removeNode, duplicateNode, clearSelection,
  ]);
}
