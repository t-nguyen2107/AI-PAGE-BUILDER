# AI Website Builder — Project Documentation

## Overview

AI Website Builder is a full-stack application for building websites using AI (natural language or structured JSON). It combines a visual drag-drop editor (Puck) with an AI pipeline that supports multiple providers (Ollama, OpenAI, Anthropic) and streaming SSE responses.

Users interact via a chat panel — typing descriptions of what they want, and the AI generates or modifies Puck components in real-time. The system supports both template-based generation (fast, cheap) and full AI generation (detailed, quality-focused).

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.2.1 | App Router, SSR, ISR, API routes |
| React | 19.2.4 | UI rendering |
| TypeScript | ^5 | Strict mode, full type safety |
| @puckeditor/core | ^0.21.2 | Visual drag-drop page builder |
| Tailwind CSS | ^4 | Utility-first styling + CSS variables |
| Prisma | ^7.6.0 | ORM + PostgreSQL (Prisma Postgres + Accelerate) |
| Zustand | ^5.0.12 | Client state (toast store) |
| Zod | ^4.3.6 | Schema validation |
| LangChain | ^1.2.39 | Multi-provider AI orchestration |
| nanoid | ^5.1.7 | ID generation |
| Sharp | ^0.34.5 | Image processing (WebP conversion) |
| Vitest | ^4.1.2 | Testing framework |

---

## Project Structure

```
pageBuilder/
├── public/
│   ├── stock/                  # 188 WebP stock images (28 categories)
│   ├── icons/                  # 159 SVG icons (heroicons)
│   └── uploads/                # User-uploaded media
├── prisma/
│   ├── schema.prisma           # Database models
│   ├── prisma.config.ts        # Prisma configuration
│   └── seed.ts                 # Database seeder
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # REST API routes
│   │   │   ├── ai/
│   │   │   │   ├── generate/           # AI generation (POST)
│   │   │   │   │   └── stream/         # SSE streaming generation
│   │   │   │   ├── search/             # AI-powered search
│   │   │   │   ├── conversations/      # Conversation history
│   │   │   │   ├── profile/            # Project AI profile
│   │   │   │   │   └── memories/       # Vector memory management
│   │   │   │   └── wizard/             # New project wizard
│   │   │   │       ├── chat/           # Winnie AI chat
│   │   │   │       ├── generate-settings/  # AI styleguide generation
│   │   │   │       └── finalize/       # Project creation
│   │   │   ├── projects/              # Project CRUD
│   │   │   │   └── [projectId]/
│   │   │   │       ├── pages/          # Page CRUD
│   │   │   │       ├── styleguide/     # Styleguide CRUD
│   │   │   │       ├── global-sections/ # Shared header/footer/nav
│   │   │   │       └── revisions/      # Page snapshots
│   │   │   ├── library/               # User-saved components
│   │   │   └── media/
│   │   │       ├── upload/            # File upload
│   │   │       ├── uploads/           # Upload management
│   │   │       └── stock/             # Stock image catalog
│   │   ├── builder/[projectId]/       # Puck editor page
│   │   ├── new-project/               # New project wizard
│   │   ├── preview/                   # Public preview (ISR)
│   │   └── page.tsx                   # Home / project listing
│   ├── puck/                   # Puck editor system
│   │   ├── puck.config.tsx     # Component definitions (33 types)
│   │   ├── types.ts            # All component prop types
│   │   ├── categories.ts       # Sidebar categories
│   │   ├── PuckEditor.tsx      # Editor wrapper component
│   │   ├── components/         # 37 render components (Tailwind)
│   │   ├── fields/             # Custom field components
│   │   │   └── MediaManager.tsx
│   │   ├── plugins/            # Puck plugins
│   │   │   ├── ai-plugin.tsx          # AI chat panel plugin
│   │   │   ├── AIChatPanel.tsx        # Chat UI component
│   │   │   └── components/
│   │   │       └── MarkdownRenderer.tsx
│   │   ├── settings/           # Settings panel
│   │   │   ├── SettingsPanel.tsx
│   │   │   └── tabs/
│   │   │       ├── GeneralTab.tsx
│   │   │       ├── PageSettingsTab.tsx
│   │   │       ├── SeoTab.tsx
│   │   │       └── StyleGuideTab.tsx
│   │   └── lib/                # Puck utilities
│   ├── features/               # Feature modules
│   │   └── ai/
│   │       ├── templates/      # 25+ template generators
│   │       ├── template-registry.ts
│   │       ├── component-generator.ts
│   │       └── prompt-parser.ts
│   ├── lib/                    # Shared libraries
│   │   ├── ai/                 # AI pipeline core
│   │   │   ├── provider.ts           # Model factory (Ollama/OpenAI/Anthropic)
│   │   │   ├── config.ts             # AI config from env
│   │   │   ├── streaming.ts          # SSE stream creation
│   │   │   ├── chain.ts              # Non-streaming LangChain
│   │   │   ├── output.ts             # Output validation
│   │   │   ├── output-sanitizer.ts   # Response cleaning
│   │   │   ├── puck-adapter.ts       # SectionNode → ComponentData conversion
│   │   │   ├── memory.ts             # Session memory (Prisma)
│   │   │   ├── memory-manager.ts     # Context loading
│   │   │   ├── profile-updater.ts    # AI profile analysis
│   │   │   ├── vector-store.ts       # pgvector semantic search
│   │   │   └── prompts/
│   │   │       ├── system-prompt.ts     # Full system prompt
│   │   │       ├── template-prompt.ts   # Compact template prompt
│   │   │       ├── template-schema.ts   # Template Zod schema
│   │   │       ├── prompt-optimizer.ts  # Intent detection, enrichment
│   │   │       └── winnie-system-prompt.ts
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── api-client.ts       # Frontend API client
│   │   ├── api-response.ts     # Response helpers
│   │   ├── id.ts               # nanoid wrapper
│   │   ├── css-variables.ts    # Styleguide CSS generation
│   │   └── store/              # Zustand stores
│   │       └── toast-store.ts
│   ├── types/                  # TypeScript interfaces
│   │   ├── ai.ts
│   │   ├── enums.ts
│   │   ├── wizard.ts
│   │   └── ...
│   ├── schemas/                # Zod validation schemas
│   └── components/             # Shared UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Tabs.tsx
│       ├── Modal.tsx
│       └── Toast.tsx
└── .env.local                  # Environment configuration
```

