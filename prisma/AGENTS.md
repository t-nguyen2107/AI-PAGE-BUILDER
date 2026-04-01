<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-31 | Updated: 2026-03-31 -->

# prisma/

## Purpose
Database schema definition and seed data for the AI Website Builder. Uses SQLite via Prisma 7 with better-sqlite3 adapter. Agent 1 owns this directory.

## Key Files
| File | Description |
|------|-------------|
| `schema.prisma` | Database schema — 7 models: Project, Page, Styleguide, GlobalSection, Revision, UserLibrary, AIPromptLog |
| `seed.ts` | Seed script — creates default project with styleguide, global header/footer, home page with hero section |

## Database Models
| Model | Purpose | Key Fields |
|-------|---------|------------|
| `Project` | Top-level container | name, description, thumbnailUrl |
| `Page` | Single page with JSON tree | title, slug, treeData (Json), isHomePage, seoTitle, seoDescription |
| `Styleguide` | Design system per project | colors, typography, spacing, componentVariants, cssVariables (all Json) |
| `GlobalSection` | Shared header/footer/nav | sectionType, sectionName, treeData (Json) |
| `Revision` | Page snapshot history | snapshot (Json), diff (Json), label |
| `UserLibrary` | Saved reusable components | name, category, nodeData (Json), tags, isPublic |
| `AIPromptLog` | AI interaction logging | prompt, action, response (Json), success, errorMessage |

## For AI Agents

### Working In This Directory
- Agent 1 (Architect) owns all changes here
- After schema changes: run `npx prisma db push` (dev) or `npx prisma migrate dev` (production)
- After schema changes: run `npx prisma generate` to update client
- JSON fields are stored as strings — stringify on write, parse on read

### Testing Requirements
- Seed script can be run with `npx prisma db seed`
- Verify with `npx prisma studio` to inspect data

### Common Patterns
- IDs use `cuid()` auto-generation
- Timestamps: `createdAt`, `updatedAt` on most models
- Unique constraints: `[projectId, slug]` on Page, `[projectId, sectionType]` on GlobalSection
- Cascade deletes on foreign keys
