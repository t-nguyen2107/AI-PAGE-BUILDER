# Changelog

## [2026-04-05] Unit Tests + Bug Fixes

### Added
- **Vitest test infrastructure** — `vitest.config.ts` (jsdom, globals, @/ alias)
- **14 test files, 188 tests** covering the AI pipeline:
  - `ai/output.test.ts` (20 tests) — validateOutput: null/invalid input, actions, think-tag stripping, emoji removal, ID auto-assign, unknown types
  - `ai/output-sanitizer.test.ts` (15 tests) — sanitizeAIResponse: emoji stripping, ID dedup/generation, defaults fill, type coercion, legacy nodes
  - `ai/embeddings.test.ts` (10 tests) — vectorToPg, resetEmbeddingConfig, config resolution
  - `ai/session-analyzer.test.ts` (18 tests) — isVietnamese, extractComponentTypes
  - `ai/config.test.ts` (9 tests) — resolveConfig: defaults, bounds clamping, deprecated env vars
  - `ai/component-catalog.test.ts` (5 tests) — VALID_COMPONENT_TYPES matches catalog keys
  - `ai/template-schema.test.ts` (15 tests) — validateTemplateResponse
  - `ai/utils.test.ts` (12 tests) — stripEmojis, safeJsonParse
  - `auth.test.ts` (2 tests) — requireAuth, canAccessProject placeholders
- `"test": "vitest run"` script in package.json
- `VALID_COMPONENT_TYPES` exported set in `component-catalog.ts`
- `isVietnamese` and `extractComponentTypes` exported from `session-analyzer.ts`

### Fixed
- **output.ts** — Think-tag regex now allows optional whitespace before `>` (`/<think[\s\S]*?<\/think\s*>/gi`)
- **vector-store.ts** — Raw SQL column names corrected from snake_case to quoted camelCase to match Prisma-generated schema:
  - `created_at` → `"createdAt"`
  - `project_id` → `"projectId"`
  - `times_referenced` → `"timesReferenced"`
  - `referenced_at` → `"referencedAt"`

### Commits
- `d6e47b5` feat: add unit test suite (188 tests) + UI improvements + think-tag regex fix
- `1ec40a7` fix: vector-store raw SQL — snake_case columns → quoted camelCase

---

## [2026-04-04] Code Review Fixes

### Fixed (commit `55461a0`)
- `prisma.ts` — Proxy with `Reflect.get`, typed `ExtendedClient`
- `ai/generate/route.ts` — Fixed `as any` → `as ComponentCategory`, added error logging
- `PuckEditor.tsx` — Memoized `createAIPlugin` with `useMemo`
- `context-loader.ts` / `profile-serializer.ts` — Added console.warn to swallowed catches
- `output.ts` / `template-schema.ts` — Shared `VALID_COMPONENT_TYPES` from component-catalog
- `auth.ts` — New auth placeholder file
