<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-31 | Updated: 2026-03-31 -->

# src/app/api/

## Purpose
REST API routes following Next.js App Router conventions. Agent 3 owns this directory. All routes use Prisma for database access and follow the `ApiResponse<T>` response format. 13 routes covering full CRUD for projects, pages, styleguide, global sections, revisions, library, and AI generation.

## Route Structure
| Route | Methods | Description |
|-------|---------|-------------|
| `projects/route.ts` | GET, POST | List projects (with page count) / Create project (transaction: project + styleguide + home page) |
| `projects/[projectId]/route.ts` | GET, PUT, DELETE | Get project with pages + styleguide / Update / Delete (cascade) |
| `projects/[projectId]/pages/route.ts` | GET, POST | List pages / Create page with default or custom treeData |
| `projects/[projectId]/pages/[pageId]/route.ts` | GET, PUT, DELETE | Get page (parsed treeData) / Update / Delete |
| `projects/[projectId]/styleguide/route.ts` | GET, PUT | Get/update styleguide (JSON fields stringified/parsed) |
| `projects/[projectId]/global-sections/route.ts` | GET, POST | List / Create global sections |
| `projects/[projectId]/global-sections/[sectionId]/route.ts` | GET, PUT, DELETE | CRUD for individual global section |
| `projects/[projectId]/revisions/route.ts` | GET, POST | List revisions / Create snapshot |
| `projects/[projectId]/revisions/[revisionId]/route.ts` | GET, POST | Get revision / Restore (replace page treeData) |
| `library/route.ts` | GET, POST | List (filter by category) / Save to library |
| `library/[libraryItemId]/route.ts` | GET, PUT, DELETE | CRUD for library item |
| `ai/generate/route.ts` | POST | Call Ollama API, parse JSON, validate, return nodes |
| `ai/search/route.ts` | POST | Text-based library search with relevance scoring |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `__tests__/` | API route tests (global-sections) |
| `ai/` | AI-specific routes (generate, search) |
| `library/` | Component library routes |
| `projects/` | Project-scoped routes (nested) |

## For AI Agents

### Working In This Directory
- Agent 3 owns all route files
- Every route uses `successResponse()` / `errorResponse()` helpers (duplicated per file — could be extracted)
- `export const dynamic = 'force-dynamic'` at top of each route
- JSON fields (treeData, colors, etc.): stringify on write, parse on read
- Input validation: check required fields exist and have correct types
- Transactions for multi-table operations (e.g., project creation)

### AI Route Special Note
- `ai/generate/route.ts` contains `buildSystemPrompt()` (Agent 4 territory) and `extractJSON()` + `validateAIResponse()`
- Agent 3 owns the HTTP layer, Agent 4 owns prompt engineering and parsing logic
- See Ownership Boundaries in `CLAUDE.md` for collaboration rules

### Testing Requirements
- Tests in `__tests__/` use mocked Prisma
- Run: `npx vitest src/app/api/__tests__/`

### Common Patterns
- `Response.json()` for all responses (Next.js native)
- `prisma.model.findUnique()` for single records, `findMany()` for lists
- Error codes: `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `OLLAMA_UNREACHABLE`, `AI_PARSE_ERROR`, `AI_VALIDATION_ERROR`
