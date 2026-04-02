'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import { useBuilderStore } from '@/store';
import { useToastStore } from '@/store/toast-store';
import { apiClient } from '@/lib/api-client';
import type { Revision } from '@/types';

interface RevisionBrowserProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
}

export function RevisionBrowser({ projectId, open, onClose }: RevisionBrowserProps) {
  const currentPageId = useBuilderStore((s) => s.currentPageId);
  const loadTree = useBuilderStore((s) => s.loadTree);
  const addToast = useToastStore((s) => s.addToast);

  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Fetch revisions when the modal opens
  useEffect(() => {
    if (!open || !currentPageId) return;

    let cancelled = false;
    setLoading(true);
    setRevisions([]);

    apiClient
      .listRevisions(projectId, currentPageId)
      .then((res) => {
        if (!cancelled && res.success && res.data) {
          setRevisions(res.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          addToast('Failed to load revisions', 'error');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, projectId, currentPageId, addToast]);

  const handleRestore = useCallback(
    async (revision: Revision) => {
      setRestoringId(revision.id);
      try {
        const res = await apiClient.restoreRevision(projectId, revision.id);
        if (res.success && res.data) {
          // res.data is the restored Page — reload the tree into the store
          const page = res.data;
          const treeData =
            typeof page.treeData === 'string'
              ? JSON.parse(page.treeData)
              : page.treeData;
          loadTree(page.id, treeData);
          addToast(`Restored revision from ${formatDate(revision.createdAt)}`, 'success');
          onClose();
        } else {
          addToast('Failed to restore revision', 'error');
        }
      } catch {
        addToast('Failed to restore revision', 'error');
      } finally {
        setRestoringId(null);
      }
    },
    [projectId, loadTree, addToast, onClose],
  );

  return (
    <Modal open={open} onClose={onClose} title="Revision History" maxWidth="max-w-xl">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="material-symbols-outlined animate-spin text-on-surface-variant text-[24px]">
            progress_activity
          </span>
          <span className="ml-2 text-sm text-on-surface-variant">Loading revisions...</span>
        </div>
      ) : revisions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
          <span className="material-symbols-outlined text-[32px] mb-2">history</span>
          <p className="text-sm">No revisions yet for this page.</p>
          <p className="text-xs mt-1 text-on-surface-outline">
            Revisions are created each time you save.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-outline-variant/10 -mx-6 max-h-[60vh] overflow-y-auto">
          {revisions.map((rev) => (
            <li
              key={rev.id}
              className="flex items-center justify-between px-6 py-3 hover:bg-surface-container/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-on-surface truncate">
                  {rev.label || 'Auto-save'}
                </p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  {formatDate(rev.createdAt)}
                </p>
              </div>
              <button
                onClick={() => handleRestore(rev)}
                disabled={restoringId !== null}
                className="ml-3 shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary border border-primary/20 hover:bg-primary/10 transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                {restoringId === rev.id ? 'Restoring...' : 'Restore'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

// ---------- helpers ----------

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;

    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;

    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
