# AI Generation Pipeline — Technical Documentation

> Tài liệu kỹ thuật cho team improve/extend AI pipeline.
> Last updated: 2026-04-10

---

## 1. Mục tiêu Pipeline

Pipeline biến **user prompt** (natural language) thành **Puck ComponentData[]** — structured JSON array các UI component đã có đầy đủ props, content, animation, gradient, hình ảnh.

### Mục tiêu chính:
- **Prompt → JSON**: User mô tả bằng tiếng Việt/Anh → AI output Puck components
- **Quality cao**: Animation, gradient, stock images, business-specific content
- **Tốc độ cảm nhận nhanh**: Redirect vào builder trong ~3s, content streaming trực tiếp trên canvas
- **Multi-provider**: Hỗ trợ Ollama, OpenAI, Anthropic, Gemini
- **Zero-cost optimization**: Prompt optimizer + design knowledge = không tốn LLM call để phân tích
- **Reusable makeup**: Hàm polish tái sử dụng cho full page, add section, edit layout

### Ba chế độ hoạt động:

| Mode | Khi nào dùng | Cách hoạt động |
|------|-------------|----------------|
| **Wizard → Builder (2-phase)** | `create_page` từ wizard | Phase 1: plan + save skeleton → redirect. Phase 2: auto-polish trong builder |
| **Makeup (in-builder)** | Chat AI trong builder (create/restyle) | polishSections() streaming trực tiếp trên canvas |
| **Full AI** | `modify`, `delete`, `unknown` | Single LLM call với full system prompt + conversation history |

---

## 2. Ràng buộc Prompt & Persona (Quan trọng)

Để giảm token và duy trì tính nhất quán cho AI Chat (Winnie, Builder Chat), pipeline áp dụng các RÀNG BUỘC (Constraints) sau:

1. **Skeletonize Phase 1:** `template-prompt.ts` bị cấm sinh ra các property làm đẹp (padding, animation, gradient). Nó chỉ trả về `[{type, props: { id, name, purpose }}]` để giảm tối đa chi phí output token và tăng tốc TTFB.
2. **DRY Design Rules:** Mọi format Markdown truyền vào prompt (bảng màu, typography) đều gọi qua `buildUnifiedDesignTokensBlock` từ `prompt-utils.ts`.
3. **No-Emoji Tone:** Giao tiếp AI tuyệt đối chuyên nghiệp năng lượng ("chuyên nghiệp, dễ thương và năng lượng") qua ngôn từ, CẤM hoàn toàn emoji để không làm giảm giá trị thương hiệu LoomWeave.
4. **Few-Shot Routing:** `system-prompt.ts` chứa các ví dụ Few-Shot (modify_node) để đảm bảo LLM hiểu đúng level của action thay vì generate lại cả trang.

---

## 3. Kiến trúc tổng thể

### 2.1. Wizard → Builder Flow (create_page)

```
┌─ WIZARD (FinalizeStep) ─────────────────── ~3 giây ────┐
│                                                         │
│  Step 1: Create Project + Styleguide + SEO             │
│                                                         │
│  Step 2: Plan Only (Flash Lite — fast model)            │
│  ┌────────────────────────────────────────────────┐     │
│  │  POST /api/ai/plan                             │     │
│  │  • optimizePrompt() → businessType, intent     │     │
│  │  • buildTemplatePrompt() → Flash Lite          │     │
│  │  • Output: [{type, props sơ bộ}]               │     │
│  │  • Save skeleton treeData vào DB               │     │
│  │  • Set page.generationStatus = "pending"       │     │
│  └────────────────────────────────────────────────┘     │
│                                                         │
│  Step 3: router.push(/builder/{projectId})   ← NHANH   │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─ BUILDER (auto-detect pending) ────────────────────────┐
│                                                         │
│  useAutoPolish() hook detects generationStatus="pending"│
│                                                         │
│  Step 1: Render skeletons từ treeData lên canvas       │
│                                                         │
│  Step 2: Auto-call polishSectionsStream() via streaming API │
│  ┌────────────────────────────────────────────────┐    │
│  │  POST /api/ai/generate/stream (isAutoPolish)   │    │
│  │  • polishSectionsStream() — single LLM call    │    │
│  │  • parseStreamingComponents() → progressive    │    │
│  │  • SSE: component_stream per section           │    │
│  │  • Skeleton → real component trên canvas       │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  Step 3: applyComponentDefaults() — fill gaps          │
│  Step 4: Skeleton IDs replaced on canvas = done       │
│                                                         │
│  ⚠ UI locked (editing disabled) trong khi polishing    │
└─────────────────────────────────────────────────────────┘
```

