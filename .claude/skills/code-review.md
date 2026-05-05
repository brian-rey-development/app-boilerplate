---
name: code-review
description: Quick pre-commit code review checklist for the monorepo
---

# Code Review Checklist

Run this before committing any code.

## TypeScript

- [ ] No `any` types introduced
- [ ] No unused imports or variables (noUnusedLocals, noUnusedParameters)
- [ ] `pnpm typecheck` passes (all 7 packages)

## Structure

- [ ] Functions <= 20 lines
- [ ] Handler files <= 15 lines (delegate to core)
- [ ] Mutations in mutations/ folder, queries in queries/ folder, schemas in schemas/ folder
- [ ] No god files mixing concerns

## Business Logic

- [ ] Mutations return `Result<T, AppError>`
- [ ] Queries return data directly (T | null or T[])
- [ ] Functions take explicit AuthContext or OrgContext parameters
- [ ] No implicit context from closures or global state

## Data Access

- [ ] All queries go through Drizzle (no raw SQL in handlers or core)
- [ ] API handlers don't import @packages/db directly
- [ ] Web never imports @packages/db

## Frontend

- [ ] No useEffect for data fetching (use TanStack Query)
- [ ] No server state in Zustand
- [ ] All four UI states handled: loading, empty, error, populated
- [ ] Granular Zustand selectors (no destructuring entire store)

## Testing

- [ ] Core functions have tests at 100% coverage
- [ ] New API handlers have colocated test files
- [ ] Tests describe behavior, not implementation

## Before Commit

```bash
pnpm check   # typecheck + lint + test
```
