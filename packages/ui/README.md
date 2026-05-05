# @packages/ui

## Purpose

shadcn/ui design system -- Button, Input, Card, Modal, FormField with Tailwind CSS.

## Exports

- `cn()` -- Tailwind class merge utility
- `Button`
- `Input`
- `Card` -- `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `Modal`
- `FormField`

## Dependencies

- `react` -- UI component library
- `@radix-ui/react-slot` -- composable slot primitive
- `class-variance-authority` -- component variant management
- `clsx` -- conditional class names
- `tailwind-merge` -- Tailwind class conflict resolution

## Commands

- `pnpm typecheck` -- TypeScript type checking
- `pnpm lint` -- TypeScript type checking (same as typecheck)
- `pnpm test` -- Run unit tests with Vitest
