# Changelog

All notable changes to LoomWeave AI Page Builder.

## [2026-04-06] — Gemini Integration + Branding Polish

### Added
- **Gemini AI provider** — `ChatGoogleGenerativeAI` via `@langchain/google-genai`
  - New provider type `'gemini'` in `AIProvider` union
  - Gemini case in all 3 model factory functions (`createModel`, `createModelBundle`, `createFastModelBundle`)
  - Token usage test script (`scripts/test-token-usage.ts`)
- **Brand gradient presets** — Added teal, navy, gold presets to HeroSection (alongside creative options)
- **Missing CSS tokens** — `--on-secondary-container` (light + dark), `--color-primary-text`, `--color-on-secondary`, `--color-on-secondary-container` in `@theme inline`

### Fixed
- **Banner animated gradient** — Fallback changed from indigo `#6366f1` to brand teal `var(--primary)`
- **WinnieChat.tsx** — Added missing state declarations for `setFollowUpAsked` and `confirmedReady`/`setConfirmedReady`
- **FinalizeStep.tsx** — TypeScript `never` narrowing fix for closure-based `generatedResult`
- **globals.css comment** — Corrected brand color order in header comment
- **Gemini model name** — `gemini-3-flash-preview` (was `gemini-3.1-flash-live-preview` which only works with Live API)

### Performance
- Gemini 3 Flash: ~7s full generation, ~3s fast model — **$0.0003–0.0004/request**
- Token usage: ~85 input + ~500–660 output per generation

---

## [2026-04-05] — LoomWeave Branding & UI Overhaul

### Added
- **LoomWeave brand identity** — Renamed from "PageBuilder"
  - Brand colors: Primary `#22746e` (teal), Secondary `#081b22` (navy), Accent `#e39c37` (amber)
  - Fonts: Poppins (heading) + Inter (body) via `next/font/google`
  - Logo: `public/assets/images/logo-full-color.png` in dashboard nav
  - Favicon: `public/assets/images/fav.png`
- **Dark mode** — Full theme toggle via `next-themes`
  - `ThemeProvider` wrapper in root layout
  - `ThemeToggle` button in dashboard header (Material Symbols sun/moon icons)
  - Complete `.dark` CSS token overrides (Material Design 3 inspired)
- **LogoSpinner component** — Animated spinner from `fav.png` (1.5s rotation, accessible)
- **Wizard animations** — Winnie float, wing flap, fade-up, cursor blink, dot wave, pulse ring keyframes

### Fixed
- **Puck component color cleanup** (12 components) — Replaced hardcoded colors with semantic design tokens:
  - `bg-gray-900` → `bg-inverse-surface`, `text-yellow-400` → `text-tertiary`, `text-red-500` → `text-error`, etc.
  - Stars in TestimonialSection: `text-yellow-400 fill-yellow-400` → `text-tertiary fill-tertiary`
  - ProductCards: `bg-red-500 text-white` → `bg-error text-on-error`
  - SocialProof: `bg-green-500` → `bg-success`
  - CTASection decorative blobs → `bg-primary-foreground/5`

### Design System
- Full Material Design 3 token system in `globals.css` (~900 lines)
- Surface hierarchy (5 levels), on-colors, containers, inverse tokens
- shadcn/ui token aliases mapped to Material equivalents
- Tailwind v4 `@theme inline` mapping all CSS vars to Tailwind utilities

---

## [2026-04-04] — AI Pipeline Quality + Performance

### Added
- **AI UI Generation Quality Overhaul** (4 phases)
  - Phase 1: Static design knowledge (25+ color palettes, 11 styles, 10 landing patterns, 14 typography pairings)
  - Phase 2: Vector RAG knowledge base (pgvector search + seed API endpoint)
  - Phase 3: Component visual improvements (StatsSection cards, CTASection animation, `useScrollAnimation` hook)
  - Phase 4: Auto-styleguide generation (business type → project colors/typography/CSS vars)
- **Fast model routing** — `createFastModelBundle()` for template mode, `createModelBundle()` for heavy chain
  - New env vars: `AI_FAST_MODEL`, `AI_FAST_BASE_URL`, `AI_FAST_API_KEY`
- **Unit test suite** — 188 tests across 14 files (Vitest + jsdom)
- **E2E AI pipeline tests** — 11 real API calls testing full generation flow
- **CustomSection** — Custom HTML/CSS component with DOMPurify sanitization
- **Winnie wizard improvements** — WinnieAvatar component, animated avatar, suggestion chips
- **Shared component catalog** — `component-catalog.ts` as single source of truth

### Fixed
- **Streaming** — Strip `response_format` for streaming (fixes empty response from some providers)
- **FinalizeStep** — Prevent double finalize from React StrictMode with `startedRef` guard
- **Code review fixes** — 13 issues: override order, empty string env fallback, dedup, error logging
- **Security** — Block CSS `@import` in CustomSection, DOMPurify sanitization for scripts
- **Vector store** — Raw SQL snake_case columns → quoted camelCase for Prisma compatibility

### Performance
- Wizard chat: **26s → ~2s** (fast model)
- Styleguide generation: **36s → ~2s** (deterministic + LLM only for SEO)
- maxTokens reduced: template 4096, chain 8192
- Parallel API calls in FinalizeStep (styleguide + project update)
- Seed batch rate limiting (2 concurrent + 500ms delay)

---

## [2026-04-03] — Foundation

### Added
- AI chain overhaul — prompts, catalog, context transfer
- Prisma schema with pgvector support
- Puck visual editor integration (36 components)
- SSE streaming pipeline
- AI memory system (3 layers: profile, vectors, sessions)
- New project wizard (Winnie AI)
- SEO suite (audit, JSON-LD, meta generator, heading validator)
- REST API (22 routes)
