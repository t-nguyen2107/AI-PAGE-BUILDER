'use client';

import { useBuilderStore } from '@/store';
import type { DOMNode } from '@/types';
import { getNodeTypeLabel } from './constants';

export interface NodeInfoBarProps {
  selectedNode: DOMNode;
}

export function NodeInfoBar({ selectedNode }: NodeInfoBarProps) {
  return (
    <div className="px-3 py-2 shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-md">
            {getNodeTypeLabel(selectedNode.type)}
          </span>
          <span className="text-xs text-on-surface-variant font-mono">
            {`<${selectedNode.tag}>`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const { duplicateNode } = useBuilderStore.getState();
              duplicateNode(selectedNode.id);
            }}
            className="p-1 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
            title="Duplicate node (Ctrl+D)"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="1" y="1" width="7" height="7" rx="1" />
              <rect x="4" y="4" width="7" height="7" rx="1" />
            </svg>
          </button>
          <button
            onClick={() => {
              const { removeNode, clearSelection } = useBuilderStore.getState();
              removeNode(selectedNode.id);
              clearSelection();
            }}
            className="p-1 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
            title="Delete node (Delete)"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M2 4h8M4 4V2.5A.5.5 0 014.5 2h3a.5.5 0 01.5.5V4M3 4v6a1 1 0 001 1h4a1 1 0 001-1V4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