---

## Architecture

### Data Model

Pages are stored in Puck `Data` format:

```typescript
Data = {
  root: { props: { title: string } },
  content: ComponentData[]  // flat array, not a tree
}

ComponentData = {
  type: string,           // e.g. "HeroSection", "FeaturesGrid"
  props: { id: string, ...fields }
}
```

The `content` array is flat — Puck renders it as a vertical stack. Layout components (ColumnsLayout, Flex, Grid) use Puck's `Slot` system for nested content.

### AI Pipeline

The AI pipeline has two modes:

**Template Mode** (fast, cheap):
1. User sends prompt → `optimizePrompt()` detects `create_page` intent
2. AI receives compact template prompt with business type context
3. AI selects from 25+ template combinations and fills content
4. Response validated via `validateTemplateResponse()` Zod schema
5. Components auto-ordered by section priority (HeroSection first)

**Full Mode** (detailed, quality):
1. User sends prompt → full system prompt with component catalog + design rules
2. Context loaded: styleguide, tree summary, session history, project AI profile
3. AI generates structured JSON with component data
4. Response sanitized → validated → converted to Puck ComponentData

Both modes support:
- **Non-streaming**: `POST /api/ai/generate` — returns complete JSON response
- **Streaming**: `POST /api/ai/generate/stream` — SSE events for real-time UX

### Streaming Architecture

```
Client                          Server
  │                               │
  │  POST /api/ai/generate/stream │
  │──────────────────────────────>│
  │                               │ Load context (styleguide, tree, memory)
  │  SSE: status (loading)        │
  │<──────────────────────────────│
  │                               │ Optimize prompt
  │  SSE: status (generating)     │
  │<──────────────────────────────│
  │                               │ Stream AI model chunks
  │                               │ Accumulate full response
  │  SSE: status (parsing)        │
  │<──────────────────────────────│
  │                               │ Parse JSON (extractJSON)
  │                               │ Validate (Zod schema)
  │  SSE: done { result }         │
  │<──────────────────────────────│
  │                               │ Persist session memory (async)
```

