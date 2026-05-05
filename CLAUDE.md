# SaaS Boilerplate

Monorepo for a multi-tenant SaaS starter with Supabase Auth, Hono API, React SPA, and shared packages.

## Architecture

**Package dependency graph (strict, no reverse imports):**

```
@packages/types
  <- @packages/db       (types + Drizzle schema)
    <- @packages/core     (types + db + Zod -- business logic)
      <- apps/api          (Hono -- thin handlers, delegates to core)
      <- @packages/ai      (AI features, imports from core)
        <- apps/web         (React SPA via Vite -- never touches DB)
        <- @packages/ui      (Design system -- Button, Input, Card, Modal)
```

- Supabase Auth on the client; JWT sent as Bearer to Hono
- Hono middleware validates JWT (jose + Supabase JWKS), enforces org membership, delegates to core
- PostgreSQL via Drizzle ORM, Organization-based multi-tenancy (org_id FK on every table)
- Three enforcement layers: Hono middleware, Core AuthContext/OrgContext, PostgreSQL RLS

### Route conventions
- `signin`, `signup`, `password-reset` -- directly with Supabase client (no API involvement)
- All other routes: SPA page -> TanStack Query (GET) or mutation hook (POST/PUT/DELETE) -> Hono API -> Core function

## Conventions

- **File naming**: folders for role (`mutations/`, `queries/`, `schemas/`, `handlers/`, `pages/`, `components/`, `hooks/`, `stores/`), files for intent (`create-organization.ts`)
- **Domain-driven**: `features/` dirs in both `apps/web` and `apps/api`, mirroring `packages/core/src/<domain>/`
- **Named exports only** -- no default exports
- **Functions <= 20 lines**, files <= 200 lines, early returns
- **No `any`**, no cross-app sibling imports
- **Mutations** return `Result<T, AppError>`, queries return `T | null` or `T[]`
- **API handlers <= 15 lines**: validate input (Zod safeParse), call core, return standardized response
- **Colocated tests**: `handler.test.ts` next to `handler.ts`
- **Path aliases**: `@packages/types`, `@packages/db`, `@packages/core`, `@packages/ai`, `@packages/ui`

## State Management (Web)

1. `useState` / `useReducer` -- start here
2. Lift state to parent if siblings need it
3. Context for config-like state (theme, locale)
4. URL/search params for bookmarkable state
5. Zustand -- last resort, only when state crosses 3+ unrelated components AND persists across nav

TanStack Query defaults: `staleTime: 60_000`, `gcTime: 300_000`, `retry: 2`, `refetchOnWindowFocus: false`

## When to Add an ADR

1. Introducing a new package or app
2. Changing the data flow between packages
3. Picking between two valid approaches
4. Deprecating or replacing an existing pattern
5. Anything you'd need to explain to a new senior engineer

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Run all workspaces in dev mode |
| `pnpm build` | Build all workspaces |
| `pnpm check` | Full check (lint + typecheck + test) |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm test` | Run all tests |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:seed` | Seed database |
| `pnpm --filter @packages/core test` | Single package test |

## Anti-Patterns

**Backend (block on review):**
- Business logic in handlers (handlers > 15 lines need refactoring)
- Implicit context (every function takes AuthContext or OrgContext explicitly)
- Swallowed errors (no `catch {}` or `catch + console.log`)
- God files (mutations, queries, schemas in separate folders)
- Raw SQL in handlers or core (all queries through Drizzle)
- Magic strings (roles, error codes, status values are typed constants)
- try/catch in every handler (shared error middleware handles unhandled errors)
- catch + throw (never catch just to re-wrap and throw)
- Premature abstraction (a function used once doesn't need to be "reusable")
- Optional parameters with default logic (caller passes it explicitly)

**Frontend (block on review):**
- useEffect for data fetching (TanStack Query owns all server state)
- Server state in Zustand (causes stale-data bugs)
- Monster components > 200 lines
- Prop drilling past 2 levels (use composition, Context, or Zustand)
- Direct Zustand mutation (always use `set()`)
- Missing UI states (loading, empty, error, populated required)
- Destructuring entire store (use granular selectors)
- Inline styles or style objects (Tailwind classes only)

## .claude/

**Agents:** `senior-backend-engineer`, `senior-frontend-engineer`, `senior-qa`, `senior-reviewer`, `senior-cto`

**Skills:** `add-feature`, `add-migration`, `code-review`
