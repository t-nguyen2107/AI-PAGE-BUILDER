'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useBuilderStore } from '@/store';
import { apiClient } from '@/lib/api-client';

/**
 * Auto-saves the page tree after 3 seconds of inactivity when the tree is dirty.
 * Silent on failure — user can always manually save with Ctrl+S.
 */
export function useAutoSave(projectId: string) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDirty = useBuilderStore((s) => s.isDirty);
  const currentPageId = useBuilderStore((s) => s.currentPageId);
  const tree = useBuilderStore((s) => s.tree);
  const markSaved = useBuilderStore((s) => s.markSaved);

  const save = useCallback(async () => {
    if (!currentPageId || !tree || !isDirty) return;
    try {
      const res = await apiClient.savePage(projectId, currentPageId, tree);
      if (res.success) {
        markSaved();
      }
    } catch {
      // Silent fail for auto-save — user can manually save via Ctrl+S
    }
  }, [projectId, currentPageId, tree, isDirty, markSaved]);

  useEffect(() => {
    if (!isDirty || !currentPageId) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(save, 3000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isDirty, save]);
}
