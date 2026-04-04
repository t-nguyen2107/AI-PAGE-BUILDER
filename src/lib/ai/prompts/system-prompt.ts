import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { SystemMessage } from '@langchain/core/messages';
import type { ComponentTierPlan } from './prompt-optimizer';

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
}

// ---------------------------------------------------------------------------
// Component Catalog Data (structured for tiered output)
// ---------------------------------------------------------------------------

interface ComponentInfo {
  description: string;
  shortDescription: string;
  propsSignature: string;
}

const COMPONENT_CATALOG: Record<string, ComponentInfo> = {
  HeroSection: {
    description: 'Hero banner with heading, subtext, CTA buttons, optional background image.',
    shortDescription: 'Hero banner with heading and CTA buttons',
    propsSignature: 'heading (string), subtext (string), badge (string?), ctaText (string), ctaHref (string), ctaSecondaryText (string?), ctaSecondaryHref (string?), align ("left"|"center"), backgroundUrl (string?), backgroundOverlay (boolean), padding ("48px"|"96px"|"128px")',
  },
  FeaturesGrid: {
    description: 'Grid of feature cards with icons, titles, descriptions.',
    shortDescription: 'Feature cards in a responsive grid',
    propsSignature: 'heading (string), subtext (string?), columns (2|3|4), features (array of {title, description, icon?})',
  },
  PricingTable: {
    description: 'Pricing tier cards with feature lists and CTA buttons.',
    shortDescription: 'Pricing plans with feature comparison',
    propsSignature: 'heading (string), subtext (string?), plans (array of {name, price, period, description, features: array of {value}, ctaText, ctaHref, highlighted: boolean})',
  },
  TestimonialSection: {
    description: 'Testimonial cards with quotes and author info.',
    shortDescription: 'Customer testimonials with quotes',
    propsSignature: 'heading (string?), testimonials (array of {quote, author, role, avatarUrl?})',
  },
  CTASection: {
    description: 'Call-to-action section with heading, subtext, and button.',
    shortDescription: 'Call-to-action with heading and button',
    propsSignature: 'heading (string), subtext (string?), ctaText (string), ctaHref (string), backgroundUrl (string?)',
  },
  FAQSection: {
    description: 'FAQ with expandable question/answer items.',
    shortDescription: 'Frequently asked questions accordion',
    propsSignature: 'heading (string), subtext (string?), items (array of {question, answer})',
  },
  StatsSection: {
    description: 'Statistics counter section.',
    shortDescription: 'Statistics counter display',
    propsSignature: 'heading (string?), stats (array of {value, label}), columns (2|3|4)',
  },
  TeamSection: {
    description: 'Team member cards with avatars.',
    shortDescription: 'Team member cards with roles',
    propsSignature: 'heading (string), subtext (string?), members (array of {name, role, avatarUrl?})',
  },
  BlogSection: {
    description: 'Blog post cards grid.',
    shortDescription: 'Blog post preview cards',
    propsSignature: 'heading (string), posts (array of {title, excerpt, imageUrl?, date, href}), columns (2|3)',
  },
  LogoGrid: {
    description: 'Logo/partner grid with images.',
    shortDescription: 'Partner/client logo grid',
    propsSignature: 'heading (string?), logos (array of {name, imageUrl})',
  },
  ContactForm: {
    description: 'Contact form section.',
    shortDescription: 'Contact form with fields',
    propsSignature: 'heading (string), subtext (string?), showPhone (boolean), showCompany (boolean), buttonText (string)',
  },
  HeaderNav: {
    description: 'Navigation bar with logo, links, and CTA.',
    shortDescription: 'Site header navigation bar',
    propsSignature: 'logo (string), links (array of {label, href}), ctaText (string?), ctaHref (string?), sticky (boolean)',
  },
  FooterSection: {
    description: 'Multi-column footer with links.',
    shortDescription: 'Multi-column site footer',
    propsSignature: 'logo (string?), description (string?), linkGroups (array of {title, links: array of {label, href}}), copyright (string?)',
  },
  TextBlock: {
    description: 'Rich text content block.',
    shortDescription: 'Rich text content block',
    propsSignature: 'content (HTML string), align ("left"|"center"|"right"), maxWidth ("sm"|"md"|"lg"|"xl"|"full")',
  },
  ImageBlock: {
    description: 'Single image with optional styling.',
    shortDescription: 'Single image with styling options',
    propsSignature: 'src (string), alt (string), width (string?), borderRadius ("none"|"sm"|"md"|"lg"|"full")',
  },
  Spacer: {
    description: 'Vertical spacing element.',
    shortDescription: 'Vertical spacing element',
    propsSignature: 'height (number, 8-200)',
  },
  ColumnsLayout: {
    description: 'Multi-column layout with slot-based content.',
    shortDescription: 'Multi-column layout container',
    propsSignature: 'columns (2|3|4), gap (number)',
  },
  NewsletterSignup: {
    description: 'Email subscription section with heading and button.',
    shortDescription: 'Email subscription form',
    propsSignature: 'heading (string), subtext (string?), buttonText (string), placeholder (string?)',
  },
  Gallery: {
    description: 'Image gallery grid with lightbox-style layout.',
    shortDescription: 'Image gallery grid',
    propsSignature: 'heading (string?), images (array of {src, alt}), columns (2|3|4)',
  },
  SocialProof: {
    description: 'Trust indicators with stats or user counts.',
    shortDescription: 'Trust indicators and social proof',
    propsSignature: 'heading (string), stats (array of {value, label})',
  },
  ComparisonTable: {
    description: 'Side-by-side plan/feature comparison.',
    shortDescription: 'Feature comparison matrix',
    propsSignature: 'heading (string), plans (array of {name, features: array of {value}})',
  },
  ProductCards: {
    description: 'Product showcase cards with prices.',
    shortDescription: 'Product cards with pricing',
    propsSignature: 'heading (string?), products (array of {title, price, image, href, description?}), columns (2|3|4)',
  },
  FeatureShowcase: {
    description: 'Split-layout feature highlight with image + details.',
    shortDescription: 'Split image + feature layout',
    propsSignature: 'heading (string), description (string?), image (string), features (array of {title, description})',
  },
  CountdownTimer: {
    description: 'Countdown timer in events/offers.',
    shortDescription: 'Countdown timer widget',
    propsSignature: 'heading (string), endDate (string,ISO date)',
  },
  AnnouncementBar: {
    description: 'Top announcement bar with message and optional CTA.',
    shortDescription: 'Top announcement bar',
    propsSignature: 'message (string), ctaText (string?), ctaHref (string?), variant ("primary"|"dark"|"gradient")',
  },
  Banner: {
    description: 'Full-width banner with heading, subtext, and CTA.',
    shortDescription: 'Full-width promotional banner',
    propsSignature: 'heading (string), subtext (string?), ctaText (string), ctaHref (string), variant ("info"|"warning"|"success"|"gradient")',
  },
  HeadingBlock: {
    description: 'Standalone heading element.',
    shortDescription: 'Standalone heading element',
    propsSignature: 'text (string), level (1|2|3|4|5|6), align ("left"|"center"|"right")',
  },
  RichTextBlock: {
    description: 'Advanced rich text with formatting.',
    shortDescription: 'Advanced rich text block',
    propsSignature: 'content (HTML string), align ("left"|"center"|"right")',
  },
  ButtonBlock: {
    description: 'Standalone button element.',
    shortDescription: 'Standalone button element',
    propsSignature: 'label (string), href (string), variant ("primary"|"outline"|"ghost")',
  },
  CardBlock: {
    description: 'Card container with title and content.',
    shortDescription: 'Card container with content',
    propsSignature: 'title (string), content (string), image (string?)',
  },
  SectionBlock: {
    description: 'Wrapper section with background and padding.',
    shortDescription: 'Section wrapper with background',
    propsSignature: 'background ("white"|"muted"|"dark"|"gradient"), padding ("sm"|"md"|"lg")',
  },
  Blank: {
    description: 'Empty container for free-form content.',
    shortDescription: 'Empty container',
    propsSignature: '(none)',
  },
  Flex: {
    description: 'Flex layout container.',
    shortDescription: 'Flexbox layout container',
    propsSignature: 'direction ("row"|"column"), gap (number), align ("start"|"center"|"end")',
  },
  Grid: {
    description: 'CSS Grid container.',
    shortDescription: 'CSS Grid container',
    propsSignature: 'columns (number), gap (number)',
  },
};

// ---------------------------------------------------------------------------
// Dynamic Catalog Builder
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

**Clarify** when: vague request, no business context, no style preference, ambiguous intent.
{"action": "clarify", "message": "Your questions (2-4 specific)", "components": []}

**Generate** when: enough context from THIS message OR conversation history.
- If user provided context in PREVIOUS messages — do NOT ask again. Generate immediately.
- If request is specific enough — generate immediately.
- Default to GENERATE if at least 2 pieces of context known.

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
## Project Knowledge (what the AI knows about this project)
${ctx.projectProfile}
Use this context to personalize your response. Match the tone, style, and language preferences.
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
