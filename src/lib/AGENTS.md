<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-31 | Updated: 2026-03-31 -->

# src/lib/

## Purpose
Shared utilities used across the application. Agent 3 owns this directory. Contains database client, API client, tree operations, JSON patch, and ID generation.

## Key Files
| File | Description |
|------|-------------|
| `prisma.ts` | Prisma client singleton with Proxy pattern + better-sqlite3 adapter + dev caching |
| `api-client.ts` | Typed fetch wrapper — methods for projects, pages, styleguide, global-sections, revisions, library, AI |
| `tree-utils.ts` | Immutable tree operations — findNode, addChild, removeNode, updateNode, moveNode, reorder, flatten, count, getPath |
| `json-patch.ts` | RFC 6901 JSON Patch — add, remove, replace, move, copy, test operations |
| `id.ts` | nanoid wrapper — `generateId(size=21)` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `__tests__/` | Tests for tree-utils (~35 tests) |

## For AI Agents

### Working In This Directory
- Agent 3 owns all files here
- `tree-utils.ts` uses `structuredClone` for immutability — never mutate input trees
- `api-client.ts` handles network errors gracefully, returns `ApiResponse<T>`
- `prisma.ts` uses development singleton caching to prevent hot-reload connection leaks
- JSON fields (treeData, colors, etc.) are strings in DB — parse/stringify in API routes, not here

### Testing Requirements
- `tree-utils.test.ts` has ~35 tests covering all tree operations
- Run: `npx vitest src/lib/__tests__/`

### Common Patterns
- All tree operations return new trees (immutable)
- API client wraps fetch with consistent error handling
- Prisma singleton prevents multiple client instances in dev
