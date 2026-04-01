<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-31 | Updated: 2026-03-31 -->

# src/schemas/

## Purpose
Zod 4 validation schemas for runtime input validation. Agent 1 owns this directory. Schemas mirror the TypeScript types in `src/types/` and provide runtime validation guards.

## Key Files
| File | Description |
|------|-------------|
| `dom-node.schema.ts` | Recursive Zod schema for full DOM tree hierarchy using `z.lazy` for circular refs |
| `ai-diff.schema.ts` | Zod schema for `AIDiff` and `AIGenerationResponse` validation |
| `seo.schema.ts` | Zod schemas for `SEOIssue`, `SEOAuditResult`, `SEOMeta`, `HeadingIssue` |
| `styleguide.schema.ts` | Zod schemas for `ColorPalette`, `TypographySystem`, `SpacingScale`, `ComponentVariant`, `Styleguide` |

## For AI Agents

### Working In This Directory
- Agent 1 (Architect) owns all changes here
- Schemas must stay in sync with `src/types/` interfaces
- Use `z.lazy()` for recursive/circular references (e.g., node children)
- Validate all external input before injecting into store or database

### Common Patterns
- Each schema file mirrors its corresponding type file
- `baseNodeSchema` defines shared fields, specific node schemas extend it
- Runtime validation: `schema.parse(data)` or `schema.safeParse(data)`
