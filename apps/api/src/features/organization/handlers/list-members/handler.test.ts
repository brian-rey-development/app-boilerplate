import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { listMembersHandler } from './handler'

type TestEnv = { Variables: Record<string, unknown> }

describe('GET /organization/:slug/members', () => {
  it('returns 500 without org context', async () => {
    const app = new Hono<TestEnv>()
    app.use('*', async (c, next) => {
      c.set('db', {})
      await next()
    })
    app.get('/:slug/members', listMembersHandler)

    const res = await app.request('/test-org/members')
    expect(res.status).toBe(500)
  })
})
