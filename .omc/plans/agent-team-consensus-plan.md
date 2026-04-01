# Agent Team Implementation Plan (Final — Consensus Approved)

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

**Option A: Audit-First Sequential Pipeline** (Chosen)
- Phase 0.5: Architect audits codebase, produces delta report for each feature
- Phases 1-4 execute delta-only work with review gates
- Pros: No redundant work, respects existing implementations, efficient agent usage
- Cons: Adds one upfront audit cycle, audit quality gates all subsequent work

**Option B: Single Agent Gap-Fill** (Rejected)
- One general-purpose agent identifies and fills all gaps sequentially
- Pros: Simpler coordination, no inter-agent overhead
- Cons: Violates user's explicit request for 5-agent team with review gates; no specialization benefit

**Invalidation for Option B:** User explicitly chose "sequential pipeline" + "dedicated reviewer agent" + "full config with tool restrictions." A single agent contradicts all three constraints.

---

## Acceptance Criteria (Testable)
- [ ] 5 `.claude/agents/` markdown config files exist with: system prompt, allowed tools list, file path restrictions, model routing
- [ ] `src/app/api/projects/[projectId]/global-sections/route.ts` provides GET/PUT for global sections (renderer already handles merge)
- [ ] `src/lib/api-client.ts` has `getGlobalSections()` and `updateGlobalSection()` methods
- [ ] Builder layout loads global sections into store; Canvas.tsx passes them to PageRenderer
- [ ] `src/types/seo.ts` exists with types refactored from inline definitions in `seo-audit.ts`
- [ ] `src/schemas/seo.schema.ts` exists with Zod schemas for SEO types
- [ ] `npm run build` succeeds after each agent's contribution
- [ ] `npm run lint` passes after each agent's contribution
- [ ] Test files exist covering: tree-utils, API routes, renderer, store, DnD, and SEO audit
- [ ] Dead `src/store/slices/` directory is resolved (deleted or formally integrated)

## Implementation Steps

### Phase 0: Agent Config Files (Foundation)

#### Step 0.1: Create `.claude/agents/architect.md`
- **File**: `.claude/agents/architect.md`
- **Content**: Agent 1 config with:
  - System prompt from `USER_CONTEXT/agents_req.md` (Agent 1 definition, lines 1-7)
  - Owned paths: `src/types/`, `src/schemas/`, `prisma/schema.prisma`, `prisma/seed.ts`, `prisma/prisma.config.ts`
  - Shared paths (Architect owns as contract-level utilities): `src/lib/tree-utils.ts`, `src/lib/json-patch.ts`
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
- **Agent**: Architect decides (architecture decision), Frontend executes (owns `src/store/`)
- **Decision**: Delete `src/store/slices/` directory (dead code — zero imports, different API names)
- **Rationale**: `src/store/index.ts` exports only from `builder-store.ts`. The sliced files have different method names (`removeNodeById` vs `removeNode`) and zero imports. They are dead code.
- **Execution**: Frontend agent deletes `src/store/slices/` after Architect confirms decision in Phase 0.5 audit
- **Review gate**: Reviewer verifies build passes after deletion

### Phase 0.5: Pre-Execution Audit (Critical)

#### Step 0.5.1: Architect audits existing implementations
- **Agent**: Architect (opus)
- **Action**: Read all relevant files and produce a delta report documenting:
  - Global section feature: What exists in renderer (`PageRenderer.tsx:12-76` — props + merge logic), types (`dom-tree.ts:85-98` — `globalSectionIds`), Prisma (`schema.prisma:69-83` — GlobalSection model), store (`builder-store.ts` — no global section state or loading), API (no global section endpoints), Canvas (`Canvas.tsx:115` — renders PageRenderer without global section props)
  - SEO module: What exists in `src/features/seo/` (seo-audit.ts, meta-generator.ts, heading-validator.ts, semantic-mapper.ts, index.ts — all complete)
  - Landing page: What exists in `src/app/page.tsx` (144-line project dashboard — complete)
  - Store architecture: Monolithic (`builder-store.ts`, used) vs sliced (`slices/`, unused — recommend deletion)
  - Shared utilities: `tree-utils.ts` (7 Frontend imports, 0 Backend imports), `json-patch.ts` (0 imports — dead code)
  - Prisma: `@unique([projectId, sectionType])` constraint on GlobalSection means each project has exactly one header, one footer, one nav, etc. POST endpoints must handle upsert or document the constraint.
- **Output**: `.omc/audit/delta-report.md` — precise gap list for each feature
- **Review gate**: Reviewer validates audit is complete and accurate

