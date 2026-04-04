# Contributing to AI Page Builder

Thank you for your interest in contributing! This guide covers everything you need to get started.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Architecture](#project-architecture)
- [Coding Standards](#coding-standards)
- [Adding a New Puck Component](#adding-a-new-puck-component)
- [Adding a New Editor Field](#adding-a-new-editor-field)
- [Adding a New API Route](#adding-a-new-api-route)
- [Adding a New AI Template](#adding-a-new-ai-template)
- [Database Changes](#database-changes)
- [Testing](#testing)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

Be respectful, constructive, and inclusive. We're all here to build something great together.

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **Git**
- **Ollama** (optional, for AI features)
- **VS Code** recommended with extensions: ESLint, Tailwind CSS IntelliSense, TypeScript

### Setup

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/AI-PAGE-BUILDER.git
cd AI-PAGE-BUILDER

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Set up database
npm run db:push

# 5. (Optional) Seed sample data
npm run db:seed

# 6. Start dev server
npm run dev
```

### Verify Setup

```bash
# Build should pass
npm run build

# Lint should pass
npm run lint
```

---

## Development Workflow

```
main (stable)
  └── feat/your-feature   ← Create from main
        └── commits       ← Push your changes
              └── PR      ← Submit back to main
```

### Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Feature | `feat/description` | `feat/contact-form-component` |
| Bug Fix | `fix/description` | `fix/header-nav-overflow` |
| Refactor | `refactor/description` | `refactor/api-response-type` |
| Docs | `docs/description` | `docs/api-endpoints` |
| Chore | `chore/description` | `chore/update-dependencies` |

### Workflow Steps

1. **Sync** with main: `git checkout main && git pull origin main`
2. **Create** branch: `git checkout -b feat/my-feature`
3. **Develop** with hot-reload dev server
4. **Test** your changes
5. **Lint** with `npm run lint`
6. **Build** with `npm run build`
7. **Commit** and push
8. **Open** a Pull Request

---

## Project Architecture

### Directory Map

```
src/
├── app/                    # Next.js App Router pages + API routes
│   ├── api/                # REST endpoints
│   ├── builder/            # Editor pages
│   └── preview/            # Published page preview (ISR)
├── puck/                   # Visual editor (Puck integration)
│   ├── components/         # 37 render components (Tailwind CSS)
│   ├── fields/             # 12 custom editor field widgets
│   ├── plugins/            # Editor plugins (AI chat panel)
│   ├── settings/           # Settings panel tabs
│   ├── puck.config.tsx     # Component registrations + field configs
│   ├── types.ts            # All component prop types
│   └── categories.ts       # Sidebar component categories
├── features/
│   ├── ai/                 # AI pipeline (templates, registry, generator)
│   └── seo/                # SEO audit tools
├── lib/
│   ├── ai/                 # Streaming, validation, Puck data adapter
│   ├── prisma.ts           # Prisma client singleton
│   ├── api-client.ts       # Typed client-side API helpers
│   └── utils.ts            # cn(), shared utilities
├── components/ui/          # Shared UI primitives (Button, Input, Modal, etc.)
├── store/                  # Zustand stores (toast)
├── types/                  # Shared TypeScript interfaces + enums
└── schemas/                # Zod validation schemas
```

### Data Flow

```
User Input
  → API Route (validates with Zod)
    → Prisma Client (queries SQLite)
      → JSON Response (ApiResponse<T>)
        → React Component (renders UI)
```

### AI Pipeline

```
Prompt → LangChain → AI Model → Raw JSON → Zod Validate → Puck Adapter → Editor
```

---

## Coding Standards

### TypeScript

- **Strict mode** is enabled. No `any` types.
- Use `@/` path alias for imports: `import { cn } from "@/lib/utils"`
- Define types in `src/puck/types.ts` for Puck components
- Define shared types in `src/types/`
- Validate external input with Zod schemas in `src/schemas/`

### React

- Use function components with hooks
- Client components must have `"use client"` at the top
- Use `useCallback` / `useMemo` only when profiling shows a need
- Props interfaces should be typed inline or in the component file

### Styling

- **Tailwind CSS 4** only. No inline `style={{}}` unless values are truly dynamic (e.g., user-entered colors)
- Use `cn()` from `@/lib/utils` for conditional class merging
- Follow the existing spacing/sizing patterns in component files

### API Routes

- All routes use `ApiResponse<T>` response format
- Validate request body/params with Zod before processing
- Use proper HTTP status codes (200, 201, 400, 404, 500)
- Handle errors with try/catch and return `ApiResponse` with `error` field

Example:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);
    // ... process
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid input" },
      { status: 400 }
    );
  }
}
```

### Git

- Keep commits atomic and focused
- Write clear commit messages (see [Commit Guidelines](#commit-guidelines))
- Don't commit `.env*`, `.omc/`, `.claude/`, `.stitch/`, or `dev.db`

---

## Adding a New Puck Component

Follow these steps to add a new visual component:

### 1. Define the Type

In `src/puck/types.ts`:

```typescript
export type MyComponentProps = {
  title: string;
  description?: string;
  variant?: "default" | "card";
};
```

### 2. Create the Render Component

In `src/puck/components/MyComponent.tsx`:

```tsx
import type { MyComponentProps } from "../types";

export default function MyComponent({ title, description, variant = "default" }: MyComponentProps) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold">{title}</h2>
        {description && <p className="mt-4 text-gray-600">{description}</p>}
      </div>
    </section>
  );
}
```

**Rules:**
- Use Tailwind CSS classes only
- Use semantic HTML (`section`, `article`, `nav`, etc.)
- Support responsive layouts (mobile-first)
- All text content should be editable via props

### 3. Register in Puck Config

In `src/puck/puck.config.tsx`, add to the `components` object:

```typescript
import MyComponent from "./components/MyComponent";
import type { MyComponentProps } from "./types";

components: {
  // ... existing components
  MyComponent: {
    defaultProps: {
      title: "Heading",
      description: "Description text here",
      variant: "default",
    },
    fields: {
      title: { type: "text" },
      description: { type: "textarea" },
      variant: {
        type: "select",
        options: [
          { label: "Default", value: "default" },
          { label: "Card", value: "card" },
        ],
      },
    },
    render: MyComponent,
  },
}
```

### 4. Add to a Category

In `src/puck/categories.ts`, add your component to the appropriate category array.

### 5. Add AI Template (Optional)

In `src/features/ai/templates/`, create a template generator so the AI can generate your component.

---

## Adding a New Editor Field

Custom fields live in `src/puck/fields/`.

### 1. Create the Field Component

```tsx
// src/puck/fields/MyField.tsx
"use client";

export type MyFieldValue = {
  // ... field value shape
};

export function MyField({
  value,
  onChange,
}: {
  value: MyFieldValue | undefined;
  onChange: (val: MyFieldValue) => void;
}) {
  return (
    <div className="space-y-2">
      {/* Field UI here */}
    </div>
  );
}
```

### 2. Use in Component Config

In `puck.config.tsx`, use the `type: "custom"` field:

```typescript
fields: {
  myField: {
    type: "custom",
    render: ({ value, onChange }) => (
      <MyField value={value} onChange={onChange} />
    ),
  },
}
```

### Field Design Guidelines

- Keep labels compact (use `text-[10px] text-gray-500`)
- Use `text-xs` for input text
- Consistent border/border-gray-200 styling
- Support "Inherit" / empty state when appropriate
- Google Fonts load dynamically when used (see `TypographyField.tsx`)

---

## Adding a New API Route

API routes follow Next.js App Router conventions in `src/app/api/`.

### Structure

```
src/app/api/
├── my-resource/
│   ├── route.ts              # GET (list), POST (create)
│   └── [id]/
│       └── route.ts          # GET (one), PATCH (update), DELETE
```

### Template

```typescript
// src/app/api/my-resource/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const items = await prisma.myModel.findMany();
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate with Zod
    const parsed = z.object({ name: z.string() }).parse(body);
    const created = await prisma.myModel.create({ data: parsed });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid input" },
      { status: 400 }
    );
  }
}
```

### Rules

- Always validate input with Zod
- Always use try/catch
- Return `ApiResponse<T>` format
- Use correct HTTP methods and status codes
- Add `revalidatePath()` calls when data changes affect published pages

---

## Adding a New AI Template

AI templates define how the AI generates component data for specific page sections.

### 1. Create the Template Generator

In `src/features/ai/templates/my-section.ts`:

```typescript
import type { SectionNode } from "@/types/dom-tree";

export function generateMySection(context: {
  title?: string;
  description?: string;
}): SectionNode {
  return {
    tag: "section",
    props: { className: "py-16 px-6" },
    children: [
      {
        tag: "h2",
        props: {},
        children: [{ tag: "text", content: context.title || "Default Title" }],
      },
    ],
  };
}
```

### 2. Register the Template

In `src/features/ai/template-registry.ts`, add your template to the registry.

### 3. Update AI Schema

In `src/lib/ai/prompts/template-schema.ts`, add the schema definition so the AI knows about your template type.

> Note: Templates currently output the old SectionNode format, which is automatically converted to Puck format by `src/lib/ai/puck-adapter.ts`.

---

## Database Changes

### Modify the Schema

1. Edit `prisma/schema.prisma`
2. Run `npm run db:push` to apply changes
3. Run `npm run db:generate` to update the Prisma client

### Migration Workflow

For development, `db:push` is sufficient. For production, generate proper migrations:

```bash
npx prisma migrate dev --name your-migration-name
```

### Schema Conventions

- Use `@map("snake_case_table")` for table names
- Use `@default(cuid())` for IDs
- Store JSON data as `String` type with a comment indicating the expected shape
- Always add `createdAt DateTime @default(now())`
- Add `@@index` for frequently queried fields
- Use `onDelete: Cascade` for required parent relations

---

## Testing

### Run Tests

```bash
# Run all tests
npx vitest

# Run tests in watch mode
npx vitest --watch

# Run a specific test file
npx vitest src/path/to/test.test.ts
```

### Test Conventions

- Co-locate test files next to the source: `Component.tsx` + `Component.test.tsx`
- Use `@testing-library/react` for component tests
- Use `jsdom` environment (configured in `vitest.config.ts`)
- Test user behavior, not implementation details

### What to Test

- **API routes**: Valid input, invalid input, edge cases
- **Components**: Render with required props, respond to user interaction
- **Utils**: Pure function logic, edge cases
- **AI pipeline**: Output validation, adapter conversion

---

## Commit Guidelines

### Format

```
<type>(<scope>): <short description>

<optional longer description>
```

### Types

| Type | Usage |
|------|-------|
| `feat` | New feature or component |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behavior change |
| `style` | CSS/Tailwind changes only |
| `docs` | Documentation changes |
| `test` | Adding or updating tests |
| `chore` | Build, dependencies, tooling |
| `perf` | Performance improvements |

### Examples

```
feat(puck): add ContactForm component with field validation
fix(api): handle missing page slug in preview route
refactor(ai): consolidate template generators into registry
style(editor): improve spacing in TypographyField
docs(readme): add contributing guide and project architecture
test(utils): add tests for tree-utils and node-utils
```

### Rules

- Use imperative mood ("add feature" not "added feature")
- Keep the first line under 72 characters
- Reference issues/PRs when relevant: `fix(api): resolve #42 null pointer in revisions`

---

## Pull Request Process

### Before Submitting

- [ ] Code compiles (`npm run build` passes)
- [ ] Lint passes (`npm run lint`)
- [ ] No `any` types introduced
- [ ] External input is validated with Zod
- [ ] New components are registered in `puck.config.tsx`
- [ ] New components are added to a category in `categories.ts`
- [ ] Database changes include both schema and `db:push`

### PR Template

```markdown
## Summary
Brief description of what this PR does.

## Changes
- Item 1
- Item 2

## Test Plan
- [ ] Manual test: describe what you tested
- [ ] Unit tests: describe what was tested

## Screenshots (if UI changes)
Before | After
```

### Review Criteria

1. **Correctness** -- Does it work as described?
2. **Type safety** -- No `any` types, proper TypeScript usage
3. **Validation** -- External input validated with Zod
4. **Consistency** -- Follows existing patterns and conventions
5. **Performance** -- No obvious performance issues
6. **Security** -- No injection vectors, proper auth checks

### Merge Rules

- PRs require at least one review
- All CI checks must pass
- Squash merge is preferred for clean history

---

## Reporting Issues

### Bug Reports

Please include:

1. **Steps to reproduce** -- numbered list of exact steps
2. **Expected behavior** -- what should happen
3. **Actual behavior** -- what happens instead
4. **Environment** -- OS, Node version, browser
5. **Screenshots** -- if applicable

### Feature Requests

Please include:

1. **Use case** -- what problem does this solve?
2. **Proposed solution** -- how should it work?
3. **Alternatives considered** -- what else did you think about?

---

## Questions?

- Open an [Issue](https://github.com/t-nguyen2107/AI-PAGE-BUILDER/issues) for bugs or features
- Start a [Discussion](https://github.com/t-nguyen2107/AI-PAGE-BUILDER/discussions) for questions

Thank you for contributing!
