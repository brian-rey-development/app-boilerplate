import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateMemberRole } from './update-member-role'
import type { OrgContext } from '@packages/types'

function createMockDb() {
  const limit = vi.fn()

  // where() returns an object that is both thenable (for queries without .limit())
  // and has a .limit() method (for queries that chain .limit())
  let whereData: any[] = []
  function makeWhereReturn() {
    return {
      limit,
      then: (onfulfilled: (v: any) => any) => Promise.resolve(whereData).then(onfulfilled),
    }
  }

  const where = vi.fn(() => makeWhereReturn())
  const from = vi.fn(() => ({ where }))
  const select = vi.fn(() => ({ from }))

  const updateReturning = vi.fn()
  const updateWhere = vi.fn(() => ({ returning: updateReturning }))
  const set = vi.fn(() => ({ where: updateWhere }))
  const update = vi.fn(() => ({ set }))

  const transaction = vi.fn()

  const db = { select, update, transaction } as any

  return { db, mocks: { limit, where, from, select, updateReturning, updateWhere, set, update, transaction, _whereData: whereData } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('updateMemberRole', () => {
  const orgId = 'org-1'

  const ownerCtx: OrgContext = { userId: 'user-1', organizationId: orgId, role: 'owner' }
  const adminCtx: OrgContext = { userId: 'user-2', organizationId: orgId, role: 'admin' }
  const memberCtx: OrgContext = { userId: 'user-3', organizationId: orgId, role: 'member' }

  const joinedAt = new Date()

  function setupTransaction(mocks: ReturnType<typeof createMockDb>['mocks']) {
    mocks.transaction.mockImplementation(async (cb: (tx: any) => Promise<any>) => {
      return cb({ select: mocks.select, update: mocks.update })
    })
  }

  it('owner promotes member to admin', async () => {
    const { db, mocks } = createMockDb()
    const targetMember = { orgId, userId: 'target-user', role: 'member', joinedAt }
    const updatedMember = { orgId, userId: 'target-user', role: 'admin', joinedAt }

    setupTransaction(mocks)
    mocks.limit.mockResolvedValueOnce([targetMember])
    mocks.updateReturning.mockResolvedValue([updatedMember])

    const result = await updateMemberRole(db, 'target-user', 'admin', ownerCtx)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.role).toBe('admin')
    }
    expect(mocks.update).toHaveBeenCalledTimes(1)
  })

  it('owner demotes admin to member', async () => {
    const { db, mocks } = createMockDb()
    const targetMember = { orgId, userId: 'target-admin', role: 'admin', joinedAt }
    const updatedMember = { orgId, userId: 'target-admin', role: 'member', joinedAt }

    setupTransaction(mocks)
    mocks.limit.mockResolvedValueOnce([targetMember])
    mocks.updateReturning.mockResolvedValue([updatedMember])

    const result = await updateMemberRole(db, 'target-admin', 'member', ownerCtx)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.role).toBe('member')
    }
  })

  it('admin gets FORBIDDEN', async () => {
    const { db } = createMockDb()

    const result = await updateMemberRole(db, 'target-user', 'admin', adminCtx)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
  })

  it('member gets FORBIDDEN', async () => {
    const { db } = createMockDb()

    const result = await updateMemberRole(db, 'target-user', 'admin', memberCtx)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
  })

  it('cannot change own role', async () => {
    const { db } = createMockDb()

    const result = await updateMemberRole(db, ownerCtx.userId, 'admin', ownerCtx)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
  })

  it('cannot demote last owner', async () => {
    const { db, mocks } = createMockDb()
    const targetMember = { orgId, userId: 'only-owner', role: 'owner', joinedAt }
    const singleOwner = [targetMember]

    setupTransaction(mocks)
    mocks.limit.mockResolvedValueOnce([targetMember])

    // Override where to make the owner count query (without .limit()) return the single owner
    mocks.where.mockImplementation(() => ({
      limit: mocks.limit,
      then: (onfulfilled: (v: any) => any) => Promise.resolve(singleOwner).then(onfulfilled),
    }))

    const result = await updateMemberRole(db, 'only-owner', 'member', ownerCtx)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
    expect(mocks.update).not.toHaveBeenCalled()
  })

  it('can demote owner when multiple owners exist', async () => {
    const { db, mocks } = createMockDb()
    const targetMember = { orgId, userId: 'owner-2', role: 'owner', joinedAt }
    const otherOwner = { orgId, userId: 'owner-1', role: 'owner', joinedAt }
    const updatedMember = { orgId, userId: 'owner-2', role: 'member', joinedAt }
    const twoOwners = [targetMember, otherOwner]

    setupTransaction(mocks)
    mocks.limit.mockResolvedValueOnce([targetMember])

    // Override where to make the owner count query return two owners
    mocks.where.mockImplementation(() => ({
      limit: mocks.limit,
      then: (onfulfilled: (v: any) => any) => Promise.resolve(twoOwners).then(onfulfilled),
    }))

    mocks.updateReturning.mockResolvedValue([updatedMember])

    const result = await updateMemberRole(db, 'owner-2', 'member', ownerCtx)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.role).toBe('member')
    }
    expect(mocks.update).toHaveBeenCalledTimes(1)
  })

  it('returns NOT_FOUND when target is not a member', async () => {
    const { db, mocks } = createMockDb()

    setupTransaction(mocks)
    mocks.limit.mockResolvedValueOnce([])

    const result = await updateMemberRole(db, 'nonexistent-user', 'admin', ownerCtx)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
    expect(mocks.update).not.toHaveBeenCalled()
  })
})
