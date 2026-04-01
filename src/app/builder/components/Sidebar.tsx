'use client';

import React, { useState, useCallback } from 'react';
import { useBuilderStore } from '@/store';
import { useToastStore } from '@/store/toast-store';
import { getNodeChildren } from '@/lib/tree-utils';
import { getNodeTypeLabel } from '@/lib/node-utils';
import type { DOMNode } from '@/types';
import type { Page } from '@/types';
import { NodeType, SemanticTag } from '@/types';
import { generateId } from '@/lib/id';
import { apiClient } from '@/lib/api-client';

// ============================================================
// TreeNode: recursive tree view with Material Symbols
// ============================================================

const NODE_ICONS: Record<string, string> = {
  page: 'description',
  section: 'layers',
  container: 'view_quilt',
  component: 'widgets',
  element: 'category',
  item: 'list',
};

function TreeNode({
  node,
  depth,
}: {
  node: DOMNode;
  depth: number;
}) {
  const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
  const hoveredNodeId = useBuilderStore((s) => s.hoveredNodeId);
  const selectNode = useBuilderStore((s) => s.selectNode);
  const hoverNode = useBuilderStore((s) => s.hoverNode);
  const [expanded, setExpanded] = useState(true);

  const children = getNodeChildren(node);
  const hasChildren = children.length > 0;
  const isSelected = selectedNodeId === node.id;
  const isHovered = hoveredNodeId === node.id;
  const iconName = NODE_ICONS[node.type] || 'code';

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectNode(node.id);
    },
    [selectNode, node.id]
  );

  const handleMouseEnter = useCallback(() => {
    hoverNode(node.id);
  }, [hoverNode, node.id]);

  const handleMouseLeave = useCallback(() => {
    hoverNode(null);
  }, [hoverNode]);

  const toggleExpand = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setExpanded((prev) => !prev);
    },
    []
  );

  return (
    <div>
      <div
        className={`
          flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all
          ${isSelected ? 'bg-white text-blue-700 shadow-sm border-l-2 border-blue-700' : ''}
          ${isHovered && !isSelected ? 'bg-white/60 text-slate-900' : ''}
          ${!isSelected && !isHovered ? 'text-slate-500 hover:text-slate-900' : ''}
        `}
        style={{ marginLeft: `${depth * 16}px` }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {hasChildren && (
          <button onClick={toggleExpand} className="shrink-0">
            <span className={`material-symbols-outlined text-sm transition-transform ${expanded ? '' : '-rotate-90'}`}>
              expand_more
            </span>
          </button>
        )}
        <span className="material-symbols-outlined text-sm">{iconName}</span>
        <span className="text-xs font-semibold uppercase tracking-wider truncate">
          {getNodeTypeLabel(node.type)}
        </span>
      </div>

      {hasChildren && expanded && (
        <div>
          {children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Layers tab
// ============================================================
function LayersTab() {
  const tree = useBuilderStore((s) => s.tree);
  const addNode = useBuilderStore((s) => s.addNode);

  const handleAddSection = useCallback(() => {
    if (!tree) return;
    const sectionNode = {
      id: generateId(),
      type: NodeType.SECTION,
      tag: SemanticTag.SECTION,
      className: '',
      children: [],
      layout: {},
      meta: {
        locked: false,
        hidden: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    } as DOMNode;
    addNode(tree.id, sectionNode);
  }, [tree, addNode]);

  if (!tree) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-xs text-on-surface-outline">No page loaded</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <TreeNode node={tree} depth={0} />
    </div>
  );
}

// ============================================================
// Pages tab
// ============================================================
function PagesTab({ projectId }: { projectId: string }) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const currentPageId = useBuilderStore((s) => s.currentPageId);
  const loadTree = useBuilderStore((s) => s.loadTree);

  React.useEffect(() => {
    let cancelled = false;
    apiClient.listPages(projectId).then((res) => {
      if (cancelled) return;
      if (res.success && res.data) {
        setPages(res.data);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [projectId]);

  const handlePageClick = useCallback(
    (page: Page) => {
      if (page.id === currentPageId) return;
      loadTree(page.id, page.treeData);
    },
    [currentPageId, loadTree]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-xs text-on-surface-variant">Loading pages...</p>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-xs text-on-surface-outline">No pages found</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {pages.map((page) => (
        <button
          key={page.id}
          onClick={() => handlePageClick(page)}
          className={`
            w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left
            ${page.id === currentPageId
              ? 'bg-white text-blue-700 shadow-sm translate-x-1'
              : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
            }
          `}
        >
          <span className="material-symbols-outlined text-sm">description</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{page.title}</p>
            <p className="text-[10px] text-on-surface-outline font-mono">/{page.slug}</p>
          </div>
          {page.isHomePage && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-primary/8 text-primary font-semibold">
              Home
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// Library tab
// ============================================================
function LibraryTab() {
  const [items, setItems] = useState<{ id: string; name: string; category: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const tree = useBuilderStore((s) => s.tree);
  const addNode = useBuilderStore((s) => s.addNode);

  React.useEffect(() => {
    let cancelled = false;
    apiClient.listLibrary().then((res) => {
      if (cancelled) return;
      if (res.success && res.data) {
        setItems(res.data.map((item) => ({ id: item.id, name: item.name, category: item.category })));
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const handleInsert = useCallback(async (itemId: string) => {
    if (!tree) return;
    try {
      const res = await apiClient.getLibraryItem(itemId);
      if (res.success && res.data?.nodeData) {
        addNode(tree.id, res.data.nodeData as DOMNode);
      }
    } catch { /* non-fatal */ }
  }, [tree, addNode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-xs text-on-surface-variant">Loading library...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <p className="text-xs text-on-surface-outline">No saved components</p>
          <p className="text-[10px] text-on-surface-outline mt-1">
            Save components to reuse across pages
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-white/60 rounded-lg transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">extension</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{item.name}</p>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-surface-container text-on-surface-variant">
            {item.category}
          </span>
          <button
            onClick={() => handleInsert(item.id)}
            disabled={!tree}
            className="p-1 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-30"
            title="Insert into page"
          >
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Styleguide tab
// ============================================================
function StyleguideTab() {
  const activeStyleguide = useBuilderStore((s) => s.activeStyleguide);

  if (!activeStyleguide) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-xs text-on-surface-outline">No styleguide loaded</p>
      </div>
    );
  }

  const colorEntries = Object.entries(activeStyleguide.colors).filter(
    ([key]) => key !== 'custom'
  );

  return (
    <div className="space-y-6">
      {/* Colors */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3 px-2">
          Color Palette
        </p>
        <div className="grid grid-cols-4 gap-2 px-2">
          {colorEntries.slice(0, 8).map(([name, value]) => (
            <div
              key={name}
              className="aspect-square rounded-lg border border-outline-variant/20 shadow-sm cursor-pointer"
              style={{ backgroundColor: value as string }}
              title={`${name}: ${value as string}`}
            />
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3 px-2">
          Typography
        </p>
        <div className="space-y-2 px-2">
          <div className="flex justify-between">
            <span className="text-xs text-on-surface-variant">Heading</span>
            <span className="text-xs text-on-surface-variant font-mono">
              {activeStyleguide.typography.headingFont}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-on-surface-variant">Body</span>
            <span className="text-xs text-on-surface-variant font-mono">
              {activeStyleguide.typography.bodyFont}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main: Sidebar — Stitch design with Material Symbols
// ============================================================
export function Sidebar({ projectId }: { projectId: string }) {
  const [activeTab, setActiveTab] = useState('layers');
  const leftPanelOpen = useBuilderStore((s) => s.leftPanelOpen);
  const toggleLeftPanel = useBuilderStore((s) => s.toggleLeftPanel);
  const projectName = useBuilderStore((s) => s.projectName);
  const tree = useBuilderStore((s) => s.tree);
  const addNode = useBuilderStore((s) => s.addNode);

  const handleAddSection = useCallback(() => {
    if (!tree) return;
    const sectionNode = {
      id: generateId(),
      type: NodeType.SECTION,
      tag: SemanticTag.SECTION,
      className: '',
      children: [],
      layout: {},
      meta: {
        locked: false,
        hidden: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    } as DOMNode;
    addNode(tree.id, sectionNode);
  }, [tree, addNode]);

  if (!leftPanelOpen) {
    return (
      <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-16 border-r border-slate-200/20 bg-slate-50/50 backdrop-blur-lg flex flex-col items-center pt-4 gap-2">
        <button
          onClick={toggleLeftPanel}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-white transition-colors"
          title="Open Sidebar"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-slate-50/50 backdrop-blur-lg border-r border-slate-200/20 flex flex-col p-4 space-y-6 z-40">
      {/* Project info header */}
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">{projectName || 'Untitled'}</p>
          <p className="uppercase text-[10px] tracking-widest font-bold text-slate-500">Main Canvas</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="space-y-1">
        <p className="uppercase text-[10px] tracking-widest font-bold text-slate-400 mb-2 px-2">Navigator</p>
        {[
          { id: 'layers', icon: 'layers', label: 'Layers' },
          { id: 'pages', icon: 'description', label: 'Pages' },
          { id: 'library', icon: 'extension', label: 'Components' },
          { id: 'styleguide', icon: 'palette', label: 'Styles' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all
              ${activeTab === item.id
                ? 'bg-white text-blue-700 shadow-sm translate-x-1'
                : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
              }
            `}
          >
            <span className="material-symbols-outlined text-sm">{item.icon}</span>
            <span className="text-xs font-semibold">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'layers' && <LayersTab />}
        {activeTab === 'pages' && <PagesTab projectId={projectId} />}
        {activeTab === 'library' && <LibraryTab />}
        {activeTab === 'styleguide' && <StyleguideTab />}
      </div>

      {/* Bottom actions */}
      <div className="pt-4 mt-auto space-y-3 border-t border-slate-200/20">
        <button
          onClick={handleAddSection}
          className="w-full btn-primary-gradient text-white rounded-lg py-2.5 text-[10px] font-bold uppercase tracking-widest"
        >
          Add Section
        </button>
        <div className="flex justify-between px-2">
          <button
            onClick={() => useToastStore.getState().addToast('Shortcuts: Ctrl+Z Undo, Ctrl+Y Redo, Ctrl+S Save. Use the AI bar to generate sections!', 'info')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">help</span>
            <span className="text-[10px] uppercase tracking-widest font-bold">Help</span>
          </button>
          <button
            onClick={toggleLeftPanel}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">sidebar</span>
            <span className="text-[10px] uppercase tracking-widest font-bold">Close</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