Key streaming features:
- `AbortSignal.timeout(90s)` always applied, combined with client disconnect signal
- Buffer-based SSE parsing handles events split across reads
- `extractJSON()` multi-strategy: direct parse → code fence → brace matching → truncated repair
- Non-JSON response fallback: `cleanAIOutput()` strips thinking tags and returns CLARIFY action
- Closed flag pattern prevents double `controller.close()`

### AI Provider System

`createModelBundle()` returns model instance + provider-specific JSON options:

| Provider | JSON Mode | Config |
|---|---|---|
| Ollama | `format: 'json'` in constructor | Default: qwen3:1.5-0.5-06_32b-Q8_K |
| OpenAI | `response_format: { type: 'json_object' }` in call options | Requires API key |
| Anthropic | N/A (prompt-based) | Requires API key |

### AI Memory System

```
ProjectAIProfile          — Business type, tone, audience, style, color preferences
AISession                 — Per project+page conversation session
AISessionMessage          — Individual messages in session
VectorEmbedding (pgvector) — Semantic search for AI memories
MiniContext               — Running summary of user actions per session
```

Session memory provides context-aware AI responses. The profile updater (`analyzeAndUpdateProfile`) runs fire-and-forget after each generation to refine the project's AI profile over time.

---

## Component System

### 33 Puck Components

| Category | Components |
|---|---|
| **Sections** (22) | HeroSection, FeaturesGrid, PricingTable, TestimonialSection, CTASection, FAQSection, StatsSection, TeamSection, BlogSection, LogoGrid, ContactForm, HeaderNav, FooterSection, NewsletterSignup, Gallery, SocialProof, ComparisonTable, ProductCards, FeatureShowcase, CountdownTimer, AnnouncementBar, Banner |
| **Layout** (5) | ColumnsLayout, SectionBlock, Blank, Flex, Grid |
| **Typography** (3) | HeadingBlock, TextBlock, RichTextBlock |
| **Media** (2) | ImageBlock, Spacer |
| **Interactive** (1) | ButtonBlock |

Additional render-only components: Card, Layout helpers.

### Sidebar Categories

6 groups in Puck sidebar: Sections, Layout, Typography, Media, Navigation, Promotional.

### Component Registration

All components are registered in `src/puck/puck.config.tsx` with:
- Strongly-typed props (see `src/puck/types.ts`)
- Field definitions for the property inspector
- Default props for new instances
- Tailwind-styled render components in `src/puck/components/`

### Design Rules (enforced by AI system prompt)

- Component backgrounds alternate between white, muted, dark, and gradient
- Sections have generous spacing; use `Spacer` for visual hierarchy
- CTAs are prominent and clear; no emojis in content
- Content uses realistic company names and professional descriptions
- Stock images referenced by path: `/stock/{category}/{filename}.webp`
- Icons referenced by path: `/icons/{variant}/{icon-name}.svg`

---

## API Routes

### AI Generation

| Route | Method | Description |
|---|---|---|
| `/api/ai/generate` | POST | Non-streaming AI generation (JSON response) |
| `/api/ai/generate/stream` | POST | Streaming AI generation (SSE events) |
| `/api/ai/search` | POST | AI-powered content search |
| `/api/ai/conversations` | GET | List conversation sessions |

### AI Profile & Memory

| Route | Method | Description |
|---|---|---|
| `/api/ai/profile` | GET/PUT | Project AI profile (business type, tone, preferences) |
| `/api/ai/profile/memories` | GET/POST/DELETE | Vector embedding memory management |

### AI Wizard

| Route | Method | Description |
|---|---|---|
| `/api/ai/wizard/chat` | POST | Winnie AI chat (SSE streaming) |
| `/api/ai/wizard/generate-settings` | POST | AI-generated styleguide + SEO |
| `/api/ai/wizard/finalize` | POST | Create project + pages + AI profile |

### Projects & Pages

| Route | Method | Description |
|---|---|---|
| `/api/projects` | GET, POST | List / create projects |
| `/api/projects/[projectId]` | GET, PUT, DELETE | Project CRUD |
| `/api/projects/[projectId]/pages` | GET, POST | List / create pages |
| `/api/projects/[projectId]/pages/[pageId]` | GET, PUT, DELETE | Page CRUD |
| `/api/projects/[projectId]/styleguide` | GET, PUT | Styleguide CRUD |
| `/api/projects/[projectId]/global-sections` | GET, POST | List / create global sections |
| `/api/projects/[projectId]/global-sections/[sectionId]` | GET, PUT, DELETE | Global section CRUD |
| `/api/projects/[projectId]/revisions` | GET, POST | List / create revisions |
| `/api/projects/[projectId]/revisions/[revisionId]` | GET, DELETE | Revision management |

