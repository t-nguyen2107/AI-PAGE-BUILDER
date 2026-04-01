# Block & Component Expansion Guide

Complete reference for adding new sections and components to the AI Website Builder.

---

## Architecture Overview

The system uses a **data-driven template generator pattern**. There is no runtime registry — blocks are defined as **pure functions** that return `SectionNode` trees, mapped by `ComponentCategory` enum values.

### The 4 Files You Touch When Adding a New Block

| # | File | What to change |
|---|------|---------------|
| 1 | `src/types/enums.ts` | Add category to `ComponentCategory` enum |
| 2 | `src/features/ai/templates/<name>.ts` | Create new template generator function |
| 3 | `src/features/ai/component-generator.ts` | Register in `SECTION_GENERATORS` map |
| 4 | `src/features/ai/prompt-parser.ts` | Add AI keyword mappings in `CATEGORY_KEYWORDS` |

---

## Step-by-Step: Adding a New Block

### Step 1: Add Category Enum

File: `src/types/enums.ts` → `ComponentCategory` enum

```typescript
export enum ComponentCategory {
  // ... existing categories ...
  STATS = 'stats',           // NEW
  TEAM = 'team',             // NEW
  LOGO_GRID = 'logo-grid',   // NEW
  TIMELINE = 'timeline',     // NEW
  BLOG = 'blog',             // NEW
  // etc.
}
```

### Step 2: Create Template Function

File: `src/features/ai/templates/<name>.ts` (new file)

Every template is a function with this signature:
```typescript
export function generateXxxSection(props?: Record<string, unknown>): SectionNode
```

### Step 3: Register Generator

File: `src/features/ai/component-generator.ts`

```typescript
import { generateStatsSection } from './templates/stats-section';

const SECTION_GENERATORS: Record<string, (props?) => SectionNode> = {
  // ... existing ...
  [ComponentCategory.STATS]: generateStatsSection,
};
```

### Step 4: Add AI Keywords

File: `src/features/ai/prompt-parser.ts` → `CATEGORY_KEYWORDS`

```typescript
stats: ComponentCategory.STATS,
statistic: ComponentCategory.STATS,
counter: ComponentCategory.STATS,
numbers: ComponentCategory.STATS,
metric: ComponentCategory.STATS,
```

Also add count property mapping in the `count` extraction logic:
```typescript
} else if (componentCategory === ComponentCategory.STATS) {
  properties.items = count;
}
```

---

## Node Tree Structure Reference

Every section must follow the 6-level hierarchy. Templates produce levels 2-6:

```
SectionNode (Level 2)
  └── ContainerNode (Level 3)
        ├── ComponentNode (Level 4) — title/heading area
        ├── ComponentNode (Level 4) — card/item 1
        │     └── ElementNode (Level 5)
        │           └── ItemNode (Level 6) [for lists]
        ├── ComponentNode (Level 4) — card/item 2
        │     └── ElementNode (Level 5)
        └── ... more components
```

### Level 2: SectionNode

```typescript
{
  id: generateId(),
  type: NodeType.SECTION,
  tag: SemanticTag.SECTION,           // or HEADER | FOOTER | NAV
  className: 'stats-section',
  meta: {
    createdAt: now,
    updatedAt: now,
    sectionName: 'Stats Section',
    aiGenerated: true,
  },
  children: [ /* ContainerNode[] */ ],
  layout: {
    display: DisplayType.FLEX,
    flexDirection: FlexDirection.COLUMN,
    alignItems: 'center',
    padding: '4rem 0',
  },
  background: { color: '#ffffff' },
}
```

**Available Section tags:** `SemanticTag.SECTION`, `SemanticTag.HEADER`, `SemanticTag.FOOTER`, `SemanticTag.NAV`

### Level 3: ContainerNode

```typescript
{
  id: generateId(),
  type: NodeType.CONTAINER,
  tag: SemanticTag.DIV,
  className: 'stats-container',
  meta: { createdAt: now, updatedAt: now },
  children: [ /* ComponentNode[] */ ],
  layout: {
    display: DisplayType.GRID,                    // or DisplayType.FLEX
    gridTemplateColumns: 'repeat(4, 1fr)',        // for grid layouts
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
  },
}
```

