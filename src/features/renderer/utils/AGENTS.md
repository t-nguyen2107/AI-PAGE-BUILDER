<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-31 | Updated: 2026-03-31 -->

# src/features/renderer/utils/

## Purpose
Style conversion utilities for the renderer. Agent 2 owns this directory. Transforms the data-layer style objects (`LayoutProperties`, `TypographyProperties`, `BackgroundProperties`) into React CSSProperties for rendering.

## Key Files
| File | Description |
|------|-------------|
| `layout-to-styles.ts` | `layoutToStyles()` converts LayoutProperties → CSSProperties. `typographyToStyles()` converts TypographyProperties → CSSProperties. `backgroundToStyles()` converts BackgroundProperties → CSSProperties. `mergeStyles(...)` merges multiple style objects |
| `render-element.ts` | `renderElement(tag, props, children)` — `React.createElement` wrapper to avoid React 19 JSX transform issues with dynamic tag strings |

## For AI Agents

### Working In This Directory
- Agent 2 owns this directory
- `layoutToStyles()` handles: display, flexDirection, justifyContent, alignItems, gap, padding, margin, maxWidth, width, height, borderRadius
- `typographyToStyles()` handles: fontFamily, fontSize, fontWeight, lineHeight, color, textAlign
- `backgroundToStyles()` handles: backgroundColor, backgroundImage, backgroundGradient, backgroundSize, backgroundRepeat
- `mergeStyles()` combines multiple partial style objects into one

### Common Patterns
- All functions are pure — no side effects, no React hooks
- Return `React.CSSProperties` objects ready for `style` prop
- Empty/undefined properties are omitted from output
- `renderElement()` is needed because React 19's JSX transform doesn't support dynamic string tags in JSX
