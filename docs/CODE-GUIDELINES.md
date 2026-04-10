# Loomweave AI Website Builder — Code Guidelines

> Last updated: 2026-04-10

This document provides comprehensive coding guidelines for the Loomweave AI Website Builder project. All team members should follow these conventions to maintain code quality and consistency.

## 1. Tech Stack & Requirements

### Core Technologies
- **Framework**: Next.js 16 (App Router), React 19, TypeScript strict mode
- **Styling**: Tailwind CSS 4 + CSS Variables (dynamic styleguide injection)
- **State Management**: Zustand 5 (toast store; Puck manages its own editor state)
- **Database**: PostgreSQL via Prisma 7 (Prisma Postgres)
- **Validation**: Zod 4 schemas
- **Editor**: @puckeditor/core v0.21.x (visual drag-drop, inline editing)
- **AI**: LangChain + Ollama/Gemini/OpenAI/Anthropic
- **Testing**: Vitest (jsdom)
- **IDs**: nanoid

### Node.js & Package Management
- **Node Version**: 18.x or higher (use `nvm use` or check package.json)
- **Package Manager**: npm (no yarn/pnpm)

## 2. Project Setup

### Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd pageBuilder

# Install dependencies
npm install

# Set up environment variables
cp .env.sample .env.local
# Edit .env.local with your database and API keys

# Generate Prisma client
npm run db:generate

# Run development server
npm run dev
```

### Database Setup
```bash
# Push schema changes to database (uses DATABASE_DIRECT_URL)
npm run db:push

# Open Prisma Studio (admin UI)
npm run db:studio
```

### Environment Variables
The project uses `.env.local` for development values. Copy `.env.sample` and fill in:
- `DATABASE_URL`: Prisma Accelerate URL (for app runtime)
- `DATABASE_DIRECT_URL`: Direct PostgreSQL URL (for CLI operations)
- `AI_PROVIDER`: gemini|openai|ollama|anthropic
- `AI_MODEL`: Main model (e.g., gemini-3-flash-preview)
- `AI_FAST_MODEL`: Lightweight model for faster tasks
- `AI_API_KEY`: Provider API key
- `EMBEDDING_PROVIDER`: For AI memory system

## 3. File & Directory Conventions

### Path Alias
- **Always use `@/`** for imports: `import { HeroSection } from "@/puck/components/HeroSection"`

### Component Organization
```
src/puck/
├── components/          # 26 Puck render components
│   ├── HeroSection.tsx
│   ├── FeaturesGrid.tsx
│   └── ...
├── puck.config.tsx     # Component definitions with fields, defaults
├── types.ts           # All component prop types
├── categories.ts      # 6 sidebar categories
└── migration/         # Old DOMNode → Puck converters

src/lib/ai/           # AI pipeline
├── prompts/           # System, template, section prompts
├── streaming.ts       # SSE streaming functions
├── section-polisher.ts # Reusable polish functions
└── defaults-engine.ts # Post-processing (zero cost)

src/features/ai/
├── templates/         # Template generators (output old format)
└── component-generator.ts # Puck data converter

src/app/api/          # REST API routes
├── ai/
│   ├── generate/
│   │   └── stream/route.ts
│   └── profile/
src/app/builder/      # Builder pages
src/app/preview/      # Public preview (ISR)
```

### Shared Resources
- `src/types/` — TypeScript interfaces + enums
- `src/schemas/` — Zod validation schemas
- `src/components/` — Shared UI components (Button, Input, Modal)
- `src/lib/` — Utilities, prisma client, AI pipeline

## 4. Coding Standards

### TypeScript Rules
- **Strict mode enabled** — no `any` types allowed
- Use `interface` for object shapes, `type` for unions/compositions
- All external input validated with Zod before use
- Explicit typing for all React component props

### React Component Rules
- **Functional components only** — no class components
- Use `React.FC` type for components with children
- Destructure props at the top level
- Spread meta props to section root elements

```tsx
// Good
export function HeroSection({ 
  heading, 
  subtext, 
  designStyle,
  ...meta 
}: HeroSectionProps & ComponentMeta) {
  // Component logic
  return <section {...meta}>{content}</section>
}

