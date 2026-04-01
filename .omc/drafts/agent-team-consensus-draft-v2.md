# Agent Team Implementation Plan (Revision 1)

## Requirements Summary
Build 5 Claude Code agent config files (.claude/agents/), then execute remaining DELTA work for 4 features. **Critical context**: The codebase is significantly further along than initially assessed. This plan is scoped to delta-only work based on Architect + Critic audit findings.

## RALPLAN-DR Summary (Short Mode)

### Principles
1. **Ownership sovereignty**: Each agent exclusively modifies files in its owned directories; cross-directory changes require the owning agent
2. **Contract-first development**: Architect defines/validates types before any implementation agent writes code
3. **Review gate enforcement**: No agent starts until reviewer approves previous agent's output
4. **Incremental app health**: App must compile, pass lint, and load after every agent's contribution
5. **Delta-only execution**: Every step is scoped against what already exists — agents build ONLY what is missing

### Decision Drivers
1. **Codebase maturity** — ~60% of planned features already exist; the real scope is gap-filling, not greenfield building
2. **Store architecture ambiguity** — monolithic `builder-store.ts` is canonical; sliced `slices/` is dead code that must be resolved
3. **Shared utility ownership** — `src/lib/` is imported by both Frontend and Backend, requiring explicit cross-agent policy

### Viable Options

**Option A: Audit-First Sequential Pipeline** (Recommended, revised from v1)
- Phase 0.5: Architect audits codebase, produces delta report for each feature
- Phases 1-4 execute delta-only work with review gates
- Pros: No redundant work, respects existing implementations, efficient agent usage
- Cons: Adds one upfront audit cycle, audit quality gates all subsequent work

**Option B: Single Agent Gap-Fill** (alternative, not recommended)
- One general-purpose agent identifies and fills all gaps sequentially
- Pros: Simpler coordination, no inter-agent overhead
- Cons: Violates user's explicit request for 5-agent team with review gates; no specialization benefit

**Invalidation for Option B:** User explicitly chose "sequential pipeline" + "dedicated reviewer agent" + "full config with tool restrictions." A single agent contradicts all three constraints.

---

## Acceptance Criteria (Testable, Revised)
- [ ] 5 `.claude/agents/` markdown config files exist with: system prompt, allowed tools list, file path restrictions, model routing
- [ ] `src/app/api/projects/[projectId]/global-sections/route.ts` provides GET/PUT for global sections (renderer already handles merge)
- [ ] `src/lib/api-client.ts` has `getGlobalSections()` and `updateGlobalSection()` methods
- [ ] Builder layout loads global sections into store so PageRenderer can consume them
- [ ] `src/types/seo.ts` exists with types refactored from inline definitions in `seo-audit.ts`
- [ ] `src/schemas/seo.schema.ts` exists with Zod schemas for SEO types
- [ ] `npm run build` succeeds after each agent's contribution
- [ ] `npm run lint` passes after each agent's contribution
- [ ] Test files exist covering: tree-utils, API routes, renderer, store, DnD, and SEO audit
- [ ] Dead `src/store/slices/` directory is either deleted or formally integrated (architectural decision)

## Implementation Steps

### Phase 0: Agent Config Files (Foundation)

#### Step 0.1: Create `.claude/agents/architect.md`
- **File**: `.claude/agents/architect.md`
- **Content**: Agent 1 config with:
  - System prompt from `USER_CONTEXT/agents_req.md` (Agent 1 definition, lines 1-7)
  - Owned paths: `src/types/`, `src/schemas/`, `prisma/schema.prisma`, `prisma/seed.ts`, `prisma/prisma.config.ts`
  - Shared paths (coordinate with other agents): `src/lib/tree-utils.ts`, `src/lib/json-patch.ts` (Architect owns these as contract-level utilities)
  - Allowed tools: Read, Edit, Write, Bash (prisma commands), Grep, Glob
  - Model: opus
  - Constraints: Never modify `src/store/`, `src/features/`, `src/app/api/`, `src/app/builder/`, `src/app/page.tsx`
- **References**: `USER_CONTEXT/agents_req.md:1-7`, `CLAUDE.md:22-34`

