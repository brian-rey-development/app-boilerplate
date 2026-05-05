import { Hono } from 'hono'
import { ZodError } from 'zod'
import { createDb } from '@packages/db'
import { corsMiddleware } from '../middleware/cors'
import { errorHandler } from '../middleware/error-handler'
import { routes } from '../../routes'

export function createApp() {
  const app = new Hono()

  // Initialize DB client
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }
  const db = createDb(databaseUrl)

  // Inject DB client into context
  app.use('*', async (c: any, next) => {
    c.set('db', db)
    await next()
  })

  // In-memory rate limiting (token bucket)
  const rateLimitMap = new Map<string, { tokens: number; lastRefill: number }>()
  const RATE_LIMIT_MAX = 100
  const RATE_LIMIT_WINDOW_MS = 60_000

  app.use('*', async (c, next) => {
    const ip = c.req.header('x-forwarded-for') ?? 'unknown'
    const now = Date.now()
    let entry = rateLimitMap.get(ip)

    if (!entry || now - entry.lastRefill > RATE_LIMIT_WINDOW_MS) {
      entry = { tokens: RATE_LIMIT_MAX - 1, lastRefill: now }
      rateLimitMap.set(ip, entry)
    } else if (entry.tokens <= 0) {
      return c.json({ ok: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } }, 429)
    } else {
      entry.tokens--
    }

    await next()
  })

  // Global error handler — catches ZodError for 400 before falling through
  app.onError((err, c) => {
    if (err instanceof ZodError) {
      return c.json({
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
        },
      }, 400)
    }
    return errorHandler(err, c)
  })

  app.use('*', corsMiddleware)
  app.route('/', routes)

  return app as any
}
