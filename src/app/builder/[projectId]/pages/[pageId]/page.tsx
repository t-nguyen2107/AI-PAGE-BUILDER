'use client';

import React, { useEffect, useState } from 'react';
import { useBuilderStore } from '@/store';
import { apiClient } from '@/lib/api-client';
import type { Page } from '@/types';

export default function BuilderPageView({
  params,
}: {
  params: Promise<{ projectId: string; pageId: string }>;
}) {
  const { projectId, pageId } = React.use(params);

  const loadTree = useBuilderStore((s) => s.loadTree);
  const setGlobalSections = useBuilderStore((s) => s.setGlobalSections);
  const currentPageId = useBuilderStore((s) => s.currentPageId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      try {
        const res = await apiClient.getPage(projectId, pageId);
        if (!res.success || !res.data) {
          setError(res.error?.message ?? 'Failed to load page');
          return;
        }

        if (cancelled) return;

        const page: Page = res.data;
        if (page.treeData) {
          loadTree(page.id, page.treeData);
        }

        // Load global sections for this project
        const gsRes = await apiClient.listGlobalSections(projectId);
        if (gsRes.success && gsRes.data) {
          setGlobalSections(gsRes.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(String(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    // Only load if this page is not already active
    if (pageId !== currentPageId) {
      loadPage();
    } else {
      setLoading(false);
    }

    return () => { cancelled = true; };
  }, [projectId, pageId, currentPageId, loadTree, setGlobalSections]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-on-surface-variant">Loading page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-error-container/20 flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-error text-[24px]">error</span>
          </div>
          <p className="text-sm text-error">{error}</p>
        </div>
      </div>
    );
  }

  return null;
}