### Media & Library

| Route | Method | Description |
|---|---|---|
| `/api/media/upload` | POST | Upload file (WebP conversion via Sharp) |
| `/api/media/uploads` | GET | List uploaded files |
| `/api/media/stock` | GET | List stock images by category |
| `/api/library` | GET, POST | List / save user components |
| `/api/library/[libraryItemId]` | GET, PUT, DELETE | Component library CRUD |

### API Response Format

All API responses use consistent `ApiResponse<T>` format:

```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: { code: string, message: string } }
```

---

## Database Schema

### Models Overview

```
Project ──1:N──> Page
       ──1:1──> Styleguide
       ──1:N──> GlobalSection
       ──1:1──> ProjectAIProfile
       ──1:N──> VectorEmbedding

Page ──1:N──> Revision

AISession ──1:N──> AISessionMessage
```

### Project

Top-level website project container.

| Field | Type | Description |
|---|---|---|
| id | String (cuid) | Primary key |
| name | String | Project name |
| description | String? | Project description |
| thumbnailUrl | String? | Project thumbnail |
| siteName | String? | Display name for website |
| companyName | String? | Legal/company name |
| logo | String? | Logo image URL |
| favicon | String? | Favicon URL |
| language | String? | Default language (default: "en") |
| socialLinks | String? | JSON: facebook, twitter, instagram, linkedIn, youtube, tikTok |
| contactInfo | String? | JSON: email, phone, address |
| metaVerification | String? | JSON: google, bing verification codes |
| defaultOgImage | String? | Fallback OG image for all pages |
| gaCode | String? | Google Analytics tracking ID |
| headScripts | String? | Raw HTML for `<head>` |
| bodyScripts | String? | Raw HTML for before `</body>` |

### Page

Individual page within a project.

| Field | Type | Description |
|---|---|---|
| id | String (cuid) | Primary key |
| projectId | String | FK → Project |
| title | String | Page title |
| slug | String | URL slug (unique per project) |
| order | Int | Sort order |
| isHomePage | Boolean | Homepage flag |
| treeData | String | JSON: serialized Puck Data |
| seoTitle, seoDescription, seoKeywords | String? | SEO metadata |
| ogTitle, ogDescription, ogImage | String? | Open Graph metadata |
| canonicalUrl | String? | Canonical URL |
| robots | String? | Robots directive (default: "index, follow") |
| twitterCard, twitterImage | String? | Twitter card metadata |
| structuredData | String? | JSON-LD structured data |

### Styleguide

Design system per project (1:1 with Project).

| Field | Type | Description |
|---|---|---|
| colors | String (JSON) | Color palette |
| typography | String (JSON) | Font families, sizes, weights |
| spacing | String (JSON) | Spacing scale |
| componentVariants | String (JSON) | Component variant overrides |
| cssVariables | String (JSON) | Generated CSS custom properties |

### GlobalSection

Shared header/footer/navigation across pages.

| Field | Type | Description |
|---|---|---|
| sectionType | String | "header", "footer", "nav", "custom" |
| sectionName | String | Display name |
| treeData | String (JSON) | Puck Data |

### AISession / AISessionMessage

Conversation context for AI generation.

| Model | Key Fields |
|---|---|
| AISession | projectId, pageId, miniContext (running action summary) |
| AISessionMessage | sessionId, role (user/assistant), content, action |

### ProjectAIProfile

Learned project preferences for AI personalization.

| Field | Type | Description |
|---|---|---|
| businessType | String | e.g. "restaurant", "saas", "portfolio" |
| businessName | String | Detected business name |
| industry | String | Industry classification |
| targetAudience | String | Detected audience |
| tone | String | Communication tone preference |
| preferredStyle | String | Design style preference |
| preferredColors | String (JSON) | Hex color array |
| contentThemes | String (JSON) | Content theme tags |
| componentPrefs | String (JSON) | Component type → usage count |
| memoryNotes | String (JSON) | { note, source, confidence }[] |