#### Step 0.2: Create `.claude/agents/frontend.md`
- **File**: `.claude/agents/frontend.md`
- **Content**: Agent 2 config with:
  - System prompt from `USER_CONTEXT/agents_req.md` (Agent 2 definition, lines 8-13)
  - Owned paths: `src/store/builder-store.ts`, `src/store/index.ts`, `src/features/renderer/`, `src/features/dnd/`, `src/features/inspector/`, `src/app/builder/`, `src/components/`
  - Shared paths (read-only): `src/lib/tree-utils.ts` (imports but does not modify — changes require Architect)
  - Allowed tools: Read, Edit, Write, Bash (npm run dev/build), Grep, Glob
  - Model: sonnet
  - Constraints: Never modify `src/types/`, `src/schemas/`, `src/app/api/`, `prisma/`, `src/lib/`
- **References**: `USER_CONTEXT/agents_req.md:8-13`

#### Step 0.3: Create `.claude/agents/backend.md`
- **File**: `.claude/agents/backend.md`
- **Content**: Agent 3 config with:
  - System prompt from `USER_CONTEXT/agents_req.md` (Agent 3 definition, lines 15-20)
  - Owned paths: `src/app/api/`, `src/lib/prisma.ts`, `src/lib/api-client.ts`, `src/lib/id.ts`
  - Shared paths (read-only): `src/lib/tree-utils.ts` (imports but does not modify — changes require Architect)
  - Allowed tools: Read, Edit, Write, Bash (prisma commands), Grep, Glob
  - Model: sonnet
  - Constraints: Never modify `src/types/`, `src/store/`, `src/features/`, `src/app/builder/`, `src/lib/tree-utils.ts`
- **References**: `USER_CONTEXT/agents_req.md:15-20`

#### Step 0.4: Create `.claude/agents/ai-seo.md`
- **File**: `.claude/agents/ai-seo.md`
- **Content**: Agent 4 config with:
  - System prompt from `USER_CONTEXT/agents_req.md` (Agent 4 definition, lines 22-27)
  - Owned paths: `src/features/ai/`, `src/features/seo/`
  - Allowed tools: Read, Edit, Write, Bash, Grep, Glob
  - Model: sonnet
  - Constraints: Never modify `src/store/`, `src/app/api/` (AI route at `src/app/api/ai/` is Backend territory), `src/features/renderer/` (CLAUDE.md:33 — Agent 4 does not modify renderer directly)
- **References**: `USER_CONTEXT/agents_req.md:22-27`, `CLAUDE.md:33`

#### Step 0.5: Create `.claude/agents/reviewer.md`
- **File**: `.claude/agents/reviewer.md`
- **Content**: Agent 5 config with:
  - System prompt: "You are the Quality Reviewer for the AI Website Builder. You validate each builder agent's output before the next agent begins. You check: 1) Build health (`npm run build` succeeds), 2) Lint compliance (`npm run lint` passes), 3) Import integrity (no broken imports), 4) Ownership boundary compliance (agent only modified owned files). You NEVER modify any source files. You only read, run build/lint, and report pass/fail with specific file:line references."
  - Owned paths: None (read-only access to all)
  - Allowed tools: Read, Bash (build/lint/test only), Grep, Glob
  - Model: opus
  - Constraints: NEVER use Edit or Write tools on source files
- **References**: Derived from deep-interview spec

#### Step 0.6: Resolve store duplication
- **Agent**: Architect (opus) — owns `src/store/` architecture decisions
- **Action**: Decide on store architecture:
  - Option A (recommended): Delete `src/store/slices/` directory (dead code, zero imports, different API names)
  - Option B: Migrate to sliced architecture, update `src/store/index.ts`
- **Files affected**: `src/store/slices/` (all 5 files)
- **Rationale**: `src/store/index.ts` exports only from `builder-store.ts`. The sliced files have different method names (`removeNodeById` vs `removeNode`) and zero imports. They are dead code.
- **Review gate**: Reviewer verifies build passes after decision

### Phase 0.5: Pre-Execution Audit (Critical)

#### Step 0.5.1: Architect audits existing implementations
- **Agent**: Architect (opus)
- **Action**: Read all relevant files and produce a delta report documenting:
  - Global section feature: What exists in renderer (`PageRenderer.tsx:14-76`), types (`dom-tree.ts:85-98` has `globalSectionIds`), Prisma (`schema.prisma:69-83` has GlobalSection model), store (`builder-store.ts` — no global section loading logic), API (no global section endpoints)
  - SEO module: What exists in `src/features/seo/` (seo-audit.ts, meta-generator.ts, heading-validator.ts, semantic-mapper.ts, index.ts — all complete)
  - Landing page: What exists in `src/app/page.tsx` (144-line project dashboard — complete)
  - Store architecture: Monolithic (`builder-store.ts`, used) vs sliced (`slices/`, unused)
  - Shared utilities: `tree-utils.ts` (7 Frontend imports, 2 Backend imports), `json-patch.ts` (0 imports — dead code)
