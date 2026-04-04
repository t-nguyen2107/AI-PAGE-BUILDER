<h1 align="center">AI Page Builder</h1>

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

AI Page Builder is an open-source visual website builder that combines a **drag-and-drop editor** with **AI-powered page generation**. Describe what you want, and the AI generates a complete page layout you can then customize with the visual editor.

Built as a modular subsystem designed to integrate into a larger AI CMS platform.

### Key Features

- **AI Page Generation** -- Describe a page in natural language, get a complete layout with 37+ pre-built components
- **Visual Drag-and-Drop Editor** -- Powered by [Puck](https://puckeditor.com/) with inline editing, viewport preview, and undo/redo
- **37 Puck Components** -- Hero, Features, Pricing, Testimonials, CTA, FAQ, Stats, Blog, Gallery, Countdown, and more
- **12 Custom Editor Fields** -- Typography, Color Picker, Gradient, Shadow, Border, Spacing, Animation, Icon Picker, Image Picker, Media Manager, and a unified Styles composer
- **AI Chat Panel** -- Conversational interface to iteratively refine pages
- **Multi-AI Backend** -- Ollama (local), OpenAI, Anthropic via LangChain
- **Style Guide System** -- Project-wide colors, typography, spacing, and CSS variables
- **SEO Toolkit** -- Meta generation, heading validation, JSON-LD, semantic HTML auditing
- **Revision History** -- Full page snapshots with diff support
- **Component Library** -- Save and reuse custom components across projects
- **ISR Preview** -- Incremental Static Regeneration for published pages
- **SQLite + Prisma 7** -- Zero-config database with better-sqlite3 adapter

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Editor | @puckeditor/core v0.21 |
| State | Zustand 5, Puck internal state |
| Database | SQLite via Prisma 7 (better-sqlite3) |
| Validation | Zod 4 |
| AI | LangChain + Ollama / OpenAI / Anthropic |
| IDs | nanoid |
| Testing | Vitest (jsdom) |

---

## Quick Start

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **Ollama** (optional, for AI features) -- [Install guide](https://ollama.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/t-nguyen2107/AI-PAGE-BUILDER.git
cd AI-PAGE-BUILDER

# Install dependencies
npm install

# Set up the database
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# AI Provider (optional — app works without AI for manual editing)
OLLAMA_BASE_URL=http://localhost:11434
OPENAI_API_KEY=           # Optional
ANTHROPIC_API_KEY=        # Optional

# Database
DATABASE_URL=file:./dev.db
```

> The app works fully as a visual editor without any AI provider configured.

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # REST API routes (17 endpoints)
│   │   ├── ai/                   # AI generation, search, conversations
│   │   ├── projects/             # CRUD projects, pages, revisions
│   │   ├── library/              # Component library
│   │   └── media/                # Stock images, uploads
│   ├── builder/[projectId]/      # Visual editor pages
│   └── preview/[projectId]/      # Published page preview (ISR)
│
├── puck/                         # Puck Editor integration
│   ├── puck.config.tsx           # 37 component definitions
│   ├── types.ts                  # Component prop types
│   ├── categories.ts             # Sidebar categories
│   ├── PuckEditor.tsx            # Client component wrapper
│   ├── components/               # 37 render components (Tailwind)
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
│   ├── prisma.ts                 # Prisma client singleton
│   ├── api-client.ts             # Client-side API helpers
│   └── utils.ts                  # Shared utilities
│
├── components/ui/                # Shared UI components
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
User Prompt → LangChain → AI Model → JSON Output → Validate (Zod) → Puck Adapter → Editor State
```

1. User describes a page in the AI Chat Panel
2. LangChain sends the prompt with a Puck-aware system prompt
3. AI generates component data as JSON
4. Zod validates the output against template schemas
5. Puck adapter converts to editor-compatible format
6. Components render immediately in the canvas

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
| `npm run db:push` | Push schema changes to database |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run db:seed` | Seed database with sample data |

---

## Database Models

```
Project ─┬── has many → Page ──── has many → Revision
          ├── has one  → Styleguide
          └── has many → GlobalSection

UserLibrary          # Saved reusable components
AIPromptLog          # AI interaction logging
AISession            # AI conversation sessions
AISessionMessage     # Session chat messages
```

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
- Strict TypeScript -- no `any` types
- Validate external input with Zod before use
- Puck components go in `src/puck/components/`
- Use Tailwind CSS classes (no inline styles unless dynamic)
- All API responses use `ApiResponse<T>` format

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

<p align="center">
  Built with Next.js, Puck, and LangChain
</p>
