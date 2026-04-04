<!-- Generated: 2026-03-31 | Updated: 2026-03-31 -->

# AI Website Builder

## Purpose
AI-powered visual website builder — modular subsystem for an AI CMS. Users create websites through a visual drag-drop editor + AI prompt generation. Built with Next.js 16, React 19, Prisma 7 (PostgreSQL), Zustand 5, and Ollama (qwen3.5).

## Key Files
| File | Description |
|------|-------------|
| `CLAUDE.md` | Project context, 4-agent architecture, coding conventions |
| `package.json` | Dependencies and scripts (Next.js 16, React 19, Prisma 7, Zustand 5) |
| `tsconfig.json` | TypeScript config with `@/` path alias |
| `vitest.config.ts` | Vitest test runner (jsdom environment) |
| `prisma.config.ts` | Prisma 7 config with PostgreSQL adapter |
| `next.config.ts` | Next.js configuration |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/` | Application source code (see `src/AGENTS.md`) |
| `prisma/` | Database schema and seed data (see `prisma/AGENTS.md`) |
| `public/` | Static assets (images, icons) |

## For AI Agents

### Working In This Directory
- Read `CLAUDE.md` first — it defines the 4-agent system and ownership rules
- Always follow the agent ownership boundaries when modifying code
- Run `npm run build` to verify changes compile
- Run `npx vitest` to run tests

### Testing Requirements
- 120+ tests across 6 test files in `src/`
- All tests must pass before committing
- Test files live in `__tests__/` subdirectories

### Common Patterns
- JSON Virtual DOM Tree: `Page → Section → Container → Component → Element → Item`
- Every page is a JSON tree stored whole in `treeData` (Prisma Json field)
- All API responses follow `ApiResponse<T> { success, data?, error?, meta }`
- Zustand store uses immer for immutable updates, zundo for undo/redo

## Dependencies

### External
- Next.js 16 — App Router framework
- React 19 — UI library
- Prisma 7 — ORM with PostgreSQL (Prisma Postgres)
- Zustand 5 — State management with temporal middleware
- @dnd-kit — Drag and drop
- Zod 4 — Runtime validation
- nanoid — ID generation
- Ollama — Local LLM (qwen3.5)