### 2.2. In-Builder AI Chat Flow

```
User types in AIChatPanel
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  Route: POST /api/ai/generate/stream                    │
│                                                         │
│  Step 1: Load Context (styleguide, session, profile)   │
│  Step 2: optimizePrompt() → detect intent              │
│  Step 3: Route by intent:                              │
│                                                         │
│  ┌─ create_page / auto-polish ──────────────────────┐  │
│  │  1. buildTemplatePrompt() → plan (or from tree) │  │
│  │  2. createMakeupStream() → polishSectionsStream │  │
│  │  3. applyComponentDefaults()                     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─ add_section ────────────────────────────────────┐  │
│  │  polishSectionsStream([newComponent], ctx)        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─ modify/delete/unknown ──────────────────────────┐  │
│  │  createAIStream() → single LLM call + history    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  Step 4: SSE Stream → AIChatPanel → Puck canvas        │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Cấu trúc Code — File Map

### 3.1. Core Pipeline (`src/lib/ai/`)

```
src/lib/ai/
├── config.ts                # AI config resolver (env vars → typed config)
├── provider.ts              # Model factory (Ollama/OpenAI/Anthropic/Gemini)
├── chain.ts                 # LangChain chain configuration
├── streaming.ts             # ★ Stream functions (createMakeupStream, createAIStream)
├── section-polisher.ts      # ★ Streaming batch polish: polishSectionsStream() + parseStreamingComponents()
├── defaults-engine.ts       # ★ NEW: Post-processing (animation, gradient, bg cycle)
├── output.ts                # Output validation (AI JSON → AIGenerationResponse)
├── output-sanitizer.ts      # Clean AI output (strip legacy format)
├── puck-adapter.ts          # Legacy DOMNode → Puck ComponentData converter
├── section-generator.ts     # Deterministic section plan resolver
├── embeddings.ts            # Embedding service (Ollama/OpenAI)
├── vector-store.ts          # pgvector CRUD + similarity search
├── memory.ts                # Session memory (miniContext, history)
├── memory-manager.ts        # AI profile + memory operations
├── session-analyzer.ts      # Rule-based insight extraction (zero LLM)
├── profile-updater.ts       # Merge session insights into profile
├── profile-serializer.ts    # Profile → compact prompt text (<800 chars)
│
├── prompts/
│   ├── system-prompt.ts        # ★ FULL mode system prompt builder (Few-shot routing examples)
│   ├── template-prompt.ts      # ★ Phase 1 — plan generation prompt (Outputs restricted skeleton JSON)
│   ├── section-prompt.ts       # ★ Phase 2 — per-section polish prompt
│   ├── prompt-optimizer.ts     # ★ Zero-cost prompt enrichment
│   ├── prompt-utils.ts         # ★ Centralized design token formatter (DRY)
│   ├── component-catalog.ts    # ★ Single source of truth: 26 component metadata
│   └── template-schema.ts      # Validate AI component response
│
└── knowledge/
    ├── design-knowledge.ts     # Static design data (palettes, patterns, typography)
    ├── color-matcher.ts        # ★ Dynamic color/style keyword matching (bilingual VI/EN)
    ├── business-detect.ts      # Business type detection from text
    └── knowledge-search.ts     # RAG vector search for design context
```

### 3.2. API Routes (`src/app/api/ai/`)

```
src/app/api/ai/
├── generate/
│   ├── route.ts                # Non-streaming generate (legacy)
│   └── stream/route.ts         # ★ Main streaming endpoint (makeup + full mode)
├── plan/route.ts               # ★ NEW: Plan-only endpoint for wizard (sync)
├── profile/route.ts            # AI profile CRUD
├── conversations/route.ts      # Session history
└── wizard/                     # New project wizard
    ├── chat/route.ts
    ├── generate-settings/route.ts
    └── finalize/route.ts
```

### 3.3. Frontend (`src/puck/`)

```
src/puck/
├── plugins/
│   └── AIChatPanel.tsx         # ★ Chat UI + progressive rendering
├── hooks/
│   └── useAutoPolish.ts        # ★ NEW: Auto-detect pending → auto-polish
├── components/
│   └── SectionSkeleton.tsx     # ★ Skeleton placeholders (makeup mode)
├── puck.config.tsx             # 26 component definitions
└── types.ts                    # Component prop types
```

### 3.4. Wizard (`src/app/new-project/`)

```
src/app/new-project/
├── page.tsx
├── NewProjectWizard.tsx
└── components/
    ├── FinalizeStep.tsx          # ★ MODIFIED: Plan only → redirect fast
    ├── WinnieChat.tsx            # Chat-based wizard intake
    ├── ProjectSettingsStep.tsx   # Styleguide + SEO settings
    ├── StylePalettePicker.tsx    # Visual style selection
    ├── StepIndicator.tsx         # Wizard progress indicator
    └── NewProjectWizardModal.tsx # Modal wrapper
