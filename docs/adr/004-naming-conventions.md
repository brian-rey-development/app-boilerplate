# ADR 004: Naming Conventions

## Status
Accepted -- 2026-05-05

## Context
We needed a consistent naming convention across the monorepo that works for both human and LLM readability, especially for code-generation tools.

## Decision
- **Folders for role**: `mutations/`, `queries/`, `schemas/`, `handlers/`, `pages/`, `components/`, `hooks/`, `stores/`
- **Files for intent**: `create-organization.ts`, `switch-organization.ts`
- **Barrel exports**: `index.ts` per domain re-exports public API
- **Colocated tests**: `handler.test.ts` next to `handler.ts`
- **No file suffixes**: no `.mutation.ts`, `.query.ts`, `.schema.ts` -- the folder is the classifier

## Consequences
Self-documenting tree structure. grep-friendly. New domains follow the pattern mechanically. The folder-as-role convention means no developer needs to invent a naming convention for a new domain.
