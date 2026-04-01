<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-31 | Updated: 2026-03-31 -->

# src/app/builder/

## Purpose
Visual builder UI — the main editing interface. Agent 2 owns this directory. Contains the builder layout, page loaders, and all builder-specific components (header, canvas, sidebar, AI prompt bar).

## Key Files
| File | Description |
|------|-------------|
| `[projectId]/layout.tsx` | Builder layout — composes: BuilderHeader (top), Sidebar (left), Canvas (center), InspectorPanel (right), AIPromptBar (bottom) |
| `[projectId]/page.tsx` | Client component — loads project, styleguide, first/home page into Zustand store |
| `[projectId]/pages/[pageId]/page.tsx` | Client component — loads specific page tree + global sections into store |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `components/` | Builder UI components (see `components/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Agent 2 owns all files here
- Layout is a Server Component — it composes the shell
- Page loaders are Client Components — they hydrate the Zustand store on mount
- All builder state lives in Zustand, not in component local state

### Common Patterns
- `useBuilderStore` with `useShallow` selectors for subscriptions
- Loading overlays while data fetches
- Error states with retry buttons
- Builder layout uses fixed positioning: sidebar left, canvas center, inspector right, AI bar bottom
