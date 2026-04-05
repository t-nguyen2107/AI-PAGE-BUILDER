# AI Website Builder — MVP Feature Summary

> Ngày: 2026-04-05 | Branch: main | Commit: 1ec40a7

---

## 1. Puck Visual Editor — 36 Components

### Sections (16)
| Component | Mô tả | Key Props |
|---|---|---|
| **HeroSection** | Hero banner với gradient/image background, badge, dual CTA | heading, subtext, badge, ctaText, ctaSecondaryText, align, gradientFrom/To, backgroundUrl, animation |
| **FeaturesGrid** | Grid features với icon/image cards | heading, columns (2-4), features[], cardStyle (elevated/icon/image/flat), hoverEffect, animation |
| **PricingTable** | Bảng giá với highlight, toggle monthly/yearly | heading, plans[], highlightedBadge, pricingToggle, yearlyPlans[], animation |
| **TestimonialSection** | Testimonial grid/carousel/masonry | heading, testimonials[], variant (grid/carousel/masonry), animation |
| **CTASection** | Call-to-action section | heading, subtext, ctaText, ctaHref, variant (gradient/dark/minimal), backgroundUrl |
| **FAQSection** | FAQ accordion | heading, items[], columns (1/2), allowMultipleOpen |
| **StatsSection** | Stats counter với animation | heading, stats[], columns, animated, duration |
| **TeamSection** | Team members grid | heading, members[], hoverEffect, socialLinks |
| **BlogSection** | Blog posts grid | heading, posts[], columns, variant, categoryFilter |
| **LogoGrid** | Partner/client logos | heading, logos[], variant, grayscale, tooltip |
| **ContactForm** | Contact form | heading, fields[], submitText, successMessage |
| **FeatureShowcase** | Feature showcase với image | heading, features[], imagePosition, animation |
| **ProductCards** | Product cards grid | heading, products[], columns, hoverEffect |
| **ComparisonTable** | So sánh plans/features | heading, plans[], features[] |
| **Gallery** | Image gallery | heading, images[], columns, variant, lightbox |
| **CustomSection** | Custom HTML/CSS section | htmlContent, bgColor, padding |

### Navigation (2)
| Component | Key Props |
|---|---|
| **HeaderNav** | logo, links[], ctaText, sticky, mobileMenu, variant (transparent/light/dark) |
| **FooterSection** | logo, linkGroups[], copyright, socialLinks[], newsletterEnabled, backToTop |

### Marketing (5)
| Component | Key Props |
|---|---|
| **NewsletterSignup** | heading, subtext, placeholder, buttonText, layout |
| **SocialProof** | heading, stats[], logos[], showAvatars, avatarCount |
| **CountdownTimer** | heading, targetDate, ctaText, style, endMessage |
| **AnnouncementBar** | text, href, dismissible, variant, bgColor |
| **Banner** | heading, subtext, ctaText, backgroundUrl, fullWidth |

### Atomic Blocks (7)
| Component | Key Props |
|---|---|
| **HeadingBlock** | text, level (h1-h6), align, size |
| **TextBlock** | content, fontSize, lineHeight, color |
| **RichTextBlock** | content (markdown), fontSize, columns |
| **ButtonBlock** | label, href, variant (primary/secondary/outline/ghost), size |
| **CardBlock** | title, description, imageUrl, variant |
| **ImageBlock** | src, alt, caption, objectFit, borderRadius |
| **Blank** | Empty wrapper |

### Layout (5)
| Component | Key Props |
|---|---|
| **SectionBlock** | bgColor, paddingY, paddingX, maxWidth, bgImageUrl |
| **Flex** | direction, justifyContent, alignItems, gap, wrap |
| **Grid** | numColumns, gap, items |
| **ColumnsLayout** | columns (2-4), gap, unequalWidths, stackOrder |
| **Spacer** | height, showDivider, dividerStyle |

**Tất cả components**: responsive, Tailwind CSS, CSS variables theming, animation support, Material Design 3.

---

## 2. AI Pipeline