```

---

## 4. Streaming Batch Polish — `section-polisher.ts`

> Single-request streaming approach: ALL sections polished in one LLM call.
> As the model streams the JSON array, a streaming JSON parser detects each complete component and emits callbacks for progressive rendering.

### 4.1. API

```typescript
// ── Types ──────────────────────────────────────────────

interface PolishContext {
  userPrompt: string;
  businessType?: string;
  businessName?: string;
  designGuidance?: DesignGuidance;
  styleguideData?: MinimalStyleguideTokens;
  designContext?: string;
  signal?: AbortSignal;
  timeoutMs?: number;       // Total batch timeout (default: 180_000)
  isMakeup?: boolean;       // true = polish existing props, false = generate fresh
  useFastModel?: boolean;   // true = fast model, false = main model (default)
}

interface PolishResult {
  type: string;
  props: Record<string, unknown>;
}

// ── Functions ──────────────────────────────────────────

/** Polish ALL sections in a single streaming request (1 LLM call) */
async function polishSectionsStream(
  components: Array<{ type: string; props: Record<string, unknown> }>,
  ctx: PolishContext,
  onSectionDone?: (index: number, total: number, result: PolishResult) => void,
): Promise<PolishResult[]>

/** Streaming JSON array parser — detects complete objects during stream */
function parseStreamingComponents(
  buffer: string,
  alreadyParsed: number,
  scanFrom?: number,
): { complete: Array<{ index: number; data: unknown }>; scanTo: number }
```

### 4.2. Nơi sử dụng

| Context | Function | Số LLM calls |
|---------|----------|-------------|
| Wizard → Builder auto-polish | `polishSectionsStream(plan, ctx, onDone)` | 1 (streaming) |
| Builder chat: "tạo trang mới" | `polishSectionsStream(plan, ctx, onDone)` | 1 (streaming) |
| Makeup mode (restyle) | `polishSectionsStream(existingPlan, ctx, onDone)` | 1 (streaming) |

### 4.3. Logic bên trong `polishSectionsStream()`

```
Input: [{ type: "HeroSection", props: {...} }, { type: "FeaturesGrid", props: {...} }, ...]
  │
  ├── buildBatchSectionPrompt(components, ctx)
  │   └── Single system prompt with ALL sections catalog + design tokens
  │
  ├── createModelBundle({ maxTokens: 16384 }) or createFastModelBundle({ maxTokens: 10240 })
  │   └── Main model (quality) or Fast model (speed)
  │
  ├── model.stream(messages, { signal })
  │   └── Streams JSON array: [{ type, props }, { type, props }, ...]
  │
  ├── parseStreamingComponents() on each chunk
  │   └── Tracks brace+bracket depth to detect complete JSON objects
  │   └── Emits onSectionDone callback per completed component
  │   └── Progressive rendering on canvas
  │
  ├── Fallback: extractJSON() on full buffer if streaming parser misses some
  │
  └── Returns: PolishResult[] (same order as input)
```

---

## 5. Defaults Engine — `defaults-engine.ts`

Post-processing layer chạy **AFTER** AI generation, **BEFORE** emitting to frontend.
**Zero LLM cost** — pure code-based.

### 5.1. API

```typescript
function applyComponentDefaults(
  components: ComponentData[],
  context?: { businessType?: string; designGuidance?: DesignGuidance },
): ComponentData[]
```

### 5.2. What it does

| Phase | Action | Ví dụ |
|-------|--------|-------|
| Per-component defaults | Inject animation, variant, hover | HeroSection → `animation: "fade-up"` |
| Hero background fill | Business type → stock image | restaurant → `/images/stock/restaurant/hero-1.jpg` |
| **CSS Variable Gradients** | CSS vars instead of AI-injected hex | HeroSection uses `var(--primary) → var(--tertiary)` |
| Avatar fill | Testimonial/Team → placeholder avatars | `avatarUrl: "/images/stock/avatars/person-1.jpg"` |
| Background alternation | Visual rhythm across sections | Even: light bg, Odd: muted bg |

### 5.3. Vị trí trong pipeline

```
AI Output → polishSectionsStream() → applyComponentDefaults() → emitComponentStream()
                                           ↑
                                      Zero cost, deterministic