- **Output**: `.omc/audit/delta-report.md` — precise gap list for each feature
- **Review gate**: Reviewer validates audit is complete

### Phase 1: Feature 1 — Global Section Inheritance (Delta-Only)

**What already exists (do NOT reimplement):**
- `PageRenderer.tsx:14-76` — Global section merge with header/footer separation
- `use-semantic-tag.ts:9-15` — HEADER, NAV, FOOTER semantic tags mapped
- `dom-tree.ts:85-98` — `PageNode.globalSectionIds` field
- `project.ts:29-37` — `GlobalSection` interface
- `prisma/schema.prisma:69-83` — GlobalSection model with `sectionType`, `sectionName`, `treeData`

**What is missing (actual work):**

#### Step 1.1: Backend — Global Section API Endpoints
- **Agent**: Backend (sonnet)
- **Files to create**:
  - `src/app/api/projects/[projectId]/global-sections/route.ts` — GET (list all global sections for project), POST (create global section)
  - `src/app/api/projects/[projectId]/global-sections/[sectionId]/route.ts` — GET, PUT, DELETE single global section
- **Files to modify**:
  - `src/lib/api-client.ts` — Add `getGlobalSections(projectId)`, `updateGlobalSection(projectId, sectionId, data)` methods following existing pattern at lines 22-91
- **References**: `src/app/api/projects/[projectId]/styleguide/route.ts` (similar CRUD pattern), `src/lib/api-client.ts:22-91`
- **Review gate**: Reviewer validates API returns correct data, build passes

#### Step 1.2: Frontend — Store Global Section Loading
- **Agent**: Frontend (sonnet)
- **Files to modify**:
  - `src/store/builder-store.ts` — Add `globalSections` state field and `setGlobalSections()` action in the store (follow existing pattern for other state fields)
  - `src/app/builder/[projectId]/layout.tsx` — Fetch global sections via `apiClient.getGlobalSections()` and load into store alongside existing page/styleguide loading
  - `src/app/builder/[projectId]/pages/[pageId]/page.tsx` — Pass global sections from store to PageRenderer (which already accepts `globalHeaderSections` and `globalFooterSections` props)
- **Do NOT modify**: `PageRenderer.tsx` (already has merge logic), `use-semantic-tag.ts` (already maps tags)
- **References**: `src/store/builder-store.ts:1-307`, `src/app/builder/[projectId]/layout.tsx`, `src/features/renderer/components/PageRenderer.tsx:14-18` (existing props)
- **Review gate**: Reviewer validates global sections render in builder, build passes

#### Step 1.3: Backend — Verify Prisma Migration
- **Agent**: Backend (sonnet)
- **Action**: Run `npx prisma db push` to ensure `global_sections` table exists in SQLite. Verify seed data at `prisma/seed.ts:69-83` creates the sample header/footer global sections.
- **Files to verify**: `prisma/schema.prisma:69-83`, `prisma/seed.ts`, `prisma/dev.db`
- **Review gate**: Reviewer confirms API returns seeded global sections

### Phase 2: Landing Page — Enhancement Only

**What already exists (do NOT reimplement):**
- `src/app/page.tsx` — Complete 144-line project dashboard with: project fetching, card grid, "Create New Project" form, links to `/builder/{projectId}`, page count, last updated date

**No mandatory work required.** The landing page is fully functional. Optional enhancements if time permits:
- Add project deletion (with confirmation dialog)
- Add project thumbnail/preview
- Add empty state when no projects exist

**Phase 2 is SKIPPED** in the sequential pipeline. Move directly to Phase 3.

### Phase 3: Feature 3 — SEO Module (Delta-Only)