### Generation Modes
| Mode | Mô tả |
|---|---|
| **Full Chain** | LangChain pipeline: system prompt → structured output → Zod validation. Cho modify_node, insert_section, delete_node, clarify |
| **Template Mode** | Compact prompt → AI picks templates → fills Puck ComponentData directly. Cho create_page (ưu tiên) |
| **Fallback** | 36 template generators (legacy DOMNode format → puck-adapter convert) |

### Providers
- **Ollama** (qwen3.5) — default, local
- **OpenAI** — configurable via env
- **Anthropic** — configurable via env

### Streaming
- SSE (Server-Sent Events) streaming
- Robust JSON extraction: direct parse → code fence → brace matching → truncated repair
- Abort signal support

### Prompt Intelligence
- **Rule-based prompt optimizer** (zero LLM cost):
  - Detects business type (20+ Vietnamese + English industry keywords)
  - Detects style preferences, language, intent classification
  - Enriches with design knowledge (color palettes, typography, landing patterns)
- **3-tier component catalog**: context-based tier selection to reduce prompt size
- **Dynamic system prompt**: injects styleguide, session context, page structure, project profile

### Actions
| Action | Mô tả |
|---|---|
| `create_page` | Tạo full page từ prompt (ưu tiên template mode) |
| `insert_section` | Thêm section vào page tại position |
| `modify_node` | Sửa component theo targetComponentId |
| `delete_node` | Xóa component |
| `clarify` | AI hỏi thêm thông tin |

---

## 3. AI Memory System (3 Layers)

```
Layer 1: ProjectAIProfile (structured)
  ├── businessType, industry, targetAudience
  ├── tone, preferredStyle, preferredColors
  ├── language, contentThemes
  └── componentPrefs, memoryNotes

Layer 2: VectorEmbedding (pgvector cosine similarity)
  ├── scope: user | project | global
  ├── category: preference | correction | pattern | fact | instruction | template | document | component_pattern
  └── auto-retrieved via semantic search

Layer 3: AISession + AISessionMessage
  ├── Per-page session với miniContext (running summary)
  ├── Max 20 messages in-context, 60 stored
  └── Auto-trim old messages
```

### Flow
```
User prompt → Load profile + vector recall → Inject vào system prompt
→ AI generates → Session analyzer extracts insights (zero LLM cost)
→ Store as pgvector memories → Merge into profile → Next generation uses updated context
```

### Session Analyzer (Rule-based, Zero LLM Cost)
- Vietnamese language detection
- Industry/business type classification (20+ keywords)
- Style preference extraction
- Correction pattern detection
- Component usage tracking

---

## 4. New Project Wizard (Winnie AI)

### Step 1: Chat
- Conversational AI với Winnie persona (SSE streaming)
- Progressive info extraction: name, idea, style, audience, tone, language, pages
- 4 suggestion chips (coffee shop, SaaS, portfolio, restaurant)
- Skip-to-blank-project option
- Animated avatar

### Step 2: Settings (AI-generated)
- **Style Guide tab**: color palette (visual preview), typography (font preview), spacing
- **SEO tab**: meta title/description (character counters), OG image, robots, canonical
- Manual editing of all fields
- 15 Google Fonts available

### Step 3: Finalize (5 phases)
1. Creating project
2. Applying style guide (CSS variables)
3. Setting up SEO metadata
4. AI homepage generation (streaming)
5. Done → auto-redirect to builder

---

## 5. SEO Suite

| Module | Mô tả |
|---|---|
| **SEO Audit** | Scoring 0-100 (pass >= 70). Checks: heading hierarchy, semantic HTML, meta tags, image alt, link hrefs, empty page |
| **JSON-LD Generator** | Schema.org structured data cho 18 component types (WebPage, FAQPage, OfferCatalog, AggregateRating, etc.) |
| **Meta Generator** | Auto-generate meta title/description từ page content |
| **Heading Validator** | Single h1, no skipped levels, no empty headings |
| **Semantic Mapper** | Maps Puck components → semantic HTML tags |
| **HTML Validator** | Validates semantic structure (header, footer, nav, sections) |

---

## 6. API Routes (22 routes)

