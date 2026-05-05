# @apps/web

## Purpose

React SPA with Vite. Supabase Auth, TanStack Query, Zustand, React Router.

## Exports

- `App` component (root component)
- `main.tsx` entry point

## Dependencies

- `@packages/types` -- shared entity types
- `@packages/ui` -- design system components
- `react` / `react-dom` -- UI library
- `react-router-dom` -- client-side routing
- `@tanstack/react-query` -- server state management
- `zustand` -- client-side state management
- `@supabase/supabase-js` -- Supabase Auth client

## Commands

- `pnpm dev` -- Start Vite dev server
- `pnpm build` -- Production build
- `pnpm typecheck` -- TypeScript type checking
- `pnpm lint` -- TypeScript type checking (same as typecheck)
- `pnpm test` -- Run tests with Vitest