**What already exists (do NOT reimplement):**
- `src/features/seo/seo-audit.ts` (247 lines) — `auditSEO()` with heading hierarchy, semantic tags, alt text, link href, empty section checks, scoring
- `src/features/seo/meta-generator.ts` (135 lines) — `generateMetaFromPage()` with title, description, OG tags, canonical URL
- `src/features/seo/heading-validator.ts` (108 lines) — `validateHeadingHierarchy()` with h1 uniqueness, level skipping
- `src/features/seo/semantic-mapper.ts` (31 lines) — `CATEGORY_SEMANTIC_MAP`, `getRecommendedTag()`
- `src/features/seo/index.ts` (8 lines) — Complete barrel export

**What is missing (actual work):**

#### Step 3.1: Architect — Refactor SEO Types to Centralized File
- **Agent**: Architect (opus)
- **Action**: Extract inline type definitions (`SEOIssue`, `SEOAuditResult`, `SEOMeta`, `HeadingIssue`) from `seo-audit.ts` and `meta-generator.ts` into `src/types/seo.ts`
- **Files to create**:
  - `src/types/seo.ts` — Centralized SEO type definitions (move from inline, not create from scratch)
- **Files to modify**:
  - `src/types/index.ts` — Add `export * from './seo'`
  - `src/features/seo/seo-audit.ts` — Replace inline types with imports from `@/types/seo`
  - `src/features/seo/meta-generator.ts` — Replace inline types with imports from `@/types/seo`
  - `src/features/seo/heading-validator.ts` — Replace inline types with imports from `@/types/seo`
- **Files to create**:
  - `src/schemas/seo.schema.ts` — Zod schemas for SEO types (genuinely new)
- **References**: `src/features/seo/seo-audit.ts:8-20` (inline types to extract), `src/types/index.ts` (existing barrel)
- **Review gate**: Reviewer validates refactored types compile, no broken imports

#### Step 3.2: AI/SEO — Enhance SEO Module (Genuinely New Work)
- **Agent**: AI/SEO (sonnet)
- **Action**: Add genuinely missing SEO functionality:
  - `src/features/seo/html-validator.ts` — `validateSemanticHTML()` that checks each node against HTML5 content model rules (e.g., `<section>` should have a heading, `<nav>` should contain links, `<article>` should have a title element). This is distinct from what `seo-audit.ts` provides.
  - Update `src/features/seo/index.ts` to export new function
- **Do NOT recreate**: seo-audit.ts, meta-generator.ts, heading-validator.ts, semantic-mapper.ts
- **References**: `src/features/seo/seo-audit.ts` (existing audit to understand gap), `src/types/enums.ts:1-97` (SemanticTag enum)
- **Review gate**: Reviewer validates new module works, build passes

### Phase 4: Feature 4 — Tests

