# AI Generation Pipeline — Technical Documentation

> Tài liệu kỹ thuật cho team improve/extend AI pipeline.
> Last updated: 2026-04-08

---

## 1. Mục tiêu Pipeline

Pipeline biến **user prompt** (natural language) thành **Puck ComponentData[]** — structured JSON array các UI component đã có đầy đủ props, content, animation, gradient, hình ảnh.

### Mục tiêu chính:
- **Prompt → JSON**: User mô tả bằng tiếng Việt/Anh → AI output Puck components
- **Quality cao**: Animation, gradient, stock images, business-specific content
- **Progressive UX**: Skeleton loading → từng section hiện dần (makeup mode)
- **Multi-provider**: Hỗ trợ Ollama, OpenAI, Anthropic, Gemini
- **Zero-cost optimization**: Prompt optimizer + design knowledge = không tốn LLM call để phân tích

### Hai chế độ hoạt động:

| Mode | Khi nào dùng | Cách hoạt động |
|------|-------------|---------------|
| **Makeup (2-phase)** | `create_page` intent | Phase 1: fast model → plan, Phase 2: main model × N sections song song |
| **Full AI** | `modify`, `delete`, `unknown` | Single LLM call với full system prompt + conversation history |

---

## 2. Kiến trúc tổng thể

```
User Prompt
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  Route: /api/ai/generate/stream                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Step 1: Load Context                                ││
│  │  • Styleguide (colors, typography, spacing, CSS)    ││
│  │  • Page treeData (existing components)               ││
│  │  • AI Session (miniContext, history)                  ││
│  │  • Project AI Profile (business context)             ││
│  └────────────────────────┬────────────────────────────┘│
│                           ▼                              │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Step 2: Optimize Prompt (zero-cost, rule-based)     ││
│  │  • detectLanguage() → vi/en/mixed                   ││
│  │  • detectIntent() → create_page/modify/delete/...   ││
│  │  • detectBusinessType() → restaurant/SaaS/...       ││
│  │  • resolveDesignGuidance() → colors, typography     ││
│  │  • selectRelevantComponents() → tiered catalog      ││
│  └────────────────────────┬────────────────────────────┘│
│                           ▼                              │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Step 2b: RAG Knowledge Lookup                       ││
│  │  • searchDesignKnowledge() → design context text    ││
│  └────────────────────────┬────────────────────────────┘│
│                           ▼                              │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Step 3: Route to Pipeline                           ││
│  │  intent === 'create_page'                           ││
│  │    → createMakeupStream()   (2-phase)               ││
│  │    else                                            ││
│  │    → createAIStream()       (single LLM call)      ││
│  └────────────────────────┬────────────────────────────┘│
│                           ▼                              │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Step 4: SSE Stream → Frontend                       ││
│  │  • status events (planning, generating, parsing)    ││
│  │  • plan event (skeleton IDs)                        ││
│  │  • component_stream events × N                      ││
│  │  • done event (final result)                        ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 3. Cấu trúc Code — File Map

### 3.1. Core Pipeline (`src/lib/ai/`)

```
src/lib/ai/
├── config.ts              # AI config resolver (env vars → typed config)
├── provider.ts            # Model factory (Ollama/OpenAI/Anthropic/Gemini)
├── chain.ts               # LangChain chain configuration
├── streaming.ts           # ★ CORE: 3 stream functions + SSE events
├── output.ts              # Output validation (AI JSON → AIGenerationResponse)
├── output-sanitizer.ts    # Clean AI output (strip legacy format)
├── puck-adapter.ts        # Legacy DOMNode → Puck ComponentData converter
├── embeddings.ts          # Embedding service (Ollama/OpenAI)
├── vector-store.ts        # pgvector CRUD + similarity search
├── memory-manager.ts      # AI profile + memory operations
├── session-analyzer.ts    # Rule-based insight extraction (zero LLM)
├── profile-updater.ts     # Merge session insights into profile
├── profile-serializer.ts  # Profile → compact prompt text (<800 chars)
├── id.ts                  # nanoid wrapper
├── utils.ts               # stripEmojis etc.
│
├── prompts/
│   ├── system-prompt.ts       # ★ FULL mode system prompt builder
│   ├── template-prompt.ts     # ★ MAKEUP mode Phase 1 prompt builder
│   ├── section-prompt.ts      # ★ MAKEUP mode Phase 2 (per-section) prompt
│   ├── prompt-optimizer.ts    # ★ Zero-cost prompt enrichment
│   ├── component-catalog.ts   # ★ Single source of truth: 26 component metadata
│   └── template-schema.ts     # Validate AI component response
│
└── knowledge/
    ├── design-knowledge.ts    # Static design data (palettes, patterns, typography)
    └── knowledge-search.ts    # RAG vector search for design context
