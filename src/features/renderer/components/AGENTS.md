<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-31 | Updated: 2026-03-31 -->

# src/features/renderer/components/

## Purpose
7 renderer components that map 1:1 to node types in the DOM tree hierarchy. Agent 2 owns this directory. Each renderer handles its node type's specific concerns (layout, styling, content) and recursively renders children.

## Key Files
| File | Description |
|------|-------------|
| `PageRenderer.tsx` | Renders `<main>` — injects global header (nav/header sections) above content and global footer below |
| `SectionRenderer.tsx` | Renders section/header/footer/nav — applies layout + background styles |
| `ContainerRenderer.tsx` | Renders layout wrapper (`<div>`) — applies flex/grid styles |
| `ComponentRenderer.tsx` | Renders meaningful UI unit (`<div>`/`<article>`/`<figure>`) — applies layout + category |
| `ElementRenderer.tsx` | Renders atomic content: headings, paragraphs, images, links, buttons, lists — handles typography + content |
| `ItemRenderer.tsx` | Renders leaf nodes: `<li>`, `<span>`, `<figcaption>`, `<div>` — text content only |
| `NodeWrapper.tsx` | Wraps EVERY node — provides click-to-select, hover outline (blue dashed), node type badge, DnD sortable via `useSortable` |

## For AI Agents

### Working In This Directory
- Agent 2 owns this directory
- All components use `React.memo` for performance
- Dynamic HTML tags rendered via `renderElement()` utility (not JSX) to avoid React 19 transform issues
- `NodeWrapper` is the integration point for: selection, hover, DnD, and type badges
- `PageRenderer` auto-separates sections: HEADER/NAV → header slot, FOOTER → footer slot, rest → main

### Common Patterns
- Each renderer receives `{ node }` + renders children via `.map()` calling the appropriate child renderer
- Style conversion: `layoutToStyles(node.layout)` + `mergeStyles(...)` from `utils/`
- Selection check: `selectedNodeId === node.id` → blue outline
- Hover check: `hoveredNodeId === node.id` → dashed outline
- `renderElement(tag, props, children)` wraps `React.createElement` for dynamic tags
