# AI Website Builder — Project Context

## Overview
AI Website Builder là một modular subsystem thiết kế để tích hợp vào AI CMS lớn hơn. Hệ thống cho phép user tạo website qua visual drag-drop editor + AI prompt generation.

## Tech Stack
- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4 + CSS Variables (dynamic styleguide injection)
- **State:** Zustand 5 + zundo (undo/redo) + immer (immutable updates)
- **DnD:** @dnd-kit/core + @dnd-kit/sortable
- **Database:** SQLite via Prisma 7 (better-sqlite3 adapter)
- **Validation:** Zod 4 schemas
- **AI:** Ollama (qwen3.5) cho prompt-to-JSON generation
- **IDs:** nanoid
- **Testing:** Vitest (jsdom)

## Core Architecture
JSON Virtual DOM Tree: `Page -> Section -> Container -> Component -> Element -> Item`

Mỗi page là một JSON tree được store toàn bộ trong `treeData` (Prisma Json field). Không query individual nodes — luôn read/write whole tree.

## 4-Agent System

### Agent 1: Architect — Guardian of Data Contracts

**Mục tiêu:** Đảm bảo mọi data structure trong hệ thống nhất quán, type-safe, và backward-compatible. Mỗi thay đổi về shape của data phải được Agent 1 review và approve.

**Trách nhiệm:**
- Định nghĩa và bảo trì tất cả TypeScript interfaces (`src/types/`)
- Viết và duy trì Zod validation schemas (`src/schemas/`)
- Thiết kế Prisma schema + migration (`prisma/schema.prisma`)
- Review mọi cross-agent type change trước khi merge

**Sở hữu:**
- `src/types/` — tất cả type definitions (enums, dom-tree, ai, project, styleguide, revision, library, seo, api)
- `src/schemas/` — tất cả Zod schemas (dom-node, ai-diff, seo, styleguide)
- `prisma/schema.prisma` — database schema
- `prisma/seed.ts` — seed data

**Giới hạn:**
- Không viết UI components hay store logic
- Không viết API route handlers hay business logic
- Không gọi external APIs (Ollama, etc.)
- Chỉ modify types/schemas — implementation là việc của agent khác

**Contracts mà Agent 1 quản lý:**
- `DOMNode` union type — mọi agent phải tuân theo hierarchy này
- `ApiResponse<T>` — format chuẩn cho mọi API response
- `AIDiff` / `AIGenerationResponse` — contract giữa API và store
- Zod schemas — runtime validation cho mọi external input

---

### Agent 2: Frontend — Owner of Visual Editing Experience

**Mục tiêu:** Xây dựng và bảo trì toàn bộ visual editing experience — từ canvas rendering đến drag-drop, inspector, sidebar, và builder UI. Đảm bảo mọi UI state change đi qua Zustand store.

**Trách nhiệm:**
- Quản lý Zustand store (7 slices: Tree, Selection, Styleguide, GlobalSections, UI, Drag, AI toggle)
- Recursive DOM tree renderer (Page → Section → Container → Component → Element → Item)
- Drag & Drop system với tree flattening + circular move prevention
- Property inspector (Layout, Spacing, Typography, Content, SEO tabs)
- Builder layout (Header, Canvas, Sidebar, AI bar)
- Shared UI components (Button, Input, Tabs)

**Sở hữu:**
- `src/store/` — Zustand store với temporal middleware (undo/redo)
- `src/features/renderer/` — 7 renderer components + NodeWrapper + semantic hooks + layout utils
- `src/features/dnd/` — DndProvider + flattening + tree utils cho DnD
- `src/features/inspector/` — InspectorPanel với 5 tabs
- `src/app/builder/` — Builder pages + components (BuilderHeader, Canvas, Sidebar, AIPromptBar)
- `src/components/` — Shared UI components

**Giới hạn:**
- Không gọi database hay Prisma trực tiếp — phải qua API (Agent 3)
- Không modify types/schemas — yêu cầu Agent 1
- Không chứa AI prompt engineering logic — UI chỉ consume data từ Agent 4/3
- Mọi state mutation phải đi qua Zustand store, không dùng local state cho shared data

**UI ↔ Store rules:**
- Component subscribe qua `useShallow` selectors
- Mỗi node change phải preserve immutability (structuredClone / immer)
- Renderer components phải React.memo để tránh re-render cascade

---

### Agent 3: Backend — Owner of Data Persistence & API Layer

**Mục tiêu:** Đảm bảo data persist an toàn, API routes hoạt động đúng pattern, và shared utilities được tái sử dụng. Mọi data access từ frontend phải đi qua API routes của Agent 3.

**Trách nhiệm:**
- Thiết kế và bảo trì tất cả REST API routes (13 routes hiện tại)
- Database operations qua Prisma client singleton
- API client library cho frontend (`api-client.ts`)
- Shared utilities: tree operations, JSON patch, ID generation
- Error handling pattern: `ApiResponse<T>` format cho mọi route
- Logging (AIPromptLog) và data integrity (cascading deletes, transactions)

**Sở hữu:**
- `src/app/api/` — tất cả API routes (projects, pages, styleguide, global-sections, revisions, library, ai/generate, ai/search)
- `src/lib/prisma.ts` — Prisma client singleton với adapter
- `src/lib/api-client.ts` — typed fetch wrapper
- `src/lib/tree-utils.ts` — immutable tree operations
- `src/lib/json-patch.ts` — RFC 6901 JSON Patch
- `src/lib/id.ts` — nanoid wrapper

