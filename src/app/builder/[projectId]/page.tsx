'use client';

import React, { useEffect, useState } from 'react';
import { useBuilderStore } from '@/store';
import { apiClient } from '@/lib/api-client';
import type { Project, Page } from '@/types';

export default function BuilderProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = React.use(params);

  const loadTree = useBuilderStore((s) => s.loadTree);
  const loadStyleguide = useBuilderStore((s) => s.loadStyleguide);
  const setProjectName = useBuilderStore((s) => s.setProjectName);
  const tree = useBuilderStore((s) => s.tree);
  const currentPageId = useBuilderStore((s) => s.currentPageId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProject() {
      try {
        // Fetch project info
        const projectRes = await apiClient.getProject(projectId);
        if (!projectRes.success || !projectRes.data) {
          setError(projectRes.error?.message ?? 'Failed to load project');
          return;
        }

        const project: Project = projectRes.data;
        setProjectName(project.name);

        // Fetch styleguide
        const styleguideRes = await apiClient.getStyleguide(projectId);
        if (styleguideRes.success && styleguideRes.data) {
          loadStyleguide(styleguideRes.data);
        }

        // Fetch pages
        const pagesRes = await apiClient.listPages(projectId);
        if (!pagesRes.success || !pagesRes.data || pagesRes.data.length === 0) {
          setError('No pages found for this project');
          return;
        }

        if (cancelled) return;

        const pages: Page[] = pagesRes.data;

        // Load the first page (or home page) into the store
        const homePage = pages.find((p) => p.isHomePage) ?? pages[0];
        if (homePage.treeData) {
          loadTree(homePage.id, homePage.treeData);
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

    loadProject();
    return () => { cancelled = true; };
  }, [projectId, loadTree, loadStyleguide, setProjectName]);

  // The layout handles rendering. This page only loads data.
  // Show loading/error states as overlays.
  if (loading) {
    return (
      <div className="fixed inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-on-surface-variant">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-red-900/20 flex items-center justify-center mx-auto mb-3">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-red-400"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return null;
}
