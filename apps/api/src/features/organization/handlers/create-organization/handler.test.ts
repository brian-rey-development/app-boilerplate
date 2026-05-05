import { describe, it, expect, vi } from 'vitest'
import { Hono } from 'hono'
import { createOrganizationHandler } from './handler'

vi.mock('@packages/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@packages/core')>()
  return {
    ...actual,
    createOrganization: vi.fn(),
  }
})

type TestEnv = { Variables: Record<string, unknown> }

function testApp() {
  const app = new Hono<TestEnv>()
  app.use('*', async (c, next) => {
    c.set('db', {})
    c.set('authContext', { userId: 'user-1' })
    await next()
  })
  app.post('/', createOrganizationHandler)
  return app
}

describe('POST /organization', () => {
  it('returns 400 when name is empty', async () => {
    const app = testApp()
    const res = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    })
    expect(res.status).toBe(400)
  })

  it('returns 201 when organization is created', async () => {
    const { createOrganization } = await import('@packages/core')

    const mockOrg = { id: 'org-1', slug: 'acme', name: 'Acme Inc', createdAt: new Date(), updatedAt: new Date() }
    vi.mocked(createOrganization).mockResolvedValueOnce({ ok: true as const, data: mockOrg })

    const app = testApp()
    const res = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Acme Inc', slug: 'acme' }),
    })

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.data.slug).toBe('acme')
  })

  it('returns 409 when slug is taken', async () => {
    const { createOrganization } = await import('@packages/core')

    vi.mocked(createOrganization).mockResolvedValueOnce({
      ok: false as const,
      error: { code: 'DUPLICATE_SLUG', message: 'Organization with slug "acme" already exists' },
    })

    const app = testApp()
    const res = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Acme Inc', slug: 'acme' }),
    })

    expect(res.status).toBe(409)
  })
})
