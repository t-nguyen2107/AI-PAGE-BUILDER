# Agent Team Implementation Plan

## Requirements Summary
Build 5 Claude Code agent config files (.claude/agents/) codifying the 4-agent builder system + 1 dedicated reviewer, then execute 4 remaining features (global sections, landing page, SEO module, tests) via sequential pipeline with review gates.

## RALPLAN-DR Summary (Short Mode)

### Principles
1. **Ownership sovereignty**: Each agent exclusively modifies files in its owned directories; cross-directory changes require the owning agent
2. **Contract-first development**: Architect defines/validates types before any implementation agent writes code
3. **Review gate enforcement**: No agent starts until reviewer approves previous agent's output (build + lint + contract check)
4. **Incremental app health**: App must compile, pass lint, and load after every agent's contribution
5. **Dependency-aware ordering**: Features execute in dependency order (global sections → landing page → SEO → tests)

### Decision Drivers
1. **Cross-cutting feature complexity** — Global section inheritance touches types, renderer, API, and SEO simultaneously, requiring careful sequential orchestration
2. **Zero-test baseline** — No tests exist, so the test feature must cover all layers without introducing regressions
3. **Agent config fidelity** — Configs must be detailed enough to enforce boundaries autonomously during execution

### Viable Options

**Option A: Full Sequential Pipeline with Per-Feature Review Gates** (Recommended)
- Each feature cycles through Architect → Reviewer → Frontend → Reviewer → Backend → Reviewer → AI/SEO → Reviewer
- Pros: Maximum safety, clear accountability, catches cross-agent issues early
- Cons: Slower (4 review gates per feature), reviewer invoked ~14 times total

