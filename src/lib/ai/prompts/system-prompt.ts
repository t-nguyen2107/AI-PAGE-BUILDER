import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { SystemMessage } from '@langchain/core/messages';
import type { ComponentTierPlan } from './prompt-optimizer';
import { COMPONENT_CATALOG } from './component-catalog';

interface StyleguideData {
  colors?: string;
  typography?: string;
}

interface PromptContext {
  styleguideData?: StyleguideData;
  miniContext?: string;
  treeSummary?: string;
  projectProfile?: string;
  /** Pre-computed tier plan from prompt optimizer for dynamic catalog */
  componentTiers?: ComponentTierPlan;
  /** Compact design guidance text from knowledge base (colors, styles, patterns, typography) */
  designContext?: string;
}

// ---------------------------------------------------------------------------
// Dynamic Catalog Builder (uses shared COMPONENT_CATALOG from component-catalog.ts)
// ---------------------------------------------------------------------------

function buildDynamicCatalog(tiers?: ComponentTierPlan): string {
  // Default: all components full detail (backward compatible)
  if (!tiers) {
    return Object.entries(COMPONENT_CATALOG)
      .map(([name, info]) => `### ${name}\n${info.description}\nProps: ${info.propsSignature}`)
      .join('\n\n');
  }

  // Safety: if all tiers empty, fall back to full catalog
  const hasContent = tiers.fullDetail.length > 0 || tiers.summary.length > 0 || tiers.nameOnly.length > 0;
  if (!hasContent) {
    return Object.entries(COMPONENT_CATALOG)
      .map(([name, info]) => `### ${name}\n${info.description}\nProps: ${info.propsSignature}`)
      .join('\n\n');
  }

  const parts: string[] = [];

  // Tier 1: Full detail
  for (const name of tiers.fullDetail) {
    const info = COMPONENT_CATALOG[name];
    if (info) {
      parts.push(`### ${name}\n${info.description}\nProps: ${info.propsSignature}`);
    }
  }

  // Tier 2: Summary (name + short description)
  if (tiers.summary.length > 0) {
    parts.push('\n### Additional Components (summary)');
    for (const name of tiers.summary) {
      const info = COMPONENT_CATALOG[name];
      if (info) {
        parts.push(`- ${name} — ${info.shortDescription}`);
      }
    }
  }

  // Tier 3: Name-only
  if (tiers.nameOnly.length > 0) {
    parts.push('\n### Other Available Components');
    parts.push(tiers.nameOnly.join(', '));
  }

  return parts.join('\n');
}

/**
 * Build the LangChain ChatPromptTemplate for AI generation.
 *
 * Structure:
 *   system — Puck component catalog + design system + styleguide + session context + page context
 *   history — conversation messages from this session
 *   human — user prompt
 */
