<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

# AI Website Builder — Agent System

## Agent 1: Chief Architect
**Role:** Guardian of data contracts, JSON Schema, API design
**Owns:** `src/types/`, `src/schemas/`, `prisma/schema.prisma`
**Rules:**
- Defines TypeScript interfaces, enums, Zod schemas
- Designs Prisma database schema
- Does NOT write UI or API handler code
- All type/schema changes must go through this agent
- Reviews API contracts for consistency

## Agent 2: UI/UX & State Engineer
**Role:** Frontend + State Management
**Owns:** `src/store/`, `src/features/renderer/`, `src/features/dnd/`, `src/features/inspector/`, `src/app/builder/`
**Rules:**
- Builds Zustand store with all slices (tree, selection, styleguide, UI, drag)
- Creates recursive React renderer (PageRenderer → ItemRenderer)
- Implements drag-and-drop with @dnd-kit
- Only agent that modifies store files
- Provides public store API for other agents (e.g., `applyAIDiff`)
- Uses React.memo on renderer components
- Dark-themed builder chrome, light canvas

## Agent 3: Backend & Data Persistence Engineer
**Role:** API routes, database operations
**Owns:** `src/app/api/`, `src/lib/prisma.ts`, `src/lib/api-client.ts`, `src/lib/json-patch.ts`
**Rules:**
- Builds CRUD API routes for Projects, Pages, Styleguides, Revisions, Library
- Ensures API response format matches `ApiResponse<T>` wrapper
- Handles JSON serialization/deserialization for SQLite String fields
- Does NOT modify Zustand store
- Uses `Response.json()` (not `NextResponse.json()`) per Next.js 16

## Agent 4: AI Optimizer & SEO Specialist
**Role:** AI generation, SEO audit, semantic HTML
**Owns:** `src/features/ai/`, `src/features/seo/`
**Rules:**
- Builds AI prompt parsing + JSON diff generation
- Creates pre-built component templates (hero, pricing, features, etc.)
- Implements SEO audit (heading hierarchy, semantic tags, meta generation)
- Does NOT modify renderer components directly
- Provides hooks/utilities that renderer consumes
- Ollama integration (qwen3.5)

## Cross-Agent Rules
1. **Immutable contracts:** Types defined by Agent 1 are immutable for other agents
2. **Store ownership:** Only Agent 2 modifies Zustand store files
3. **API format:** All routes follow `ApiResponse<T>` envelope pattern
4. **JSON fields:** All JSON data in SQLite stored as `String` — must stringify/parse
5. **Client components:** All interactive components use `'use client'` directive
6. **Next.js 16 patterns:** `params: Promise<...>` for dynamic routes, `Response.json()`

## Execution Phases
```
Phase 0: Setup → Phase 1: Types+Schema → Phase 2: Store → Phase 3: API → Phase 4: Renderer+DnD → Phase 5: AI+SEO
```