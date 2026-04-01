<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-31 | Updated: 2026-03-31 -->

# src/features/seo/

## Purpose
SEO audit and semantic HTML validation system. Agent 4 owns this directory. Checks heading hierarchy, meta tags, semantic HTML usage, image alt text, and HTML5 content model compliance.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | Barrel export |
| `semantic-mapper.ts` | Maps `ComponentCategory` → recommended `SemanticTag` arrays |
| `heading-validator.ts` | Validates heading hierarchy: single h1, no skipped levels, no empty headings |
| `meta-generator.ts` | Generates SEO meta from page tree: title (meta or first h1), description (meta or first p, 160 char limit), OG tags, canonical URL |
| `seo-audit.ts` | Full SEO audit scoring (0-100, pass ≥ 70). Checks: heading hierarchy, meta title/description length, semantic HTML ratio, images with alt, links with href, empty sections |
| `html-validator.ts` | HTML5 content model validation: section needs heading, article needs heading, nav needs links, no nested header/footer, aside context, single main, heading level skip |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `__tests__/` | SEO tests (~24 tests) — audit.test.ts, html-validator.test.ts |

## For AI Agents

### Working In This Directory
- Agent 4 owns this directory
- SEO audit runs on the full page tree, not individual nodes
- Score calculation is additive: start at 100, deduct for issues
- HTML validator checks content model rules, not rendering
- Meta generator extracts from tree nodes (first h1, first p)

### Testing Requirements
- ~24 tests across audit + html-validator
- Run: `npx vitest src/features/seo/__tests__/`

### Common Patterns
- `SEOAuditResult` = score + issues array + pass/fail boolean
- Issues categorized by severity (error, warning, info) and category (heading, meta, semantic, accessibility)
- `HeadingValidator` tracks seen heading levels to detect skips
- `SemanticMapper` provides category-specific tag recommendations
