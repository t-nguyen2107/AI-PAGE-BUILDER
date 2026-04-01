'use client';

import React, { useMemo, useCallback, useState, useRef } from 'react';
import { useHistory } from '@/store';
import Script from 'next/script';
import { useBuilderStore } from '@/store';
import { getNodePath, getNodeTypeLabel } from '@/lib/node-utils';
import { apiClient } from '@/lib/api-client';
import type { AIGenerationResponse, DOMNode, SectionNode } from '@/types';
import { NodeType, SemanticTag } from '@/types/enums';
import { PageRenderer } from '@/features/renderer';
import { DndProvider } from '@/features/dnd';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { SelectionToolbar } from '@/features/renderer/components/SelectionToolbar';

// ============================================================
// Canvas — Stitch design with dot-grid + floating AI bar
// ============================================================
export function Canvas({ projectId }: { projectId: string }) {
  const tree = useBuilderStore((s) => s.tree);
  const zoom = useBuilderStore((s) => s.zoom);
  const setZoom = useBuilderStore((s) => s.setZoom);
  const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
  const selectNode = useBuilderStore((s) => s.selectNode);
  const currentPageId = useBuilderStore((s) => s.currentPageId);
  const applyAIDiff = useBuilderStore((s) => s.applyAIDiff);
  const addChatMessage = useBuilderStore((s) => s.addChatMessage);
  const globalSections = useBuilderStore((s) => s.globalSections) ?? [];

  const [commandInput, setCommandInput] = useState('');
  const [commandLoading, setCommandLoading] = useState(false);
  const [previewWidth, setPreviewWidth] = useState<'100%' | '768px' | '375px'>('100%');
  const abortRef = useRef<AbortController | null>(null);

  const { undo, canUndo } = useHistory();

  const PREVIEW_CYCLE: Array<'100%' | '768px' | '375px'> = ['100%', '768px', '375px'];
  const PREVIEW_LABELS: Record<string, string> = { '100%': 'Desktop', '768px': 'Tablet', '375px': 'Mobile' };

  const handleCyclePreview = useCallback(() => {
    setPreviewWidth((prev) => {
      const idx = PREVIEW_CYCLE.indexOf(prev);
      return PREVIEW_CYCLE[(idx + 1) % PREVIEW_CYCLE.length];
    });
  }, []);

  const handleUndo = useCallback(() => {
    if (canUndo) undo();
  }, [undo, canUndo]);

  const headerSections = useMemo<SectionNode[]>(
    () => globalSections
      .filter((s) => s.sectionType === 'header')
      .map((s) => s.treeData),
    [globalSections]
  );

  const footerSections = useMemo<SectionNode[]>(
    () => globalSections
      .filter((s) => s.sectionType === 'footer')
      .map((s) => s.treeData),
    [globalSections]
  );

  const breadcrumbPath = useMemo(() => {
    if (!tree || !selectedNodeId) return [];
    return getNodePath(tree, selectedNodeId);
  }, [tree, selectedNodeId]);

  const handleZoomIn = useCallback(() => {
    setZoom(zoom + 10);
  }, [zoom, setZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom(zoom - 10);
  }, [zoom, setZoom]);

  const handleZoomReset = useCallback(() => {
    setZoom(100);
  }, [setZoom]);

  const applyResponse = useCallback(
    (res: AIGenerationResponse) => {
      if (res.action === 'full_page' && res.nodes.length > 0 && res.nodes[0].type !== NodeType.PAGE) {
        const pageNode = {
          id: tree?.id ?? `page_${Date.now()}`,
          type: NodeType.PAGE,
          tag: SemanticTag.MAIN,
          className: '',
          children: res.nodes,
          meta: tree?.meta ?? {
            title: 'Untitled Page',
            slug: 'untitled',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          styleguideId: tree?.styleguideId ?? '',
          globalSectionIds: tree?.globalSectionIds ?? [],
        };
        applyAIDiff({
          action: res.action,
          targetNodeId: tree?.id ?? '',
          payload: pageNode as DOMNode,
          position: res.position,
        });
      } else {
        applyAIDiff({
          action: res.action,
          targetNodeId: res.targetNodeId ?? (selectedNodeId ?? tree?.id ?? ''),
          payload: res.nodes.length === 1 ? res.nodes[0] : res.nodes,
          position: res.position,
        });
      }
    },
    [selectedNodeId, tree, applyAIDiff],
  );

  const handleCommandSend = useCallback(() => {
    const trimmed = commandInput.trim();
    if (!trimmed || !currentPageId || commandLoading) return;

    addChatMessage({ role: 'user', content: trimmed, status: 'success' });
    setCommandInput('');
    setCommandLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    apiClient.generateFromPromptStream(
      {
        prompt: trimmed,
        projectId,
        pageId: currentPageId,
        targetNodeId: selectedNodeId ?? undefined,
        styleguideId: tree?.styleguideId ?? '',
      },
      () => {}, // chunks handled by canvas application
      (result) => {
        setCommandLoading(false);
        abortRef.current = null;
        if (result.action !== 'clarify') {
          applyResponse(result);
        }
        addChatMessage({
          role: 'assistant',
          content: result.message ?? `Applied: ${result.action.replace(/_/g, ' ')}`,
          status: 'success',
          action: result.action,
        });
      },
      (error) => {
        setCommandLoading(false);
        abortRef.current = null;
        addChatMessage({
          role: 'assistant',
          content: `Error: ${error}`,
          status: 'error',
        });
      },
    );
  }, [commandInput, projectId, currentPageId, selectedNodeId, tree, commandLoading, applyResponse, addChatMessage]);

  return (
    <>
      {/* Tailwind Play CDN — enables AI-generated Tailwind classes at runtime */}
      <Script
        src="https://cdn.tailwindcss.com"
        strategy="lazyOnload"
      />

      {/* Main Canvas Area */}
      <section className="flex-1 bg-surface-container-low canvas-dot-grid relative overflow-y-auto p-12">
        {/* Breadcrumb bar */}
        <div className="absolute top-0 left-0 w-full h-8 bg-white/60 backdrop-blur-sm flex items-center px-4 gap-1 z-10 border-b border-outline-variant/20">
          {breadcrumbPath.length > 0 ? (
            breadcrumbPath.map((node, i) => (
              <React.Fragment key={node.id}>
                {i > 0 && (
                  <span className="material-symbols-outlined text-[12px] text-on-surface-outline">
                    chevron_right
                  </span>
                )}
                <button
                  onClick={() => selectNode(node.id)}
                  className={`
                    text-xs px-1.5 py-0.5 rounded-md transition-colors whitespace-nowrap
                    ${i === breadcrumbPath.length - 1
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }
                  `}
                >
                  {getNodeTypeLabel(node.type)}
                </button>
              </React.Fragment>
            ))
          ) : (
            <span className="text-xs text-on-surface-outline">No element selected</span>
          )}
        </div>

        {/* Canvas content */}
        <div className="pt-8">
          {tree ? (
            <div className="flex justify-center">
              <div
                className="w-full bg-white canvas-shadow min-h-300 rounded-lg overflow-hidden border border-outline-variant/10 relative transition-[max-width] duration-300"
                style={{ zoom: zoom / 100, maxWidth: previewWidth }}
              >
                <DndProvider tree={tree}>
                  <ErrorBoundary>
                    <PageRenderer
                      node={tree}
                      globalHeaderSections={headerSections}
                      globalFooterSections={footerSections}
                    />
                  </ErrorBoundary>
                </DndProvider>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-150">
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-on-surface-outline">dashboard</span>
                </div>
                <p className="text-sm text-on-surface-variant font-medium">No page loaded</p>
                <p className="text-xs text-on-surface-outline mt-1">
                  Select a page from the sidebar to start editing
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Zoom controls — bottom left */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/80 backdrop-blur-xl rounded-xl px-2 py-1 border border-outline-variant/20 shadow-sm z-10">
          <button
            onClick={handleZoomOut}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Zoom out"
          >
            <span className="material-symbols-outlined text-[16px]">remove</span>
          </button>
          <button
            onClick={handleZoomReset}
            className="text-xs text-on-surface-variant hover:text-on-surface px-1.5 py-0.5 rounded-lg hover:bg-surface-container transition-colors min-w-10 text-center font-semibold"
            title="Reset zoom"
          >
            {zoom}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Zoom in"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
        </div>

        {/* Floating Quick Actions — bottom right of canvas */}
        <div className="absolute bottom-4 right-85 flex flex-col gap-3 items-end z-10">
          <button
            onClick={handleCyclePreview}
            title={`Preview: ${PREVIEW_LABELS[previewWidth]}`}
            className="w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center text-on-surface-variant hover:text-primary transition-all active:scale-90 border border-outline-variant/20"
          >
            <span className="material-symbols-outlined text-[18px]">devices</span>
          </button>
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo"
            className="w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center text-on-surface-variant hover:text-primary transition-all active:scale-90 border border-outline-variant/20 disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
          </button>
        </div>
      </section>

      {/* Floating AI Command Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
        <div className="bg-white/80 backdrop-blur-2xl p-2 rounded-2xl border border-white/40 shadow-2xl">
          <div className="flex items-center gap-4 px-4 py-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary shrink-0">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {commandLoading ? 'hourglass_top' : 'auto_awesome'}
              </span>
            </div>
            <input
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-on-surface placeholder:text-slate-400 outline-none"
              placeholder={commandLoading ? 'Generating...' : 'Ask AI to design or refine...'}
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleCommandSend();
                }
              }}
              disabled={commandLoading || !currentPageId}
            />
            {commandLoading ? (
              <button
                onClick={() => { abortRef.current?.abort(); setCommandLoading(false); }}
                className="p-2 bg-error text-white rounded-xl active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">stop</span>
              </button>
            ) : (
              <button
                onClick={handleCommandSend}
                disabled={!commandInput.trim() || !currentPageId}
                className="p-2 bg-primary text-white rounded-xl active:scale-95 transition-all disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Selection Toolbar — floating AI actions on selected elements */}
      <SelectionToolbar projectId={projectId} />
    </>
  );
}