```

---

## 6. Database: Page Generation Status

### Schema change

```prisma
model Page {
  ...
  generationStatus String? @default(null)
  // null       = normal page (manually created or fully polished)
  // "pending"  = skeleton saved, waiting for polish
  // "polishing"= Phase 2 in progress
  // "complete" = polish finished (transitions to null on next save)
  ...
}
```

### State machine

```
null ──[wizard creates page]──→ "pending"
                                    │
                      [builder loads, useAutoPolish detects "pending"]
                                    │
                                    ▼
                              Auto-polish streams
                      (skeleton IDs replaced on canvas)
                                    │
                                    ▼
                             Canvas is "complete"
                    (no DB write — skeleton IDs gone = done)
```

---

## 7. Flow chi tiết — Phase 1 (Plan)

### 7.1. API: `POST /api/ai/plan`

**Sync endpoint** — chỉ ~1-2 giây.

```typescript
// Request
POST /api/ai/plan
{
  prompt: string;        // User description
  projectId: string;
  pageId: string;
  styleguideId?: string;
}

// Response
{
  success: true,
  data: {
    components: [
      { type: "HeaderNav", props: { ... } },
      { type: "HeroSection", props: { ... } },
      ...
    ],
    treeData: {
      root: { props: { title: "Home" } },
      content: [/* skeleton ComponentData[] */]
    }
  }
}
```

**Internal flow:**
1. Load styleguide + project AI profile (parallel)
2. `optimizePrompt(prompt)` → businessType, designContext, designGuidance
3. `buildTemplatePrompt(ctx)` → Flash Lite model
4. `validateTemplateResponse()` → validate plan
5. Build skeleton treeData: each component gets `id` but minimal props
6. Save to DB: `page.treeData = skeleton`, `page.generationStatus = "pending"`
7. Return plan + treeData

### 7.2. Wizard FinalizeStep (simplified)

```
BEFORE (15s wait):
  creating → styleguide → seo → generateFromPromptStream() → WAIT → save → redirect

AFTER (3s wait):
  creating → styleguide → seo → POST /api/ai/plan (1-2s) → redirect IMMEDIATELY
```

No more "generating" spinner phase in wizard.

---

## 8. Flow chi tiết — Phase 2 (Polish)

### 8.1. Builder Auto-Polish: `useAutoPolish()` hook

```typescript
// File: src/puck/hooks/useAutoPolish.ts

interface UseAutoPolishProps {
  projectId: string;
  pageId: string;
  styleguideId?: string;
  generationStatus?: string | null;  // "pending" triggers auto-polish
  onComponentStream: (component, index, total, replacesSkelId?) => void;
  onPlan?: (plan: { type: string; skeletonId: string }[]) => void;
  onComplete: () => void;
  onError: (error: string) => void;
}

// Returns:
{ isPolishing: boolean; progressLabel: string; error: string | null }
```

**Behavior:**
1. Triggers when `generationStatus === "pending"` AND `styleguideId` available
2. Calls `apiClient.generateFromPromptStream()` with `isAutoPolish: true`
3. Callbacks via refs (avoids abort on re-render): `onPlan` → `onComponentStream` → `onComplete`
4. No DB status writes — completion is detected by skeleton IDs being replaced on canvas
5. `polishedRef` prevents double-trigger across re-renders

### 8.2. Backend Auto-Polish Flow (stream route)

When `isAutoPolish=true`, the route handler:
1. **Skips session creation** — no AISession, no history, saves ~500ms
2. **Skips RAG lookup** — uses static design-knowledge.ts instead
3. **Loads business context from ProjectAIProfile** (businessType, businessName, tone, style)
4. **Resolves designGuidance** from business type (zero LLM cost)
5. **Routes to `createMakeupStream()`** with `intent: 'modify'` and `existingTreeData`

### 8.3. Streaming Polish Flow

```
Builder loads page (generationStatus = "pending")
    │
    ▼
useAutoPolish() detects status
    │
    ▼
POST /api/ai/generate/stream  { isAutoPolish: true }
    │
    ├── Load page treeData + styleguide + AI profile (parallel)
    ├── Resolve designGuidance from businessType (zero cost)
    ├── Skip session + RAG (not needed for auto-polish)
    │
    ▼
