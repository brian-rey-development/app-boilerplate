---
name: add-feature
description: Walkthrough for adding a new domain end-to-end (types -> db -> core -> api -> web -> tests)
---

# Add Feature

Follow these steps in order when adding a new domain (e.g., "billing", "projects").

## Step 1: Types

Create entity types in `packages/types/src/<domain>/`:

- Define the entity interfaces (e.g., `Project`, `ProjectMember`)
- Add to `packages/types/src/<domain>/index.ts`
- Add to `packages/types/src/index.ts`

Types only — no Zod, no runtime logic.

## Step 2: Database Schema

Create Drizzle schema in `packages/db/src/schema/<domain>.ts`:

- Define the pgTable
- Add foreign keys referencing existing tables
- Add to `packages/db/src/schema/index.ts` (table export + relations)

## Step 3: Migration

```bash
pnpm db:generate   # generates SQL in packages/db/migrations/
```

Verify the migration SQL is correct (up + down), then:

```bash
pnpm db:migrate    # apply to local DB
pnpm db:seed       # verify with seed data
```

## Step 4: Core Logic

Create business logic in `packages/core/src/<domain>/`:

```
<domain>/
├── mutations/   # create-X.ts, update-X.ts, delete-X.ts + .test.ts
├── queries/     # get-X.ts, list-X.ts + .test.ts
├── schemas/     # validation schemas
└── index.ts
```

Rules:
- Mutations return `Result<T, AppError>`
- Queries return `T | null` or `T[]`
- Every function takes explicit `AuthContext` or `OrgContext`
- 100% test coverage

## Step 5: API Routes

Add handlers and routes in `apps/api/src/features/<domain>/`:

```
<domain>/
├── handlers/
│   └── create-X/
│       ├── handler.ts
│       └── handler.test.ts
├── routes.ts
```

Then wire in `apps/api/src/routes.ts`.

## Step 6: Web Pages

Add pages, hooks, stores in `apps/web/src/features/<domain>/`:

```
<domain>/
├── pages/        # route-level components
├── components/   # shared UI for this feature
├── hooks/        # TanStack Query hooks
└── stores/       # Zustand stores (only if needed)
```

## Step 7: Verify

```bash
pnpm check        # typecheck + lint + test
```