### Level 4: ComponentNode

```typescript
{
  id: generateId(),
  type: NodeType.COMPONENT,
  tag: SemanticTag.DIV,           // or ARTICLE | FIGURE
  className: 'stat-card',
  category: ComponentCategory.STATS,
  meta: { createdAt: now, updatedAt: now, aiGenerated: true },
  children: [ /* ElementNode[] */ ],
  layout: {
    display: DisplayType.FLEX,
    flexDirection: FlexDirection.COLUMN,
    alignItems: 'center',
    gap: '0.75rem',
    padding: '2rem',
  },
  inlineStyles: {
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
}
```

### Level 5: ElementNode

```typescript
// Heading
{
  id: generateId(),
  type: NodeType.ELEMENT,
  tag: SemanticTag.H3,
  className: 'stat-number',
  content: '10,000+',
  typography: { fontSize: '2.5rem', fontWeight: '700' },
  meta: { createdAt: now, updatedAt: now },
}

// Paragraph
{
  id: generateId(),
  type: NodeType.ELEMENT,
  tag: SemanticTag.P,
  className: 'stat-label',
  content: 'Active Users',
  typography: { fontSize: '1rem', color: '#64748b' },
  meta: { createdAt: now, updatedAt: now },
}

// Image
{
  id: generateId(),
  type: NodeType.ELEMENT,
  tag: SemanticTag.IMG,
  className: 'team-photo',
  src: '/placeholder-avatar.jpg',
  attributes: { alt: 'Team member name' },
  meta: { createdAt: now, updatedAt: now },
}

// Unordered List (with Items)
{
  id: generateId(),
  type: NodeType.ELEMENT,
  tag: SemanticTag.UL,
  className: 'feature-list',
  meta: { createdAt: now, updatedAt: now },
  children: [
    {
      id: generateId(),
      type: NodeType.ITEM,
      tag: SemanticTag.LI,
      content: 'Feature 1',
      meta: { createdAt: now, updatedAt: now },
    },
  ],
}

// Anchor/Link
{
  id: generateId(),
  type: NodeType.ELEMENT,
  tag: SemanticTag.A,
  className: 'card-link',
  content: 'Learn More',
  href: '#',
  meta: { createdAt: now, updatedAt: now },
}

// Button
{
  id: generateId(),
  type: NodeType.ELEMENT,
  tag: SemanticTag.BUTTON,
  className: 'action-btn',
  content: 'Sign Up',
  attributes: { 'data-href': '/signup' },
  inlineStyles: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
  },
  meta: { createdAt: now, updatedAt: now },
}
```

### Level 6: ItemNode

```typescript
// List item
{
  id: generateId(),
  type: NodeType.ITEM,
  tag: SemanticTag.LI,
  content: 'Feature text here',
  meta: { createdAt: now, updatedAt: now },
}

// Span (inline text wrapper)
{
  id: generateId(),
  type: NodeType.ITEM,
  tag: SemanticTag.SPAN,
  content: 'highlighted text',
  typography: { fontWeight: '600', color: '#3b82f6' },
  meta: { createdAt: now, updatedAt: now },
}

// Figcaption
{
  id: generateId(),
  type: NodeType.ITEM,
  tag: SemanticTag.FIGCAPTION,
  content: 'Image description',
  meta: { createdAt: now, updatedAt: now },
}
```

---

## All Available Enums Quick Reference

### NodeType (6 levels)
`PAGE`, `SECTION`, `CONTAINER`, `COMPONENT`, `ELEMENT`, `ITEM`

### SemanticTag (HTML element mapping)
| Group | Tags |
|-------|------|
| Structure | `HEADER`, `NAV`, `MAIN`, `SECTION`, `ARTICLE`, `ASIDE`, `FOOTER` |
| Generic | `DIV`, `SPAN` |
| Headings | `H1`, `H2`, `H3`, `H4`, `H5`, `H6` |
| Text | `P`, `A` |
| Media | `IMG`, `FIGURE`, `FIGCAPTION` |
| Lists | `UL`, `OL`, `LI` |
| Interactive | `BUTTON`, `FORM`, `INPUT` |

