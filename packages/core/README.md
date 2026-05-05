# @packages/core

## Purpose

Pure business logic. Zero framework dependencies. 100% test coverage required.

## Exports

- Organization mutations: `createOrganization`, `updateOrganization`, `deleteOrganization`, `inviteMember`, `removeMember`, `updateMemberRole`
- Organization queries: `getOrganization`, `listOrganizations`, `listMembers`
- Auth mutations: `register`
- Zod schemas and input types

## Dependencies

- `@packages/types` -- shared entity types
- `@packages/db` -- database schemas and client
- `drizzle-orm` -- ORM for type-safe SQL
- `zod` -- input validation schemas

## Commands

- `pnpm typecheck` -- TypeScript type checking
- `pnpm lint` -- TypeScript type checking (same as typecheck)
- `pnpm test` -- Run tests with Vitest (includes coverage, threshold 98%)
