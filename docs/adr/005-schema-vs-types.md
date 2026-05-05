# ADR 005: Schema vs Types

## Status
Accepted -- 2026-05-05

## Context
We needed clear separation between TypeScript type definitions (compile-time only) and Zod schemas (runtime validation) to avoid circular dependencies and enforce a single source of truth.

## Decision
- `@packages/types` holds pure entity interfaces -- zero runtime dependencies, zero imports from other packages
- `@packages/core` holds Zod schemas, colocated with the functions they validate (a `schemas/` folder per domain)
- Application-layer input validation imports schemas from `@packages/core`
- No Zod schemas in `@packages/types`

## Consequences
`@packages/types` stays dependency-free and publishable. Schemas live next to the business logic they protect, making them the single source of truth. Both API handlers and web forms import the same schemas from core, guaranteeing consistent validation across layers.