**Option B: Batch Agents per Feature (skip Reviewer for trivial steps)**
- Same pipeline but reviewer only invoked at feature boundaries (not between every agent)
- Pros: Faster execution (~4 reviews total), less overhead
- Cons: Misses intra-feature issues (e.g., Frontend breaking Architect's contracts before Backend notices)

**Invalidation rationale for Option B:** The user explicitly chose "dedicated reviewer agent" and "working app after each agent". Skipping intra-feature reviews violates both constraints. The cross-cutting nature of global sections makes intra-feature review critical.

---

## Acceptance Criteria (Testable)
- [ ] 5 `.claude/agents/` markdown config files exist with: system prompt, allowed tools list, file path restrictions, model routing
- [ ] `src/types/` contains new interfaces for global section merge behavior (`GlobalSectionMergeConfig`, `InheritedSection`)
- [ ] `src/features/renderer/components/PageRenderer.tsx` merges global sections (header/footer) into page render tree
- [ ] `src/app/api/projects/[projectId]/global-sections/route.ts` provides GET/PUT for global sections
- [ ] `src/app/page.tsx` is no longer Next.js boilerplate — shows project list/dashboard
- [ ] `src/features/seo/` directory exists with semantic audit module and meta tag utilities
- [ ] `npm run build` succeeds after each agent's contribution
- [ ] `npm run lint` passes after each agent's contribution
- [ ] Test files exist in `src/__tests__/` or `src/**/*.test.ts(x)` covering tree-utils, API routes, renderer, and store

## Implementation Steps

### Phase 0: Agent Config Files (Foundation)

#### Step 0.1: Create `.claude/agents/architect.md`
- **File**: `.claude/agents/architect.md`
- **Content**: Agent 1 config with:
  - System prompt from `USER_CONTEXT/agents_req.md` (Agent 1 definition)
  - Owned paths: `src/types/`, `src/schemas/`, `prisma/schema.prisma`
  - Allowed tools: Read, Edit, Write, Bash (prisma commands only), Grep, Glob
  - Model: opus
  - Constraints: Never modify `src/store/`, `src/features/`, `src/app/api/`, `src/app/builder/`
- **References**: `USER_CONTEXT/agents_req.md:1-7`, `CLAUDE.md` agent rules

#### Step 0.2: Create `.claude/agents/frontend.md`
- **File**: `.claude/agents/frontend.md`
- **Content**: Agent 2 config with:
  - System prompt from `USER_CONTEXT/agents_req.md` (Agent 2 definition)
  - Owned paths: `src/store/`, `src/features/renderer/`, `src/features/dnd/`, `src/features/inspector/`, `src/app/builder/`, `src/components/`
  - Allowed tools: Read, Edit, Write, Bash (npm run dev/build), Grep, Glob
  - Model: sonnet
  - Constraints: Never modify `src/types/`, `src/schemas/`, `src/app/api/`, `prisma/`
- **References**: `USER_CONTEXT/agents_req.md:8-13`

#### Step 0.3: Create `.claude/agents/backend.md`
- **File**: `.claude/agents/backend.md`
- **Content**: Agent 3 config with:
  - System prompt from `USER_CONTEXT/agents_req.md` (Agent 3 definition)
  - Owned paths: `src/app/api/`, `src/lib/prisma.ts`, `src/lib/api-client.ts`, `src/lib/tree-utils.ts`, `src/lib/json-patch.ts`
  - Allowed tools: Read, Edit, Write, Bash (prisma commands), Grep, Glob
  - Model: sonnet
  - Constraints: Never modify `src/types/`, `src/store/`, `src/features/`, `src/app/builder/`
- **References**: `USER_CONTEXT/agents_req.md:15-20`

#### Step 0.4: Create `.claude/agents/ai-seo.md`
- **File**: `.claude/agents/ai-seo.md`
- **Content**: Agent 4 config with:
  - System prompt from `USER_CONTEXT/agents_req.md` (Agent 4 definition)
  - Owned paths: `src/features/ai/`, `src/features/seo/`
  - Allowed tools: Read, Edit, Write, Bash, Grep, Glob
  - Model: sonnet
  - Constraints: Never modify `src/store/`, `src/app/api/`, `src/app/builder/`
- **References**: `USER_CONTEXT/agents_req.md:22-27`

#### Step 0.5: Create `.claude/agents/reviewer.md`
- **File**: `.claude/agents/reviewer.md`
- **Content**: Agent 5 config with:
  - System prompt: "You are the Quality Reviewer for the AI Website Builder. Your role is to validate each builder agent's output before the next agent begins. You check: 1) Type contract integrity (no broken imports), 2) Build health (npm run build succeeds), 3) Lint compliance (npm run lint passes), 4) Ownership boundary violations. You NEVER modify any source files — you only read, run build/lint, and report pass/fail with specific issues."
  - Owned paths: None (read-only access to all)
  - Allowed tools: Read, Bash (build/lint/test only), Grep, Glob
  - Model: opus
  - Constraints: NEVER use Edit or Write tools on source files
- **References**: Derived from deep-interview spec (reviewer role)

### Phase 1: Feature 1 — Global Section Inheritance

#### Step 1.1: Architect — Define Global Section Merge Types
- **Agent**: Architect (opus)
- **Files to modify/create**:
  - `src/types/dom-tree.ts` — Add `InheritedSection` interface with fields: `sourceSectionId`, `sectionType`, `mergeBehavior` ('append' | 'prepend' | 'replace')
  - `src/types/project.ts` — Add `GlobalSectionConfig` interface with `headerSectionId`, `footerSectionId`, `customInheritedSections`
  - `src/schemas/dom-node.schema.ts` — Add Zod schema for `InheritedSection`
- **References**: `src/types/dom-tree.ts:1-191` (existing DOM tree types), `prisma/schema.prisma` GlobalSection model
- **Review gate**: Reviewer validates new types compile and don't break existing imports

#### Step 1.2: Frontend — Implement Global Section Merge in Renderer
- **Agent**: Frontend (sonnet)
- **Files to modify/create**:
  - `src/features/renderer/components/PageRenderer.tsx` — Add `mergeGlobalSections()` function that reads global sections from store and merges them into page tree before rendering (header prepended, footer appended)
  - `src/store/slices/tree-slice.ts` — Add `setGlobalSections()` action and `mergedTree` computed selector
  - `src/app/builder/[projectId]/layout.tsx` — Load global sections into store alongside page data
- **References**: `src/features/renderer/components/PageRenderer.tsx` (current renders children only), `src/store/builder-store.ts:1-307` (store structure), `src/store/slices/tree-slice.ts:1-143`
- **Review gate**: Reviewer validates renderer renders header/footer, no broken imports

#### Step 1.3: Backend — Global Section API Endpoints
- **Agent**: Backend (sonnet)
- **Files to modify/create**:
  - `src/app/api/projects/[projectId]/global-sections/route.ts` — GET (list all global sections for project), PUT (update global section treeData)
  - `src/app/api/projects/[projectId]/global-sections/[sectionId]/route.ts` — GET, PUT, DELETE single global section
  - `src/lib/api-client.ts` — Add `getGlobalSections()`, `updateGlobalSection()` methods
- **References**: `src/app/api/projects/[projectId]/styleguide/route.ts` (similar pattern for styleguide CRUD), `src/lib/api-client.ts:1-91` (existing API client)
- **Review gate**: Reviewer validates API returns correct data, build passes

#### Step 1.4: AI/SEO — Semantic HTML for Global Sections
- **Agent**: AI/SEO (sonnet)
- **Files to modify/create**:
  - `src/features/renderer/hooks/use-semantic-tag.ts` — Ensure global section types map to correct semantic tags (`<header>`, `<footer>`, `<nav>`)
  - `src/features/ai/generate/route.ts` — Update system prompt to handle global section injection in AI-generated pages
- **References**: `src/features/renderer/hooks/use-semantic-tag.ts` (existing semantic tag resolution), `src/app/api/ai/generate/route.ts:1-392`
- **Review gate**: Reviewer validates semantic output, full feature 1 complete

### Phase 2: Feature 2 — Landing Page

#### Step 2.1: Frontend — Landing Page UI
- **Agent**: Frontend (sonnet)
- **Files to modify/create**:
  - `src/app/page.tsx` — Replace Next.js boilerplate with project list/dashboard: fetch projects via `apiClient.getProjects()`, display as card grid with "Create Project" button, link each card to `/builder/{projectId}`
  - `src/app/globals.css` — Ensure landing page styles are compatible
- **References**: `src/app/page.tsx` (current is default boilerplate), `src/lib/api-client.ts` has `getProjects()` and `createProject()` methods
- **Review gate**: Reviewer validates landing page renders project list, build passes

#### Step 2.2: Backend — Landing Page Data (if needed)
- **Agent**: Backend (sonnet)
- **Files to modify**:
  - `src/app/api/projects/route.ts` — Verify GET /projects returns all needed fields for card display (currently returns project list, may need to include page count or thumbnail)
- **References**: `src/app/api/projects/route.ts` (existing GET handler)
- **Review gate**: Reviewer validates API supports landing page, feature 2 complete

### Phase 3: Feature 3 — SEO Module

#### Step 3.1: Architect — SEO Types
- **Agent**: Architect (opus)
- **Files to create**:
  - `src/types/seo.ts` — `SEOAuditResult`, `SEOIssue` (severity, message, nodePath, suggestion), `MetaTagConfig`
  - `src/schemas/seo.schema.ts` — Zod schemas for SEO types
- **References**: `src/types/` existing type structure, `src/types/enums.ts` (SemanticTag enum)
- **Review gate**: Reviewer validates new types

#### Step 3.2: AI/SEO — SEO Audit Module
- **Agent**: AI/SEO (sonnet)
- **Files to create**:
  - `src/features/seo/index.ts` — Barrel export
  - `src/features/seo/audit.ts` — `auditSEO(tree: PageNode): SEOAuditResult` — validates heading hierarchy, semantic tag usage, alt text presence, meta tag completeness
  - `src/features/seo/meta-tags.ts` — `generateMetaTags(tree: PageNode): MetaTagConfig` — extracts title, description, OG tags from page tree
  - `src/features/seo/html-validator.ts` — `validateSemanticHTML(node: DOMNode): SEOIssue[]` — checks each node against semantic HTML5 spec
- **References**: `src/types/dom-tree.ts` (node hierarchy), `src/types/enums.ts:1-97` (SemanticTag enum)
- **Review gate**: Reviewer validates SEO module runs, feature 3 complete

### Phase 4: Feature 4 — Tests

#### Step 4.0: Setup Testing Infrastructure
- **Agent**: Backend (sonnet)
- **Files to modify/create**:
  - `package.json` — Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
  - `vitest.config.ts` — Configure Vitest with path aliases
- **References**: `package.json` (current deps), `tsconfig.json` (path alias config)

#### Step 4.1: Backend — API Route Tests + Tree Utils Tests
- **Agent**: Backend (sonnet)
- **Files to create**:
  - `src/lib/__tests__/tree-utils.test.ts` — Unit tests for all 13 tree utility functions
  - `src/lib/__tests__/json-patch.test.ts` — Unit tests for RFC 6902 operations
  - `src/app/api/__tests__/projects.test.ts` — Integration tests for project CRUD endpoints
- **References**: `src/lib/tree-utils.ts:1-205` (13 functions), `src/lib/json-patch.ts:1-106`

#### Step 4.2: Frontend — Store + Renderer Tests
- **Agent**: Frontend (sonnet)
- **Files to create**:
  - `src/store/__tests__/builder-store.test.ts` — Tests for all store slices (tree, selection, styleguide, UI, drag)
  - `src/features/renderer/__tests__/PageRenderer.test.tsx` — Tests for recursive rendering with global sections
- **References**: `src/store/builder-store.ts:1-307`, `src/features/renderer/components/PageRenderer.tsx`

#### Step 4.3: AI/SEO — SEO Module Tests
- **Agent**: AI/SEO (sonnet)
- **Files to create**:
  - `src/features/seo/__tests__/audit.test.ts` — Tests for SEO audit, heading hierarchy validation, semantic tag checks
  - `src/features/seo/__tests__/meta-tags.test.ts` — Tests for meta tag generation
- **References**: `src/features/seo/audit.ts`, `src/features/seo/meta-tags.ts` (created in Phase 3)

#### Step 4.4: Reviewer — Final Validation
- **Agent**: Reviewer (opus)
- **Action**: Run full test suite (`npx vitest run`), verify coverage, run build + lint, report final status
- **Review gate**: All tests pass, build succeeds, lint clean → project complete

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Cross-agent type breakage (Architect changes break Frontend imports) | Medium | High | Reviewer runs `npm run build` after Architect step; Architect reads existing imports before modifying |
| Global section merge logic is complex (tree merging edge cases) | High | Medium | Start with simple prepend/append; defer advanced merge strategies. Use existing tree-utils functions (`findNodeById`, `addChildNode`) |
| Testing setup introduces dependency conflicts with Next.js 16 + React 19 | Medium | Medium | Use Vitest (not Jest) which has better ESM/native module support. Pin React 19 compatible testing-library versions |
| SEO audit produces false positives on valid HTML structures | Low | Low | Start with configurable severity levels; let users dismiss warnings. Only block on critical issues |
| Sequential pipeline is slow (14+ review gates) | High | Low | Accepted trade-off per user's choice. Reviewer uses quick checks (build + lint + import verification) |

## Verification Steps
1. After Phase 0: All 5 agent config files exist and are valid markdown with required sections
2. After Step 1.1: `npx tsc --noEmit` passes with new types
3. After Step 1.2: `npm run build` passes, renderer shows header/footer
4. After Step 1.3: Global section API returns 200 with correct data
5. After Step 2.1: `src/app/page.tsx` loads project list, cards link to builder
6. After Step 3.2: `auditSEO()` runs on sample page tree and returns structured results
7. After Step 4.4: `npx vitest run` passes, `npm run build` succeeds, `npm run lint` clean

## ADR (Decision Record)
- **Decision**: Sequential pipeline with per-agent review gates
- **Drivers**: Cross-cutting features (global sections), zero-test baseline, user preference for safety
- **Alternatives considered**: Parallel execution (rejected — cross-agent conflicts), batch review (rejected — user explicitly chose dedicated reviewer)
- **Why chosen**: User explicitly selected sequential pipeline + dedicated reviewer. Dependency-first ordering ensures each feature builds on a validated foundation
- **Consequences**: Slower execution (~14 review cycles) but higher confidence in each step. Agent configs serve as documentation of ownership boundaries
- **Follow-ups**: After initial execution, evaluate if review gates can be relaxed for independent features. Consider adding a testing agent as a 6th role for future sprints