### DisplayType
`BLOCK`, `FLEX`, `GRID`, `INLINE`, `INLINE_BLOCK`

### FlexDirection
`ROW`, `COLUMN`, `ROW_REVERSE`, `COLUMN_REVERSE`

### TextAlign
`LEFT`, `CENTER`, `RIGHT`, `JUSTIFY`

### Current ComponentCategory
`HERO`, `PRICING`, `FEATURES`, `TESTIMONIAL`, `CTA`, `FAQ`, `GALLERY`, `CONTACT`, `HEADER_NAV`, `FOOTER`, `CUSTOM`

---

## Layout Pattern Cheat Sheet

### Full-width centered section
```typescript
layout: {
  display: DisplayType.FLEX,
  flexDirection: FlexDirection.COLUMN,
  alignItems: 'center',
  padding: '4rem 0',
},
```

### Grid of N columns
```typescript
layout: {
  display: DisplayType.GRID,
  gridTemplateColumns: `repeat(${count}, 1fr)`,
  gap: '2rem',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 2rem',
},
```

### Horizontal flex with wrapping
```typescript
layout: {
  display: DisplayType.FLEX,
  flexDirection: FlexDirection.ROW,
  flexWrap: 'wrap',
  gap: '1.5rem',
  justifyContent: 'center',
},
```

### Card with vertical stack
```typescript
layout: {
  display: DisplayType.FLEX,
  flexDirection: FlexDirection.COLUMN,
  alignItems: 'center',
  gap: '1rem',
  padding: '2rem',
},
```

---

## Blueprint: Stats/Counter Section (Example)

```typescript
// src/features/ai/templates/stats-section.ts
import { NodeType, SemanticTag, DisplayType, FlexDirection, ComponentCategory, TextAlign } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

interface StatItem {
  value: string;
  label: string;
  description?: string;
}

const DEFAULT_STATS: StatItem[] = [
  { value: '10K+', label: 'Active Users', description: 'Growing every day' },
  { value: '99.9%', label: 'Uptime', description: 'Reliable infrastructure' },
  { value: '150+', label: 'Countries', description: 'Global presence' },
  { value: '24/7', label: 'Support', description: 'Always here for you' },
];

function generateStatCard(stat: StatItem, now: string): ComponentNode {
  return {
    id: generateId(),
    type: NodeType.COMPONENT,
    tag: SemanticTag.DIV,
    className: 'stat-card',
    category: ComponentCategory.STATS,
    meta: { createdAt: now, updatedAt: now, aiGenerated: true },
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      gap: '0.5rem',
      padding: '2rem 1.5rem',
    },
    inlineStyles: {
      textAlign: 'center',
      borderRadius: '12px',
    },
    children: [
      {
        id: generateId(),
        type: NodeType.ELEMENT,
        tag: SemanticTag.H3,
        className: 'stat-value',
        content: stat.value,
        typography: { fontSize: '2.5rem', fontWeight: '800', color: '#3b82f6' },
        meta: { createdAt: now, updatedAt: now },
      },
      {
        id: generateId(),
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'stat-label',
        content: stat.label,
        typography: { fontSize: '1.125rem', fontWeight: '600' },
        meta: { createdAt: now, updatedAt: now },
      },
      ...(stat.description ? [{
        id: generateId(),
        type: NodeType.ELEMENT,
        tag: SemanticTag.P,
        className: 'stat-desc',
        content: stat.description,
        typography: { fontSize: '0.875rem', color: '#64748b' },
        meta: { createdAt: now, updatedAt: now },
      }] : []),
    ],
  };
}

export function generateStatsSection(props?: Record<string, unknown>): SectionNode {
  const count = Math.max(2, Math.min(6, (props?.items as number) ?? (props?.count as number) ?? 4));
  const customStats = props?.stats as StatItem[] | undefined;
  const stats: StatItem[] = customStats ? customStats.slice(0, count) : DEFAULT_STATS.slice(0, count);
  const now = new Date().toISOString();

  const statCards = stats.map((s) => generateStatCard(s, now));

  return {
    id: generateId(),
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: 'stats-section',
    meta: { createdAt: now, updatedAt: now, sectionName: 'Stats Section', aiGenerated: true },
    children: [
      {
        id: generateId(),
        type: NodeType.CONTAINER,
        tag: SemanticTag.DIV,
        className: 'stats-container',
        meta: { createdAt: now, updatedAt: now },
        children: [
          // Title component
          {
            id: generateId(),
            type: NodeType.COMPONENT,
            tag: SemanticTag.DIV,
            className: 'stats-title-wrap',
            meta: { createdAt: now, updatedAt: now },
            layout: { display: DisplayType.FLEX, justifyContent: 'center' },
            children: [
              {
                id: generateId(),
                type: NodeType.ELEMENT,
                tag: SemanticTag.H2,
                className: 'stats-title',
                content: (props?.heading as string) ?? 'By The Numbers',
                typography: { fontSize: '2rem', fontWeight: '700', textAlign: TextAlign.CENTER },
                meta: { createdAt: now, updatedAt: now },
              },
            ],
          },
          // Stats grid
          {
            id: generateId(),
            type: NodeType.CONTAINER,
            tag: SemanticTag.DIV,
            className: 'stats-grid',
            meta: { createdAt: now, updatedAt: now },
            children: statCards,
            layout: {
              display: DisplayType.GRID,
              gridTemplateColumns: `repeat(${count}, 1fr)`,
              gap: '2rem',
            },
          } as unknown as ComponentNode,
        ],
        layout: {
          display: DisplayType.FLEX,
          flexDirection: FlexDirection.COLUMN,
          alignItems: 'center',
          gap: '3rem',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
        },
      },
    ],
    layout: {
      display: DisplayType.FLEX,
      flexDirection: FlexDirection.COLUMN,
      alignItems: 'center',
      padding: '4rem 0',
    },
    background: { color: '#f8fafc' },
  };
}
```

