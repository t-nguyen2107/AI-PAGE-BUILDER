<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-31 | Updated: 2026-03-31 -->

# src/components/

## Purpose
Shared reusable UI components. Agent 2 owns this directory. Components follow a dark theme (zinc/purple palette) with consistent styling via Tailwind CSS classes.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `ui/` | Core UI primitives — Button, Input, TextArea, Select, Tabs, TabPanels |
| `layout/` | Layout components (if any) |

## For AI Agents

### Working In This Directory
- Each component is self-contained in its own file
- Use Tailwind classes directly (no CSS modules)
- Dark theme: backgrounds are `zinc-800/900`, text is `zinc-200/400`, accents are `purple-400/500/600`
- Components accept `className` prop for customization

### Common Patterns
- Props interfaces defined inline with the component
- Consistent variant + size pattern: `variant="primary"`, `size="md"`
- Button variants: default, primary, ghost, outline, danger
- Input components support optional `label` prop
