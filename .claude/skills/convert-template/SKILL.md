# convert-template: HTML to DOM Node Template Converter

Convert HyperUI/Tailwind HTML templates to pageBuilder DOM node TypeScript generators.

## When to use
- When user says "convert template", "convert html", "add template from html"
- When converting HyperUI HTML patterns to DOM node format

## Template Styles

### Style A: CSS-Variable (existing templates)
Uses `layout: { display, flexDirection, gap, ... }` objects + CSS variables like `var(--foreground)`.
Example: `hero-split-image.ts`, `hero-minimal-dark.ts`, `cta-centered-simple.ts`

### Style B: Tailwind (new HyperUI conversions)
Uses `className: 'tailwind-classes'` + `layout: {}` (empty). The Tailwind CDN is loaded in Canvas.
Example: `hero-tw-dark-bg.ts`

**Always use Style B for HyperUI conversions.**

## Conversion Rules

### 1. HTML → DOM Node Type Mapping

| HTML Element | DOM Node Type | SemanticTag |
|---|---|---|
| `<section>` | `NodeType.SECTION` | `SemanticTag.SECTION` |
| `<header>` | `NodeType.SECTION` | `SemanticTag.HEADER` |
| `<footer>` | `NodeType.SECTION` | `SemanticTag.FOOTER` |
| `<nav>` | `NodeType.SECTION` | `SemanticTag.NAV` |
| `<div>` (with div children) | `NodeType.CONTAINER` or `NodeType.COMPONENT` | `SemanticTag.DIV` |
| `<article>` | `NodeType.COMPONENT` | `SemanticTag.ARTICLE` |
| `<figure>` | `NodeType.COMPONENT` | `SemanticTag.FIGURE` |
| `<h1>`-`<h6>` | `NodeType.ELEMENT` | `SemanticTag.H1`-`SemanticTag.H6` |
| `<p>` | `NodeType.ELEMENT` | `SemanticTag.P` |
| `<a>` | `NodeType.ELEMENT` | `SemanticTag.A` |
| `<img>` | `NodeType.ELEMENT` | `SemanticTag.IMG` |
| `<button>` | `NodeType.ELEMENT` | `SemanticTag.BUTTON` |
| `<ul>`/`<ol>` | `NodeType.ELEMENT` | `SemanticTag.UL`/`SemanticTag.OL` |
| `<li>` | `NodeType.ITEM` | `SemanticTag.LI` |
| `<span>` | `NodeType.ITEM` | `SemanticTag.SPAN` |
| `<svg>` | **SKIP** | Not representable |
| `<blockquote>` | `NodeType.ELEMENT` | `SemanticTag.P` |

### 2. Hierarchy Rules (STRICT)

The tree must follow this nesting order:
```
SectionNode → ContainerNode[] → ComponentNode[] → ElementNode[] → ItemNode[]
```

- `SectionNode.children` must be `ContainerNode[]`
- `ContainerNode.children` must be `ComponentNode[]`
- `ComponentNode.children` must be `(ElementNode | ComponentNode)[]`
- `ElementNode.children` must be `(ElementNode | ItemNode)[]`

**If HTML doesn't fit this hierarchy, insert wrapper nodes.**

Example: If `<section>` has a direct `<img>` child:
```
❌ Section → Element (violates hierarchy)
✅ Section → Container → Component → Element (insert wrappers)
```

### 3. Div → Container vs Component Decision

A `<div>` becomes:
- **ContainerNode**: Direct child of Section, or a major layout wrapper (e.g., "max-w-7xl", grid parent)
- **ComponentNode**: A meaningful UI unit inside a Container (e.g., a card, button group, text block)

### 4. Content Extraction

Extract dynamic content as props with defaults:

```typescript
export function generate[Name](props?: Record<string, unknown>): SectionNode {
  const heading = (props?.heading as string) ?? 'Default Heading';
  const subtext = (props?.subtext as string) ?? 'Default description text.';
  const ctaText = (props?.ctaText as string) ?? 'Get Started';
  const ctaHref = (props?.ctaHref as string) ?? '#';
  // ...
}
```

For array data (features, pricing tiers, testimonials):
```typescript
const rawItems = props?.items as Array<{ title: string; description: string }> | undefined;
const items = rawItems ?? DEFAULT_ITEMS;
```

### 5. Tailwind Class Handling

- HTML `class="..."` → `className: '...'` on the DOM node
- Use `layout: {}` (empty object) — Tailwind handles all layout
- Use `meta: { createdAt: now, updatedAt: now }` on every node
- For the section: add `meta.sectionName` and `meta.aiGenerated: true`

### 6. SVG Handling

SVGs cannot be represented in the DOM tree. Options:
- **Skip entirely** — remove the SVG and its container
- **Replace with Material Symbol** — use `<p class="material-symbols-outlined ...">icon_name</p>`
- **Replace with colored div** — `<div class="flex size-12 items-center justify-center rounded-xl bg-gray-900 text-white"></div>` (empty, just visual)

### 7. File Template

Every template file MUST follow this exact structure:

```typescript
import { NodeType, SemanticTag, ComponentCategory } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

/**
 * [Description of the template]
 * Based on HyperUI [category]/[n].html
 *
 * Props: [list of props with types and defaults]
 */
export function generate[Name](props?: Record<string, unknown>): SectionNode {
  // 1. Extract props with defaults
  const heading = (props?.heading as string) ?? 'Default';
  const now = new Date().toISOString();

  // 2. Build dynamic children (loops for arrays)
  // 3. Build node tree bottom-up
  // 4. Return SectionNode

  return {
    id: generateId(),
    type: NodeType.SECTION,
    tag: SemanticTag.SECTION,
    className: '...',  // Tailwind classes
    layout: {},
    meta: { createdAt: now, updatedAt: now, sectionName: '...', aiGenerated: true },
    children: [
      // ContainerNode(s)
    ],
  };
}
```

### 8. Required Imports

```typescript
// Minimum imports needed:
import { NodeType, SemanticTag } from '@/types/enums';
import { generateId } from '@/lib/id';
import type { SectionNode, ContainerNode, ComponentNode, ElementNode } from '@/types/dom-tree';

// Only import additional types/enums if actually used:
// ComponentCategory — only if setting category on ComponentNode
// ItemNode — only if generating list items
```

## Validation Steps

After writing a template file, ALWAYS run:

```bash
npx tsc --noEmit --pretty 2>&1 | head -30
```

If TypeScript errors exist, fix them before proceeding. Common issues:
- Missing imports
- Wrong node type in children array
- Missing required fields (id, type, tag, meta, layout)
- Using `tag` value not in the allowed union type

## Registration

After creating a template:

1. Add import to `src/features/ai/templates/registry-setup.ts`
2. Add `registerTemplate()` call with id, category, label, description, generate function, and defaultContent
3. Update `src/lib/ai/prompts/template-prompt.ts` to include new template ID in the catalog

## Batch Conversion

For converting multiple HTML files, use the CLI script:

```bash
npx tsx scripts/html-to-template.ts <input.html> --id <template_id> --category <category> [--output <output_path>]
```

The CLI script handles mechanical conversion. Review and refine the output using these rules.