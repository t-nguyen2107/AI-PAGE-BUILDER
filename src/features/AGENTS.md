<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-31 | Updated: 2026-03-31 -->

# src/features/

## Purpose
Feature modules organized by domain. Each feature is self-contained with its own components, hooks, utils, and tests. Barrel-exported via `index.ts`.

## Subdirectories
| Directory | Purpose | Agent |
|-----------|---------|-------|
| `ai/` | AI generation — prompt parsing, JSON diff, 8 template generators | Agent 4 |
| `dnd/` | Drag & drop — DndProvider, tree flattening, circular move prevention | Agent 2 |
| `inspector/` | Property inspector — 5 tabs (Layout, Spacing, Typography, Content, SEO) | Agent 2 |
| `renderer/` | DOM tree renderer — 7 renderer components, NodeWrapper, semantic hooks | Agent 2 |
| `seo/` | SEO audit — heading validator, meta generator, HTML validator | Agent 4 |

## For AI Agents

### Working In This Directory
- Each feature directory has its own `index.ts` barrel export
- Cross-feature imports are allowed but respect agent ownership
- Test files live in `__tests__/` within each feature
- Follow the agent ownership rules in `CLAUDE.md`

### Common Patterns
- Features export a public API via `index.ts`
- Internal implementation details stay in subdirectories
- Tests use Vitest with jsdom environment