**Giới hạn:**
- Không chứa UI logic hay React components
- Không modify types/schemas — yêu cầu Agent 1
- Không chứa AI prompt engineering — chỉ transport layer cho AI requests
- API route chỉ handle HTTP + data layer, không biết về renderer hay store

**API conventions:**
- Mọi response theo `ApiResponse<T> { success, data?, error?, meta }`
- Mọi write operation validate input trước khi persist
- JSON fields (treeData, colors, etc.) stringify khi write, parse khi read
- Transaction cho multi-table operations (e.g., tạo project + styleguide + home page)

---

### Agent 4: AI/SEO — Owner of AI Intelligence & Content Quality

**Mục tiêu:** Đảm bảo AI generation tạo ra valid JSON nodes theo đúng data contracts, và SEO audit kiểm tra được content quality. Agent 4 là chuyên gia về prompt engineering và semantic HTML.

**Trách nhiệm:**
- AI prompt engineering — system prompt design cho Ollama
- AI response parsing và validation (extract JSON, validate structure)
- Template generators (8 templates: hero, pricing, features, testimonial, CTA, header-nav, footer, contact)
- Natural language prompt parser (keyword → AIAction + ComponentCategory)
- SEO audit system (heading hierarchy, semantic HTML, meta tags, accessibility)
- Semantic HTML mapping và HTML5 content model validation

**Sở hữu:**
- `src/features/ai/` — prompt-parser, component-generator, json-diff-generator, diff-apply, templates/
- `src/features/seo/` — semantic-mapper, heading-validator, meta-generator, seo-audit, html-validator
- `src/types/ai.ts` — AI-specific types (co-author với Agent 1 review)
- `src/schemas/ai-diff.schema.ts` — AI diff validation (co-author với Agent 1 review)

**Giới hạn:**
- Không modify renderer components trực tiếp — request Agent 2
- Không gọi Prisma hay modify database — request Agent 3
- Không tạo mới types/schemas — propose cho Agent 1 review
- AI output phải tuân thủ `DOMNode` hierarchy (Agent 1 contract)

**AI flow rules:**
- System prompt phải include đầy đủ node hierarchy docs
- AI response phải pass `validateAIResponse()` trước khi gửi về client
- Template generators chỉ dùng khi Ollama unreachable (fallback)
- Mọi AI interaction phải log vào `AIPromptLog`

---

### Cross-Agent Collaboration Rules

1. **Type change flow:** Agent nào cần → propose → Agent 1 review/approve → implement
2. **API change flow:** Agent nào cần → propose → Agent 3 implement route → update api-client
3. **AI feature flow:** Agent 4 owns logic → Agent 3 wraps in API → Agent 2 builds UI → Agent 1 reviews types
4. **UI needs data:** Agent 2 → call Agent 3's API client → never bypass to Prisma directly
5. **All agents** có thể add methods vào `api-client.ts` cho domain-specific API calls

### New Feature Assignment

| Feature | Lead Agent | Support Agents | Files to Modify |
|---------|-----------|----------------|-----------------|
| Thinking UI (display AI thinking) | Agent 2 | Agent 4 (data flow), Agent 3 (API) | `AIPromptBar.tsx`, `src/types/ai.ts`, `src/app/api/ai/generate/route.ts` |
| Fix AI_PARSE_ERROR (strip `<think/>` tags) | Agent 3 | Agent 4 (AI response handling) | `src/app/api/ai/generate/route.ts` |
| Thinking state in store | Agent 2 | Agent 4 (thinking data) | `src/store/builder-store.ts` |

## Key Directories
- `src/types/` — TypeScript interfaces + enums (Agent 1, Agent 4 co-owns `ai.ts`)
- `src/schemas/` — Zod validation schemas (Agent 1)
- `src/store/` — Zustand store with 7 slices + temporal middleware (Agent 2)
- `src/lib/` — Shared utilities: tree-utils, prisma, api-client, json-patch, id (Agent 3)
- `src/components/` — Shared UI components: Button, Input, Tabs (Agent 2)
- `src/features/renderer/` — Recursive React renderer + NodeWrapper + semantic hooks (Agent 2)
- `src/features/dnd/` — Drag & Drop system + DndProvider + flattening utils (Agent 2)
- `src/features/inspector/` — Property inspector with 5 tabs (Agent 2)
- `src/features/ai/` — AI prompt parsing, JSON diff generation, 8 template generators (Agent 4)
- `src/features/seo/` — Semantic HTML mapping, heading validator, SEO audit, HTML validator (Agent 4)
- `src/app/api/` — 13 REST API routes (Agent 3)
- `src/app/builder/` — Builder UI: Header, Canvas, Sidebar, AIPromptBar (Agent 2)
- `src/app/page.tsx` — Homepage with project list + create form (Agent 2)
- `prisma/` — Schema + seed script (Agent 1)

## Database Models
- **Project** → has many Pages, one Styleguide, many GlobalSections
- **Page** → has treeData (Json), many Revisions
- **Styleguide** → colors, typography, spacing, cssVariables (all Json)
- **GlobalSection** → sectionType, treeData (Json) — for header/footer inheritance
- **Revision** → snapshot (Json), optional diff (Json)
- **UserLibrary** → saved components, nodeData (Json), embedding (Bytes?)
- **AIPromptLog** → AI interaction logging

## API Pattern
All API responses use: `ApiResponse<T> { success, data?, error?, meta }`

## Coding Conventions
- Use `@/` path alias for imports
- Strict TypeScript — no `any` types
- Validate all external input with Zod before store injection
- React.memo on renderer components for performance
- Use `useShallow` from zustand for selector subscriptions
- Immer middleware for all Zustand state mutations
