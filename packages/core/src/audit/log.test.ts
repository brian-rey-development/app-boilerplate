import { describe, it, expect, vi } from 'vitest'
import { logAuditEvent } from './log'
import type { DbClient } from '@packages/db'

function createMockDb() {
  const returning = vi.fn()
  const values = vi.fn(() => ({ returning }))
  const insert = vi.fn(() => ({ values }))

  const db = { insert } as unknown as DbClient

  return { db, mocks: { returning, values, insert } }
}

describe('logAuditEvent', () => {
  const input = {
    orgId: 'org-1',
    userId: 'user-1',
    action: 'organization.created',
    resource: 'organization',
    resourceId: 'org-1',
  }

  it('inserts an audit event and returns its id', async () => {
    const { db, mocks } = createMockDb()
    mocks.returning.mockResolvedValue([{ id: 'audit-1' }])

    const result = await logAuditEvent(db, input)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.id).toBe('audit-1')
    }
    expect(mocks.insert).toHaveBeenCalledTimes(1)
    expect(mocks.values).toHaveBeenCalledWith(input)
  })

  it('returns INTERNAL_ERROR when insert returns empty rows', async () => {
    const { db, mocks } = createMockDb()
    mocks.returning.mockResolvedValue([])

    const result = await logAuditEvent(db, input)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('INTERNAL_ERROR')
    }
  })

  it('includes metadata when provided', async () => {
    const { db, mocks } = createMockDb()
    mocks.returning.mockResolvedValue([{ id: 'audit-2' }])

    const result = await logAuditEvent(db, {
      ...input,
      metadata: { ip: '1.2.3.4', userAgent: 'test' },
    })

    expect(result.ok).toBe(true)
    expect(mocks.values).toHaveBeenCalledWith({
      ...input,
      metadata: { ip: '1.2.3.4', userAgent: 'test' },
    })
  })

  it('omits optional fields when not provided', async () => {
    const { db, mocks } = createMockDb()
    mocks.returning.mockResolvedValue([{ id: 'audit-3' }])

    const result = await logAuditEvent(db, { orgId: 'org-1', action: 'test', resource: 'test' })

    expect(result.ok).toBe(true)
    expect(mocks.values).toHaveBeenCalledWith({ orgId: 'org-1', action: 'test', resource: 'test' })
  })
})
