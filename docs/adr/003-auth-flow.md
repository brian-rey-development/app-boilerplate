# ADR 003: Auth Flow

## Status
Accepted -- 2026-05-05

## Context
We need JWT-based auth for a SPA + API architecture without managing database sessions on the API side.

## Decision
Supabase Auth runs on the React client. The client sends the Supabase JWT as a Bearer token to Hono. API middleware verifies the JWT using `jose` (JWKS endpoint from Supabase, cached). Org middleware extracts org membership from a `organization_members` table. Roles are `owner`, `admin`, `member`.

## Consequences
Stateless auth -- no session store on the API. JWT verification requires a network call to the JWKS endpoint but is cached server-side. Roles are enforced at middleware, core, and DB (RLS) levels. Token rotation and refresh are handled entirely by Supabase client SDK.
