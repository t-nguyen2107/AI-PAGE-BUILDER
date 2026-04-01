# Deep Interview Spec: 5-Agent Builder Team

## Metadata
- Interview ID: agent-team-2026-0330
- Rounds: 6
- Final Ambiguity Score: 15%
- Type: brownfield
- Generated: 2026-03-30
- Threshold: 20%
- Status: PASSED

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.92 | 0.35 | 0.322 |
| Constraint Clarity | 0.82 | 0.25 | 0.205 |
| Success Criteria | 0.80 | 0.25 | 0.200 |
| Context Clarity | 0.85 | 0.15 | 0.128 |
| **Total Clarity** | | | **0.855** |
| **Ambiguity** | | | **0.145 (15%)** |

## Goal
Build a 5-agent Claude Code team (4 builder agents + 1 dedicated reviewer) that executes remaining features of the AI Website Builder in a sequential pipeline with review gates between each agent. Each agent is codified as a full `.claude/agents/` config file with system prompts, tool restrictions, file path ownership, and model routing. The team then executes 4 remaining features in dependency order, with a dedicated reviewer agent validating output before the next builder starts.

## Constraints
- **Sequential pipeline**: Agents execute one at a time in order: Architect → Frontend → Backend → AI/SEO, with Reviewer gates between each
- **Full agent configs**: Each `.claude/agents/` file includes system prompt, allowed tools, file path restrictions, and model routing
- **Ownership boundaries** (from agents_req.md):
  - Agent 1 (Architect): `src/types/`, `src/schemas/`, `prisma/schema.prisma`
  - Agent 2 (Frontend): `src/store/`, `src/features/renderer/`, `src/features/dnd/`, `src/features/inspector/`, `src/app/builder/`
  - Agent 3 (Backend): `src/app/api/`, `src/lib/prisma.ts`, `src/lib/api-client.ts`
  - Agent 4 (AI/SEO): `src/features/ai/`, `src/features/seo/`
- **Review gate**: Dedicated 5th agent (Reviewer) validates each builder's output — checks contracts, code quality, and app health — before the next builder starts
- **App must work after each agent**: compiles, passes lint, loads correctly
- **Feature execution order** (dependencies-first):
  1. Global section inheritance (cross-cutting: types → renderer → API → SEO)
  2. Landing page (needs global header/footer)
  3. SEO module (needs stable renderer)
  4. Tests (needs everything else done)

## Non-Goals
- Reusable agent configs for future sprints beyond this scope
- Vector search / embedding integration (placeholder only)
- Image upload endpoint
- Authentication system

## Acceptance Criteria
- [ ] 5 `.claude/agents/` config files exist with full system prompts, tool lists, file path restrictions, and model routing
- [ ] Agent 1 (Architect) defines new types/schemas for global sections and SEO
- [ ] Agent 2 (Frontend) implements global section merge in renderer + landing page UI
- [ ] Agent 3 (Backend) adds global section API routes + landing page data endpoints
- [ ] Agent 4 (AI/SEO) builds SEO audit module with semantic HTML validation
- [ ] Dedicated Reviewer agent validates each builder's output before next starts
- [ ] App compiles, passes lint, and loads correctly after each agent's contribution
- [ ] All 4 gap features are functional: global section inheritance, landing page, SEO module, tests

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| "Strong agent team" means execution team only | Asked to clarify: configs only, execution team only, or both? | User wants both: codified configs AND execution team |
| Agents should run in parallel for speed | Asked about interaction model given cross-cutting features | User chose sequential pipeline for safety |
| Existing 4 agents are sufficient | Asked if system should be redesigned | User wants full config with tool restrictions, including a 5th reviewer agent |
| Review is implicit (build-on-previous) | Asked how agent-to-agent review should work | User chose dedicated reviewer agent as separate role |
| Feature order doesn't matter | Asked about execution priority given dependencies | User confirmed dependencies-first order |

## Technical Context

### Brownfield Codebase State
- **Steps 1-4 fully implemented**: Types, schemas, Prisma, store, renderer, DnD, inspector, API routes, AI generation
- **Step 5 partially done**: AI action handlers exist but SEO module missing
- **Zero tests**: No test files anywhere in the project

### Existing Agent Config
- `.claude/AGENTS/AGENTS.md` — single rule ("read Next.js docs before coding")
- `.agents/skills/` — Prisma skill references (auto-generated)
- `USER_CONTEXT/agents_req.md` — 4-agent system prompts (not yet in config format)

### Key Dependencies
- Next.js 16.2.1, React 19.2.4, Zustand 5.0.12, Prisma 7.6.0
- @dnd-kit/core 6.3.1, Zod 4.3.6, Tailwind CSS 4.x
- No testing libraries installed yet (needs vitest/jest + testing-library)

### Database Models (existing)
- Project, Page, Styleguide, GlobalSection, Revision, UserLibrary, AIPromptLog
- GlobalSection has `sectionType` + `treeData` fields but no runtime merge logic

## Ontology (Key Entities)

| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| Agent Config | core domain | systemPrompt, allowedTools, filePathRestrictions, modelRouting | Defines each Builder Agent and Reviewer Agent |
| Builder Agent | core domain | role, ownedDirectories, tools, model | Architect, Frontend, Backend, or AI/SEO |
| Reviewer Agent | core domain | reviewScope, tools, model | Validates Builder Agent output |
| Sequential Pipeline | supporting | executionOrder, reviewGates | Orchestrates Builder Agents in order |
| Feature Execution Order | supporting | priority, dependencies | Dependencies-first: GlobalSections → LandingPage → SEO → Tests |
| Agent Ownership Boundary | supporting | agent, directories, filePatterns | Maps Builder Agent to owned directories |
| Global Section Inheritance | feature | mergeLogic, runtimeBehavior | Feature 1 — cross-cutting across all agents |
| Landing Page | feature | projectList, dashboard | Feature 2 — depends on global sections |
| SEO Module | feature | semanticAudit, metaTagInjection | Feature 3 — depends on stable renderer |
| Test Suite | feature | unitTests, integrationTests | Feature 4 — depends on all features |
| Tool Restriction | supporting | agent, allowedTools, deniedTools | Per-agent tool access control |

## Ontology Convergence

| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|----------------|
| 1 | 5 | 5 | - | - | N/A |
| 2 | 6 | 1 | 0 | 5 | 83% |
| 3 | 8 | 2 | 0 | 6 | 75% |
| 4 | 9 | 1 | 1 | 7 | 78% |
| 5 | 10 | 1 | 1 | 8 | 80% |
| 6 | 11 | 1 | 0 | 10 | 91% |

## Agent Team Design

### 5 Agents

| # | Agent | Role | Model | Owns | Tools |
|---|-------|------|-------|------|-------|
| 1 | Architect | Data contracts, types, schemas, Prisma | opus | `src/types/`, `src/schemas/`, `prisma/` | Read, Edit, Write, Bash (prisma), Grep, Glob |
| 2 | Frontend | Zustand store, renderer, DnD, inspector, builder UI | sonnet | `src/store/`, `src/features/`, `src/app/builder/`, `src/components/` | Read, Edit, Write, Bash (npm), Grep, Glob |
| 3 | Backend | API routes, database persistence, shared utils | sonnet | `src/app/api/`, `src/lib/` | Read, Edit, Write, Bash (prisma), Grep, Glob |
| 4 | AI/SEO | AI generation, semantic HTML, SEO audit | sonnet | `src/features/ai/`, `src/features/seo/` | Read, Edit, Write, Bash, Grep, Glob |
| 5 | Reviewer | Validate output, check contracts, verify app health | opus | All (read-only for review) | Read, Bash (build/lint), Grep, Glob |

### Execution Pipeline

```
Feature 1: Global Section Inheritance
  Architect (types + schema changes)
    → Reviewer (validate contracts)
    → Frontend (renderer merge logic)
    → Reviewer (validate renderer)
    → Backend (API endpoints)
    → Reviewer (validate API)
    → AI/SEO (semantic HTML for global sections)
    → Reviewer (final validation)

Feature 2: Landing Page
  Architect (page types if needed)
    → Reviewer
    → Frontend (landing page UI)
    → Reviewer
    → Backend (project list API)
    → Reviewer

Feature 3: SEO Module
  Architect (SEO types)
    → Reviewer
    → AI/SEO (SEO audit + meta tags)
    → Reviewer
    → Frontend (SEO UI if needed)
    → Reviewer

Feature 4: Tests
  All agents add tests for their owned areas
    → Reviewer (verify coverage + all pass)
```

## Interview Transcript
<details>
<summary>Full Q&A (6 rounds)</summary>

### Round 1
**Q:** What does 'strong agent team' mean to you in this context?
**A:** Both configs + execution team — codify the 4-agent system as .claude/agents/ config files, then build an OMC execution team that respects those agent boundaries to complete remaining features
**Ambiguity:** 56% (Goal: 0.60, Constraints: 0.20, Criteria: 0.20, Context: 0.85)

### Round 2
**Q:** How should the agents interact when executing remaining work?
**A:** Sequential pipeline — agents run one at a time, each completes before the next starts
**Ambiguity:** 48% (Goal: 0.65, Constraints: 0.45, Criteria: 0.20, Context: 0.85)

### Round 3
**Q:** What would make you say 'yes, this is exactly what I wanted'? (multi-select)
**A:** Agent-to-agent review, All 4 gap features working, Working app after each agent (did NOT select reusable configs)
**Ambiguity:** 32% (Goal: 0.80, Constraints: 0.50, Criteria: 0.60, Context: 0.85)

### Round 4
**Q:** How detailed should the .claude/agents/ config files be?
**A:** Full config with tool restrictions — system prompts, allowed tools, file path restrictions, model routing, and input/output contracts
**Ambiguity:** 26% (Goal: 0.85, Constraints: 0.65, Criteria: 0.60, Context: 0.85)

### Round 5
**Q:** How should agent-to-agent review work concretely?
**A:** Dedicated reviewer agent — a separate 5th agent reviews code quality, checks contracts, and approves or rejects before the next agent starts
**Ambiguity:** 20% (Goal: 0.88, Constraints: 0.70, Criteria: 0.75, Context: 0.85)

### Round 6
**Q:** Which execution order should the agent pipeline follow?
**A:** Dependencies-first: 1) Global sections, 2) Landing page, 3) SEO module, 4) Tests
**Ambiguity:** 15% (Goal: 0.92, Constraints: 0.82, Criteria: 0.80, Context: 0.85)

</details>