```

### 3.2. API Route (`src/app/api/ai/generate/`)

```
src/app/api/ai/
├── generate/
│   ├── route.ts               # Non-streaming generate (legacy)
│   └── stream/route.ts        # ★ Main streaming endpoint
├── profile/route.ts           # AI profile CRUD
├── conversations/route.ts     # Session history
└── wizard/                    # New project wizard
    ├── chat/route.ts
    ├── generate-settings/route.ts
    └── finalize/route.ts
```

### 3.3. Frontend (`src/puck/`)

```
src/puck/
├── plugins/
│   └── AIChatPanel.tsx        # ★ Chat UI + progressive rendering
├── components/
│   └── SectionSkeleton.tsx    # ★ Skeleton placeholders (makeup mode)
├── puck.config.tsx            # 26 component definitions
└── types.ts                   # Component prop types
```

---

## 4. Flow chi tiết

### 4.1. Makeup Mode (create_page intent)

```
┌──────────────────────────────────────────────────────────┐
│                   MAKEUP PIPELINE                         │
│                                                          │
│  Phase 1: STRUCTURE RESOLVER                             │
│  ┌─────────────────────────────────────────────────┐     │
│  │ Input: enrichedPrompt + businessType            │     │
│  │ Model: FAST model (qwen3.5)                     │     │
│  │ Prompt: buildTemplatePrompt()                    │     │
│  │ Output: { components: [{ type, props }] }        │     │
│  │ Validate: validateTemplateResponse()             │     │
│  │ SSE: plan event → [skeleton IDs]                 │     │
│  └──────────────────────┬──────────────────────────┘     │
│                         │                                 │
│  Phase 2: PARALLEL MAKEUP (Promise.allSettled)            │
│  ┌─────────────────────────────────────────────────┐     │
│  │ For EACH component in plan (PARALLEL):          │     │
│  │  • buildSectionPrompt(type, catalog, context)   │     │
│  │  • Model: MAIN model (qwen3.5)                  │     │
│  │  • Makeup rules: animation, gradient, images    │     │
│  │  • Validate: validateSingleComponent()          │     │
│  │  • Fallback: use Phase 1 props if AI fails      │     │
│  │  SSE: component_stream event per section        │     │
│  └──────────────────────┬──────────────────────────┘     │
│                         │                                 │
│  Assembly:                                                │
│  • Assign skeleton IDs → props.id                         │
│  • orderPuckComponents() → sort by section priority       │
│  • emitComponentStream() → progressive SSE                │
│  • done event → final AIGenerationResponse                │
└──────────────────────────────────────────────────────────┘
```

**SSE Event Timeline:**
```
1. status(planning)     → "Planning page layout..."
2. plan                 → [{ type: "HeaderNav", skeletonId: "skel_abc" }, ...]
   [Frontend renders SectionSkeleton components]