### Phase 1: Feature 1 — Global Section Inheritance (Delta-Only)

**What already exists (do NOT reimplement):**
- `PageRenderer.tsx:12-76` — Global section merge with header/footer separation (props `globalHeaderSections`/`globalFooterSections` + full merge logic)
- `use-semantic-tag.ts:9-15` — HEADER, NAV, FOOTER semantic tags already mapped
- `dom-tree.ts:85-98` — `PageNode.globalSectionIds` field
- `project.ts:29-37` — `GlobalSection` interface
- `prisma/schema.prisma:69-83` — GlobalSection model with `sectionType`, `sectionName`, `treeData`, `@@unique([projectId, sectionType])`

**What is missing (actual work):**

#### Step 1.1: Backend — Global Section API Endpoints
- **Agent**: Backend (sonnet)
- **Files to create**:
  - `src/app/api/projects/[projectId]/global-sections/route.ts` — GET (list all global sections for project), POST (create global section — handle `@unique` constraint with upsert or error)
  - `src/app/api/projects/[projectId]/global-sections/[sectionId]/route.ts` — GET, PUT, DELETE single global section
- **Files to modify**:
  - `src/lib/api-client.ts` — Add `getGlobalSections(projectId)`, `updateGlobalSection(projectId, sectionId, data)` methods following existing pattern at lines 22-91
- **Note**: Follow existing `styleguide/route.ts` CRUD pattern. Handle Prisma unique constraint on `[projectId, sectionType]`.
- **References**: `src/app/api/projects/[projectId]/styleguide/route.ts` (similar pattern), `src/lib/api-client.ts:22-91`
- **Review gate**: Reviewer validates API returns correct data, build passes

#### Step 1.2: Frontend — Store Global Section Loading + Canvas Wiring
- **Agent**: Frontend (sonnet)
- **Files to modify**:
  - `src/store/builder-store.ts` — Add `globalSections` state field and `setGlobalSections()` action
  - `src/app/builder/[projectId]/layout.tsx` — Fetch global sections via `apiClient.getGlobalSections()` and load into store (add alongside existing styleguide loading pattern)
  - `src/app/builder/[projectId]/pages/[pageId]/page.tsx` — Ensure global sections are loaded (this file handles data loading, returns `null`)
  - **`src/app/builder/components/Canvas.tsx:115`** — Wire `globalHeaderSections` and `globalFooterSections` from store to `<PageRenderer>` (THIS IS THE KEY FILE — currently renders `<PageRenderer node={tree} />` without global section props)
- **Do NOT modify**: `PageRenderer.tsx` (already has merge logic), `use-semantic-tag.ts` (already maps tags)
- **References**: `src/store/builder-store.ts:1-307`, `src/app/builder/components/Canvas.tsx:115` (rendering site), `src/app/builder/[projectId]/layout.tsx` (layout loading)
- **Review gate**: Reviewer validates global sections render in builder, build passes

#### Step 1.3: Backend — Verify Prisma Migration
- **Agent**: Backend (sonnet)
- **Action**: Run `npx prisma db push` to ensure `global_sections` table exists in SQLite. Verify seed data at `prisma/seed.ts` creates the sample header/footer global sections.
- **Files to verify**: `prisma/schema.prisma:69-83`, `prisma/seed.ts`, `prisma/dev.db`
- **Review gate**: Reviewer confirms API returns seeded global sections

### Phase 2: Landing Page — SKIPPED

**Already complete.** `src/app/page.tsx` is a fully functional 144-line project dashboard with project fetching, card grid, "Create New Project" form, links to `/builder/{projectId}`, page count, last updated dates, loading state, and empty state.

No work required.

### Phase 3: Feature 3 — SEO Module (Delta-Only)

**What already exists (do NOT reimplement):**
- `src/features/seo/seo-audit.ts` (247 lines) — `auditSEO()` with heading hierarchy, semantic tags, alt text, link href, empty section checks, scoring
- `src/features/seo/meta-generator.ts` (135 lines) — `generateMetaFromPage()` with title, description, OG tags, canonical URL
- `src/features/seo/heading-validator.ts` (108 lines) — `validateHeadingHierarchy()` with h1 uniqueness, level skipping
- `src/features/seo/semantic-mapper.ts` (31 lines) — `CATEGORY_SEMANTIC_MAP`, `getRecommendedTag()`
- `src/features/seo/index.ts` (8 lines) — Complete barrel export

**What is missing (actual work):**

