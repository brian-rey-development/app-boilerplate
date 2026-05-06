import { initTelemetry } from './shared/lib/telemetry'
import * as Sentry from '@sentry/node'
import { createApp } from './shared/lib/create-app'
import { createOpenApiSpec } from './shared/lib/openapi'
import { apiReference } from '@scalar/hono-api-reference'
import { serve } from 'inngest/hono'
import { inngest } from './inngest/client'
import { sendInviteEmail, sendWelcomeEmail, cleanupExpiredInvites } from './inngest'
import type { Context } from 'hono'

initTelemetry()

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: 0.1,
  })
}

const app = createApp()

app.get('/openapi.json', (c: Context) => c.json(createOpenApiSpec()))
app.get('/docs', apiReference({ url: '/openapi.json' }))

const inngestHandler = serve({ client: inngest, functions: [sendInviteEmail, sendWelcomeEmail, cleanupExpiredInvites] })
app.all('/api/inngest', async (c: Context) => { return inngestHandler(c) })

export const server = {
  port: Number(process.env.PORT) || 3001,
  fetch: app.fetch,
}

export default server
