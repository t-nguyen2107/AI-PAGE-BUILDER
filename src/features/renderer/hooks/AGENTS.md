<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-31 | Updated: 2026-03-31 -->

# src/features/renderer/hooks/

## Purpose
React hooks for the renderer system. Agent 2 owns this directory.

## Key Files
| File | Description |
|------|-------------|
| `use-semantic-tag.ts` | Hook + utility that maps `SemanticTag` enum values to actual HTML tag strings. Falls back to default tag based on `NodeType` when semantic tag is not specified |

## For AI Agents

### Working In This Directory
- Agent 2 owns this directory
- `useSemanticTag(tag, nodeType)` — React hook version (for components)
- `mapSemanticTag(tag, nodeType)` — standalone function (for non-hook contexts)
- Default mapping: section→`section`, container→`div`, component→`div`, element→`p`, item→`span`

### Common Patterns
- Hook wraps the standalone function with memoization
- SemanticTag enum has 26 valid HTML5 tags
- Fallback ensures rendering never breaks with invalid tags
