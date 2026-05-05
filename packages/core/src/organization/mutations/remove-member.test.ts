import { describe, it, expect, vi, beforeEach } from 'vitest'
import { removeMember } from './remove-member'
import type { OrgContext } from '@packages/types'

function createMockDb() {
  const limit = vi.fn()
  const where = vi.fn(() => ({
    limit,
    then: (onfulfilled: (v: any) => any) => Promise.resolve([]).then(onfulfilled),
  }))
  const from = vi.fn(() => ({ where }))
  const select = vi.fn(() => ({ from }))

  const deleteWhere = vi.fn()
  const del = vi.fn(() => ({ where: deleteWhere }))

  const db = { select, delete: del } as any

  return { db, mocks: { limit, where, from, select, deleteWhere, del } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('removeMember', () => {
  const orgId = 'org-1'

  const ownerCtx: OrgContext = { userId: 'user-1', organizationId: orgId, role: 'owner' }
  const adminCtx: OrgContext = { userId: 'user-2', organizationId: orgId, role: 'admin' }
  const memberCtx: OrgContext = { userId: 'user-3', organizationId: orgId, role: 'member' }

  it('owner removes member', async () => {
    const { db, mocks } = createMockDb()

    mocks.limit.mockResolvedValue([{ orgId, userId: 'target-user', role: 'member' }])

    const result = await removeMember(db, 'target-user', ownerCtx)

    expect(result.ok).toBe(true)
    expect(mocks.del).toHaveBeenCalledTimes(1)
  })

  it('admin removes member', async () => {
    const { db, mocks } = createMockDb()

    mocks.limit.mockResolvedValue([{ orgId, userId: 'target-user', role: 'member' }])

    const result = await removeMember(db, 'target-user', adminCtx)

    expect(result.ok).toBe(true)
    expect(mocks.del).toHaveBeenCalledTimes(1)
  })

  it('admin cannot remove another admin', async () => {
    const { db, mocks } = createMockDb()

    mocks.limit.mockResolvedValue([{ orgId, userId: 'target-admin', role: 'admin' }])

    const result = await removeMember(db, 'target-admin', adminCtx)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
    expect(mocks.del).not.toHaveBeenCalled()
  })

  it('admin cannot remove owner', async () => {
    const { db, mocks } = createMockDb()

    mocks.limit.mockResolvedValue([{ orgId, userId: 'target-owner', role: 'owner' }])

    const result = await removeMember(db, 'target-owner', adminCtx)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
    expect(mocks.del).not.toHaveBeenCalled()
  })

  it('cannot remove self', async () => {
    const { db } = createMockDb()

    const result = await removeMember(db, ownerCtx.userId, ownerCtx)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
  })

  it('cannot remove the last owner', async () => {
    const { db, mocks } = createMockDb()

    mocks.limit.mockResolvedValue([{ orgId, userId: 'only-owner', role: 'owner' }])

    // Override where for the owner count query (no .limit(), uses .then())
    mocks.where.mockImplementation(() => ({
      limit: mocks.limit,
      then: (onfulfilled: (v: any) => any) => Promise.resolve([{ orgId, userId: 'only-owner', role: 'owner' }]).then(onfulfilled),
    }))

    const result = await removeMember(db, 'only-owner', ownerCtx)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
    expect(mocks.del).not.toHaveBeenCalled()
  })

  it('member gets FORBIDDEN', async () => {
    const { db } = createMockDb()

    const result = await removeMember(db, 'target-user', memberCtx)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
  })

  it('returns NOT_FOUND when target user is not a member', async () => {
    const { db, mocks } = createMockDb()

    mocks.limit.mockResolvedValue([])

    const result = await removeMember(db, 'nonexistent-user', ownerCtx)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
    expect(mocks.del).not.toHaveBeenCalled()
  })
})
