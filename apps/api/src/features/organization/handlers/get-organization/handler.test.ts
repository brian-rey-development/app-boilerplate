import { describe, it, expect, vi } from 'vitest'
import { Hono } from 'hono'
import { getOrganizationHandler } from './handler'

vi.mock('@packages/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@packages/core')>()
  return {
    ...actual,
    getOrganization: vi.fn(),
  }
})

type TestEnv = { Variables: Record<string, unknown> }

describe('GET /organization/:slug', () => {
  it('returns 404 when org not found', async () => {
    const app = new Hono<TestEnv>()
    app.use('*', async (c, next) => {
      c.set('db', {})
      await next()
    })
    app.get('/:slug', getOrganizationHandler)

    const res = await app.request('/nonexistent')
    expect(res.status).toBe(404)
  })

  it('returns 200 with org data when found', async () => {
    const { getOrganization } = await import('@packages/core')

    const mockOrg = { id: 'org-1', slug: 'acme', name: 'Acme Inc', createdAt: new Date(), updatedAt: new Date() }
    vi.mocked(getOrganization).mockResolvedValueOnce(mockOrg)

    const app = new Hono<TestEnv>()
    app.use('*', async (c, next) => {
      c.set('db', {})
      await next()
    })
    app.get('/:slug', getOrganizationHandler)

    const res = await app.request('/acme')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.data.slug).toBe('acme')
  })
})
