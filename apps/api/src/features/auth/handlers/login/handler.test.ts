import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { loginHandler } from './handler'

describe('POST /auth/login', () => {
  it('returns 200', async () => {
    const app = new Hono().post('/auth/login', loginHandler)
    const res = await app.request('/auth/login', { method: 'POST' })
    expect(res.status).toBe(200)
  })
})
