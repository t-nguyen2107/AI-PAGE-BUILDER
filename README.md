<h1 align="center">LoomWeave — AI Page Builder</h1>

<p align="center">
  <strong>Build production-ready websites with AI-powered visual editing</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Puck-0.21-6366f1" alt="Puck Editor" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma" alt="Prisma 7" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
</p>

---

## Overview

LoomWeave is an open-source visual website builder that combines a **drag-and-drop editor** with **AI-powered page generation**. Describe what you want, and the AI generates a complete page layout you can then customize with the visual editor.

Built as a modular subsystem designed to integrate into a larger AI CMS platform.

### Key Features

- **AI Page Generation** — Describe a page in natural language, get a complete layout with 36+ pre-built components
- **Visual Drag-and-Drop Editor** — Powered by [Puck](https://puckeditor.com/) with inline editing, viewport preview, and undo/redo
- **36 Puck Components** — Hero, Features, Pricing, Testimonials, CTA, FAQ, Stats, Blog, Gallery, Countdown, and more
- **12 Custom Editor Fields** — Typography, Color Picker, Gradient, Shadow, Border, Spacing, Animation, Icon Picker, Image Picker, Media Manager, and a unified Styles composer
- **AI Chat Panel** — Conversational interface to iteratively refine pages
- **Multi-AI Backend** — Gemini Flash, Ollama (local), OpenAI, Anthropic via LangChain
- **Winnie AI Wizard** — Step-by-step new project creation with conversational AI assistant
- **AI Memory System** — 3-layer memory (profile, pgvector, sessions) that learns from your project
- **Dark Mode** — Full light/dark theme with Material Design 3 token system
- **Style Guide System** — Project-wide colors, typography, spacing, and CSS variables
- **SEO Toolkit** — Meta generation, heading validation, JSON-LD, semantic HTML auditing
- **Revision History** — Full page snapshots with diff support
- **Component Library** — Save and reuse custom components across projects
- **ISR Preview** — Incremental Static Regeneration for published pages
- **PostgreSQL + Prisma 7** — Managed database with Prisma Postgres + pgvector

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Editor | @puckeditor/core v0.21.x |
| State | Zustand 5, Puck internal state |
| Database | PostgreSQL via Prisma 7 (Prisma Postgres + pgvector) |
| Validation | Zod 4 |
| AI | LangChain + Gemini / Ollama / OpenAI / Anthropic |
| Theming | Material Design 3 tokens, next-themes |
| IDs | nanoid |
| Testing | Vitest (jsdom) — 188+ tests |

---

## Quick Start

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **Prisma Postgres** database — [Create one free](https://console.prisma.io)
- **AI API Key** — Gemini (recommended), OpenAI, Anthropic, or Ollama

### Installation

```bash
# Clone the repository
git clone https://github.com/t-nguyen2107/AI-PAGE-BUILDER.git
cd AI-PAGE-BUILDER

# Install dependencies
npm install

# Set up environment
cp .env.sample .env.local
# Edit .env.local with your database URL and AI provider config

# Set up the database schema
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

Copy `.env.sample` to `.env.local` and configure. See [.env.sample](.env.sample) for full documentation.

**Minimal setup (Gemini — recommended):**

```env
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_KEY"
DATABASE_DIRECT_URL="postgres://user:password@db.prisma.io:5432/postgres?sslmode=require"

AI_PROVIDER="gemini"
AI_MODEL="gemini-3-flash-preview"
AI_API_KEY="YOUR_GEMINI_API_KEY"
```

> **Setup:** Create a free [Prisma Postgres](https://console.prisma.io) database, get a [Gemini API key](https://aistudio.google.com/apikey), then paste into `.env.local`.

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # REST API routes (22 endpoints)
│   │   ├── ai/                   # AI generation, search, conversations, wizard
│   │   ├── projects/             # CRUD projects, pages, revisions, styleguide
│   │   ├── library/              # Component library
│   │   └── media/                # Stock images, uploads
│   ├── builder/[projectId]/      # Visual editor pages
│   ├── new-project/              # Winnie AI wizard (3 steps)
│   └── preview/[projectId]/      # Published page preview (ISR)
│
├── puck/                         # Puck Editor integration
│   ├── puck.config.tsx           # 36 component definitions
│   ├── types.ts                  # Component prop types
│   ├── categories.ts             # Sidebar categories
│   ├── PuckEditor.tsx            # Client component wrapper
│   ├── components/               # 36 render components (Tailwind)
│   ├── hooks/                    # useScrollAnimation
│   ├── fields/                   # 12 custom editor fields
│   ├── plugins/                  # AI chat panel plugin
│   └── settings/                 # Project settings panels
│
├── features/
│   ├── ai/                       # AI pipeline (templates, registry, generator)
│   └── seo/                      # SEO audit, meta, JSON-LD, semantic mapper
│
├── lib/
│   ├── ai/                       # Streaming, output validation, Puck adapter
│   │   ├── provider.ts           # Multi-provider model factory
│   │   ├── config.ts             # AI provider + fast model config
│   │   ├── streaming.ts          # SSE streaming pipeline
│   │   ├── chain.ts              # LangChain generation chain
│   │   ├── knowledge/            # Design knowledge + auto-styleguide
│   │   └── prompts/              # System prompt, template prompt, catalog
│   ├── prisma.ts                 # Prisma client singleton
│   ├── api-client.ts             # Client-side API helpers
│   └── utils.ts                  # Shared utilities
│
├── components/                   # Shared UI components
│   ├── providers/                # ThemeProvider
│   └── ui/                       # ThemeToggle, LogoSpinner, Modal, etc.
│
├── store/                        # Zustand stores
├── types/                        # TypeScript interfaces & enums
└── schemas/                      # Zod validation schemas
```

---

## Architecture

### Puck Data Model

Pages are stored as Puck `Data` format:

```typescript
interface Data {
  root: { props: { title: string } };
  content: ComponentData[];  // flat array of components
}

interface ComponentData {
  type: string;    // e.g. "HeroSection", "FeaturesGrid"
  props: {         // component-specific props
    id: string;
    // ... typed fields per component
  };
}
```

### AI Pipeline

```
User Prompt → Prompt Optimizer → LangChain → AI Model → JSON → Validate (Zod) → Puck Editor
```

1. User describes a page in the AI Chat Panel
2. Rule-based prompt optimizer detects business type, style, language (zero LLM cost)
3. LangChain sends enriched prompt with component catalog + design knowledge
4. AI generates component data as JSON
5. Zod validates the output against template schemas
6. Components render immediately in the canvas

### AI Memory System (3 Layers)

```
Layer 1: ProjectAIProfile — structured business/style/language preferences
Layer 2: VectorEmbedding — pgvector semantic search for insights & corrections
Layer 3: AISession — per-page conversation context with auto-trim
```

### Model Routing

| Task | Model | Why |
|------|-------|-----|
| Full page generation | `AI_MODEL` (e.g. gemini-3-flash) | Structured output quality |
| Template mode | `AI_FAST_MODEL` (e.g. gemini-3-flash-lite) | Speed (~3s vs ~7s) |
| Wizard chat | `AI_FAST_MODEL` | Conversational responsiveness |
| Styleguide/SEO | `AI_FAST_MODEL` | Small payloads, fast response |

### API Pattern

All API responses follow a consistent format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: { page?: number; total?: number };
}
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (includes Prisma generate) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest test suite (188+ tests) |
| `npm run db:push` | Push schema changes to database |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run db:seed` | Seed database with sample data |

---

## Database Models

```
Project ─┬── has many → Page ──── has many → Revision
          ├── has one  → Styleguide
          ├── has one  → ProjectAIProfile
          ├── has many → GlobalSection
          └── has many → VectorEmbedding

UserLibrary          # Saved reusable components
AIPromptLog          # AI interaction logging
AISession            # Per-page AI conversation sessions
AISessionMessage     # Session chat messages
```

---

## Brand Design System

LoomWeave uses a Material Design 3 inspired token system:

| Token | Light | Dark |
|-------|-------|------|
| Primary | `#22746e` (teal) | `#5ec4b8` (light teal) |
| Secondary | `#081b22` (navy) | `#7aabb0` (light navy) |
| Tertiary/Accent | `#e39c37` (amber) | `#f5c878` (light amber) |
| Surface | `#f5f6f7` | `#0d1f24` |

Full token system in `src/app/globals.css` with 5-level surface hierarchy, on-colors, containers, and inverse tokens.

---

## Contributing

We welcome contributions! See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for detailed guidelines.

**Quick summary:**

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Follow the coding conventions below
4. Submit a Pull Request

### Coding Conventions

- Use `@/` path alias for imports
- Strict TypeScript — no `any` types
- Validate external input with Zod before use
- Puck components go in `src/puck/components/`
- Use semantic design tokens (not hardcoded colors) — `bg-primary`, `text-on-surface`, `bg-surface-container`
- All API responses use `ApiResponse<T>` format

---

## Deploy

### Deploy to Vercel

The easiest way to deploy is via [Vercel](https://vercel.com):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

When prompted, add these environment variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Prisma Accelerate URL (`prisma+postgres://...`) |
| `DATABASE_DIRECT_URL` | Direct PostgreSQL connection |
| `AI_PROVIDER` | `gemini`, `ollama`, `openai`, or `anthropic` |
| `AI_MODEL` | Main model (e.g. `gemini-3-flash-preview`) |
| `AI_API_KEY` | API key for the AI provider |
| `AI_FAST_MODEL` | Fast model for template mode (optional) |
| `AI_FAST_API_KEY` | Fast model API key (optional, falls back to AI_API_KEY) |

> Use the **Accelerate URL** (`prisma+postgres://...`) as `DATABASE_URL` on Vercel for connection pooling.

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

<p align="center">
  Built with Next.js, Puck, LangChain, and Gemini
</p>
