import { Hono } from 'hono'

export const healthRoutes = new Hono()
  .get('/', (c) => c.json({ ok: true, data: { status: 'healthy' } }))
