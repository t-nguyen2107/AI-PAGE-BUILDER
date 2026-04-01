<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-31 | Updated: 2026-03-31 -->

# src/features/dnd/

## Purpose
Drag & drop system for the visual builder. Agent 2 owns this directory. Uses @dnd-kit/core + @dnd-kit/sortable with a tree flattening approach for nested node reordering. Includes circular move prevention (can't drag a parent into its own child).

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | Barrel export |
| `DndProvider.tsx` | Wraps canvas with `DndContext` — handles drag start/over/end with PointerSensor (5px activation), SortableContext for flattened tree, DragOverlay for visual feedback |
| `dnd-utils.ts` | `FlattenedItem` interface, `flattenTreeForDnD()`, `getDescendantIds()`, `findParent()`, `isDescendant()`, `getValidDropTargets()` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `__tests__/` | DnD utils tests (~20 tests) |

## For AI Agents

### Working In This Directory
- Agent 2 owns this directory
- Tree is flattened into a list for @dnd-kit SortableContext (depth-first, with parent refs)
- `isDescendant()` check prevents circular moves
- DragOverlay shows a visual preview during drag

### Testing Requirements
- ~20 tests covering flattening, descendant detection, parent finding, valid targets
- Run: `npx vitest src/features/dnd/__tests__/`

### Common Patterns
- `FlattenedItem` = `{ id, parentId, depth, node, children }`
- Flatten → SortableContext → onDragEnd → find new parent → moveNode in store
- PointerSensor with 5px activation distance prevents accidental drags on click
