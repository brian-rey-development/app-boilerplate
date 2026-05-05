import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { AppError } from '@packages/types'

export function ok<T>(c: Context, data: T, status: ContentfulStatusCode = 200) {
  return c.json({ ok: true as const, data }, status)
}

export function error(c: Context, err: AppError) {
  const status = errorStatusCode(err.code)
  return c.json({ ok: false as const, error: err }, status)
}

function errorStatusCode(code: AppError['code']): ContentfulStatusCode {
  switch (code) {
    case 'VALIDATION_ERROR': return 400
    case 'NOT_FOUND': return 404
    case 'UNAUTHORIZED': return 401
    case 'FORBIDDEN': return 403
    case 'DUPLICATE_SLUG': return 409
    case 'INVITE_EXPIRED': return 410
    case 'INTERNAL_ERROR': return 500
    default: return 500
  }
}