3. status(generating)   → "Polishing 7 sections..."
4. component_stream × N → Each polished section replaces skeleton
5. done                 → { action: "full_page", components: [...] }
```

### 4.2. Full AI Mode (modify/delete/unknown)

```
┌──────────────────────────────────────────────────────────┐
│                   FULL AI PIPELINE                        │
│                                                          │
│  Single LLM Call:                                        │
│  ┌─────────────────────────────────────────────────┐     │
│  │ Input: enrichedPrompt                            │     │
│  │ Model: MAIN model (qwen3.5, maxTokens: 16384)   │     │
│  │ Prompt: buildChainPrompt()                       │     │
│  │   • Full component catalog (tiered)              │     │
│  │   • Styleguide tokens                            │     │
│  │   • Design intelligence                          │     │
│  │   • Landing pattern recommendation               │     │
│  │   • Session history (conversation context)       │     │
│  │   • Page tree summary (current components)       │     │
│  │   • Project AI profile                           │     │
│  │ Stream: model.stream() → accumulate text         │     │
│  │ Parse: extractJSON() → sanitize → validateOutput │     │
│  │ SSE: status → component_stream → done            │     │
│  └─────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
```

---

## 5. Prompt System — Chi tiết từng Prompt Builder

### 5.1. `buildChainPrompt()` — Full Mode System Prompt

**File:** `src/lib/ai/prompts/system-prompt.ts`
**Hàm:** `buildChainPrompt(ctx?: PromptContext): ChatPromptTemplate`
**Khi nào dùng:** Full AI mode (modify, delete, unknown intent)

**Input:**
```typescript
interface PromptContext {
  styleguideData?: { colors, typography, spacing, cssVariables };
  miniContext?: string;          // Session action log
  treeSummary?: string;          // Current page components
  projectProfile?: string;       // AI profile (<800 chars)
  componentTiers?: ComponentTierPlan;  // Dynamic catalog tiers
  designContext?: string;        // RAG knowledge text
  designGuidance?: DesignGuidance;     // Resolved palette + pattern
}
```

**Output structure:**
```
[System] → Component Catalog + Styleguide + Design Intelligence + Page Layout
[History] → Conversation messages from session
[Human] → User prompt
```

**Các phần chính trong system message:**
1. **COMPONENT CATALOG** — Dynamic 3-tier catalog (full detail / summary / name-only)
2. **RESPONSE FORMAT** — JSON structure: `{ action, components, targetComponentId, position, message }`
3. **DESIGN PRINCIPLES** — 7 rules (alternate backgrounds, consistent palette, no emojis...)
4. **DESIGN INTELLIGENCE** — Color usage, component prop utilization, content quality, layout variety
5. **RECOMMENDED PAGE LAYOUT** — From `design-knowledge.ts` landing patterns
6. **FULL PAGE GENERATION** — Section-by-section instructions
7. **STYLEGUIDE CONSTRAINTS** — Exact color tokens, typography rules, token application rules
8. **CLARIFICATION RULES** — Default to GENERATE, only clarify when genuinely ambiguous
9. **MODIFICATION ACTIONS** — 8 action types (full_page, insert_component, modify_node...)

### 5.2. `buildTemplatePrompt()` — Makeup Phase 1 Prompt

**File:** `src/lib/ai/prompts/template-prompt.ts`
**Hàm:** `buildTemplatePrompt(_ctx?: TemplatePromptContext): ChatPromptTemplate`
**Khi nào dùng:** Makeup mode Phase 1 — plan component layout

**Input:**
```typescript
interface TemplatePromptContext {
  businessType?: string;
  businessStyle?: string;
  language?: string;
  stockImages?: Record<string, string[]>;
  styleguideData?: StyleguideTokens;
  designContext?: string;
}
```

**Mục đích:** AI chọn 5-8 components phù hợp và điền props cơ bản. Nhanh — dùng fast model.

**Prompt structure:**
- System: Component type reference (from `COMPONENT_CATALOG`) + response format + content rules + styleguide tokens + stock image paths
- Human: User prompt

**Response format:**
```json
{ "components": [ { "type": "HeaderNav", "props": { ... } }, ... ] }
```

### 5.3. `buildSectionPrompt()` — Makeup Phase 2 Prompt

**File:** `src/lib/ai/prompts/section-prompt.ts`
**Hàm:** `buildSectionPrompt(sectionType, catalogEntry, context): ChatPromptTemplate`
**Khi nào dùng:** Makeup mode Phase 2 — polish từng section song song

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

**Prompt structure:**
- System: Component metadata (1 component only!) + design tokens + stock image hints + **Makeup Enhancement Rules**
- Human: User prompt

**Makeup Enhancement Rules** (khi `isMakeup = true`):
1. **Animation** — fade-up cho hero/CTA, stagger cho grids, stagger-fade cho testimonials
2. **Gradients** — gradientFrom/gradientTo với exact color tokens
3. **Images** — Fill ALL image props với stock paths phù hợp business type
4. **Text Polish** — Compelling, business-specific content
5. **Visual Variety** — variant props (carousel, gradient, elevated)
6. **Hover Effects** — "lift" trên FeaturesGrid và ProductCards
7. **Background Alternation** — Even index: light/gradient, Odd index: muted/dark

**Response format:**
```json
{ "props": { "heading": "...", ... } }
```

### 5.4. `optimizePrompt()` — Zero-cost Prompt Enrichment

**File:** `src/lib/ai/prompts/prompt-optimizer.ts`
**Hàm:** `optimizePrompt(rawPrompt: string): OptimizedContext`
**Chi phí:** Zero — pure rule-based, không gọi LLM

**What it does:**
1. **detectLanguage()** — Vietnamese markers → vi/en/mixed
2. **detectIntent()** — Keywords → create_page/add_section/modify/delete/unknown
3. **detectBusinessType()** — Vietnamese + English keywords → 20+ industry types
4. **detectStyle()** — Style keywords → modern/minimal/elegant/bold/...
5. **resolveDesignGuidance()** — Business type → complete color palette + typography
6. **selectRelevantComponents()** — Intent + business type → 3-tier catalog

**Output:**
```typescript
interface OptimizedContext {
  enrichedPrompt: string;     // Context prefix + user prompt + design block
  businessType: string | null;
  style: string | null;
  language: 'vi' | 'en' | 'mixed';
  intent: Intent;
  nameRefs: string[];          // @name references
  designGuidance: DesignGuidance | null;
  designContext: string | null;
}
```

**Component Tier Selection Logic:**

| Intent | fullDetail | summary | nameOnly |
|--------|-----------|---------|----------|
| create_page | structural + business-relevant | rest | — |
| add_section | structural | all content | — |
| modify/delete | structural + on-page components | rest | — |
| unknown | structural | — | all content |

---

## 6. Design Knowledge System

### 6.1. Static Knowledge (`src/lib/ai/knowledge/design-knowledge.ts`)

Zero-cost data injected trực tiếp vào prompt:

- **PRODUCT_COLOR_PALETTES** — 20+ business types → complete shadcn-compatible color tokens (WCAG compliant)
- **LANDING_PATTERNS** — Recommended section order per business type
- **PRODUCT_REASONING** — Style priority, typography mood, anti-patterns
- **PRODUCT_TYPOGRAPHY** — Font recommendations per industry

### 6.2. RAG Knowledge (`src/lib/ai/knowledge/knowledge-search.ts`)

pgvector-powered similarity search:
- User prompt → embedding → cosine similarity search → design context text
- Non-fatal: fails gracefully if pgvector unavailable

---

## 7. Model Configuration

### 7.1. Config (`src/lib/ai/config.ts`)

```typescript
interface AIConfig {
  provider: AIProvider;     // ollama | openai | anthropic | gemini
  model: string;            // default: qwen3.5
  baseUrl: string;          // default: http://localhost:11434
  apiKey?: string;
  temperature: number;      // default: 0.7
  maxRetries: number;       // default: 2
  maxTokens: number;        // default: 16384
}
```

**Env vars:**
```
AI_PROVIDER=ollama
AI_MODEL=qwen3.5
AI_BASE_URL=http://localhost:11434
AI_API_KEY=
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=16384
AI_MAX_RETRIES=2

