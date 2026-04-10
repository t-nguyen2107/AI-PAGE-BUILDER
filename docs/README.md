# Loomweave Documentation

> Project documentation for team onboarding and reference.

## Guides

| Document | Description | Audience |
|----------|-------------|----------|
| [Code Guidelines](CODE-GUIDELINES.md) | Coding standards, naming conventions, setup guide, testing | All developers |
| [Codebase Guide](CODEBASE.md) | Project structure, directory map, data flows, navigation | New team members |
| [AI Pipeline](AI_Pipeline.md) | AI generation pipeline architecture, prompts, streaming, defaults | AI/Backend team |
| [MVP Features](MVP-FEATURES.md) | Minimum viable product feature list | Product team |

## Quick Start

```bash
# Setup
npm install
cp .env.sample .env.local
npm run db:generate

# Development
npm run dev

# Database
DATABASE_URL="$DATABASE_DIRECT_URL" npm run db:push
```

## Key Directories

- `src/puck/` — Visual editor + 26 Puck components
- `src/lib/ai/` — AI pipeline (prompts, streaming, knowledge)
- `src/app/api/` — REST API routes
- `src/features/` — Feature modules (templates, SEO, stock images)
- `src/types/` + `src/schemas/` — TypeScript types + Zod validation

## Contributing

See [Code Guidelines](CODE-GUIDELINES.md) for commit conventions, PR process, and coding standards.
