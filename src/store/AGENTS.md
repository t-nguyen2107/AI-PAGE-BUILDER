<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-31 | Updated: 2026-03-31 -->

# src/store/

## Purpose
Zustand 5 store — the single source of truth for all builder state. Agent 2 owns this directory. Uses immer for immutable mutations and zundo temporal middleware for undo/redo (50 steps, 300ms debounce).

## Key Files
| File | Description |
|------|-------------|
| `builder-store.ts` | Monolithic store with 7 slices: Tree, Selection, Styleguide, GlobalSections, UI, Drag, AI |
| `index.ts` | Barrel export — `useBuilderStore` and `useHistory` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `__tests__/` | Store tests (~30 tests) covering all 7 slices + undo/redo |
| `middleware/` | Store middleware (if any extracted) |

## Store Slices
| Slice | Key State | Key Actions |
|-------|-----------|-------------|
| Tree | `tree`, `currentPageId` | loadTree, addNode, removeNode, updateNode, moveNode, reorderChildren, duplicateNode, replaceNode, applyAIDiff, markSaved |
| Selection | `selectedNodeId`, `hoveredNodeId` | selectNode, hoverNode, clearSelection |
| Styleguide | `styleguide` | loadStyleguide, updateColors, updateTypography, updateCSSVariables, clearStyleguide |
| GlobalSections | `globalSections` | setGlobalSections |
| UI | `showLeftPanel`, `showRightPanel`, `activePanel`, `isDragging`, `showAI`, `zoom` | toggleLeftPanel, toggleRightPanel, setActivePanel, setDragging, toggleAI, setZoom (25-200 clamped) |
| Drag | `dragData`, `dropTarget` | startDrag, setDropTarget, endDrag |

## For AI Agents

### Working In This Directory
- Agent 2 owns this directory — other agents do NOT modify store files directly
- All state mutations use immer (modify `draft` directly)
- `applyAIDiff()` is the bridge from AI → store (Agent 4 proposes, Agent 2 implements)
- Use `useShallow` from zustand for component subscriptions to prevent re-renders
- Temporal middleware (zundo) provides `undo()` / `redo()` via `useHistory` hook

### Testing Requirements
- ~30 tests covering all slices and undo/redo
- Run: `npx vitest src/store/__tests__/`

### Common Patterns
- `structuredClone` for deep cloning before mutations
- `findNodeById` / `findParentNode` from `@/lib/tree-utils` for tree traversal
- Immer `produce` wraps all mutations in actions
