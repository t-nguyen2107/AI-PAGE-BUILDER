<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-31 | Updated: 2026-03-31 -->

# src/

## Purpose
Application source code organized by feature ownership following the 4-Agent architecture. Agent 1 owns `types/` + `schemas/`, Agent 2 owns `store/` + `features/renderer/` + `features/dnd/` + `features/inspector/` + `app/builder/` + `components/`, Agent 3 owns `app/api/` + `lib/`, Agent 4 owns `features/ai/` + `features/seo/`.

## Key Files
| File | Description |
|------|-------------|
| `app/layout.tsx` | Root layout — Geist fonts, dark theme background |
| `app/page.tsx` | Homepage — project list grid + create form |

## Subdirectories
| Directory | Purpose | Agent |
|-----------|---------|-------|
| `types/` | TypeScript interfaces + enums | Agent 1 |
| `schemas/` | Zod validation schemas | Agent 1 |
| `store/` | Zustand store (7 slices + temporal middleware) | Agent 2 |
| `features/renderer/` | Recursive DOM tree renderer | Agent 2 |
| `features/dnd/` | Drag & drop system | Agent 2 |
| `features/inspector/` | Property inspector (5 tabs) | Agent 2 |
| `features/ai/` | AI prompt parsing + template generators | Agent 4 |
| `features/seo/` | SEO audit + semantic HTML validation | Agent 4 |
| `app/api/` | REST API routes (13 routes) | Agent 3 |
| `app/builder/` | Builder UI pages + components | Agent 2 |
| `app/preview/` | Preview mode (not yet built) | Agent 2 |
| `components/` | Shared UI components (Button, Input, Tabs) | Agent 2 |
| `lib/` | Shared utilities (tree-utils, prisma, api-client, json-patch, id) | Agent 3 |

## For AI Agents

### Working In This Directory
- Check `CLAUDE.md` for agent ownership before modifying any file
- Use `@/` path alias for all imports (e.g., `import { X } from '@/types'`)
- Strict TypeScript — no `any` types
- Barrel exports via `index.ts` in each directory

### Testing Requirements
- Tests in `__tests__/` subdirectories (store, lib, dnd, seo, api)
- Run: `npx vitest`
- ~120+ tests total

### Common Patterns
- All Zustand mutations use immer (draft state)
- React.memo on renderer components
- `useShallow` for store selectors
- Zod validation before store injection