### VectorEmbedding

pgvector-powered semantic memory.

| Field | Type | Description |
|---|---|---|
| scope | String | "user", "project", "global" |
| category | String | "preference", "correction", "pattern", etc. |
| content | String | Text content |
| metadata | String (JSON) | Source, confidence, tags |
| embedding | Bytes? | Vector embedding (768 or 1536 dim) |

### Other Models

- **Revision** — Page snapshot with optional diff (JsonPatch)
- **UserLibrary** — Saved component templates with embedding
- **AIPromptLog** — AI interaction logging (prompt, action, response, success)

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `AI_PROVIDER` | `"ollama"` | AI provider: `ollama`, `openai`, `anthropic` |
| `AI_MODEL` | `"qwen3:1.5-0.5-06_32b-Q8_K"` | Model identifier |
| `AI_BASE_URL` | `"http://localhost:11434"` | Ollama/OpenAI base URL |
| `AI_API_KEY` | — | API key for OpenAI/Anthropic |
| `AI_TEMPERATURE` | `"0.3"` | Generation temperature (0–2) |
| `AI_MAX_TOKENS` | `"4096"` | Maximum output tokens |
| `AI_MAX_RETRIES` | `"2"` | Retry attempts |
| `DATABASE_URL` | — | Prisma Accelerate connection string |
| `DIRECT_URL` | — | Direct PostgreSQL connection |

---

## Stock Assets

### Stock Images

188 WebP images across 28 categories in `/public/stock/`:

agriculture(6), automotive(7), beauty(6), blog(3), children(6), cta(2), drink(6), education(10), family(5), fashion(11), features(3), finance(8), fitness(5), food(10), hero(6), home-living(10), lifestyle(10), medical(4), nature(7), people(7), pets(5), realestate(5), sports(12), team(6), technology(8), testimonials(4), travel(10), wedding(6)

AI references images as `/stock/{category}/{filename}.webp` in component props (e.g. HeroSection `backgroundUrl`).

### Icons

159 SVG icons from heroicons in `/public/icons/`:
- `outline/` — 98 icons (24x24, stroke)
- `solid/` — 37 icons (24x24, fill)
- `mini/` — 24 icons (20x20, fill)

Also available as React components via `@heroicons/react` package.

---

## Development

### Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server (Turbopack, port 3000) |
| `npm run build` | Production build (prisma generate + next build) |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:studio` | Prisma Studio GUI |
| `npm run db:seed` | Seed database |
| `npx vitest` | Run tests |

### Prerequisites

- Node.js 18+
- PostgreSQL (via Prisma Postgres)
- Ollama (or OpenAI/Anthropic API key)

### AI Response Format

AI returns JSON only — no markdown, no code fences, no explanation:

```json
{
  "action": "full_page | insert_component | insert_section | modify_node | replace_node | delete_node | reorder_children | clarify",
  "components": [{ "type": "ComponentName", "props": { ...fields } }],
  "targetComponentId": "optional",
  "position": 0,
  "message": "optional description"
}
```

Components are validated using Zod schemas, auto-assigned IDs via nanoid, and ordered by section priority.

---

## Architecture Decisions

| Decision | Rationale |
|---|---|
| Puck for visual editing | Industry-standard, extensible, built-in DnD + inline editing |
| Flat `content[]` over tree | Puck uses flat arrays — simpler mental model |
| Tailwind CSS 4 + CSS Variables | Dynamic styleguide injection at runtime |
| Streaming SSE | Real-time AI feedback, better UX than polling |
| Dual AI modes | Template (fast) vs Full (quality) — best of both |
| AbortSignal timeout | Prevent hanging streams on client disconnect |
| Session memory + AI profile | Context-aware responses that improve over time |
| pgvector embeddings | Semantic search for AI memory within PostgreSQL |
| ISR with 60s revalidation | Static preview performance with on-demand cache bust |

## Feature Summary

| Feature | Count/Details |
|---|---|
| Puck components | 33 registered types |
| AI templates | 25+ template generators |
| Stock images | 188 WebP images (28 categories) |
| SVG icons | 159 heroicons (3 variants) |
| API routes | 23 endpoints |
| Database models | 10 Prisma models |
| AI providers | 3 (Ollama, OpenAI, Anthropic) |
