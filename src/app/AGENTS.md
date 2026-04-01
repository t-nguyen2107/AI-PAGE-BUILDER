<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-31 | Updated: 2026-03-31 -->

# src/app/

## Purpose
Next.js App Router pages and API routes. Split into three domains: API routes (Agent 3), builder UI (Agent 2), and preview (Agent 2). Root layout and homepage are Agent 2 territory.

## Key Files
| File | Description |
|------|-------------|
| `layout.tsx` | Root layout — Geist + Geist Mono fonts, dark zinc background |
| `page.tsx` | Homepage — lists projects in grid, create new project form |

## Subdirectories
| Directory | Purpose | Agent |
|-----------|---------|-------|
| `api/` | REST API routes — 13 routes for CRUD operations (see `api/AGENTS.md`) | Agent 3 |
| `builder/` | Visual builder UI — editor pages and components (see `builder/AGENTS.md`) | Agent 2 |
| `preview/` | Preview mode pages (see `preview/AGENTS.md`) | Agent 2 |

## For AI Agents

### Working In This Directory
- `layout.tsx` and `page.tsx` are Agent 2 territory
- App Router conventions: `page.tsx` = route, `layout.tsx` = wrapper, `route.ts` = API handler
- Dynamic segments use `[param]` syntax (e.g., `[projectId]`)

### Common Patterns
- Server components by default — add `'use client'` directive only when needed
- Builder pages load data into Zustand store via `useEffect` on mount
- API routes use shared `successResponse()` / `errorResponse()` helpers