createMakeupStream(enrichedPrompt, { existingTreeData, intent: 'modify' })
    │
    ├── Phase 1: Extract plan from existing treeData (zero AI cost)
    │   └── Emit SSE: plan → [{ type, skeletonId }] for skeleton rendering
    │
    ├── Phase 2: polishSectionsStream() — SINGLE streaming request
    │   ├── SSE: status(generating) → "Polishing N sections..."
    │   ├── buildBatchSectionPrompt(ALL components) → single system prompt
    │   ├── model.stream() → streams JSON array of ALL sections
    │   ├── parseStreamingComponents() → detects each complete component
    │   ├── SSE: component_stream(0) → HeaderNav ready
    │   │   └── Replace skeleton "skel_123" with real component
    │   ├── SSE: component_stream(1) → HeroSection ready
    │   │   └── Replace skeleton "skel_456" with real component
    │   ├── ... (sections appear as streaming parser completes them)
    │   └── Fallback: extractJSON() on full buffer if stream parser misses any
    │
    ├── applyComponentDefaults() — fills animation, gradients, images
    │   └── CSS var gradients (var(--primary) → var(--tertiary))
    │   └── Auto-applied animation defaults (fade-up, stagger, etc.)
    │
    ├── SSE: done → { action: "full_page", components: [...] }
    │   └── Skeleton IDs replaced on Puck canvas = "complete"
    │   └── No DB generationStatus write needed
    │
    └── Builder re-enables editing