// Bad - no React.FC, no meta spreading
export const HeroSection = (props: any) => {
  return <section>{props.heading}</section>
}
```

### English-First Policy
- **All code comments** in English
- **All UI copy** in English (default)
- **All AI prompts** in English
- Vietnamese **only** when user explicitly writes in Vietnamese
- **No emojis** in code unless user explicitly requests

### Input Validation
```tsx
// Always validate external data
import { z } from "zod";

const UserInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

// In API routes
const validatedInput = UserInputSchema.parse(request.body);
```

## 5. Naming Conventions

### Components
- **PascalCase**: `HeroSection.tsx`, `FeaturesGrid.tsx`
- **File name matches component name**

### Hooks
- **camelCase with `use` prefix**: `useScrollAnimation.ts`, `useAutoPolish.ts`
- Export hook interface if complex

### Utilities
- **camelCase files**: `utils.ts`, `api-client.ts`
- **camelCase functions**: `cn()`, `getDesignTokens()`

### Types
- **PascalCase interfaces**: `HeroSectionProps`, `ComponentMeta`
- Group related types in single files (`types.ts`)

### API Routes
- **kebab-case directory names**: `api/ai/generate/stream/route.ts`
- **kebab-case endpoint names**: `/api/ai/profile`

### CSS & Variables
- **Tailwind utility classes** only — no custom CSS
- **CSS variables** for theming: `var(--primary)`, `var(--tertiary)`
- Use `cn()` function for class merging

## 6. Component Rules (Puck)

### Component Structure
1. **Render components** in `src/puck/components/`
2. **Type definitions** in `src/puck/types.ts`
3. **Config definitions** in `src/puck/puck.config.tsx`

### Style Implementation
```tsx
// Always use getDesignTokens for style-aware rendering
const ds = getDesignTokens(designStyle);

// Use CSS variables for theme-dependent values
const gradient = "linear-gradient(135deg, var(--primary), var(--tertiary))";

// NOT hardcoded hex values (except user overrides)
const customGradient = gradientFrom || gradientTo;
```

### Animation Handling
- **Use `useScrollAnimation` hook** for all section animations
- Default animation: `animation: "fade-up"`
- Respect `prefers-reduced-motion` media query

```tsx
const anim = useScrollAnimation(animation); // Returns { ref, className, visible }

// Apply to content wrapper
<div ref={anim.ref} className={`${anim.className} transition-all duration-700`}>
  {content}
</div>
```

### Gradient System
- **Default**: CSS variables (`var(--primary)`, `var(--tertiary)`)
- **User override**: Props `gradientFrom`/`gradientTo` (hex values)
- **AI pipeline**: Never set hex defaults — only CSS vars

## 7. AI Pipeline Rules

### Template Output
- AI templates in `src/features/ai/templates/` output **old SectionNode format**
- Converted to Puck format via `puck-adapter.ts`

### Prompt System
- **Shared constants** in `src/lib/ai/prompts/`
- Always use `CLICHE_WARNING`, `CONCRETE_RULES`, `CONTENT_PROPS`
- **Visual styling** auto-applied by defaults-engine — **don't instruct AI**

### Style Guidelines
- **Hero gradients**: CSS vars by default, user hex overrides only
- **Animation**: `fade-up` for hero/CTA, `stagger` for grids
- **Images**: Use `buildBatchStockImageHint()` for compact references
- **Background alternation**: Even sections light, odd sections muted

### Prompt Optimization
```tsx
// Zero-cost prompt enrichment in optimizePrompt()
// No LLM calls — pure rule-based
detectLanguage(prompt)      // vi/en/mixed
detectIntent(prompt)      // create_page/add_section/modify/delete
detectBusinessType(prompt) // restaurant/tech/retail/etc.
```

## 8. Git Workflow

### Commit Messages
Format: `type: concise description`

```bash
# Feature
feat: add AI-powered image generation

# Fix
fix: prevent auto-polish stream abort on re-render

# Refactor
refactor: extract useScrollAnimation hook

# Performance
perf: optimize database query for page revisions

# Documentation
docs: update API response patterns

# Chores
chore: update dependencies
```

### Workflow Rules
1. **Push before big tasks** — Clean checkpoint for potential reverts
2. **Commit often** — Logical, focused commits
3. **Include Co-Authored-By** for AI-assisted work

```bash
# Example commit with AI assistance
git commit -m "$(cat <<'EOF'
feat: implement auto-polish system for AI-generated pages

