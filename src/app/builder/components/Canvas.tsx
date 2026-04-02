'use client';

import React, { useMemo, useCallback, useState, useRef } from 'react';
import { useHistory } from '@/store';
import Script from 'next/script';
import { useBuilderStore } from '@/store';
import type { Breakpoint } from '@/store';
import { getNodePath, getNodeTypeLabel } from '@/lib/node-utils';
import { apiClient } from '@/lib/api-client';
import type { AIGenerationResponse, AIDiff, SectionNode } from '@/types';
import { NodeType, SemanticTag } from '@/types/enums';
import { PageRenderer } from '@/features/renderer';
import { DndProvider } from '@/features/dnd';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { SelectionToolbar } from '@/features/renderer/components/SelectionToolbar';
import { DiffPreviewOverlay } from '@/features/ai/diff-preview';

// ============================================================
// Canvas — Stitch design with dot-grid + floating AI bar
// ============================================================

const BREAKPOINT_WIDTHS: Record<Breakpoint, string> = {
  desktop: '1280px',
  tablet: '768px',
  mobile: '375px',
};

const BREAKPOINT_CYCLE: Breakpoint[] = ['desktop', 'tablet', 'mobile'];
const BREAKPOINT_LABELS: Record<Breakpoint, string> = { desktop: 'Desktop', tablet: 'Tablet', mobile: 'Mobile' };

