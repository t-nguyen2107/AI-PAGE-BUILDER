<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-31 | Updated: 2026-03-31 -->

# src/features/renderer/

## Purpose
Recursive DOM tree renderer — the visual heart of the builder. Agent 2 owns this directory. Renders the JSON Virtual DOM tree (Page → Section → Container → Component → Element → Item) into actual HTML with click-to-select, hover highlights, and DnD integration.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | Barrel export of all renderers, hooks, and utilities |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `components/` | 7 renderer components + NodeWrapper (see `components/AGENTS.md`) |
| `hooks/` | Semantic tag mapping hook (see `hooks/AGENTS.md`) |
| `utils/` | Layout/style conversion utilities (see `utils/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Agent 2 owns this directory
- Each renderer maps to a specific `NodeType` and renders its children recursively
- `NodeWrapper` wraps EVERY node — provides click-to-select, hover outline, type badge, and DnD sortable
- All renderers use `React.memo` for performance
- Dynamic HTML tags are rendered via `React.createElement` (not JSX) to avoid React 19 JSX transform issues

### Common Patterns
- `PageRenderer` injects global header/footer sections automatically
- `SectionRenderer` separates into header (nav/header tags) vs main content
- `ElementRenderer` handles text, images, links, buttons, lists
- Layout styles are converted from `LayoutProperties` → `React.CSSProperties` via `layoutToStyles()`
- `renderElement()` utility wraps `React.createElement` for dynamic tag support
