# App Boilerplate

Production-ready SaaS starter with everything you rebuild every time: auth, multi-tenancy, API, AI infrastructure, and design system.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TanStack Query v5, Zustand v5, shadcn/ui, Tailwind |
| API | Hono, jose (JWT), Zod validation |
| Auth | Supabase Auth (email/password, magic link, Google, GitHub) |
| Database | PostgreSQL, Drizzle ORM, Supabase RLS |
| AI | Vercel AI SDK, Langfuse tracing |
| Monorepo | Turborepo, pnpm workspaces |
| Language | TypeScript strict mode |

## Architecture

```
apps/
├── web/          React SPA -- never touches DB directly
└── api/          Hono API -- JWT validation, org middleware, delegates to core

packages/
├── types/        Pure TypeScript entities, zero dependencies
├── db/           Drizzle schemas, migrations, Supabase client
├── core/         Business logic, 100% test coverage
├── ai/           AI SDK pipelines, Langfuse, tool registry
└── ui/           shadcn/ui design system

strictly:  types <- db <- core <- {api, ai, web/ui}
```

## Getting Started

```bash
pnpm install
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_ANON_KEY, DATABASE_URL, etc.
pnpm db:generate
pnpm db:migrate
pnpm dev
```

## Multi-Tenancy

Organization-based from day one. Every tenant table has `org_id` FK. Three enforcement layers: Hono middleware (membership check), Core functions (explicit `AuthContext`/`OrgContext`), PostgreSQL RLS.

## Project Structure

Every domain follows the same pattern:
```
core/src/organization/
├── mutations/    create-organization.ts + .test.ts
├── queries/      get-organization.ts + .test.ts
├── schemas/      Zod validation schemas
└── index.ts

api/src/features/organization/
├── handlers/     create-organization/handler.ts + .test.ts
├── routes.ts
└── middleware.ts

web/src/features/organization/
├── pages/        dashboard.tsx, settings.tsx, members.tsx
├── components/   member-list.tsx
├── hooks/        use-organization.ts, use-members.ts
└── stores/       organization-store.ts
```

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Run all workspaces |
| `pnpm check` | Typecheck + lint + test |
| `pnpm typecheck` | TypeScript check |
| `pnpm --filter @packages/core test` | Single package |
| `pnpm db:generate` | Generate migrations |
| `pnpm db:migrate` | Apply migrations |

## AI Agents

Five specialized Claude Code agents live in `.claude/agents/`:
- `senior-backend-engineer` -- API, core, DB
- `senior-frontend-engineer` -- React, TanStack Query, Zustand
- `senior-qa` -- Systematic testing, edge cases
- `senior-reviewer` -- 4-layer code review (correctness, security, maintainability, performance)
- `senior-cto` -- Architecture decisions, ADRs

Three skills in `.claude/skills/`: `add-feature`, `add-migration`, `code-review`.

## Decisions

See `docs/adr/` for architecture decision records:
- [001](docs/adr/001-monorepo-structure.md) Monorepo structure
- [002](docs/adr/002-multi-tenancy.md) Multi-tenancy model
- [003](docs/adr/003-auth-flow.md) Auth flow
- [004](docs/adr/004-naming-conventions.md) Naming conventions
- [005](docs/adr/005-schema-vs-types.md) Types vs schemas

## License

MIT
