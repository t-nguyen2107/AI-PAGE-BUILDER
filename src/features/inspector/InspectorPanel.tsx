'use client';

import React, { useState, useCallback } from 'react';
import { useBuilderStore } from '@/store';
import { findNodeById } from '@/lib/tree-utils';
import type {
  DOMNode,
  LayoutProperties,
  TypographyProperties,
  SectionNode,
  ContainerNode,
  ComponentNode,
  ElementNode,
  ItemNode,
} from '@/types';
import { Tabs, TabPanels } from '@/components/ui/tabs';
import { INSPECTOR_TABS_CONFIG, useDebouncedCallback } from './constants';
import { NodeInfoBar } from './NodeInfoBar';
import {
  LayoutTab,
  SpacingTab,
  BackgroundTab,
  TypographyTab,
  ContentTab,
  SEOTab,
} from './tabs';

export function InspectorPanel() {
  const [activeTab, setActiveTab] = useState('layout');
  const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
  const tree = useBuilderStore((s) => s.tree);
  const rightPanelOpen = useBuilderStore((s) => s.rightPanelOpen);
  const toggleRightPanel = useBuilderStore((s) => s.toggleRightPanel);
  const updateNode = useBuilderStore((s) => s.updateNode);

  const selectedNode = selectedNodeId && tree ? findNodeById(tree, selectedNodeId) : null;

  const debouncedUpdateLayout = useDebouncedCallback(
    (nodeId: string, key: string, value: string) => {
      if (!tree) return;
      const currentNode = findNodeById(tree, nodeId);
      if (!currentNode || !('layout' in currentNode)) return;

      const currentLayout =
        (currentNode as SectionNode | ContainerNode | ComponentNode).layout ?? {};
      const newLayout = { ...currentLayout, [key]: value || undefined };

      Object.keys(newLayout).forEach((k) => {
        if (newLayout[k as keyof LayoutProperties] === undefined) {
          delete newLayout[k as keyof LayoutProperties];
        }
      });

      updateNode(nodeId, { layout: newLayout } as Partial<DOMNode>);
    },
    300
  );

  const debouncedUpdateTypography = useDebouncedCallback(
    (nodeId: string, key: string, value: string) => {
      if (!tree) return;
      const currentNode = findNodeById(tree, nodeId);
      if (!currentNode || !('typography' in currentNode)) return;

      const currentTypo = (currentNode as ElementNode | ItemNode).typography ?? {};
      const newTypo = { ...currentTypo, [key]: value || undefined };

      Object.keys(newTypo).forEach((k) => {
        if (newTypo[k as keyof TypographyProperties] === undefined) {
          delete newTypo[k as keyof TypographyProperties];
        }
      });

      updateNode(nodeId, { typography: newTypo } as Partial<DOMNode>);
    },
    300
  );

  const debouncedUpdateContent = useDebouncedCallback(
    (nodeId: string, key: string, value: string) => {
      if (key.startsWith('__attr__')) {
        const attrKey = key.replace('__attr__', '');
        const currentAttrs = (() => {
          if (!tree) return {};
          const n = findNodeById(tree, nodeId);
          return n?.attributes ?? {};
        })();
        updateNode(nodeId, { attributes: { ...currentAttrs, [attrKey]: value } });
        return;
      }
      updateNode(nodeId, { [key]: value } as Partial<DOMNode>);
    },
    300
  );

  const handleUpdateLayout = useCallback(
    (key: keyof LayoutProperties, value: string) => {
      if (!selectedNodeId) return;
      debouncedUpdateLayout(selectedNodeId, key, value);
    },
    [selectedNodeId, debouncedUpdateLayout]
  );

  const handleUpdateTypography = useCallback(
    (key: keyof TypographyProperties, value: string) => {
      if (!selectedNodeId) return;
      debouncedUpdateTypography(selectedNodeId, key, value);
    },
    [selectedNodeId, debouncedUpdateTypography]
  );

  const handleUpdateContent = useCallback(
    (key: string, value: string) => {
      if (!selectedNodeId) return;
      debouncedUpdateContent(selectedNodeId, key, value);
    },
    [selectedNodeId, debouncedUpdateContent]
  );

  if (!rightPanelOpen) {
    return (
      <div className="w-10 bg-surface-lowest flex flex-col items-center pt-2 panel-transition">
        <button
          onClick={toggleRightPanel}
          className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          title="Open Inspector"
        >
          <span className="material-symbols-outlined text-[16px]">right_panel_open</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-72 bg-surface-lowest flex flex-col h-full overflow-hidden panel-transition">
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-10 shrink-0">
        <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
          Inspector
        </span>
        <button
          onClick={toggleRightPanel}
          className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          title="Close Inspector"
        >
          <span className="material-symbols-outlined text-[14px]">close</span>
        </button>
      </div>

      {/* No selection state */}
      {!selectedNode ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-on-surface-outline text-[20px]">grid_view</span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Select an element to inspect its properties
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Node info bar + actions */}
          <NodeInfoBar selectedNode={selectedNode} />

          {/* Tabs */}
          <Tabs
            tabs={INSPECTOR_TABS_CONFIG}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className="px-2 shrink-0"
          />

          {/* Tab panels */}
          <TabPanels className="p-0">
            {activeTab === 'layout' && (
              <LayoutTab node={selectedNode} onUpdateLayout={handleUpdateLayout} />
            )}
            {activeTab === 'spacing' && (
              <SpacingTab node={selectedNode} onUpdateLayout={handleUpdateLayout} />
            )}
            {activeTab === 'background' && (
              <BackgroundTab node={selectedNode} />
            )}
            {activeTab === 'typography' && (
              <TypographyTab node={selectedNode} onUpdateTypography={handleUpdateTypography} />
            )}
            {activeTab === 'content' && (
              <ContentTab node={selectedNode} onUpdateContent={handleUpdateContent} />
            )}
            {activeTab === 'seo' && <SEOTab node={selectedNode} />}
          </TabPanels>
        </>
      )}
    </div>
  );
}
