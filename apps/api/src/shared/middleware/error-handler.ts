import type { Context } from 'hono'
import * as Sentry from '@sentry/node'
import { logger } from '../lib/logger'

export function errorHandler(err: Error, c: Context) {
  logger.error({ error: err.message, stack: err.stack }, 'unhandled error')

  if (Sentry.getClient()) {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', err.name)
      Sentry.captureException(err)
    })
  }

  return c.json(
    { ok: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
    500,
  )
}