#### Step 4.0: Setup Testing Infrastructure
- **Agent**: Backend (sonnet)
- **Files to modify/create**:
  - `package.json` — Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@vitejs/plugin-react` (for React 19 compatibility), `jsdom`
  - `vitest.config.ts` — Configure Vitest with `@/` path alias from `tsconfig.json`
- **References**: `package.json` (current deps), `tsconfig.json` (path alias)

#### Step 4.1: Backend — API Route Tests + Tree Utils Tests
- **Agent**: Backend (sonnet)
- **Files to create**:
  - `src/lib/__tests__/tree-utils.test.ts` — Unit tests for all 13 tree utility functions (findNodeById, addChildNode, removeNode, moveNode, cloneTree, etc.)
  - `src/app/api/__tests__/projects.test.ts` — Integration tests for project CRUD endpoints (GET list, POST create, GET single, PUT update, DELETE)
  - `src/app/api/__tests__/global-sections.test.ts` — Tests for new global section endpoints (from Phase 1)
- **References**: `src/lib/tree-utils.ts:1-206` (13 functions), `src/app/api/projects/route.ts`

#### Step 4.2: Frontend — Store + Renderer Tests
- **Agent**: Frontend (sonnet)
- **Files to create**:
  - `src/store/__tests__/builder-store.test.ts` — Tests for store: tree mutations (add/remove/update/move nodes), selection state, undo/redo with temporal middleware
  - `src/features/renderer/__tests__/PageRenderer.test.tsx` — Tests for recursive rendering, global section injection (header/footer)
  - `src/features/dnd/__tests__/dnd-utils.test.ts` — Tests for `flattenTreeForDnD()`, `getDescendantIds()`, `getValidDropTargets()`
- **References**: `src/store/builder-store.ts:1-307`, `src/features/renderer/components/PageRenderer.tsx`, `src/features/dnd/dnd-utils.ts:1-117`

#### Step 4.3: AI/SEO — SEO Module Tests
- **Agent**: AI/SEO (sonnet)
- **Files to create**:
  - `src/features/seo/__tests__/audit.test.ts` — Tests for `auditSEO()`, heading hierarchy validation, semantic tag checks
  - `src/features/seo/__tests__/html-validator.test.ts` — Tests for new `validateSemanticHTML()` function
- **References**: `src/features/seo/seo-audit.ts`, `src/features/seo/html-validator.ts` (created in Phase 3)

#### Step 4.4: Reviewer — Final Validation
- **Agent**: Reviewer (opus)
- **Action**: Run full test suite (`npx vitest run`), verify all tests pass, run `npm run build` + `npm run lint`, report final status
- **Review gate**: All tests pass, build succeeds, lint clean → project complete

## Revised Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Agent modifies already-existing code, breaking it | Medium | Critical | Phase 0.5 audit produces explicit "do NOT touch" list per step; reviewer checks diff against expected files |
| Shared utility (`tree-utils.ts`) change breaks multiple agents | Low | High | Architect owns `src/lib/tree-utils.ts` and `json-patch.ts`; other agents import but don't modify |
| Store architecture decision (delete slices vs migrate) delayed | Low | Medium | Step 0.6 makes explicit decision before any feature work; reviewer verifies |
| Vitest + React 19 + Next.js 16 compatibility issues | Medium | Medium | Use Vitest (not Jest); pin compatible @testing-library/react version; test infrastructure step runs before any test files |
| SEO type refactoring breaks existing SEO module | Low | Medium | Architect reads existing inline types before extracting; reviewer runs build after refactor |

## Verification Steps
1. After Phase 0: All 5 agent config files exist; store duplication resolved; build passes
2. After Phase 0.5: Delta report exists with explicit gap list per feature
3. After Step 1.1: Global section API returns 200 with seeded data from `prisma/seed.ts`
4. After Step 1.2: Builder renders global header/footer sections; `npm run build` passes
5. After Step 3.1: `src/types/seo.ts` exists; existing SEO module still works; no broken imports
6. After Step 3.2: `validateSemanticHTML()` runs on sample tree and returns structured results
7. After Step 4.4: `npx vitest run` passes, `npm run build` succeeds, `npm run lint` clean

## ADR (Decision Record)
- **Decision**: Audit-first sequential pipeline with delta-only execution
- **Drivers**: Codebase is 60%+ further along than initially assessed; redundant implementation is the highest risk
- **Alternatives considered**:
  - Execute as-is (rejected — 3 of 4 phases contain redundant work)
  - Single agent gap-fill (rejected — contradicts user's 5-agent team choice)
  - Parallel execution (rejected — cross-agent conflicts with shared utilities)
- **Why chosen**: Pre-execution audit eliminates redundant work while preserving user's chosen sequential pipeline + dedicated reviewer model. Delta-only scoping ensures agents build ONLY what is missing.
- **Consequences**: Faster execution (less work per phase), higher confidence (no overwriting existing code), but requires accurate audit as foundation
- **Follow-ups**: After execution, evaluate if agent configs should be refined for future sprints. Consider adding a 6th "DevOps/Testing" agent for ongoing test maintenance.

## Changelog (Revision 1)
- Added Phase 0.5: Pre-execution audit (Architect recommendation)
- Added Step 0.6: Store duplication resolution (Critic finding)
- Re-scoped Phase 1 to delta-only: removed PageRenderer.tsx modification (already exists), removed use-semantic-tag.ts modification (ownership violation + already complete)
- Added `src/lib/` shared ownership policy: Architect owns tree-utils.ts/json-patch.ts, other agents import only
- Removed Phase 2 entirely (landing page already built — Critic finding)
- Re-scoped Phase 3 to delta-only: types are refactored (not created), only Zod schemas and html-validator are genuinely new
- Added DnD tests to Phase 4 Step 4.2 (Critic finding)
- Added Step 1.3: Prisma migration verification (Critic finding)
- Fixed AI route path: `src/features/ai/generate/route.ts` → `src/app/api/ai/generate/route.ts` (Critic finding)
- Fixed AI/SEO agent constraints: explicitly forbids modifying `src/features/renderer/` per CLAUDE.md:33
- Updated acceptance criteria: removed already-satisfied items, added delta-specific criteria