```

---

## 9. Prompt System — Chi tiết từng Prompt Builder

### 9.1. `buildChainPrompt()` — Full Mode System Prompt

**File:** `src/lib/ai/prompts/system-prompt.ts`
**Khi nào dùng:** Full AI mode (modify, delete, unknown intent)

**Prompt structure:**
```
[System] → Component Catalog + Styleguide + Design Intelligence + Page Layout
[History] → Conversation messages from session
[Human] → User prompt
```

**Các phần chính trong system message:**
1. **COMPONENT CATALOG** — Dynamic 3-tier catalog (full detail / summary / name-only)
2. **RESPONSE FORMAT** — JSON: `{ action, components, targetComponentId, position, message }`
3. **DESIGN PRINCIPLES** — 7 rules (alternate backgrounds, consistent palette, no emojis...)
4. **DESIGN INTELLIGENCE** — Color usage, component prop utilization, content quality
5. **RECOMMENDED PAGE LAYOUT** — From `design-knowledge.ts` landing patterns
6. **STYLEGUIDE CONSTRAINTS** — Color tokens, typography rules
7. **MODIFICATION ACTIONS** — 8 action types (full_page, insert_component, modify_node...)

### 9.2. `buildTemplatePrompt()` — Phase 1 Plan Prompt

**File:** `src/lib/ai/prompts/template-prompt.ts`
**Khi nào dùng:** Plan generation — chọn 5-8 component types + basic props
**Model:** Flash Lite (fast model)

**Key changes:**
- **Dynamic Landing Patterns**: Resolves business-type-specific patterns instead of hardcoded "typical order"
- **10 patterns**: hero_features_cta, hero_testimonials_cta, product_showcase, pricing_focused, minimal_funnel, waitlist_launch, ecommerce_full, trust_authority, event_countdown, creative_portfolio
- **AI flexibility**: Can now add/swap components to fit business needs

**Response format:**
```json
{ "components": [ { "type": "HeaderNav", "props": { ... } }, ... ] }
```

### 9.3. `buildSectionPrompt()` — Phase 2 Per-Section Prompt

**File:** `src/lib/ai/prompts/section-prompt.ts`
**Khi nào dùng:** Polish từng section (called by `polishSection()`)
**Model:** Main model (Gemini Flash / qwen3.5)

**Optimizations:**
- **Shared constants**: Deduplicated CONTENT_PROPS, CLICHE_WARNING, CONCRETE_RULES
- **Compact stock images**: Using buildBatchStockImageHint() instead of buildStockImageHint()
- **Polish mode optimization**: Skips `buildUnifiedDesignTokensBlock()` + uses `buildPolishRules()` instead of full system rules when `isMakeup=true` — 57% input token reduction

**Input:**
```typescript
interface SectionPromptContext {
  userPrompt: string;
  businessType: string;
  designGuidance?: DesignGuidance;
  styleguideData?: StyleguideTokens;
  designContext?: string;
  position: { index: number; total: number };
  isMakeup?: boolean;  // → thêm Makeup Enhancement Rules
}
```

**Makeup Enhancement Rules** (khi `isMakeup = true`):
1. **Content Quality** (MOST IMPORTANT) — Specific, compelling content tailored to business type. No generic clichés.
2. **Images** — Fill ALL image props using EXACT paths from stock library. Each section uses a DIFFERENT image.
3. **Visual styling is AUTO-APPLIED** — Do NOT set animation, cardStyle, hoverEffect, variant, columns, gradientFrom/gradientTo, or padding props. These are injected by defaults-engine.

**CONTENT_PROPS map** — 19 component types có content fields cần fill:
```typescript
CONTENT_PROPS = {
  HeroSection: 'heading, subtext, ctaText, badge text, trustBadges (3-4 items)',
  FeaturesGrid: 'heading, subtext, 4-6 features with title + description + icon name',
  TestimonialSection: 'heading, 3-4 testimonials with specific quote + author + role',
  CTASection: 'heading, subtext, ctaText',
  PricingTable: 'heading, 3 tiers with name + price + realistic feature list',
  // ... more types
}
```

**Response format:**
```json
{ "props": { "heading": "...", "animation": "fade-up", ... } }
```

### 9.4. Design Style System

**8 coordinated visual styles** applied automatically to all components (defined in `src/puck/lib/design-styles.ts`):

| Style | `designStyle` value | Characteristics |
|-------|---------------------|----------------|
| **Elevated (Default)** | `"elevated"` | Soft shadows, rounded corners, subtle depth |
| **Minimal** | `"minimal"` | No shadows, subtle borders, airy whitespace |
| **Glassmorphism** | `"glassmorphism"` | Blur, translucent layers, gradient mesh |
| **Brutalism** | `"brutalism"` | Thick borders, sharp corners, bold type, offset shadows |
| **Neo-Brutalism** | `"neobrutalism"` | Playful brutalism with color, thick borders |
| **Soft UI** | `"soft-ui"` | Gentle depth, neumorphism-inspired, warm |
| **Aurora** | `"aurora"` | Gradient mesh, flowing color, organic shapes |
| **Bento Grid** | `"bento"` | Apple-style grid, tight spacing, clean, modern |

**Implementation:**
- `getDesignTokens(style)` returns coordinated: section backgrounds, card styles, typography, buttons, hover effects, decorative elements
- Applied via `designStyle` prop on all section components
- Injected by defaults-engine from `designGuidance.reasoning.stylePriority` via `mapStylePriorityToDesignStyle()`
- `buildUnifiedDesignTokensBlock()` instructs AI: `set designStyle prop on EVERY section component`

### 9.5. `optimizePrompt()` — Zero-cost Prompt Enrichment

**File:** `src/lib/ai/prompts/prompt-optimizer.ts`
**Chi phí:** Zero — pure rule-based, không gọi LLM

**What it does:**
1. `detectLanguage()` → vi/en/mixed
2. `detectIntent()` → create_page/add_section/modify/delete/unknown
3. `detectBusinessType()` → 20+ industry types
4. `detectStyle()` → modern/minimal/elegant/bold/...
5. `resolveDesignGuidance()` → complete color palette + typography
6. `selectRelevantComponents()` → 3-tier catalog

### 9.6. Token Optimization

**Polish mode token savings: ~57% input reduction (1,080 tokens saved per request)**

Polish mode skips visual styling instructions since defaults-engine handles all of that at zero cost:
- `buildPolishRules()` replaces `buildSystemLevelDesignRules()` in makeup mode (~79t vs ~821t, 90% less)
- `buildUnifiedDesignTokensBlock()` skipped entirely in makeup mode (~338t saved)
- Animation specs, color tokens, typography, COMPOSITION_RULES — all handled by defaults-engine
- Full AI mode (modify/delete) still uses complete `buildSystemLevelDesignRules()` + design tokens

**Token cost per polish request:**
- Before: ~1,881 input tokens
- After: ~801 input tokens (43% of original)
- Output: ~1,620 tokens (unchanged)
- Total: ~2,421 tokens (was ~3,501, 31% reduction)

---

## 10. Design Knowledge System

### 10.1. Static Knowledge (`design-knowledge.ts`)

Zero-cost data injected trực tiếp vào prompt:

- **PRODUCT_COLOR_PALETTES** — 20+ business types → shadcn-compatible color tokens
- **LANDING_PATTERNS** — Recommended section order per business type
- **PRODUCT_REASONING** — Style priority, typography mood, anti-patterns
- **PRODUCT_TYPOGRAPHY** — Font recommendations per industry

### 10.2. RAG Knowledge (`knowledge-search.ts`)

pgvector-powered similarity search:
- User prompt → embedding → cosine similarity search → design context text
- Non-fatal: fails gracefully if pgvector unavailable

---

## 11. Model Configuration

### 11.1. Config (`src/lib/ai/config.ts`)

```
AI_PROVIDER=gemini          # ollama | openai | anthropic | gemini
AI_MODEL=gemini-2.5-flash   # Main model
AI_API_KEY=...
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=16384

