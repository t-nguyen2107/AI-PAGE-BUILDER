import { create } from 'zustand';
import { temporal } from 'zundo';
import { devtools } from 'zustand/middleware';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import type { PageNode, DOMNode } from '@/types/dom-tree';
import type { Styleguide, ColorPalette, TypographySystem } from '@/types/styleguide';
import type { NodeType, AIAction } from '@/types/enums';
import type { AIDiff } from '@/types/ai';
import type { GlobalSection } from '@/types/project';
import {
  addChildNode,
  removeNode,
  updateNodeInTree,
  moveNode as moveNodeInTree,
  reorderChildren as reorderChildrenInTree,
  deepCloneWithNewIds,
  findNodeById,
  findParentNode,
  getChildIndex,
} from '@/lib/tree-utils';

// ===========================================
// SLICE INTERFACES
// ===========================================

export interface TreeSlice {
  currentPageId: string | null;
  tree: PageNode | null;
  isDirty: boolean;
  lastSavedAt: string | null;
}

export interface TreeActions {
  loadTree: (pageId: string, tree: PageNode) => void;
  resetTree: () => void;
  addNode: (parentId: string, node: DOMNode, position?: number) => void;
  removeNode: (nodeId: string) => void;
  updateNode: (nodeId: string, partial: Partial<DOMNode>) => void;
  moveNode: (nodeId: string, newParentId: string, position: number) => void;
  reorderChildren: (parentId: string, childIds: string[]) => void;
  duplicateNode: (nodeId: string) => void;
  replaceNode: (nodeId: string, newNode: DOMNode) => void;
  applyAIDiff: (diff: AIDiff) => void;
  markSaved: () => void;
}

export interface SelectionSlice {
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
}

export interface SelectionActions {
  selectNode: (nodeId: string | null) => void;
  hoverNode: (nodeId: string | null) => void;
  clearSelection: () => void;
}

export interface StyleguideSlice {
  activeStyleguide: Styleguide | null;
}

export interface StyleguideActions {
  loadStyleguide: (styleguide: Styleguide) => void;
  updateColors: (colors: Partial<ColorPalette>) => void;
  updateTypography: (typography: Partial<TypographySystem>) => void;
  updateCSSVariables: (vars: Record<string, string>) => void;
  clearStyleguide: () => void;
}

export interface GlobalSectionsSlice {
  globalSections: GlobalSection[];
}

export interface GlobalSectionsActions {
  setGlobalSections: (sections: GlobalSection[]) => void;
}

export interface UISlice {
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  activePanel: 'layers' | 'pages' | 'library' | 'styleguide' | null;
  isDragging: boolean;
  showAI: boolean;
  zoom: number;
}

export interface UIActions {
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setActivePanel: (panel: UISlice['activePanel']) => void;
  setDragging: (dragging: boolean) => void;
  toggleAI: () => void;
  setZoom: (zoom: number) => void;
}

export interface DragSlice {
  dragNodeId: string | null;
  dragNodeType: NodeType | null;
  dropTargetId: string | null;
  dropPosition: number | null;
}

export interface DragActions {
  startDrag: (nodeId: string, nodeType: NodeType) => void;
  setDropTarget: (targetId: string | null, position: number | null) => void;
  endDrag: () => void;
}

// ===========================================
// AI CHAT SLICE
// ===========================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  status?: 'pending' | 'success' | 'error';
  action?: string;
  undoSteps?: number;
}

export interface AIChatSlice {
  chatMessages: ChatMessage[];
  rightPanelTab: 'ai' | 'inspector';
  projectName: string;
}

export interface AIChatActions {
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateChatMessage: (id: string, partial: Partial<ChatMessage>) => void;
  clearChatMessages: () => void;
  setRightPanelTab: (tab: AIChatSlice['rightPanelTab']) => void;
  setProjectName: (name: string) => void;
}

// ===========================================
// COMBINED TYPE
// ===========================================

