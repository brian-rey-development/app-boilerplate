import { describe, it, expect, vi } from 'vitest'
import { Hono } from 'hono'
import { registerHandler } from './handler'

vi.mock('@packages/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@packages/core')>()
  return {
    ...actual,
    register: vi.fn(),
  }
})

type TestEnv = { Variables: Record<string, unknown> }

function createTestApp(dbMock: unknown) {
  const app = new Hono<TestEnv>()
  app.use('*', async (c, next) => {
    c.set('db', dbMock)
    c.set('authContext', { userId: 'user-1' })
    await next()
  })
  app.post('/auth/register', registerHandler)
  return app
}

describe('POST /auth/register', () => {
  it('returns 400 on invalid input', async () => {
    const db = {} as any
    const app = createTestApp(db)

    const res = await app.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' }),
    })

    expect(res.status).toBe(400)
  })

  it('returns 201 when registration succeeds', async () => {
    const { register } = await import('@packages/core')

    const mockUser = { id: 'user-1', email: 'test@example.com', fullName: 'Test User', avatarUrl: null, createdAt: new Date(), updatedAt: new Date() }
    vi.mocked(register).mockResolvedValueOnce({ ok: true as const, data: mockUser })

    const db = {} as any
    const app = createTestApp(db)

    const res = await app.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', fullName: 'Test User' }),
    })

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.data.email).toBe('test@example.com')
  })
})