# Fast model (for plan generation):
AI_FAST_MODEL=qwen3.5
AI_FAST_BASE_URL=http://localhost:11434
AI_FAST_API_KEY=
```

### 7.2. Model Usage trong Pipeline

| Task | Model | Max Tokens | Timeout |
|------|-------|-----------|---------|
| Makeup Phase 1 (plan) | `createFastModelBundle()` | 4096 | 90s |
| Makeup Phase 2 (per-section) | `createModelBundle()` | 4096 | 60s per section |
| Full AI mode (stream) | `createModelBundle()` | 16384 | 180s |
| Wizard (Winnie chat) | `createFastModelBundle()` | 4096 | 90s |

---

## 8. SSE Event Types

```typescript
interface SSEEvent {
  type: 'chunk' | 'done' | 'error' | 'status' | 'component_stream' | 'plan';

  // status event
  step?: string;       // 'planning' | 'generating' | 'parsing' | 'validating'
  label?: string;      // Human-readable label

  // plan event (makeup Phase 1)
  plan?: { type: string; skeletonId: string }[];

  // component_stream event
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

## 9. Output Validation Pipeline

### 9.1. Template Response (`template-schema.ts`)

```
AI JSON → validateTemplateResponse()
  ├── Check components array exists, length 1-12
  ├── Validate each component type against VALID_COMPONENT_TYPES
  ├── Fuzzy match (case-insensitive, strip spaces) for typos
  └── Return { data: PuckComponentPlanRaw, error: null }
```

### 9.2. Single Component (`template-schema.ts`)

```
AI JSON → validateSingleComponent()
  ├── Accept { props: {...} } format (unwrapped)
  ├── Accept { type, props } format (standard)
  ├── Warn on unknown types (don't reject)
  └── Return { data: PuckComponentRaw, error: null }
```

### 9.3. Full Output (`output.ts`)

```
AI JSON → sanitizeAIResponse() → validateOutput()
  ├── Validate action (must be in AIAction enum)
  ├── Handle 'clarify' action (message required)
  ├── Support legacy 'nodes' field → convert to 'components'
  ├── Ensure each component has id
  ├── Strip emojis from text props
  └── Return AIGenerationResponse
```

### 9.4. JSON Extraction (`streaming.ts`)

```
Accumulated text → extractJSON()
  ├── Strip <think/> tags (qwen3.5 reasoning)
  ├── Try direct JSON.parse()
  ├── Try code fence extraction (```json ... ```)
  ├── Try brace matching ({ ... })
  ├── Fix trailing commas
  └── Try truncated JSON repair (close open braces/brackets)
```

---

## 10. Component Catalog — 26 Components

**File:** `src/lib/ai/prompts/component-catalog.ts`

Single source of truth cho tất cả component metadata:

| Component | Type | Category |
|-----------|------|----------|
| HeaderNav | Section | Navigation |
| HeroSection | Section | Hero |
| AnnouncementBar | Section | Promotional |
| FeaturesGrid | Section | Content |
| FeatureShowcase | Section | Content |
| StatsSection | Section | Content |
| LogoGrid | Section | Social Proof |
| SocialProof | Section | Social Proof |
| TestimonialSection | Section | Social Proof |
| PricingTable | Section | Business |
| ComparisonTable | Section | Business |
| ProductCards | Section | E-commerce |
| BlogSection | Section | Content |
| FAQSection | Section | Content |
| CTASection | Section | Conversion |
| NewsletterSignup | Section | Conversion |
| ContactForm | Section | Conversion |
| CountdownTimer | Section | Promotional |
| Banner | Section | Promotional |
| Gallery | Section | Media |
| TeamSection | Section | Content |
| FooterSection | Section | Navigation |
| RichTextBlock | Atomic | Typography |
| ImageBlock | Atomic | Media |
| Spacer | Atomic | Layout |
| ColumnsLayout | Atomic | Layout |

Mỗi entry trong catalog có:
- `description` — Full description
- `shortDescription` — Compact version
- `propsSignature` — Typed prop reference
- `recommendedDefaults` — AI should use these
- `variantTips` — Business-specific guidance (SaaS, E-commerce, Restaurant...)

---

## 11. Frontend Integration

### 11.1. AIChatPanel (`src/puck/plugins/AIChatPanel.tsx`)

Handles:
- User input → `apiClient.generateFromPromptStream()`
- SSE event processing
- Progressive rendering via Puck `dispatch({ type: 'setData' })`
- Skeleton → polished replacement (makeup mode)
- Live render animation (components appear one-by-one)

### 11.2. Progressive Rendering Flow

```
onPlan(plan) → Render SectionSkeleton components
  │
  ├── skeleton: HeaderNav    ──→ onComponent → replace skeleton
  ├── skeleton: HeroSection   ──→ onComponent → replace skeleton
  ├── skeleton: FeaturesGrid  ──→ onComponent → replace skeleton
  ├── skeleton: CTASection    ──→ onComponent → replace skeleton
  └── skeleton: FooterSection ──→ onComponent → replace skeleton
  │
  ▼
onDone(result) → Update chat message "Đã tạo xong N thành phần"
```

### 11.3. API Client (`src/lib/api-client.ts`)

`generateFromPromptStream()` — 7 callbacks:
```typescript
generateFromPromptStream(
  data,           // { prompt, projectId, pageId, styleguideId }
  onChunk,        // Raw text chunks (unused for JSON mode)
  onDone,         // Final AIGenerationResponse
  onError,        // Error message
  onStatus,       // Pipeline step updates
  onComponent,    // Individual component (progressive)
  onPlan,         // Skeleton plan (makeup mode)
): AbortController  // For cancellation
```

---

## 12. Areas for Improvement

### Performance
- **Caching**: Section prompt results could be cached for similar business types
- **Streaming per-section**: Currently Phase 2 uses `invoke()` — could stream each section
- **Prompt size**: System prompt is ~8K tokens — could compress catalog further

### Quality
- **Multi-language**: Better Vietnamese content generation (currently English-biased)
- **Color consistency**: AI sometimes ignores styleguide tokens — stronger enforcement
- **Image variety**: Expand stock image library per business type
- **Animation defaults**: Make animation always-on instead of opt-in

### Architecture
- **Streaming mode for Phase 2**: Use `model.stream()` instead of `model.invoke()` per section
- **Retry logic**: Failed sections could retry once with simplified prompt
- **A/B testing**: Track which prompt variations produce better results
- **Cost tracking**: Token counting per provider for cost monitoring

### New Features
- **Component-level edit**: User edits specific component → AI only modifies that one
- **Style transfer**: Apply one site's style to another
- **Responsive variants**: Generate different layouts for mobile/desktop
- **SEO optimization pass**: Post-generation SEO audit + auto-fix

---

## 13. Quick Reference — Key Functions

| Function | File | Purpose |
|----------|------|---------|
| `createMakeupStream()` | `streaming.ts` | 2-phase makeup pipeline |
| `createAIStream()` | `streaming.ts` | Single-call full AI pipeline |
| `createTwoPassStream()` | `streaming.ts` | Alternative 2-pass (unused, kept for reference) |
| `optimizePrompt()` | `prompt-optimizer.ts` | Zero-cost prompt enrichment |
| `selectRelevantComponents()` | `prompt-optimizer.ts` | Dynamic catalog tiering |
| `buildChainPrompt()` | `system-prompt.ts` | Full mode system prompt |
| `buildTemplatePrompt()` | `template-prompt.ts` | Makeup Phase 1 prompt |
| `buildSectionPrompt()` | `section-prompt.ts` | Makeup Phase 2 per-section prompt |
| `extractJSON()` | `streaming.ts` | Robust JSON extraction from AI text |
| `validateTemplateResponse()` | `template-schema.ts` | Validate component plan |
| `validateSingleComponent()` | `template-schema.ts` | Validate single section output |
| `validateOutput()` | `output.ts` | Validate full AI response |
| `resolveDesignGuidance()` | `design-knowledge.ts` | Business type → color palette + typography |
| `createModelBundle()` | `provider.ts` | Main model + JSON call options |
| `createFastModelBundle()` | `provider.ts` | Fast/lightweight model bundle |
| `buildTreeSummary()` | `system-prompt.ts` | Puck Data → text summary for AI context |