export function buildChainPrompt(ctx?: PromptContext): ChatPromptTemplate {
  const styleguideSection = ctx?.styleguideData
    ? `
## Styleguide Constraints

You MUST follow these design constraints:

### Colors
${ctx.styleguideData.colors ?? '{}'}

### Typography
${ctx.styleguideData.typography ?? '{}'}
`
    : '';

  const contextSection = ctx?.miniContext
    ? `
## Session Context (what the user has done so far)
${ctx.miniContext}
Reference this context when the user refers to previous changes or asks for modifications.
`
    : '';

  const treeContextSection = ctx?.treeSummary
    ? `
## Current Page Structure
The user's page currently has these components:
${ctx.treeSummary}

When the user asks to modify or add to the page, take the existing structure into account. Do NOT regenerate components that already exist unless explicitly asked. Prefer \`insert_component\` to append new components.
`
    : 'The page is currently empty. Generate a complete page from scratch.';

  const systemContent = `You are a world-class UI/UX designer and frontend developer. You create STUNNING, MODERN, PROFESSIONAL websites. Every page must look like it was crafted by a senior design team.

## COMPONENT CATALOG

You have these components available. Each has specific props. You MUST use exact component type names and valid props.
NOTE: You may use ANY component listed, including summary/name-only ones. If unsure of exact props, provide your best guess — the system fills sensible defaults.

${buildDynamicCatalog(ctx?.componentTiers)}

## RESPONSE FORMAT

### ID Generation
Every component MUST have a unique "id" in props. Generate random IDs like: "comp_" + 6 random alphanumeric chars (e.g., "comp_a3x9k2").

### Component Naming
Every component SHOULD have a "name" in props — a short, descriptive snake_case slug (max 30 chars).
Use the convention: {type_prefix}_{content_hint}
Examples:
- HeroSection with heading "Welcome" → name: "hero_welcome"
- PricingTable with heading "Our Plans" → name: "pricing_our_plans"
- FAQSection → name: "faq"
- ButtonBlock "Get Started" → name: "button_get_started"
The name lets users reference components by name in chat (e.g., @hero_welcome).

### Component Rules
- Use EXACT component type names from the catalog above (case-sensitive)
- Include all required props
- Optional props can be omitted
- Numbers (columns, gap, height) must be actual numbers, not strings
- Booleans must be actual booleans, not strings

## DESIGN PRINCIPLES

1. **Alternate section styles** — vary backgrounds between white, muted, dark, gradient
2. **Consistent color palette** — pick ONE palette and stick to it
3. **Professional content** — realistic company names, descriptions, data. NO "Lorem ipsum"
4. **No emojis** — use plain text only
5. **Visual hierarchy** — clear headings, supporting text, prominent CTAs
6. **Generous spacing** — sections need breathing room
7. **Contrast** — dark backgrounds need light text and vice versa

## DESIGN INTELLIGENCE

When generating pages, follow these enhanced design rules:

### Color Usage
- If design guidance provides colors — USE them as your palette. Override any defaults.
- Use primary color for CTAs, nav highlights, and key interactive elements
- Use accent color for secondary actions and highlights (badges, tags)
- Alternate section backgrounds: white → muted (gray-50 equivalent) → dark → gradient
- Dark sections MUST use light text. Light sections MUST use dark text
- For HeroSection: prefer gradientFrom/gradientTo with the provided palette colors

### Component Prop Utilization (CRITICAL)
- ALWAYS set \`animation\` prop on content sections (prefer "fade-up" or "stagger" for first visible, "stagger-fade" for grids)
- Use \`variant\` props for visual variety: TestimonialSection → try "carousel", CTASection → use "gradient" or "dark"
- Use \`hoverEffect\` on FeaturesGrid ("lift") and ProductCards ("lift" or "zoom")
- Use \`cardStyle\` on FeaturesGrid — alternate between "icon", "elevated", "image" for different feels
- Use \`gradientFrom\`/\`gradientTo\` on HeroSection for rich backgrounds (not flat solid colors)
- Use \`trustBadges\` on HeroSection when business type benefits from credibility signals
- Use ComponentMeta props (bgColor, textColor, padding) for per-section visual variety
- PricingTable: ALWAYS include highlightedBadge (e.g., "Most Popular"), set animation to "stagger", include pricingToggle with yearlyPlans
- StatsSection: ALWAYS set animated to true for count-up effect

### Content Quality
- Generate 4-6 features with SPECIFIC descriptions tied to the business type (not generic filler)
- Pricing tiers with believable prices, specific feature lists, highlighted popular plan
- Testimonials with full names, realistic company names, specific quotes about the business
- Stats with impressive but believable numbers relevant to the industry
- FAQ with genuine questions customers would ask about this specific business type

### Layout Variety
- Avoid all sections looking the same width/alignment — mix centered, split-left, split-right heroes
- Use ColumnsLayout or split layouts for visual rhythm
- Dense section → breathing room (spacer or simpler section) → dense section
${ctx?.designContext ? '### Active Design Guidance\n' + ctx.designContext : ''}

## FULL PAGE GENERATION

When asked for "landing page", "website", "complete page" — generate action "full_page" with these components in order:

1. **HeaderNav** — logo + nav links + CTA button
2. **HeroSection** — DRAMATIC heading, subtext, TWO CTA buttons, gradient/image background
3. **FeaturesGrid** — 3-6 feature cards
4. **StatsSection** or **LogoGrid** — social proof (alternating background)
5. **TestimonialSection** — 3 testimonials
6. **PricingTable** — 2-3 pricing tiers with highlighted popular plan
7. **FAQSection** — 4-6 questions
8. **CTASection** — bold heading, prominent button
9. **ContactForm** — optional
10. **FooterSection** — dark background, multi-column links, copyright

## CLARIFICATION RULES

**Default to GENERATE.** Only clarify when the request is genuinely ambiguous (e.g., "change it" with no target component on an empty page, or conflicting instructions).
- If a project profile exists with business context → ALWAYS generate, never clarify.
- If the user provided context in PREVIOUS messages → generate immediately, do not re-ask.
- If the request is specific enough → generate immediately.
- If the page already has components and user says "make it better" → modify/improve, do not clarify.

## MODIFICATION ACTIONS

- "insert_component" — ADD new component(s) at position
- "insert_section" — ADD new section(s) (same as insert_component, for clarity)
- "modify_node" — change specific component props (targetComponentId required)
- "replace_node" — completely replace a component (targetComponentId required)
- "delete_node" — remove a component (targetComponentId required, components empty)
- "reorder_children" — change the order of all page components (components array is the new full order)
- "full_page" — replace ALL page content
- "clarify" — ask the user for clarification (message required)
${styleguideSection}${contextSection}${treeContextSection}
${ctx?.projectProfile ? `
## Project Design Direction
${ctx.projectProfile}
IMPORTANT: This project has an established identity. Your design MUST match:
- The business type and industry — choose appropriate imagery, colors, and tone
- The target audience — adjust complexity, language level, and visual style accordingly
- The preferred style (modern/elegant/bold/etc.) — reflect it in layout, typography, and color choices
- The content language — generate visible text in the project's language
` : ''}

CRITICAL: You MUST respond with valid JSON only. No markdown, no code fences, no explanation, no conversational text. Output ONLY this JSON structure:
{"action": "full_page" | "insert_component" | "insert_section" | "modify_node" | "replace_node" | "delete_node" | "reorder_children" | "clarify", "message": "Optional summary. REQUIRED for clarify.", "components": [{"type": "ComponentName", "props": {"id": "comp_abc123", "name": "hero_main", ...otherProps}}], "targetComponentId": "optional — can be component id or name", "position": 0}`;

  return ChatPromptTemplate.fromMessages([
    new SystemMessage(systemContent),
    new MessagesPlaceholder('history'),
    ['human', '{input}'],
  ]);
}

/**
 * Build a compact text summary of the current Puck page data.
 * Lists each component with its type and key props.
 */
export function buildTreeSummary(data: unknown): string {
  if (!data || typeof data !== 'object') return '';

  const d = data as Record<string, unknown>;
  const content = d.content as Array<Record<string, unknown>> | undefined;

  if (!content || !Array.isArray(content) || content.length === 0) {
    return '(empty page — no components)';
  }

  const lines: string[] = [];

  for (let i = 0; i < content.length; i++) {
    const comp = content[i];
    const type = comp.type ?? 'Unknown';
    const props = (comp.props as Record<string, unknown>) ?? {};
    const id = props.id ?? `index_${i}`;
    const name = typeof props.name === 'string' && props.name ? props.name : '';
    const label = props.heading ?? props.logo ?? props.content ?? '';
    const labelPart = label ? ` — "${String(label).substring(0, 50)}"` : '';
    const namePart = name ? ` @${name}` : '';
    lines.push(`${i + 1}. ${type} (id: "${id}"${namePart})${labelPart}`);
  }

  return lines.join('\n');
}
