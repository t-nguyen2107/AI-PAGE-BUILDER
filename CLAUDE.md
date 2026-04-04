# AI Website Builder — Project Context

## Overview
AI Website Builder là một modular subsystem thiết kế để tích hợp vào AI CMS lớn hơn. Hệ thống cho phép user tạo website qua **Puck Core visual editor** + AI prompt generation.

## Tech Stack
- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Editor:** @puckeditor/core v0.21.x (visual drag-drop, inline editing, viewport preview, undo/redo)
- **Styling:** Tailwind CSS 4 + CSS Variables (dynamic styleguide injection)
- **State:** Zustand 5 (toast store; Puck manages its own editor state)
- **Database:** SQLite via Prisma 7 (better-sqlite3 adapter)
- **Validation:** Zod 4 schemas
- **AI:** Ollama (qwen3.5) cho prompt-to-JSON generation
- **IDs:** nanoid
- **Testing:** Vitest (jsdom)

## Core Architecture — Puck Data Model

Pages are stored as Puck `Data` format in `treeData` (Prisma Json field):
```
Data = {
  root: { props: { title: string } },
  content: ComponentData[]  // flat array, not a tree
}

ComponentData = {
  type: string,           // e.g. "HeroSection", "FeaturesGrid"
  props: { id: string, ...fields }
}
```

**26 Puck component types:** HeroSection, FeaturesGrid, PricingTable, TestimonialSection, CTASection, FAQSection, StatsSection, TeamSection, BlogSection, LogoGrid, ContactForm, HeaderNav, FooterSection, TextBlock, ImageBlock, Spacer, ColumnsLayout, NewsletterSignup, Gallery, SocialProof, ComparisonTable, ProductCards, FeatureShowcase, CountdownTimer, AnnouncementBar, Banner.

**Old DOMNode format** (6-level hierarchy) is still used internally by template generators in `src/features/ai/templates/` and converted to Puck format via `src/lib/ai/puck-adapter.ts`. Migration is tracked in the plan at `C:\Users\MR THIEN\.claude\plans\flickering-enchanting-waterfall.md`.

## Key Directories

### Puck Editor (new)
- `src/puck/puck.config.tsx` — 26 component definitions with fields, defaultProps, render
- `src/puck/types.ts` — All component prop types
- `src/puck/categories.ts` — 6 sidebar categories (sections, layout, typography, media, navigation, promotional)
- `src/puck/PuckEditor.tsx` — Client component wrapping `<Puck>` with save + viewport config
- `src/puck/components/` — 26 render components (Tailwind-styled)
- `src/puck/migration/` — Old DOMNode → Puck Data converter (dom-to-puck.ts, puck-to-dom.ts)

### AI Pipeline
- `src/lib/ai/` — Streaming (Ollama → LangChain → SSE), output validation, sanitizing, puck-adapter
- `src/lib/ai/prompts/` — System prompt (Puck-aware), template prompt, template schema
- `src/features/ai/templates/` — 25+ template generators (still output old SectionNode format, converted via adapter)
- `src/features/ai/template-registry.ts` — Template registration and lookup
- `src/features/ai/component-generator.ts` — Generates Puck ComponentData from category

### SEO
- `src/features/seo/` — SEO audit, heading validator, meta generator, JSON-LD generator, semantic mapper, HTML validator (all adapted for Puck Data)

### Shared
- `src/types/` — TypeScript interfaces + enums (dom-tree still used by templates; ai, project, styleguide, seo, etc.)
- `src/schemas/` — Zod validation schemas (styleguide, seo)
- `src/store/` — Zustand toast store (builder-store removed — Puck manages its own state)
- `src/lib/` — prisma, api-client, id, utils, ai/ pipeline
- `src/components/` — Shared UI components (Button, Input, Tabs, Modal, Toast)
- `src/app/api/` — REST API routes (projects, pages, styleguide, global-sections, revisions, library, ai/generate, ai/search)
- `src/app/builder/` — Builder pages (uses `<PuckEditor>`)
- `src/app/preview/` — Public preview using Puck `<Render>` with ISR

### Removed during Puck migration
- `src/features/renderer/` — Recursive DOMNode renderer (replaced by Puck canvas)
- `src/features/dnd/` — Custom DnD system (Puck has built-in DnD)
- `src/features/inspector/` — Custom property inspector (Puck has built-in field editor)
- `src/store/builder-store.ts` — 7-slice Zustand store (Puck manages state internally)
- `src/lib/tree-utils.ts`, `src/lib/json-patch.ts`, `src/lib/node-utils.ts` — Replaced by Puck's state management
- `src/schemas/dom-node.schema.ts`, `src/schemas/ai-diff.schema.ts` — No longer needed

## Database Models
- **Project** → has many Pages, one Styleguide, many GlobalSections
- **Page** → has treeData (Json, Puck Data format), many Revisions
- **Styleguide** → colors, typography, spacing, cssVariables (all Json)
- **GlobalSection** → sectionType, treeData (Json) — for header/footer inheritance
- **Revision** → snapshot (Json), optional diff (Json)
- **UserLibrary** → saved components, nodeData (Json)
- **AIPromptLog** → AI interaction logging

## API Pattern
All API responses use: `ApiResponse<T> { success, data?, error?, meta }`

## ISR
- Preview pages use `export const revalidate = 60` for ISR
- Page save API calls `revalidatePath()` to bust cache on publish

## Workflow Rules
- **Push before big tasks:** Before starting any large, complex, or multi-file task, commit and push all current changes first. This ensures a clean checkpoint in case the task needs to be reverted.
- **Commit often:** Break work into logical commits. Don't let uncommitted changes accumulate across unrelated features.

## Working Rules
- **Push before starting large tasks:** Before beginning any complex or multi-file task (refactors, migrations, new features), commit and push all pending changes first. This ensures a clean checkpoint to revert to if things go wrong.
- **Commit often:** Break work into logical commits. Don't let uncommitted changes accumulate across unrelated features.

## Coding Conventions
- Use `@/` path alias for imports
- Strict TypeScript — no `any` types
- Validate all external input with Zod before store injection
- Puck component render files go in `src/puck/components/`
- Template generators in `src/features/ai/templates/` output old SectionNode format, converted by puck-adapter
