# @apps/api

## Purpose

Hono API server. Validates JWT, enforces org membership, delegates business logic to @packages/core.

## Exports

- `createApp()` -- Hono app factory
- Route tree (`routes.ts`)

## Dependencies

- `@packages/types` -- shared entity types
- `@packages/core` -- business logic
- `@packages/db` -- database client and schemas
- `hono` -- web framework
- `jose` -- JWT verification
- `zod` -- input validation
- `drizzle-orm` -- database queries

## Commands

- `pnpm dev` -- Start dev server with hot reload (tsx watch)
- `pnpm build` -- Compile TypeScript
- `pnpm typecheck` -- TypeScript type checking
- `pnpm lint` -- TypeScript type checking (same as typecheck)
- `pnpm test` -- Run tests with Vitest
