# Loomweave AI Website Builder - Codebase Comprehension Guide

## 1. Architecture Overview

### 3-Tier Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                        │
│  • Puck Editor (visual drag-drop)                         │
│  • Next.js App Router pages                               │
│  • AI Chat Interface                                      │
│  • Dynamic Styling (CSS Variables)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓ SSE Streaming
┌─────────────────────────────────────────────────────────────┐
│                     API Layer                             │
│  • REST API routes (/api/*)                                │
│  • Streaming endpoints (/api/ai/generate/stream)           │
│  • Authentication & Authorization                         │
│  • Data Validation (Zod schemas)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓ SQL Queries
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                          │
│  • PostgreSQL with pgvector extension                      │
│  • Prisma ORM v7                                          │
│  • Vector embeddings for AI memory                        │
│  • JSON storage for Puck data structures                  │
└─────────────────────────────────────────────────────────────┘
```

### AI Pipeline Architecture
```
User Prompt → LangChain → Ollama/OpenAI → SSE Streaming → Puck Canvas
     ↓           ↓            ↓              ↓            ↓
  Prompt     Chains     Models      Events    Progressive
  Optimizer   Config    Selection     Processing   Rendering
```

### Dynamic Theming System
```
Styleguide JSON → CSS Variables → Tailwind Classes → Components
     ↓                ↓               ↓              ↓
  Colors,       Runtime CSS     Component      Visual
  Typography     Injection       Styles        Consistency
  Spacing                      System
```

## 2. Directory Map

### `src/puck/` - Puck Editor Core
**Owner:** Frontend team (visual editor specialists)
**Purpose:** Visual editing interface and component definitions

| Subdirectory | Contents | Key Files |
|--------------|----------|-----------|
| `components/` | 26 Puck component renders | `HeroSection.tsx`, `FeaturesGrid.tsx`, etc. |
| `puck.config.tsx` | Component configuration & type definitions | Main config file |
| `types.ts` | All component prop types | Type definitions |
| `categories.ts` | 6 sidebar categories | Organization metadata |
| `PuckEditor.tsx` | Main editor wrapper | Client component |
| `plugins/` | AI chat, profile components | AIChatPanel.tsx |
| `hooks/` | React hooks for editor | useAutoPolish.ts |
| `fields/` | Custom field components | ColorPickerField.tsx, etc. |
| `inspector/` | Property panel | StyleguideContext.tsx |
| `migration/` | Legacy format converters | dom-to-puck.ts |

### `src/lib/ai/` - AI Pipeline
**Owner:** AI team (prompt engineering & ML engineers)
**Purpose:** AI generation, streaming, and knowledge management

| Subdirectory | Contents | Key Files |
|--------------|----------|-----------|
| `prompts/` | AI prompt builders | `system-prompt.ts`, `template-prompt.ts` |
| `knowledge/` | Design knowledge base | `design-knowledge.ts`, `color-matcher.ts` |
| `streaming.ts` | SSE orchestration | Stream creation & management |
| `section-polisher.ts` | Streaming batch polish | `polishSectionsStream()`, `parseStreamingComponents()` |
| `defaults-engine.ts` | Post-processing visual defaults | Zero-cost visual enhancement |
| `puck-adapter.ts` | Legacy format conversion | DOMNode → Puck converter |
| `embeddings.ts` | Embedding service | Provider-agnostic embedding |
| `vector-store.ts` | pgvector operations | Similarity search |
| `memory-manager.ts` | AI memory operations | Profile CRUD + recall |
| `session-analyzer.ts` | Insight extraction | Rule-based analysis |
| `profile-updater.ts` | Profile merging | Fire-and-forget updates |
| `profile-serializer.ts` | Profile → compact text | <800 char prompts |

### `src/lib/` - Shared Utilities
**Owner:** Core team (shared infrastructure)
**Purpose:** Database, API clients, and common utilities

| File | Purpose |
|------|---------|
| `prisma.ts` | Prisma client creation |
| `api-client.ts` | Fetch wrapper with error handling |
| `id.ts` | Nanoid generation utilities |
| `utils.ts` | Common helper functions |
| `css-variables.ts` | CSS variable management |
| `css.ts` | CSS generation utilities |

### `src/features/` - Feature Modules
**Owner:** Feature teams (business logic specialists)
**Purpose:** Business features that span multiple layers

| Subdirectory | Contents |
|--------------|----------|
| `ai/templates/` | Template generators (legacy format) |
| `ai/template-registry.ts` | Template lookup system |
| `ai/component-generator.ts` | Puck component generator |
| `seo/` | SEO tools (audit, meta, JSON-LD) |
| `stock-images/` | Stock image management |

### `src/types/` - TypeScript Definitions
**Owner:** All teams (type system owners)
**Purpose:** Centralized type definitions

| Category | Files |
|----------|-------|
| Core types | `project.ts`, `page.ts`, `seo.ts` |
| AI types | `ai.ts`, `embeddings.ts` |
| Puck types | `puck.ts` (from @puckeditor/core) |
| Component types | `components.ts` (auto-generated) |

### `src/schemas/` - Validation Schemas
**Owner:** Backend team (data validation)
**Purpose:** Input/output validation with Zod

| Schema | Purpose |
|--------|---------|
| `styleguide.schema.ts` | Styleguide validation |
| `seo.schema.ts` | SEO metadata validation |
| `ai.schema.ts` | AI input/output validation |

### `src/store/` - State Management
**Owner:** Frontend team (state specialists)
**Purpose:** Global state management

| Store | Purpose |
|-------|---------|
| `toast-store.ts` | Toast notifications (Zustand) |
| `settings-store.ts` | App settings |

### `src/components/` - Shared UI Components
**Owner:** Design system team
**Purpose:** Reusable UI components

| Category | Examples |
|---------|----------|
| Form controls | `Button.tsx`, `Input.tsx`, `Card.tsx` |
| Layout | `Container.tsx`, `Grid.tsx` |
| Feedback | `Toast.tsx`, `Modal.tsx` |
| Field components | `ColorPicker.tsx`, `MediaPicker.tsx` |

### `src/app/` - Next.js App Router
**Owner:** Frontend team (page specialists)
**Purpose:** Page routes and API endpoints

| Directory | Purpose |
|-----------|---------|
| `api/` | REST API routes |
| `builder/` | Page builder interface |
| `preview/` | Public preview pages |
| `new-project/` | Project creation wizard |

### `prisma/` - Database Schema
**Owner:** Backend team (data specialists)
**Purpose:** Database schema and migrations

| File | Purpose |
|------|---------|
| `schema.prisma` | Database model definitions |
| `migrations/` | Database migration files |

## 3. Key Files Reference

### Core Puck Files
| File | Description |
|------|-------------|
| `src/puck/puck.config.tsx` | 26 component definitions with fields, defaults, and render functions |
| `src/puck/types.ts` | TypeScript interfaces for all component props |
| `src/puck/PuckEditor.tsx` | Main editor component with save/load functionality |
| `src/puck/inspector/StyleguideContext.tsx` | Runtime CSS variable injection system |

### AI Pipeline Files
| File | Description |
|------|-------------|
| `src/lib/ai/prompts/system-prompt.ts` | Full mode AI system prompt with component catalog |
| `src/lib/ai/prompts/template-prompt.ts` | Phase 1 plan generation (skeleton output) |
| `src/lib/ai/prompts/section-prompt.ts` | Phase 2 per-section polish prompt |
| `src/lib/ai/streaming.ts` | SSE stream orchestration for AI generation |
| `src/lib/ai/defaults-engine.ts` | Post-AI visual defaults (animation, gradients, images) |
| `src/lib/ai/knowledge/design-knowledge.ts` | 120 color palettes, 10 patterns, 22 design styles |
| `src/lib/ai/knowledge/color-matcher.ts` | Dynamic color matching for wizard |
| `src/app/api/ai/generate/stream/route.ts` | Main streaming endpoint |

### Database Files
| File | Description |
|------|-------------|
| `prisma/schema.prisma` | Complete database schema with all models |
| `src/lib/prisma.ts` | Prisma client configuration |

## 4. Data Flow Diagrams

### Page Generation Flow
```
User Prompt → Plan (Phase 1) → Polish (Phase 2) → Defaults → Canvas
     ↓           ↓               ↓            ↓          ↓
  Input    Fast Model       Single Stream  Zero Cost  Puck
  Analyze   (1-2s)          (1 LLM call)  Post-Proc  Render
```

**Steps:**
1. **Plan Phase**: Fast model outputs skeleton components (`{type, basic props}`)
2. **Redirect**: User immediately redirected to builder with skeleton data
3. **Auto-Polish**: Builder detects pending status and triggers Phase 2
4. **Polish Phase**: Single streaming request polishes ALL sections via `polishSectionsStream()`
5. **Defaults Engine**: Applies visual enhancements (animations, CSS var gradients, images)
6. **Canvas Update**: Components appear progressively via streaming JSON parser + SSE events

### Theme Flow
```
Styleguide JSON → CSS Variables → Tailwind Classes → Components
     ↓                ↓               ↓              ↓
  Colors,       Runtime CSS     Component      Visual
  Typography     Injection       Styles        Consistency
  Spacing                      System
```

**Implementation:**
1. **Styleguide**: Color palette, typography scale, spacing tokens
2. **CSS Variables**: Runtime injection via `StyleguideContext`
3. **Tailwind Classes**: Custom CSS utilities for design tokens
4. **Components**: Styled using CSS variables for consistency

### AI Memory System Flow
```
Chat → Embeddings → Vector Search → Profile Update → Next Prompt
  ↓       ↓           ↓             ↓            ↓
Input    Provider    pgvector      Structured   Enhanced
         Embed      Similarity    Profile      Prompts
```

**Flow:**
1. **Embedding**: User message converted to vector
2. **Vector Search**: Similar past experiences retrieved
3. **Profile Update**: Insights merged into structured profile
4. **Prompt Enhancement**: Profile injected into next prompt

### Database Flow
```
Prisma Schema → Accelerate URL → PostgreSQL with pgvector
     ↓               ↓              ↓
  Type Definitions  Connection    Vector Search
  Validation       Pool          Embeddings
```

**Features:**
- **Prisma Accelerate**: Connection pooling for app runtime
- **Direct URL**: For CLI operations (db push, migrate)
- **pgvector**: Cosine similarity for vector search
- **JSON Fields**: Puck data structures stored as JSON

## 5. Component Architecture

### 26 Puck Components
Components are organized into 6 categories:

| Category | Components | Purpose |
|----------|------------|---------|
| **Navigation** | HeaderNav, FooterSection | Site navigation structure |
| **Hero** | HeroSection | Main value proposition |
| **Content** | FeaturesGrid, FeatureShowcase, StatsSection, BlogSection, FAQSection, TeamSection, TextBlock, ColumnsLayout | Main content sections |
| **Social Proof** | LogoGrid, SocialProof, TestimonialSection | Trust indicators |
| **Business** | PricingTable, ComparisonTable, ProductCards | Commercial content |
| **Conversion** | CTASection, NewsletterSignup, ContactForm, CountdownTimer | Lead generation |
| **Media** | Gallery, ImageBlock | Visual content |
| **Layout** | Spacer, Banner, AnnouncementBar, CustomSection | Structure & decoration |

### Component Structure
Each component follows this pattern:
```typescript
// In types.ts
interface ComponentProps {
  id: string;
  // ... specific props
}

// In puck.config.tsx
const Component: ComponentConfig = {
  fields: { /* field definitions */ },
  defaultProps: { /* default values */ },
  render: ({ props }) => <ComponentRender {...props} />
}