### Core CRUD
| Route | Methods | Mô tả |
|---|---|---|
| `/api/projects` | GET, POST | List / create projects |
| `/api/projects/[id]` | GET, PUT, DELETE | Project CRUD |
| `/api/projects/[id]/pages` | GET, POST | List / create pages |
| `/api/projects/[id]/pages/[id]` | GET, PUT | Page CRUD |
| `/api/projects/[id]/styleguide` | GET, PUT | Styleguide CRUD |
| `/api/projects/[id]/global-sections` | GET, POST | Global sections (header/footer) |
| `/api/projects/[id]/revisions` | GET, POST | Page revision history |
| `/api/library` | GET, POST | Component library |
| `/api/media/upload` | POST | File upload → Sharp WebP conversion |
| `/api/media/stock` | GET | Stock image library |

### AI
| Route | Method | Mô tả |
|---|---|---|
| `/api/ai/generate` | POST | Non-streaming AI generation |
| `/api/ai/generate/stream` | POST | SSE streaming AI generation |
| `/api/ai/search` | POST | Library component search |
| `/api/ai/wizard/chat` | POST | Winnie wizard chat (SSE) |
| `/api/ai/wizard/generate-settings` | POST | AI styleguide + SEO generation |
| `/api/ai/wizard/finalize` | POST | Transactional project creation |
| `/api/ai/profile` | GET, PUT, DELETE | Project AI profile |
| `/api/ai/profile/memories` | GET, DELETE | Vector memory entries |
| `/api/ai/conversations` | GET, DELETE | Session message history |

---

## 7. Database Models (11 models)

| Model | Key Fields |
|---|---|
| **Project** | name, siteName, companyName, logo, favicon, language, socialLinks (JSON), contactInfo (JSON), gaCode, headScripts, bodyScripts |
| **Page** | title, slug (unique/project), isHomePage, treeData (JSON), seoTitle/Description/Keywords, ogTitle/Description/Image, structuredData (JSON) |
| **Styleguide** | colors (JSON), typography (JSON), spacing (JSON), componentVariants (JSON), cssVariables (JSON) |
| **GlobalSection** | sectionType (header/footer/nav/custom), treeData (JSON) |
| **Revision** | snapshot (JSON), label, diff (JSON) |
| **UserLibrary** | name, category, nodeData (JSON), tags, isPublic |
| **AIPromptLog** | prompt, action, response (JSON), success |
| **AISession** | miniContext (running summary) |
| **AISessionMessage** | role (user/assistant), content, action |
| **ProjectAIProfile** | businessType, industry, tone, preferredStyle, preferredColors, language, componentPrefs |
| **VectorEmbedding** | scope, category, content, metadata (JSON), embedding (pgvector), dimensions |

---

## 8. Editor Plugins & Panels

| Feature | Mô tả |
|---|---|
| **AI Chat Panel** | In-editor AI chat sidebar cho generation commands |
| **AI Profile Summary** | Badge hiển thị project AI profile |
| **AI Profile Editor** | Modal edit profile fields + memories list |
| **Settings Panel** | 4 tabs: Page, Style Guide, SEO, General |
| **Preview Panel** | Live preview với viewport switching (desktop/tablet/mobile) |

---

## 9. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Editor | @puckeditor/core v0.21.x |
| Styling | Tailwind CSS 4 + CSS Variables |
| State | Zustand 5 |
| Database | PostgreSQL via Prisma 7 (Prisma Postgres + pgvector) |
| AI | Ollama / OpenAI / Anthropic via LangChain |
| Validation | Zod 4 |
| IDs | nanoid |
| Testing | Vitest (jsdom) — 188 tests, 14 files |
| Images | Sharp (WebP conversion) |

---

## 10. MVP Status

| Feature | Status |
|---|---|
| Puck Visual Editor (36 components) | ✅ Hoàn thành |
| AI Pipeline (streaming, multi-provider) | ✅ Hoàn thành |
| AI Memory System (3 layers) | ✅ Hoàn thành |
| New Project Wizard (Winnie) | ✅ Hoàn thành |
| SEO Suite | ✅ Hoàn thành |
| REST API (22 routes) | ✅ Hoàn thành |
| Unit Tests (188 tests) | ✅ Hoàn thành |
| Auth | 🔶 Placeholder |
| Deploy (Vercel) | ⬜ Chưa |
| User Management | ⬜ Chưa |
| Multi-user Collaboration | ⬜ Chưa |
| Export HTML | ⬜ Chưa |