# Fast model (for plan generation):
AI_FAST_PROVIDER=gemini
AI_FAST_MODEL=gemini-3.1-flash-lite
AI_FAST_API_KEY=...
```

### 11.2. Model Usage trong Pipeline

| Task | Model Factory | Max Tokens | Timeout |
|------|--------------|-----------|---------|
| Phase 1: Plan | `createFastModelBundle()` | 4096 | 90s |
| Phase 2: Per-section polish | `createModelBundle()` | 4096 | 60s/section |
| Full AI mode | `createModelBundle()` | 16384 | 180s |
| Wizard chat | `createFastModelBundle()` | 4096 | 90s |
| Single section polish | `createModelBundle()` | 4096 | 60s |

---

## 12. SSE Event Types

```typescript
interface SSEEvent {
  type: 'chunk' | 'done' | 'error' | 'status' | 'component_stream' | 'plan';

  // status event
  step?: string;       // 'planning' | 'generating' | 'parsing' | 'rendering'
  label?: string;      // Human-readable label

  // plan event (Phase 1 result)
  plan?: { type: string; skeletonId: string }[];

  // component_stream event (Phase 2, per section)
  component?: ComponentData;
  componentIndex?: number;
  componentTotal?: number;
  replacesSkelId?: string;  // Skeleton ID being replaced

  // done event
  result?: AIGenerationResponse;

  // error event
  message?: string;
}
```

---

## 13. Output Validation Pipeline

### 13.1. Template Response (`template-schema.ts`)
```
AI JSON → validateTemplateResponse()
  ├── Check components array exists, length 1-12
  ├── Validate each component type against VALID_COMPONENT_TYPES
  ├── Fuzzy match (case-insensitive, strip spaces) for typos
  └── Return { data: PuckComponentPlanRaw, error: null }
