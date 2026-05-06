import { Hono } from 'hono'
import { ZodError } from 'zod'
import { createDb } from '@packages/db'
import type { DbClient } from '@packages/db'
import type { AuthContext, OrgContext } from '@packages/types'
import { corsMiddleware } from '../middleware/cors'
import { errorHandler } from '../middleware/error-handler'
import { routes } from '../../routes'

type AppVariables = {
  db: DbClient
  authContext: AuthContext
  orgContext: OrgContext
}

const RATE_LIMIT_MAX = 100
const RATE_LIMIT_WINDOW_MS = 60_000

function createRateLimiter() {
  const map = new Map<string, { count: number; resetAt: number }>()

  return function rateLimit(key: string): { allowed: boolean } {
    const now = Date.now()
    const entry = map.get(key)

    if (!entry || now > entry.resetAt) {
      map.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
      if (map.size > 10_000) {
        for (const [k, v] of map) {
          if (now > v.resetAt) map.delete(k)
        }
      }
      return { allowed: true }
    }

    if (entry.count >= RATE_LIMIT_MAX) {
      return { allowed: false }
    }

    entry.count++
    return { allowed: true }
  }
}

export function createApp() {
  const app = new Hono<{ Variables: AppVariables }>()
  const rateLimit = createRateLimiter()

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }
  const db = createDb(databaseUrl)

  app.use('*', corsMiddleware)

  app.use('*', async (c, next) => {
    c.set('db', db)
    await next()
  })

  app.use('*', async (c, next) => {
    if (c.req.path === '/health') {
      await next()
      return
    }

    const ip = c.req.header('x-forwarded-for') ?? 'unknown'
    const { allowed } = rateLimit(ip)

    if (!allowed) {
      return c.json({ ok: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } }, 429)
    }

    await next()
  })

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

  app.route('/', routes)

  return app
}
