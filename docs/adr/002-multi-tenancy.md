# ADR 002: Multi-Tenancy

## Status
Accepted -- 2026-05-05

## Context
SaaS apps need tenant isolation from day one. Refactoring it in later is expensive and error-prone.

## Decision
Organization-based tenancy. Every tenant-scoped table has an `org_id` foreign key. Three enforcement layers provide defense-in-depth:

1. Hono middleware verifies JWT and checks org membership
2. Core functions receive explicit `AuthContext` / `OrgContext` with org ID
3. PostgreSQL Row-Level Security (RLS) enforces at the database level

## Consequences
Strong isolation even if app-layer checks have bugs. Adds a column to every tenant-scoped table. RLS policies must be maintained alongside schema migrations. Every query developer-facing and internal must carry the org context explicitly.