#### Step 3.1: Architect — Refactor SEO Types to Centralized File
- **Agent**: Architect (opus) — owns type contracts per CLAUDE.md:30
- **Action**: Extract inline type definitions from SEO module files into `src/types/seo.ts`
- **Types to extract**:
  - `SEOIssue`, `SEOAuditResult` from `seo-audit.ts:8-20`
  - `SEOMeta` from `meta-generator.ts:4-12`
  - `HeadingIssue` from `heading-validator.ts:4-9`
- **Files to create**:
  - `src/types/seo.ts` — Centralized SEO type definitions
  - `src/schemas/seo.schema.ts` — Zod schemas for SEO types (genuinely new)
- **Files to modify** (import replacement only — no logic changes):
  - `src/types/index.ts` — Add `export * from './seo'`
  - `src/features/seo/seo-audit.ts` — Replace inline types with imports from `@/types/seo`
  - `src/features/seo/meta-generator.ts` — Replace inline types with imports from `@/types/seo`
  - `src/features/seo/heading-validator.ts` — Replace inline types with imports from `@/types/seo`
- **Note**: This is a refactoring step crossing into AI/SEO territory, justified by CLAUDE.md:30 ("every type/schema change must go through Agent 1"). Changes are limited to import source replacement, no logic alteration.
- **References**: `src/features/seo/seo-audit.ts:8-20`, `src/features/seo/meta-generator.ts:4-12`, `src/features/seo/heading-validator.ts:4-9`
- **Review gate**: Reviewer validates refactored types compile, no broken imports

#### Step 3.2: AI/SEO — Add HTML Content Validator (Genuinely New)
- **Agent**: AI/SEO (sonnet)
- **Action**: Create `html-validator.ts` with `validateSemanticHTML()` — checks each node against HTML5 content model rules (e.g., `<section>` should have a heading, `<nav>` should contain links, `<article>` should have a title element). This is distinct from what `seo-audit.ts` provides.
- **Files to create**:
  - `src/features/seo/html-validator.ts` — `validateSemanticHTML()` function
- **Files to modify**:
  - `src/features/seo/index.ts` — Add export for `validateSemanticHTML`
- **Do NOT recreate**: seo-audit.ts, meta-generator.ts, heading-validator.ts, semantic-mapper.ts
- **References**: `src/features/seo/seo-audit.ts` (existing audit for gap analysis), `src/types/enums.ts:1-97` (SemanticTag enum)
- **Review gate**: Reviewer validates new module works, build passes

### Phase 4: Feature 4 — Tests

