# AI Website Builder - Pre-Execution Delta Report

**Generated:** 2026-03-30  
**Auditor:** Architect (oh-my-claudecode)  
**Scope:** Codebase audit of existing implementation vs. CLAUDE.md specification

---

## 1. Global Section Inheritance

### EXISTS

| Component | File | Status |
|-----------|------|--------|
| Prisma model | prisma/schema.prisma:69-83 | GlobalSection model with projectId, sectionType, sectionName, treeData |
| TypeScript type | src/types/project.ts:29-37 | GlobalSection interface fully defined |
| Type export | src/types/index.ts:36 | GlobalSection exported from barrel |
| DOM tree contract | src/types/dom-tree.ts:97 | PageNode.globalSectionIds: string[] field present |
| Zod schema | src/schemas/dom-node.schema.ts:129 | globalSectionIds: z.array(z.string()) validated |
| PageRenderer props | PageRenderer.tsx:14-17 | globalHeaderSections and globalFooterSections props declared |
| PageRenderer merge logic | PageRenderer.tsx:49-76 | Dual-mode: explicit props OR auto-separation by SemanticTag |
| Seed data | prisma/seed.ts:69-158 | Header and footer global sections seeded with full SectionNode trees |
| Seed wiring | prisma/seed.ts:235 | globalSectionIds wired into page tree |

### MISSING

| Gap | Description | Severity |
|-----|-------------|----------|
| Global Section API CRUD | No global-sections endpoint exists. Cannot list, create, update, or delete global sections via API. | **CRITICAL** |
| api-client methods | api-client.ts has no global section methods. | **CRITICAL** |
| Store global section state | builder-store.ts has no slice for global sections. No loading state or actions. | **CRITICAL** |
| Canvas wiring | Canvas.tsx:115 calls PageRenderer without passing global section props. Merge logic is dead code at runtime. | **CRITICAL** |
| Project creation omits globals | projects/route.ts POST creates project but NOT default global sections. Only seed script does. | **MAJOR** |

### Summary
The data contract and rendering logic for global sections are fully implemented at the type/schema/renderer level. However, the entire data pipeline from API through store to Canvas is disconnected.

---

## 2. SEO Module

### EXISTS

| File | Contents |
|------|----------|
| semantic-mapper.ts | CATEGORY_SEMANTIC_MAP maps ComponentCategory to SemanticTag. |
| heading-validator.ts | validateHeadingHierarchy() - single h1, no skipped levels, no empty headings. |
| meta-generator.ts | generateMetaFromPage() - extracts h1, first paragraph, first image. Generates SEOMeta with OG. |
| seo-audit.ts | auditSEO() - full audit scoring 0-100. Checks headings, meta, semantic tags, alt text, links, empty sections. |
| index.ts | Clean barrel export of all public types and functions. |

### MISSING

| Gap | Description | Severity |
|-----|-------------|----------|
| Inline types | HeadingIssue, SEOMeta, SEOIssue, SEOAuditResult defined inline rather than src/types/. Breaks Agent 1 convention. | **MINOR** |
| No SEO UI | No inspector panel or audit results display. | **MAJOR** |
| No Next.js metadata export | No generateMetadata() integration. generateMetaFromPage() is orphaned. | **MAJOR** |
| No SEO API endpoint | No /api/.../seo route. | **MINOR** |

### Summary
SEO module is functionally complete at pure-logic level. Gap is integration.

---

## 3. Landing Page

### EXISTS
- src/app/page.tsx - Full dashboard (lines 1-144).
- Fetches projects from /api/projects, displays grid with cards.
- Create project form with inline input + button.
- Proper loading, empty state, error handling.

### MISSING
- None. Real functional dashboard, not Next.js boilerplate.

### Severity: NONE (complete)

---

## 4. Store Architecture

### EXISTS
- src/store/builder-store.ts - Single canonical store file (308 lines).
- src/store/index.ts - Barrel re-export.
- Slices: TreeSlice, SelectionSlice, StyleguideSlice, UISlice, DragSlice.
- Middleware: zustand/devtools + zundo/temporal.
- useHistory() helper.

### MISSING

| Gap | Description | Severity |
|-----|-------------|----------|
| No slices/ directory | All slices in one monolithic file. | **MINOR** |
| No immer middleware | immer is a dependency but NOT used. All mutations use structuredClone. | **MAJOR** |
| No useShallow | CLAUDE.md specifies useShallow but no file uses it. | **MINOR** |

### Summary
Store is functionally complete. Missing immer middleware and slice separation.

---

## 5. Shared Utilities

### EXISTS
- src/lib/tree-utils.ts (206 lines) - Full tree manipulation.
- src/lib/json-patch.ts (107 lines) - Full RFC 6902 JSON Patch.
- src/lib/id.ts, src/lib/prisma.ts.

### MISSING

| Gap | Description | Severity |
|-----|-------------|----------|
| json-patch unused | applyPatches() never imported outside json-patch.ts. Dead code. | **MAJOR** |

---

## 6. Testing

### EXISTS
- No test framework in package.json.
- No test config files.
- No test files in src/.

### MISSING
- All testing infrastructure. No runner, no files, no config, no scripts. | **CRITICAL**

---

## Aggregate Severity Summary

| Area | Critical | Major | Minor | Complete |
|------|----------|-------|-------|----------|
| 1. Global Section Inheritance | 4 | 1 | 0 | Types/schema/renderer logic done |
| 2. SEO Module | 0 | 2 | 2 | Pure logic complete |
| 3. Landing Page | 0 | 0 | 0 | Fully implemented |
| 4. Store Architecture | 0 | 1 | 2 | Functional, missing immer |
| 5. Shared Utilities | 0 | 1 | 0 | json-patch dead code |
| 6. Testing | 1 | 0 | 0 | Nothing exists |
| TOTAL | 5 | 5 | 4 | |

---

## Priority Recommendations

### P0 - Critical
1. Create Global Sections API endpoint with full CRUD + api-client methods.
2. Add global section slice to builder store.
3. Wire Canvas.tsx to pass global sections to PageRenderer.
4. Add global section creation to project POST.
5. Set up test infrastructure (vitest + testing-library).

### P1 - Major
6. Integrate immer middleware into builder store.
7. Wire json-patch into revision restore.
8. Add SEO audit UI panel.
9. Create generateMetadata() integration.

### P2 - Minor
10. Move SEO inline types to src/types/.
11. Split store into slice files under src/store/slices/.
12. Adopt useShallow for object selectors.

---

## References
- prisma/schema.prisma:69-83 - GlobalSection model
- src/types/project.ts:29-37 - GlobalSection interface
- src/types/dom-tree.ts:97 - PageNode.globalSectionIds
- PageRenderer.tsx:12-18 - Props with global section support
- PageRenderer.tsx:49-76 - Merge logic
- Canvas.tsx:115 - Dead props
- builder-store.ts - Store (308 lines, no global slice, no immer)
- api-client.ts - No global section methods
- json-patch.ts - Dead code
- prisma/seed.ts:69-158 - Seeds global sections
- projects/route.ts:196-240 - Missing global section creation
- features/seo/ - All 4 SEO files
- page.tsx - Full dashboard
- package.json - No test deps, immer unused
