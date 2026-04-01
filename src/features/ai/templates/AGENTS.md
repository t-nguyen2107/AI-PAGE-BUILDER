<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-31 | Updated: 2026-03-31 -->

# src/features/ai/templates/

## Purpose
Component template generators — produce valid `DOMNode` trees for 8 common section types. Agent 4 owns this directory. Each generator returns a complete tree with realistic placeholder content and Tailwind styling.

## Key Files
| File | Description | Props |
|------|-------------|-------|
| `hero-section.ts` | Hero with heading + subtext + CTA button | heading, subtext, ctaText, ctaHref, backgroundUrl |
| `pricing-section.ts` | Pricing grid with 1-4 configurable tiers | tiers, count, tierData |
| `features-grid.ts` | Features grid with 2-4 columns | columns, items, featureData |
| `testimonial-section.ts` | Testimonial cards (1-6) | quotes, count, testimonialData |
| `cta-section.ts` | CTA section with heading + button | heading, subtext, ctaText, ctaHref |
| `header-nav.ts` | Header/nav with logo + link list | siteName, links |
| `footer.ts` | Footer with brand + 3 link columns + copyright | siteName, copyright, columns |
| `contact-form.ts` | Contact form with configurable fields | heading, subtext, fields, submitText |

## For AI Agents

### Working In This Directory
- Agent 4 owns all template files
- Each template returns a `SectionNode` (or `ComponentNode` via `generateComponent()`)
- All generated IDs use `'n_' + generateId()` pattern
- Templates use Tailwind CSS classes and inline styles via `LayoutProperties`
- FAQ and Gallery categories fall back to `features-grid` template

### Common Patterns
- `generateXxxSection(props)` → builds tree bottom-up (Item → Element → Component → Container → Section)
- Sensible defaults when props are omitted (e.g., "Coming Soon" for missing headings)
- All nodes include `meta: { locked: false, hidden: false, createdAt, updatedAt }`
- Each node gets a unique `id` via `generateId()`

### Note
These templates are currently **NOT used in the main Ollama flow**. They exist as a local/fallback generation system. The main flow sends the user's prompt directly to Ollama and parses the JSON response.