#### Step 4.0: Setup Testing Infrastructure
- **Agent**: Backend (sonnet)
- **Files to modify/create**:
  - `package.json` — Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` (skip `@vitejs/plugin-react` — likely unnecessary with React 19)
  - `vitest.config.ts` — Configure Vitest with `@/` path alias from `tsconfig.json`
- **References**: `package.json` (current deps), `tsconfig.json` (path alias)

#### Step 4.1: Backend — API Route Tests + Tree Utils Tests
- **Agent**: Backend (sonnet)
- **Files to create**:
  - `src/lib/__tests__/tree-utils.test.ts` — Unit tests for all 13 tree utility functions
  - `src/app/api/__tests__/projects.test.ts` — Integration tests for project CRUD endpoints
  - `src/app/api/__tests__/global-sections.test.ts` — Tests for new global section endpoints
- **References**: `src/lib/tree-utils.ts:1-206`, `src/app/api/projects/route.ts`

#### Step 4.2: Frontend — Store + Renderer + DnD Tests
- **Agent**: Frontend (sonnet)
- **Files to create**:
  - `src/store/__tests__/builder-store.test.ts` — Tests for tree mutations, selection state, undo/redo with temporal middleware
  - `src/features/renderer/__tests__/PageRenderer.test.tsx` — Tests for recursive rendering, global section injection
  - `src/features/dnd/__tests__/dnd-utils.test.ts` — Tests for `flattenTreeForDnD()`, `getDescendantIds()`, `getValidDropTargets()`
- **References**: `src/store/builder-store.ts:1-307`, `src/features/renderer/components/PageRenderer.tsx`, `src/features/dnd/dnd-utils.ts:1-117`

#### Step 4.3: AI/SEO — SEO Module Tests
- **Agent**: AI/SEO (sonnet)
- **Files to create**:
  - `src/features/seo/__tests__/audit.test.ts` — Tests for `auditSEO()`, heading hierarchy validation
  - `src/features/seo/__tests__/html-validator.test.ts` — Tests for new `validateSemanticHTML()` function
- **References**: `src/features/seo/seo-audit.ts`, `src/features/seo/html-validator.ts` (created in Phase 3)

#### Step 4.4: Reviewer — Final Validation
- **Agent**: Reviewer (opus)
- **Action**: Run full test suite (`npx vitest run`), verify all tests pass, run `npm run build` + `npm run lint`, report final status
- **Review gate**: All tests pass, build succeeds, lint clean → project complete

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Agent modifies already-existing code, breaking it | Medium | Critical | Phase 0.5 audit produces explicit "do NOT touch" list per step; reviewer checks diff against expected files |
| Shared utility (`tree-utils.ts`) change breaks multiple agents | Low | High | Architect owns `src/lib/tree-utils.ts`; other agents import but don't modify |
| Store deletion breaks build | Low | Medium | Reviewer runs build after deletion; dead code has zero imports |
| Vitest + React 19 + Next.js 16 compatibility issues | Medium | Medium | Use Vitest (not Jest); skip `@vitejs/plugin-react`; test infra step runs before any test files |
| SEO type refactoring breaks existing SEO module | Low | Medium | Architect reads existing inline types before extracting; reviewer runs build after refactor |
| Phase 0.5 audit misses a gap | Low | Medium | Reviewer validates audit completeness; review gates catch missed gaps at execution time |

## Verification Steps
1. After Phase 0: All 5 agent config files exist; store duplication resolved; build passes
2. After Phase 0.5: Delta report exists with explicit gap list per feature
3. After Step 1.1: Global section API returns 200 with seeded data from `prisma/seed.ts`
4. After Step 1.2: Canvas.tsx passes global sections to PageRenderer; builder renders header/footer
5. After Step 3.1: `src/types/seo.ts` exists; existing SEO module still works; no broken imports
6. After Step 3.2: `validateSemanticHTML()` runs on sample tree and returns structured results
7. After Step 4.4: `npx vitest run` passes, `npm run build` succeeds, `npm run lint` clean

## ADR (Architecture Decision Record)
- **Decision**: Audit-first sequential pipeline with delta-only execution and per-agent review gates
- **Drivers**: Codebase is 60%+ further along than initially assessed; redundant implementation was the highest risk; user chose sequential pipeline + dedicated reviewer
- **Alternatives considered**:
  1. Execute original plan as-is (rejected — 3 of 4 phases contained redundant work)
  2. Single agent gap-fill (rejected — contradicts user's 5-agent team choice)
  3. Parallel execution (rejected — cross-agent conflicts with shared utilities)
- **Why chosen**: Pre-execution audit eliminates redundant work while preserving user's chosen sequential pipeline + dedicated reviewer model. Delta-only scoping ensures agents build ONLY what is missing. Consensus from both Architect and Critic confirms this approach.
- **Consequences**: Faster execution (less work per phase), higher confidence (no overwriting existing code), but requires accurate audit as foundation. Ownership boundary crossings in Steps 0.6 and 3.1 are documented as pragmatic exceptions.
- **Follow-ups**: After execution, evaluate if agent configs should be refined for future sprints. Consider adding a 6th "DevOps/Testing" agent for ongoing test maintenance. Evaluate if `json-patch.ts` should be removed (dead code with zero imports).

## Consensus History
- **Iteration 1**: Planner created draft → Architect APPROVED with improvements → Critic REJECTED (3 of 4 phases redundant)
- **Iteration 2**: Planner revised to delta-only → Architect APPROVED (3 minor improvements) → Critic APPROVED with reservations (2 major findings incorporated)

## Changelog
- v1: Initial plan (rejected — redundant work)
- v2 (final): Delta-only plan incorporating:
  - Phase 0.5: Pre-execution audit (Architect recommendation)
  - Step 0.6: Store duplication resolution (Critic finding)
  - Phase 1 delta-only: API endpoints + store loading + Canvas wiring only (Critic finding)
  - Canvas.tsx:115 explicitly identified as rendering wiring site (Architect + Critic finding)
  - Phase 2 removed: Landing page already built (Critic finding)
  - Phase 3 delta-only: Type refactoring + html-validator only (Critic finding)
  - `src/lib/` shared ownership: Architect owns tree-utils/json-patch (Architect recommendation)
  - tree-utils import count corrected: 7 Frontend, 0 Backend (Architect + Critic verification)
  - DnD tests added to Phase 4 (Critic finding)
  - Step 0.6 ownership clarified: Architect decides, Frontend executes (Architect improvement)
  - Prisma `@unique` constraint documented for Step 1.1 (Critic open question)
  - `@vitejs/plugin-react` removed from Step 4.0 (Critic suggestion)
