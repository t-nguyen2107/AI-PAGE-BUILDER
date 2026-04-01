<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-31 | Updated: 2026-03-31 -->

# src/types/

## Purpose
TypeScript interfaces and enums defining all data contracts. Agent 1 (Architect) is the guardian — every type change must be reviewed by Agent 1. These types are the immutable contracts that all agents must follow.

## Key Files
| File | Description |
|------|-------------|
| `enums.ts` | 8 enums: `NodeType` (7 values), `SemanticTag` (26 HTML tags), `DisplayType`, `ComponentCategory` (11 categories), `AIAction` (7 actions), `FlexDirection`, `TextAlign`, `BackgroundSize`, `BackgroundRepeat` |
| `dom-tree.ts` | 6-level DOM hierarchy: `PageNode → SectionNode → ContainerNode → ComponentNode → ElementNode → ItemNode`. Plus `LayoutProperties`, `TypographyProperties`, `BackgroundProperties`, `NodeMeta`. Union types: `DOMNode`, `ParentNode`, `ContentNode` |
| `ai.ts` | AI types: `AIGenerationRequest/Response`, `AIDiff`, `OllamaMessage/ChatRequest/ChatResponse`, `ParsedIntent` |
| `project.ts` | Project entities: `Project`, `Page`, `GlobalSection`, `CreateProjectInput`, `CreatePageInput` |
| `styleguide.ts` | Design system: `ColorPalette` (11 colors), `TypographySystem`, `SpacingScale`, `ComponentVariant`, `Styleguide` |
| `revision.ts` | Version control: `Revision`, `RevisionDiff`, `JsonPatch` (RFC 6901) |
| `library.ts` | Component library: `LibraryNodeData`, `LibraryItem`, `SaveToLibraryInput` |
| `seo.ts` | SEO audit: `SEOIssueSeverity`, `SEOIssueCategory`, `SEOIssue`, `SEOAuditResult`, `SEOMeta`, `HeadingIssue` |
| `api.ts` | API response types: `ApiResponse<T>`, `PaginatedResponse<T>`, route params |
| `index.ts` | Barrel re-export of all types |

## For AI Agents

### Working In This Directory
- Agent 1 is the primary owner and reviewer
- Agent 4 co-authors `ai.ts` — Agent 1 reviews
- These types are IMMUTABLE CONTRACTS — changing them affects all agents
- Always run `npm run build` after type changes to catch breakage

### Common Patterns
- Strict hierarchy enforced: each node type has specific allowed children
- `NodeType` enum is the discriminator for `DOMNode` union
- `NodeMeta` is shared across all node levels
- API types use generics: `ApiResponse<T>`
