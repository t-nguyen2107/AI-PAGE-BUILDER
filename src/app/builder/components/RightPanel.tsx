'use client';

import React from 'react';
import { useBuilderStore } from '@/store';
import { AIChatPanel } from './AIChatPanel';
import { InspectorPanel } from '@/features/inspector/InspectorPanel';

// ============================================================
// RightPanel — Stitch-style inspector with Material Symbols
// ============================================================
export function RightPanel({ projectId }: { projectId: string }) {
  const rightPanelOpen = useBuilderStore((s) => s.rightPanelOpen);
  const rightPanelTab = useBuilderStore((s) => s.rightPanelTab);
  const setRightPanelTab = useBuilderStore((s) => s.setRightPanelTab);
  const toggleRightPanel = useBuilderStore((s) => s.toggleRightPanel);

  if (!rightPanelOpen) {
    return (
      <aside className="w-12 bg-white border-l border-outline-variant/20 flex flex-col items-center pt-4 gap-2 shrink-0">
        <button
          onClick={toggleRightPanel}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          title="Open inspector"
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
        </button>
      </aside>
    );
  }

  return (
    <aside className="fixed right-0 top-16 h-[calc(100vh-64px)] w-80 bg-white border-l border-outline-variant/20 flex flex-col z-40">
      {/* Tabs */}
      <div className="flex border-b border-outline-variant/20 shrink-0">
        {[
          { id: 'inspector', label: 'Design' },
          { id: 'ai', label: 'AI Chat' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setRightPanelTab(tab.id as 'ai' | 'inspector')}
            className={`
              flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-colors
              ${rightPanelTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-on-surface'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={toggleRightPanel}
          className="px-3 text-slate-400 hover:text-slate-900 transition-colors"
          title="Close panel"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {rightPanelTab === 'ai' ? (
          <AIChatPanel projectId={projectId} />
        ) : (
          <InspectorPanel />
        )}
      </div>

      {/* Footer meta */}
      <div className="p-4 bg-surface-container-low flex justify-between items-center text-[10px] font-bold text-on-surface-variant border-t border-outline-variant/20 shrink-0">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Auto-Save</span>
        </div>
        <span>v0.1.0</span>
      </div>
    </aside>
  );
}