---

## Suggested Block Roadmap (Priority Order)

### High Priority — Common Marketing Blocks
| Block | Category | Description |
|-------|----------|-------------|
| Stats/Counter | `STATS` | Number highlights with labels |
| Team | `TEAM` | Member cards with photo, name, role |
| Logo Grid | `LOGO_GRID` | Partner/client logo showcase |
| Blog/Posts | `BLOG` | Article preview cards |

### Medium Priority — Fix Placeholders
| Block | Category | Current Status |
|-------|----------|---------------|
| FAQ | `FAQ` | Aliases to features-grid — needs dedicated accordion/Q&A template |
| Gallery | `GALLERY` | Aliases to features-grid — needs image grid with captions |

### Lower Priority — Specialized Blocks
| Block | Category | Description |
|-------|----------|-------------|
| Timeline | `TIMELINE` | Step-by-step process / history |
| Testimonials Long-form | — | Video testimonial or detailed case study |
| Comparison Table | `COMPARISON` | Feature comparison grid |
| Video Hero | — | Hero with embedded video |
| Map/Location | `MAP` | Embedded map with address info |
| Newsletter | `NEWSLETTER` | Email subscription form |
| Social Proof | `SOCIAL_PROOF` | Twitter/LinkedIn embed-style feed |
| Cookie Banner | `COOKIE` | GDPR consent banner |

---

## Checklist for Each New Block

- [ ] `src/types/enums.ts` — Add to `ComponentCategory`
- [ ] `src/features/ai/templates/<name>.ts` — Create template function
- [ ] `src/features/ai/component-generator.ts` — Import + add to `SECTION_GENERATORS`
- [ ] `src/features/ai/prompt-parser.ts` — Add keywords to `CATEGORY_KEYWORDS`
- [ ] `src/features/ai/prompt-parser.ts` — Add count mapping in `properties` block (if applicable)
- [ ] Verify: builder sidebar renders the new category
- [ ] Verify: AI prompt ("add a stats section") generates correct output
