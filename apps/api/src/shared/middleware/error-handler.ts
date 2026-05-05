import type { Context } from 'hono'

export function errorHandler(err: Error, c: Context) {
  console.error('[api error]', err.stack ?? err.message)
  return c.json(
    { ok: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
    500,
  )
}