export type BuilderState = TreeSlice &
  TreeActions &
  SelectionSlice &
  SelectionActions &
  StyleguideSlice &
  StyleguideActions &
  GlobalSectionsSlice &
  GlobalSectionsActions &
  UISlice &
  UIActions &
  DragSlice &
  DragActions &
  AIChatSlice &
  AIChatActions;

// ===========================================
// STORE CREATION
// ===========================================

export const useBuilderStore = create<BuilderState>()(
  devtools(
    temporal(
      (set, get) => ({
        // ----- Tree State -----
        currentPageId: null,
        tree: null,
        isDirty: false,
        lastSavedAt: null,

        loadTree: (pageId, tree) =>
          set({ currentPageId: pageId, tree, isDirty: false, lastSavedAt: new Date().toISOString() }),

        resetTree: () =>
          set({ currentPageId: null, tree: null, isDirty: false, lastSavedAt: null }),

        addNode: (parentId, node, position) => {
          const { tree } = get();
          if (!tree) return;
          set({ tree: addChildNode(tree, parentId, node, position), isDirty: true });
        },

        removeNode: (nodeId) => {
          const { tree } = get();
          if (!tree) return;
          set({ tree: removeNode(tree, nodeId), isDirty: true });
        },

        updateNode: (nodeId, partial) => {
          const { tree } = get();
          if (!tree) return;
          set({ tree: updateNodeInTree(tree, nodeId, partial), isDirty: true });
        },

        moveNode: (nodeId, newParentId, position) => {
          const { tree } = get();
          if (!tree) return;
          set({ tree: moveNodeInTree(tree, nodeId, newParentId, position), isDirty: true });
        },

        reorderChildren: (parentId, childIds) => {
          const { tree } = get();
          if (!tree) return;
          set({ tree: reorderChildrenInTree(tree, parentId, childIds), isDirty: true });
        },

        duplicateNode: (nodeId) => {
          const { tree } = get();
          if (!tree) return;
          const node = findNodeById(tree, nodeId);
          if (!node) return;
          const cloned = deepCloneWithNewIds(node);
          const parent = findParentNode(tree, nodeId);
          if (!parent) return;
          const idx = getChildIndex(parent, nodeId);
          set({ tree: addChildNode(tree, parent.id, cloned, idx + 1), isDirty: true });
        },

        replaceNode: (nodeId, newNode) => {
          const { tree } = get();
          if (!tree) return;
          set({ tree: updateNodeInTree(tree, nodeId, newNode), isDirty: true });
        },

        applyAIDiff: (diff) => {
          const { tree } = get();
          if (!tree) return;

          let newTree = tree;
          switch (diff.action) {
            case 'insert_section':
            case 'insert_component': {
              const nodes = Array.isArray(diff.payload) ? diff.payload : [diff.payload as DOMNode];
              for (const node of nodes) {
                newTree = addChildNode(newTree, diff.targetNodeId, node, diff.position);
              }
              break;
            }
            case 'modify_node':
              newTree = updateNodeInTree(newTree, diff.targetNodeId, diff.payload as Partial<DOMNode>);
              break;
            case 'delete_node':
              newTree = removeNode(newTree, diff.targetNodeId);
              break;
            case 'replace_node':
              newTree = updateNodeInTree(newTree, diff.targetNodeId, diff.payload as DOMNode);
              break;
            case 'reorder_children':
              newTree = reorderChildrenInTree(newTree, diff.targetNodeId, diff.payload as unknown as string[]);
              break;
            case 'full_page':
              newTree = diff.payload as PageNode;
              break;
          }
          set({ tree: newTree, isDirty: true });
        },

        markSaved: () => set({ isDirty: false, lastSavedAt: new Date().toISOString() }),

        // ----- Selection State -----
        selectedNodeId: null,
        hoveredNodeId: null,

        selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
        hoverNode: (nodeId) => set({ hoveredNodeId: nodeId }),
        clearSelection: () => set({ selectedNodeId: null, hoveredNodeId: null }),

        // ----- Styleguide State -----
        activeStyleguide: null,

        loadStyleguide: (styleguide) => set({ activeStyleguide: styleguide }),
        updateColors: (colors) =>
          set((s) => ({
            activeStyleguide: s.activeStyleguide
              ? { ...s.activeStyleguide, colors: { ...s.activeStyleguide.colors, ...colors } }
              : null,
          })),
        updateTypography: (typography) =>
          set((s) => ({
            activeStyleguide: s.activeStyleguide
              ? { ...s.activeStyleguide, typography: { ...s.activeStyleguide.typography, ...typography } }
              : null,
          })),
        updateCSSVariables: (vars) =>
          set((s) => ({
            activeStyleguide: s.activeStyleguide
              ? { ...s.activeStyleguide, cssVariables: { ...s.activeStyleguide.cssVariables, ...vars } }
              : null,
          })),
        clearStyleguide: () => set({ activeStyleguide: null }),

        // ----- Global Sections State -----
        globalSections: [],

        setGlobalSections: (sections) => set({ globalSections: sections }),

        // ----- UI State -----
        leftPanelOpen: true,
        rightPanelOpen: true,
        activePanel: 'layers' as const,
        isDragging: false,
        showAI: false,
        zoom: 100,

        toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
        toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
        setActivePanel: (panel) => set({ activePanel: panel }),
        setDragging: (dragging) => set({ isDragging: dragging }),
        toggleAI: () => set((s) => ({ showAI: !s.showAI })),
        setZoom: (zoom) => set({ zoom: Math.max(25, Math.min(200, zoom)) }),

        // ----- Drag State -----
        dragNodeId: null,
        dragNodeType: null,
        dropTargetId: null,
        dropPosition: null,

        startDrag: (nodeId, nodeType) => set({ dragNodeId: nodeId, dragNodeType: nodeType }),
        setDropTarget: (targetId, position) => set({ dropTargetId: targetId, dropPosition: position }),
        endDrag: () => set({ dragNodeId: null, dragNodeType: null, dropTargetId: null, dropPosition: null }),

        // ----- AI Chat State -----
        chatMessages: [],
        rightPanelTab: 'ai' as const,
        projectName: '',

        addChatMessage: (message) =>
          set((s) => ({
            chatMessages: [
              ...s.chatMessages,
              { ...message, id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, timestamp: new Date().toISOString() },
            ],
          })),
        updateChatMessage: (id, partial) =>
          set((s) => ({
            chatMessages: s.chatMessages.map((m) => (m.id === id ? { ...m, ...partial } : m)),
          })),
        clearChatMessages: () => set({ chatMessages: [] }),
        setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
        setProjectName: (name) => set({ projectName: name }),
      }),
      {
        limit: 50,
        partialize: (state) => ({
          tree: state.tree,
          currentPageId: state.currentPageId,
        }),
        equality: (pastState, currentState) =>
          JSON.stringify(pastState.tree) === JSON.stringify(currentState.tree),
        handleSet: (handleSet) => {
          let timeout: ReturnType<typeof setTimeout> | null = null;
          return (state) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => handleSet(state), 300);
          };
        },
      }
    ),
    { name: 'ai-builder-store' }
  )
);

// Undo/Redo helper — reactive via zustand subscription
export function useHistory() {
  const { undo, redo, pastStates, futureStates } = useStoreWithEqualityFn(
    useBuilderStore.temporal,
    (state) => ({
      undo: state.undo,
      redo: state.redo,
      pastStates: state.pastStates,
      futureStates: state.futureStates,
    }),
  );

  return {
    undo,
    redo,
    canUndo: pastStates.length > 0,
    canRedo: futureStates.length > 0,
    historyLength: pastStates.length,
  };
}