// In components/Component.tsx
export function ComponentRender(props: ComponentProps) {
  // Tailwind styling + logic
}
```

### Design Styles System
8 coordinated visual styles available across all components (defined in `src/puck/lib/design-styles.ts`):
- **elevated**: Soft shadows, rounded corners, subtle depth (default)
- **minimal**: No shadows, subtle borders, airy whitespace
- **glassmorphism**: Blur, translucent layers, gradient mesh
- **brutalism**: Thick borders, sharp corners, bold type, offset shadows
- **neobrutalism**: Playful brutalism with color, thick borders
- **soft-ui**: Gentle depth, neumorphism-inspired, warm
- **aurora**: Gradient mesh, flowing color, organic shapes
- **bento**: Apple-style grid, tight spacing, clean, modern

Style selection affects:
- Section backgrounds, card styles, typography, buttons, hover effects
- Applied via `designStyle` prop on all section components
- Injected by defaults-engine from `mapStylePriorityToDesignStyle()`

## 6. AI Knowledge System

### Static Knowledge (`design-knowledge.ts`)
- **120 Color Palettes**: Business-type-specific color schemes
- **22 Design Styles**: Complete visual style definitions
- **10 Landing Patterns**: Recommended section arrangements
- **14 Typography Pairings**: Font combinations per industry
- **11 Business Types**: Industry-specific content guidelines

### Dynamic Matching (`color-matcher.ts`)
- Bilingual color name → hex map (English + Vietnamese)
- HSL distance calculation for color matching
- Style keyword matching against DESIGN_STYLES
- `resolveWizardRecommendations()` combines color + style + business signals

### Vector Memory System
- **pgvector**: PostgreSQL extension for similarity search
- **Embeddings**: Ollama nomic-embed-text or OpenAI text-embedding-3-small
- **Memory Types**: Project-specific, global, and user memories
- **Cosine Similarity**: Finds relevant past experiences

### Prompt Optimization
Zero-cost preprocessing that:
- Detects language (Vietnamese/English)
- Extracts intent (create_page, add_section, modify, delete)
- Identifies business type (20+ categories)
- Resolves design guidance (colors, typography)
- Selects relevant component catalog tier

## 7. Database Models

### Core Entities
```typescript
Project    // Project settings & metadata
Page       // Pages with Puck treeData (JSON)
Styleguide // Colors, typography, spacing (JSON)
GlobalSection // Reusable header/footer sections
Revision   // Page snapshots for versioning
UserLibrary // Saved components
```

### AI Entities
```typescript
AIPromptLog      // AI interaction logging
AISession        // Per-page session history
AISessionMessage // Individual messages in sessions
ProjectAIProfile // Structured project insights
VectorEmbedding   // Unified vector storage
```

### Relationships
- `Project` → `Page[]` (one-to-many)
- `Project` → `Styleguide` (one-to-one, nullable)
- `Project` → `GlobalSection[]` (one-to-many)
- `Project` → `ProjectAIProfile` (one-to-one, nullable)
- `Project` → `VectorEmbedding[]` (one-to-many)
- `Page` → `Revision[]` (one-to-many)
- `AISession` → `AISessionMessage[]` (one-to-many)

## 8. How to Navigate

### Adding a New Puck Component
1. **Add type definition**: `src/puck/types.ts`
2. **Create render component**: `src/puck/components/NewComponent.tsx`
3. **Update config**: `src/puck/puck.config.tsx`
4. **Add category**: `src/puck/categories.ts` (if needed)
5. **Add fields**: `src/puck/fields/NewComponentField.tsx` (if custom)
6. **Update AI knowledge**: `src/lib/ai/knowledge/design-knowledge.ts` (if applicable)

### Modifying the AI Prompt
1. **Find prompt file**: 
   - Full mode: `src/lib/ai/prompts/system-prompt.ts`
   - Plan mode: `src/lib/ai/prompts/template-prompt.ts`
   - Polish mode: `src/lib/ai/prompts/section-prompt.ts`
2. **Update prompt content**: Add examples, constraints, or rules
3. **Update component catalog**: `src/lib/ai/prompts/component-catalog.ts`
4. **Test flow**: Use AI chat in builder to verify

### Adding a New API Endpoint
1. **Create route**: `src/app/api/new-feature/route.ts`
2. **Add input validation**: Use Zod schema in `src/schemas/`
3. **Implement logic**: Use `src/lib/api-client.ts` for DB operations
4. **Add error handling**: Use `ApiResponse<T>` pattern
5. **Add permissions**: Implement authentication/authorization

### Changing Database Schema
1. **Update schema**: `prisma/schema.prisma`
2. **Generate client**: `npx prisma generate`
3. **Push changes**: `DATABASE_URL="$DATABASE_DIRECT_URL" npx prisma db push`
4. **Update types**: TypeScript types auto-generated
5. **Create migration**: `npx prisma migrate dev`

### Adding a New Design Style
1. **Update design knowledge**: `src/lib/ai/knowledge/design-knowledge.ts`
2. **Add color palette**: To `PRODUCT_COLOR_PALETTES`
3. **Add typography**: To `PRODUCT_TYPOGRAPHY`
4. **Add pattern info**: To `LANDING_PATTERNS`
5. **Test with AI**: Use wizard to verify style application

## 9. Development Workflow

### Before Starting Large Tasks
1. **Commit and push**: Ensure clean checkpoint
2. **Check git status**: No uncommitted changes
3. **Review related files**: Understand current implementation

### Code Conventions
- **Path alias**: Use `@/` for all imports
- **TypeScript**: Strict mode, no `any` types
- **Validation**: All external input validated with Zod
- **Component location**: Puck components in `src/puck/components/`
- **Template format**: Template generators output old DOMNode format

### Testing Strategy
- **Unit tests**: For utilities and helpers (Vitest)
- **Component tests**: For Puck components (jsdom)
- **Integration tests**: For AI pipeline (mock LLM responses)
- **E2E tests**: For full user flows (Playwright)

### Performance Considerations
- **Streaming**: Use SSE for progressive rendering
- **Caching**: Cache AI responses where possible
- **Vector search**: Limit memory searches to relevant contexts
- **Component optimization**: Memoize expensive operations

## 10. Common Patterns

### API Response Pattern
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    [key: string]: unknown;
  };
}
```

### Component Field Pattern
```typescript
{
  fields: {
    heading: { type: "text" },
    color: { type: "color" },
    image: { type: "media" }
  },
  defaultProps: {
    heading: "Default Heading",
    color: "#3B82F6"
  }
}
```

### AI Context Pattern
```typescript
interface AIContext {
  userPrompt: string;
  businessType?: string;
  designGuidance?: DesignGuidance;
  styleguideData?: StyleguideTokens;
  sessionHistory?: AISessionMessage[];
  position?: { index: number; total: number };
}
```

### CSS Variable Pattern
```typescript
// In styleguide context
:root {
  --primary: #3B82F6;
  --primary-on: #FFFFFF;
  --font-heading: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
}

// In components
color: var(--primary);
font-family: var(--font-heading);
```

This guide should help new team members quickly understand the codebase structure and development patterns. For detailed API documentation, see the individual files and inline comments.