- Add useAutoPolish hook to detect pending generation status
- Implement polishSections() for parallel component generation
- Add progress tracking and cancellation support
- Stream polished sections directly to Puck canvas

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

## 9. Testing

### Test Structure
- **Vitest** with jsdom for unit tests
- **Test files co-located**: `Component.test.tsx` next to `Component.tsx`
- Test file naming: `[component].test.tsx`

### Test Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage
```

### Pre-commit Checks
```bash
# TypeScript check (must pass)
npx tsc --noEmit

# Build check (for larger changes)
npm run build

# ESLint check
npm run lint
```

### Example Test
```tsx
import { render, screen } from "@testing-library/react";
import { HeroSection } from "./HeroSection";

describe("HeroSection", () => {
  it("renders heading and subtext", () => {
    render(
      <HeroSection
        heading="Welcome"
        subtext="This is a hero section"
        id="test"
      />
    );
    
    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByText("This is a hero section")).toBeInTheDocument();
  });
});
```

## 10. API Response Pattern

All API responses follow the standard format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

// Example usage
export async function functionHandler() {
  try {
    const result = await someOperation();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## 11. Database Patterns

### Prisma Client Usage
```typescript
// Use accelerate URL for runtime, direct URL for CLI
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Accelerate for runtime
    },
  },
});

// In CLI operations, use:
// DATABASE_URL="$DATABASE_DIRECT_URL" npx prisma db push
```

### JSON Field Handling
- Pages use `treeData: Json` field for Puck Data format
- Styleguide uses `colors`, `typography`, etc. as Json fields
- Use Zod validation for all JSON data

## 12. Performance Guidelines

### Bundle Optimization
- Use dynamic imports for heavy components
- Implement proper React.memo usage for expensive renders
- Avoid unnecessary re-renders with useCallback/useMemo

### Image Optimization
- Use Next.js Image component for all images
- Implement responsive images with proper srcsets
- Use placeholder images while loading

### Database Queries
- Use Prisma's select to limit returned fields
- Implement proper pagination for list queries
- Cache frequently accessed data

## 13. Security Considerations

### Input Validation
- Validate all user input with Zod schemas
- Sanitize all HTML content (isomorphic-dompurify)
- Use proper parameterized queries via Prisma

### API Security
- Implement rate limiting on API endpoints
- Use environment variables for sensitive data
- Validate JWT tokens for protected routes

### CORS Configuration
- Configure proper CORS policies for API routes
- Use environment-specific settings

## 14. Accessibility

### Component Accessibility
- Use semantic HTML elements
- Provide proper ARIA labels where needed
- Implement keyboard navigation
- Ensure proper color contrast

### Testing
- Use eslint-plugin-jsx-a11y for linting
- Test with screen readers when possible
- Ensure all interactive elements are keyboard accessible

## 15. Common Patterns

### Error Boundaries
```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Wrap routes with error boundaries
<ErrorBoundary>
  <Component />
</ErrorBoundary>
```

### Loading States
```tsx
import { useState } from "react";

export function Component() {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    try {
      await fetchData();
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? "Loading..." : "Click me"}
    </button>
  );
}
```

### Styled Components
```tsx
// Use Tailwind classes directly
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">

// Use cn() for conditional classes
const buttonClasses = cn(
  "px-4 py-2 rounded",
  variant === "primary" ? "bg-blue-500" : "bg-gray-200"
);
```

## 16. Debugging

### Development Tools
- Use Next.js built-in error reporting
- Implement proper logging with timestamps
- Use React DevTools for component inspection
- Use Prisma Studio for database debugging

### Common Issues
- TypeScript errors: Run `npx tsc --noEmit` to check
- Build errors: Check for missing dependencies or imports
- Database errors: Verify connection strings and migrations
- AI errors: Check API keys and model configuration

## 17. Contributing

### Pull Request Process
1. Create feature branch from main
2. Implement changes following guidelines
3. Update tests if applicable
4. Run pre-commit checks
5. Submit PR with clear description
6. Address review comments
7. Merge after approval

### Code Review Checklist
- [ ] Follows coding standards
- [ ] Includes necessary tests
- [ ] Proper error handling
- [ ] Accessible implementation
- [ ] Performance considerations
- [ ] Documentation updated

---

**Remember**: This is an international product. All code, comments, and documentation should be in English unless specifically requested otherwise by the user.