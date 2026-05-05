# ADR 001: Monorepo Structure

## Status
Accepted -- 2026-05-05

## Context
We needed a scalable structure for a SaaS starter that prevents rebuilding auth, multi-tenancy, and API wiring for every project.

## Decision
Use Turborepo + pnpm workspaces. `packages/` for shared code, `apps/` for deployables. Dependency graph: `types <- db <- core <- {api, ai, web}`. `@packages/ui` is a peer leaf consumed only by `apps/web`.

## Consequences
Clear boundaries enforced by dependency direction. Each package is independently testable and publishable. Requires discipline to prevent circular deps -- the graph must stay acyclic. Adding a new package is mechanical (scaffold, wire into turbo.json, no reverse-imports).
