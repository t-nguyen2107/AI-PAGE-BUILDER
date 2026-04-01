'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useBuilderStore, useHistory } from '@/store';
import { useToastStore } from '@/store/toast-store';
import { apiClient } from '@/lib/api-client';
import { findNodeByText } from '@/lib/tree-utils';

export function BuilderHeader({ projectId }: { projectId: string }) {
  const tree = useBuilderStore((s) => s.tree);
  const currentPageId = useBuilderStore((s) => s.currentPageId);
  const isDirty = useBuilderStore((s) => s.isDirty);
  const markSaved = useBuilderStore((s) => s.markSaved);
  const projectName = useBuilderStore((s) => s.projectName);
  const selectNode = useBuilderStore((s) => s.selectNode);
  const leftPanelOpen = useBuilderStore((s) => s.leftPanelOpen);
  const toggleLeftPanel = useBuilderStore((s) => s.toggleLeftPanel);
  const setActivePanel = useBuilderStore((s) => s.setActivePanel);

  const { undo, redo, canUndo, canRedo } = useHistory();
  const addToast = useToastStore((s) => s.addToast);

  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const handleSave = useCallback(async () => {
    if (!tree || !currentPageId) return;
    setSaving(true);
    try {
      const res = await apiClient.savePage(projectId, currentPageId, tree);
      if (res.success) {
        markSaved();
      }
    } finally {
      setSaving(false);
    }
  }, [tree, currentPageId, projectId, markSaved]);

  const handlePublish = useCallback(async () => {
    if (!tree || !currentPageId) return;
    setSaving(true);
    try {
      const res = await apiClient.savePage(projectId, currentPageId, tree);
      if (res.success) {
        markSaved();
        addToast('Published successfully!', 'success');
      } else {
        addToast('Publish failed. Please try again.', 'error');
      }
    } catch {
      addToast('Publish failed. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  }, [tree, currentPageId, projectId, markSaved, addToast]);

  const handlePreview = useCallback(() => {
    if (!currentPageId) return;
    window.open(`/preview/${projectId}/${currentPageId}`, '_blank');
  }, [projectId, currentPageId]);

  const handleNavClick = useCallback(
    (panel: 'pages' | 'layers' | 'library') => {
      if (!leftPanelOpen) toggleLeftPanel();
      setActivePanel(panel);
    },
    [leftPanelOpen, toggleLeftPanel, setActivePanel]
  );

  const handleSearch = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter' || !searchQuery.trim() || !tree) return;
      const found = findNodeByText(tree, searchQuery.trim());
      if (found) {
        selectNode(found.id);
        addToast(`Found: ${found.type} node`, 'info');
      } else {
        addToast('No matching element found', 'info');
      }
    },
    [searchQuery, tree, selectNode, addToast]
  );

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl flex justify-between items-center h-16 px-8 border-b border-slate-100/50">
      {/* Left: Brand + Nav */}
      <div className="flex items-center gap-8">
        <span className="text-lg font-bold tracking-tighter text-slate-900">CuratorAI</span>
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => handleNavClick('pages')}
            className="text-blue-700 font-semibold border-b-2 border-blue-700 pb-1 text-sm tracking-tight"
          >
            Pages
          </button>
          <button
            onClick={() => handleNavClick('layers')}
            className="text-slate-500 hover:text-slate-900 transition-colors duration-200 text-sm tracking-tight"
          >
            History
          </button>
          <button
            onClick={() => handleNavClick('library')}
            className="text-slate-500 hover:text-slate-900 transition-colors duration-200 text-sm tracking-tight"
          >
            Components
          </button>
        </nav>
      </div>

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-4">
        {/* Undo/Redo */}
        <button
          onClick={() => undo()}
          disabled={!canUndo}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Undo"
        >
          <span className="material-symbols-outlined text-[18px]">undo</span>
        </button>
        <button
          onClick={() => redo()}
          disabled={!canRedo}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Redo"
        >
          <span className="material-symbols-outlined text-[18px]">redo</span>
        </button>

        <div className="h-5 w-px bg-slate-200" />

        {/* Search */}
        <div className="relative flex items-center h-9 px-3 bg-slate-100/50 rounded-lg">
          <span className="material-symbols-outlined text-sm text-slate-400 mr-2">search</span>
          <input
            ref={searchRef}
            className="bg-transparent border-none focus:ring-0 text-xs w-48"
            placeholder="Search elements... (Enter)"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        {/* Dirty indicator */}
        {isDirty && (
          <span className="w-2 h-2 rounded-full bg-primary shrink-0" title="Unsaved changes" />
        )}

        <button
          onClick={handlePreview}
          className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-slate-50 transition-colors rounded-lg"
        >
          Preview
        </button>
        <button
          onClick={handleSave}
          disabled={!isDirty || saving || !currentPageId}
          className="bg-surface-container-highest text-on-surface px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={handlePublish}
          disabled={!isDirty || saving || !currentPageId}
          className="btn-primary-gradient text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          {saving ? 'Publishing...' : 'Publish'}
        </button>

        {/* Profile avatar */}
        <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/20 flex items-center justify-center ml-1">
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">account_circle</span>
        </div>
      </div>
    </header>
  );
}
