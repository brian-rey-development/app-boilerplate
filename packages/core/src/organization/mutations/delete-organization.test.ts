import { describe, it, expect, vi, beforeEach } from 'vitest'
import { deleteOrganization } from './delete-organization'
import type { OrgContext } from '@packages/types'

function createMockDb() {
  const limit = vi.fn()
  const where = vi.fn(() => ({
    limit,
    then: (onfulfilled: (v: any) => any) => Promise.resolve([{ count: 1 }]).then(onfulfilled),
  }))
  const from = vi.fn(() => ({ where }))
  const select = vi.fn(() => ({ from }))

  const deleteWhere = vi.fn()
  const del = vi.fn(() => ({ where: deleteWhere }))
  const transaction = vi.fn()

  const db = { select, delete: del, transaction } as any

  return { db, mocks: { limit, where, from, select, deleteWhere, del, transaction } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('deleteOrganization', () => {
  const orgId = 'org-1'

  const ownerCtx: OrgContext = { userId: 'user-1', organizationId: orgId, role: 'owner' }
  const adminCtx: OrgContext = { userId: 'user-2', organizationId: orgId, role: 'admin' }
  const memberCtx: OrgContext = { userId: 'user-3', organizationId: orgId, role: 'member' }

  function setupTransaction(mocks: ReturnType<typeof createMockDb>['mocks']) {
    mocks.transaction.mockImplementation(async (cb: (tx: any) => Promise<any>) => {
      return cb({ select: mocks.select, delete: mocks.del })
    })
  }

  it('owner can delete', async () => {
    const { db, mocks } = createMockDb()

    setupTransaction(mocks)
    mocks.limit.mockResolvedValue([{ id: orgId, slug: 'test-org', name: 'Test Org' }])

    const result = await deleteOrganization(db, ownerCtx)

    expect(result.ok).toBe(true)
    expect(mocks.del).toHaveBeenCalledTimes(1)
  })

  it('admin gets FORBIDDEN', async () => {
    const { db } = createMockDb()

    const result = await deleteOrganization(db, adminCtx)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
  })

  it('member gets FORBIDDEN', async () => {
    const { db } = createMockDb()

    const result = await deleteOrganization(db, memberCtx)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
  })

  it('returns NOT_FOUND when org does not exist', async () => {
    const { db, mocks } = createMockDb()

    setupTransaction(mocks)
    mocks.limit.mockResolvedValue([])

    const result = await deleteOrganization(db, ownerCtx)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
    expect(mocks.del).not.toHaveBeenCalled()
  })
})
