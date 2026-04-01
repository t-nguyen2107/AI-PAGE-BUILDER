<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-31 | Updated: 2026-03-31 -->

# src/features/inspector/

## Purpose
Property inspector panel for selected nodes. Agent 2 owns this directory. Shows 5 tabs of editable properties for the currently selected node in the builder canvas.

## Key Files
| File | Description |
|------|-------------|
| `InspectorPanel.tsx` | Right panel with 5 collapsible tabs: Layout, Spacing, Typography, Content, SEO. Debounced updates (300ms) to prevent rapid store writes |

## Inspector Tabs
| Tab | Properties |
|-----|-----------|
| Layout | display (flex/grid/block), flexDirection, justifyContent, alignItems, gap, grid columns |
| Spacing | padding, margin, width, height, maxWidth, borderRadius |
| Typography | fontFamily, fontSize, fontWeight, lineHeight, color, textAlign |
| Content | text content, image src, link href, CSS className, node ID |
| SEO | semantic tag, node type, heading level, page info, SEO keywords |

## For AI Agents

### Working In This Directory
- Agent 2 owns this directory
- Uses `useBuilderStore` with `useShallow` for selected node subscription
- Debounced updates prevent excessive re-renders during typing
- Tab content renders conditionally based on node type (e.g., img fields only for img elements)
- Collapsible toggle button in panel header

### Common Patterns
- Each tab reads from `selectedNodeId` → `findNodeById(tree, id)` → display fields
- Changes call `updateNodeInTree()` with partial updates via immer
- Non-applicable fields are hidden (e.g., typography tab hidden for img nodes)
