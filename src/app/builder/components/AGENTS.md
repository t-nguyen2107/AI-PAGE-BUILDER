<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-31 | Updated: 2026-03-31 -->

# src/app/builder/components/

## Purpose
Builder-specific UI components — the main editing interface widgets. Agent 2 owns this directory. Components are composed in the builder layout.

## Key Files
| File | Description |
|------|-------------|
| `BuilderHeader.tsx` | Top bar — sidebar toggle, project title, unsaved indicator, undo/redo buttons, AI toggle, Preview link, Save button, inspector toggle |
| `Canvas.tsx` | Center editing area — breadcrumb path for selected node, zoomable PageRenderer (25-200%), zoom controls, empty state placeholder |
| `Sidebar.tsx` | Left panel with 4 tabs: Layers (recursive tree view), Pages (list + navigate), Library (saved components), Styleguide (color swatches + typography). Collapsible |
| `AIPromptBar.tsx` | Bottom bar (conditionally shown) — text input for AI prompt, Generate button, loading spinner, error display. Sends to `/api/ai/generate`, converts response to `AIDiff`, applies to store |

## For AI Agents

### Working In This Directory
- Agent 2 owns render/state logic; Agent 4 defines AI data flow for `AIPromptBar`
- All components are `'use client'` — they use Zustand store and browser APIs
- `BuilderHeader` uses `useHistory` hook for undo/redo
- `Canvas` manages zoom state and global section injection
- `Sidebar` uses recursive `LayerItem` component for tree view
- `AIPromptBar` is the main AI interaction point — converts `AIGenerationResponse` → `AIDiff` → `applyAIDiff()`

### AIPromptBar Flow (Cross-Agent)
1. User types prompt → `apiClient.generateFromPrompt()` → Agent 3's API route
2. API route calls Ollama → Agent 4's system prompt + parsing
3. Response → `AIDiff` → `applyAIDiff()` → Zustand store update → canvas re-renders

### Common Patterns
- `useBuilderStore` with `useShallow` for subscriptions
- Collapsible panels with toggle state
- Tab-based navigation for sidebar
- Error display bars for AI failures
