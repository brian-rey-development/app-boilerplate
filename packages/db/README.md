# @packages/db

## Purpose

Drizzle ORM schemas, migrations, and Supabase PostgreSQL client.

## Exports

- `createDb()` -- factory to create a typed database client
- `DbClient` -- the client type
- `Transaction` -- transaction type
- Table schemas: `organizations`, `profiles`, `orgMembers`, `orgInvites`
- Drizzle relations

## Dependencies

- `@packages/types` -- shared entity types
- `drizzle-orm` -- ORM for type-safe SQL queries
- `postgres` -- PostgreSQL driver

## Commands

- `pnpm typecheck` -- TypeScript type checking
- `pnpm lint` -- TypeScript type checking (same as typecheck)
- `pnpm test` -- Run unit tests with Vitest
- `pnpm db:generate` -- Generate Drizzle migrations
- `pnpm db:migrate` -- Apply pending migrations
- `pnpm db:seed` -- Seed the database with sample data
