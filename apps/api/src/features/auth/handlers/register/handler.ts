import type { Context } from 'hono'
import { register, registerSchema } from '@packages/core'
import { ok, error } from '../../../../shared/lib/response'

export async function registerHandler(c: Context) {
  const parseResult = registerSchema.safeParse(await c.req.json())
  if (!parseResult.success) {
    return c.json({
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: parseResult.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
      },
    }, 400)
  }

  const body = parseResult.data

  const authCtx = c.get('authContext')
  if (!authCtx) {
    return c.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Auth required' } }, 401)
  }

  const db = c.get('db')
  const result = await register(db, body, authCtx.userId)

  if (!result.ok) return error(c, result.error)
  return ok(c, result.data, 201)
}