export function Canvas({ projectId }: { projectId: string }) {
  const tree = useBuilderStore((s) => s.tree);
  const zoom = useBuilderStore((s) => s.zoom);
  const setZoom = useBuilderStore((s) => s.setZoom);
  const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
  const selectNode = useBuilderStore((s) => s.selectNode);
  const currentPageId = useBuilderStore((s) => s.currentPageId);
  const previewAIDiff = useBuilderStore((s) => s.previewAIDiff);
  const addChatMessage = useBuilderStore((s) => s.addChatMessage);
  const globalSections = useBuilderStore((s) => s.globalSections) ?? [];
  const activeBreakpoint = useBuilderStore((s) => s.activeBreakpoint);
  const setBreakpoint = useBuilderStore((s) => s.setBreakpoint);

  const [commandInput, setCommandInput] = useState('');
  const [commandLoading, setCommandLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const commandAccumRef = useRef('');

  const { undo, canUndo } = useHistory();

  const previewWidth = BREAKPOINT_WIDTHS[activeBreakpoint];

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

  const buildDiff = useCallback(
    (res: AIGenerationResponse): AIDiff => {
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
        return {
          action: res.action,
          targetNodeId: tree?.id ?? '',
          payload: pageNode as AIDiff['payload'],
          position: res.position,
        };
      }
      return {
        action: res.action,
        targetNodeId: res.targetNodeId ?? (selectedNodeId ?? tree?.id ?? ''),
        payload: res.nodes.length === 1 ? res.nodes[0] : res.nodes,
        position: res.position,
      };
    },
    [selectedNodeId, tree],
  );

  const previewResponse = useCallback(
    (res: AIGenerationResponse) => {
      const diff = buildDiff(res);
      previewAIDiff(diff);
    },
    [buildDiff, previewAIDiff],
  );

  const handleCommandSend = useCallback(() => {
    const trimmed = commandInput.trim();
    if (!trimmed || !currentPageId || commandLoading) return;

    addChatMessage({ role: 'user', content: trimmed, status: 'success' });
    setCommandInput('');
    setCommandLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    commandAccumRef.current = '';

    apiClient.generateFromPromptStream(
      {
        prompt: trimmed,
        projectId,
        pageId: currentPageId,
        targetNodeId: selectedNodeId ?? undefined,
        styleguideId: tree?.styleguideId ?? '',
      },
      (text) => { commandAccumRef.current += text; },
      (result) => {
        setCommandLoading(false);
        abortRef.current = null;
        commandAccumRef.current = '';

        if (result.action !== 'clarify') {
          previewResponse(result);
        }
        addChatMessage({
          role: 'assistant',
          content: result.action === 'clarify'
            ? (result.message ?? 'I need more information.')
            : `Preview ready: ${result.action.replace(/_/g, ' ')}`,
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
      // onStatus — pipeline progress (for future UI enhancement)
      undefined,
    );
  }, [commandInput, projectId, currentPageId, selectedNodeId, tree, commandLoading, previewResponse, addChatMessage]);

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
        <div className="absolute top-0 left-0 w-full h-8 bg-surface-lowest/60 backdrop-blur-sm flex items-center px-4 gap-1 z-10 border-b border-outline-variant/20">
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
                data-canvas-root
                className="w-full bg-surface-lowest canvas-shadow min-h-screen rounded-lg overflow-hidden border border-outline-variant/10 relative transition-[max-width] duration-300"
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

        {/* Zoom controls — bottom left, fixed so always visible */}
        <div className="fixed top-32 left-68 flex items-center gap-1 bg-surface-lowest/80 backdrop-blur-xl rounded-xl px-2 py-1 border border-outline-variant/20 shadow-sm z-40">
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
        <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10">
          {/* Device toggle — segmented control */}
          <div className="flex items-center bg-surface-lowest/80 backdrop-blur-xl rounded-xl border border-outline-variant/20 shadow-lg p-0.5">
            {BREAKPOINT_CYCLE.map((bp) => {
              const isActive = activeBreakpoint === bp;
              const icon = bp === 'desktop' ? 'desktop_windows' : bp === 'tablet' ? 'tablet_mac' : 'phone_iphone';
              return (
                <button
                  key={bp}
                  onClick={() => setBreakpoint(bp)}
                  title={BREAKPOINT_LABELS[bp]}
                  className={`
                    relative px-2.5 py-1.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-1.5
                    ${isActive
                      ? 'bg-primary-container text-on-primary-container shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }
                  `}
                >
                  <span className="material-symbols-outlined text-[16px]">{icon}</span>
                  <span className="text-[10px] font-semibold hidden sm:inline">{BREAKPOINT_LABELS[bp]}</span>
                </button>
              );
            })}
          </div>
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo"
            className="w-9 h-9 rounded-xl bg-surface-lowest/80 backdrop-blur-xl flex items-center justify-center text-on-surface-variant hover:text-primary transition-all active:scale-90 border border-outline-variant/20 shadow-lg disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
          </button>
        </div>
      </section>

      {/* Floating AI Command Bar — centered on screen */}
      <div className="fixed bottom-8 inset-x-0 flex justify-center px-4 z-50">
        <div className="w-full max-w-2xl group/cmd">
          {/* Main bar container */}
          <div className="relative bg-surface-lowest/95 backdrop-blur-xl rounded-2xl border border-outline-variant/20 shadow-2xl group-focus-within/cmd:border-primary/40 group-focus-within/cmd:shadow-primary/20 transition-all duration-300 overflow-hidden">
            <div className="relative flex items-center gap-3 px-4 py-3">
              {/* AI Icon with ambient glow */}
              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-lg shadow-primary/20 shrink-0">
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{
                    fontVariationSettings: "'FILL' 1",
                    animation: commandLoading ? 'aiSpin 2s linear infinite' : 'none'
                  }}
                >
                  {commandLoading ? 'hourglass_top' : 'auto_awesome'}
                </span>
              </div>

              {/* Input field with improved typography */}
              <div className="flex-1 relative">
                <input
                  className="w-full bg-transparent border-none focus:ring-0 text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none py-2 leading-relaxed tracking-wide"
                  placeholder={commandLoading ? 'Generating magic...' : 'Describe what you want to create...'}
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
              </div>

              {/* Keyboard shortcut hint */}
              <kbd className="hidden sm:flex items-center text-[9px] font-medium text-on-surface-variant/40 bg-surface-container-high/50 px-2 py-1 rounded-lg border border-outline-variant/10 shrink-0 tracking-wider">
                ⏎ ENTER
              </kbd>

              {/* Action buttons */}
              <div className="shrink-0">
                {commandLoading ? (
                  <button
                    onClick={() => { abortRef.current?.abort(); setCommandLoading(false); }}
                    className="group/stop relative w-11 h-11 flex items-center justify-center bg-linear-to-br from-error to-error/90 text-on-error rounded-xl shadow-lg shadow-error/20 hover:shadow-error/30 active:scale-95 transition-all duration-200"
                  >
                    <div className="absolute inset-0 bg-linear-to-br from-error/20 to-transparent rounded-xl opacity-0 group-hover/stop:opacity-100 transition-opacity duration-200" />
                    <span className="material-symbols-outlined text-[20px] relative">stop</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCommandSend}
                    disabled={!commandInput.trim() || !currentPageId}
                    className="group/send relative w-11 h-11 flex items-center justify-center bg-linear-to-br from-primary via-primary-container to-primary text-on-primary rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:shadow-none disabled:hover:scale-100 transition-all duration-200 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent opacity-0 group-hover/send:opacity-100 transition-opacity duration-200" />
                    <span className="material-symbols-outlined text-[20px] relative transition-transform duration-200 group-hover/send:-translate-y-0.5">arrow_upward</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <SelectionToolbar projectId={projectId} />

      {/* Diff Preview Overlay — shows pending AI changes before applying */}
      <DiffPreviewOverlay />
    </>
  );
}