```

### 13.2. Single Component (`template-schema.ts`)
```
AI JSON → validateSingleComponent()
  ├── Accept { props: {...} } format (unwrapped)
  ├── Accept { type, props } format (standard)
  ├── Warn on unknown types (don't reject)
  └── Return { data: PuckComponentRaw, error: null }
```

### 13.3. JSON Extraction (`streaming.ts`)
```
Accumulated text → extractJSON()
  ├── Strip <think/> tags (qwen reasoning)
  ├── Try direct JSON.parse()
  ├── Try code fence extraction (```json ... ```)
  ├── Try brace matching ({ ... })
  ├── Fix trailing commas
  └── Try truncated JSON repair (close open braces/brackets)
```

---

## 14. Component Catalog — 26 Components

**File:** `src/lib/ai/prompts/component-catalog.ts`

**Note**: HeroSection and CTASection now use CSS Variable gradients instead of AI-injected hex values. Default: `var(--primary) → var(--tertiary)`, but can override via `gradientFrom`/`gradientTo` props in inspector.

| Component | Category | Structural? |
|-----------|----------|-------------|
| HeaderNav | Navigation | ✅ |
| HeroSection | Hero | ✅ |
| AnnouncementBar | Promotional | |
| FeaturesGrid | Content | ✅ |
| FeatureShowcase | Content | |
| StatsSection | Content | |
| LogoGrid | Social Proof | |
| SocialProof | Social Proof | |
| TestimonialSection | Social Proof | |
| PricingTable | Business | |
| ComparisonTable | Business | |
| ProductCards | E-commerce | |
| BlogSection | Content | |
| FAQSection | Content | |
| CTASection | Conversion | ✅ |
| NewsletterSignup | Conversion | |
| ContactForm | Conversion | |
| CountdownTimer | Promotional | |
| Banner | Promotional | |
| Gallery | Media | |
| TeamSection | Content | |
| FooterSection | Navigation | ✅ |
| RichTextBlock | Typography | |
| ImageBlock | Media | |
| Spacer | Layout | |
| ColumnsLayout | Layout | |

---

## 15. Frontend Integration

### 15.1. AIChatPanel (`src/puck/plugins/AIChatPanel.tsx`)

Handles:
- User input → `apiClient.generateFromPromptStream()`
- SSE event processing
- Progressive rendering via Puck `dispatch({ type: 'setData' })`
- Skeleton → polished replacement (makeup mode)
- Live render animation (components appear one-by-one)

### 15.2. useAutoPolish Hook (`src/puck/hooks/useAutoPolish.ts`)

Detects `page.generationStatus = "pending"` and auto-triggers Phase 2:
- Disables editing controls
- Shows progress banner
- Streams polished sections into canvas
- Auto-saves when complete
- Re-enables editing

### 15.3. Progressive Rendering Flow

```
onPlan(plan) → Render SectionSkeleton components
  │
  ├── skeleton: HeaderNav     ──→ onComponent → replace skeleton
  ├── skeleton: HeroSection    ──→ onComponent → replace skeleton
  ├── skeleton: FeaturesGrid   ──→ onComponent → replace skeleton
  ├── skeleton: CTASection     ──→ onComponent → replace skeleton
  └── skeleton: FooterSection  ──→ onComponent → replace skeleton
  │
  ▼
onDone(result) → Update chat message "Đã tạo xong N thành phần"
```

### 15.4. API Client Callbacks

```typescript
generateFromPromptStream(
  data,           // { prompt, projectId, pageId, styleguideId }
  onChunk,        // Raw text chunks (unused for JSON mode)
  onDone,         // Final AIGenerationResponse
  onError,        // Error message
  onStatus,       // Pipeline step updates
  onComponent,    // Individual component (progressive)
  onPlan,         // Skeleton plan
): AbortController  // For cancellation
```

---

## 16. Key Functions — Quick Reference

| Function | File | Purpose |
|----------|------|---------|
| `polishSectionsStream()` | `section-polisher.ts` | ★ Polish ALL sections in single streaming request |
| `parseStreamingComponents()` | `section-polisher.ts` | ★ Streaming JSON parser for progressive rendering |
| `applyComponentDefaults()` | `defaults-engine.ts` | ★ Post-AI visual polish (zero cost) |
| `createMakeupStream()` | `streaming.ts` | SSE stream with plan → polish → emit |
| `createAIStream()` | `streaming.ts` | Single-call full AI pipeline |
| `optimizePrompt()` | `prompt-optimizer.ts` | Zero-cost prompt enrichment |
| `selectRelevantComponents()` | `prompt-optimizer.ts` | Dynamic catalog tiering |
| `buildChainPrompt()` | `system-prompt.ts` | Full mode system prompt |
| `buildTemplatePrompt()` | `template-prompt.ts` | Phase 1 plan prompt |
| `buildSectionPrompt()` | `section-prompt.ts` | Phase 2 per-section prompt |
| `extractJSON()` | `streaming.ts` | Robust JSON extraction from AI text |
| `validateTemplateResponse()` | `template-schema.ts` | Validate component plan |
| `validateSingleComponent()` | `template-schema.ts` | Validate single section output |
| `resolveDesignGuidance()` | `design-knowledge.ts` | Business type → color palette |
| `extractColorKeywords()` | `color-matcher.ts` | Bilingual color name → hex extraction |
| `matchPalettesByColors()` | `color-matcher.ts` | HSL distance palette matching |
| `resolveWizardRecommendations()` | `color-matcher.ts` | Combined color+style+business recommendations |
| `createModelBundle()` | `provider.ts` | Main model + JSON call options |
| `createFastModelBundle()` | `provider.ts` | Fast/lightweight model bundle |
| `buildTreeSummary()` | `system-prompt.ts` | Puck Data → text summary for AI context |

---

## 17. Areas for Improvement

### ✅ Completed Recent Improvements
- **CSS Variable Gradients**: HeroSection uses `var(--primary) → var(--tertiary)` by default, user hex overrides via inspector
- **Dynamic Landing Patterns**: 10 business-specific patterns instead of hardcoded order in template-prompt.ts
- **Animation Defaults**: All 26+ content sections have auto-applied animations via defaults-engine
- **Token Optimization**: ~27-30% savings through deduplication (shared CONTENT_PROPS, compact stock images)
- **Design Style System**: 8 coordinated visual styles (elevated, minimal, glassmorphism, brutalism, neobrutalism, soft-ui, aurora, bento)
- **Streaming Batch Polish**: Single-request `polishSectionsStream()` replaces parallel N-call approach
- **Dynamic Style Recommender**: `color-matcher.ts` for bilingual keywords → palette matching
- **Auto-Polish via Skeleton IDs**: No DB status writes needed, canvas detects completion from ID replacement

### Performance
- **Caching**: Section prompt results could be cached for similar business types
- **Prompt size**: System prompt is ~8K tokens — could compress catalog further

### Quality
- **Multi-language**: Better Vietnamese content generation
- **Color consistency**: AI sometimes ignores styleguide tokens — stronger enforcement
- **Image variety**: Expand stock image library per business type

### Architecture
- **Retry logic**: Failed sections could retry once with simplified prompt
- **A/B testing**: Track which prompt variations produce better results
- **Cost tracking**: Token counting per provider for cost monitoring

### New Features
- **Style transfer**: Apply one site's style to another
- **Responsive variants**: Generate different layouts for mobile/desktop
- **SEO optimization pass**: Post-generation SEO audit + auto-fix
