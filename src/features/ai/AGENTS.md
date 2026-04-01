<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-31 | Updated: 2026-03-31 -->

# src/features/ai/

## Purpose
AI generation system — prompt parsing, JSON diff generation/validation, component template generators, and diff-to-store bridge. Agent 4 owns this directory. Currently the main flow goes through Ollama API (Agent 3 route); local template generators serve as fallback.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | Barrel export of all AI functions |
| `prompt-parser.ts` | Natural language → `ParsedIntent` — keyword matching for AIAction, ComponentCategory, count, colors, text content |
| `component-generator.ts` | `generateSection()` / `generateComponent()` — delegates to template generators by category |
| `json-diff-generator.ts` | `generateAIDiff()` / `validateAIDiff()` — validates diff structure per action type |
| `diff-apply.ts` | `applyAIDiffToStore()` — validates then applies AIDiff to Zustand store (bridge file, currently unused in main flow) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `templates/` | 8 component template generators (see `templates/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Agent 4 owns all files here
- `prompt-parser.ts` uses keyword matching (not AI) — maps words to actions/categories
- `component-generator.ts` delegates to templates — FAQ and Gallery fall back to features-grid
- `diff-apply.ts` exists but main flow uses `store.applyAIDiff()` directly from `AIPromptBar`
- Template generators produce valid `DOMNode` trees matching Agent 1's type contracts

### Known Issues
- Ollama (qwen3.5) sometimes wraps response in `<think/>` tags — causes AI_PARSE_ERROR
- `extractJSON()` in the API route needs to strip thinking tags before parsing
- Template generators are unused in the Ollama flow — potential offline/fallback mode

### Common Patterns
- `ParsedIntent` → action + category + props → template generator → DOMNode tree
- `AIDiff` wraps: action + targetNodeId + payload (node or nodes) + position
- Each template accepts props with sensible defaults
