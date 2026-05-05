import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateOrganization } from './update-organization'
import { updateOrganizationSchema } from '../schemas'
import type { OrgContext, Organization } from '@packages/types'

function createMockDb() {
  const limit = vi.fn()
  const where = vi.fn(() => ({ limit }))
  const from = vi.fn(() => ({ where }))
  const select = vi.fn(() => ({ from }))

  const updateReturning = vi.fn()
  const updateWhere = vi.fn(() => ({ returning: updateReturning }))
  const set = vi.fn(() => ({ where: updateWhere }))
  const update = vi.fn(() => ({ set }))

  const transaction = vi.fn()

  const db = { select, update, transaction } as any

  return { db, mocks: { limit, where, from, select, updateReturning, updateWhere, set, update, transaction } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('updateOrganization', () => {
  const orgId = 'org-1'
  const existingOrg: Organization = { id: orgId, slug: 'test-org', name: 'Test Org', createdAt: new Date(), updatedAt: new Date() }

  const ownerCtx: OrgContext = { userId: 'user-1', organizationId: orgId, role: 'owner' }
  const adminCtx: OrgContext = { userId: 'user-2', organizationId: orgId, role: 'admin' }
  const memberCtx: OrgContext = { userId: 'user-3', organizationId: orgId, role: 'member' }

  function setupTransaction(mocks: ReturnType<typeof createMockDb>['mocks']) {
    mocks.transaction.mockImplementation(async (cb: (tx: any) => Promise<any>) => {
      return cb({ select: mocks.select, update: mocks.update })
    })
  }

  it('owner can update name', async () => {
    const { db, mocks } = createMockDb()
    const updated = { ...existingOrg, name: 'Updated Name' }

    setupTransaction(mocks)
    mocks.limit.mockResolvedValueOnce([existingOrg])
    mocks.updateReturning.mockResolvedValue([updated])

    const result = await updateOrganization(db, { name: 'Updated Name' }, ownerCtx)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.name).toBe('Updated Name')
    }
    expect(mocks.update).toHaveBeenCalledTimes(1)
  })

  it('admin can update name', async () => {
    const { db, mocks } = createMockDb()
    const updated = { ...existingOrg, name: 'Updated Name' }

    setupTransaction(mocks)
    mocks.limit.mockResolvedValueOnce([existingOrg])
    mocks.updateReturning.mockResolvedValue([updated])

    const result = await updateOrganization(db, { name: 'Updated Name' }, adminCtx)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.name).toBe('Updated Name')
    }
  })

  it('member gets FORBIDDEN', async () => {
    const { db } = createMockDb()

    const result = await updateOrganization(db, { name: 'Updated Name' }, memberCtx)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
  })

  it('returns DUPLICATE_SLUG if slug taken', async () => {
    const { db, mocks } = createMockDb()

    setupTransaction(mocks)
    mocks.limit
      .mockResolvedValueOnce([existingOrg])
      .mockResolvedValueOnce([{ id: 'org-2', slug: 'taken-slug' }])

    const result = await updateOrganization(db, { slug: 'taken-slug' }, ownerCtx)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('DUPLICATE_SLUG')
    }
    expect(mocks.update).not.toHaveBeenCalled()
  })

  it('returns updated org on success', async () => {
    const { db, mocks } = createMockDb()
    const updated = { ...existingOrg, name: 'New Name', slug: 'new-slug' }

    setupTransaction(mocks)
    mocks.limit
      .mockResolvedValueOnce([existingOrg])
      .mockResolvedValueOnce([])
    mocks.updateReturning.mockResolvedValue([updated])

    const result = await updateOrganization(db, { name: 'New Name', slug: 'new-slug' }, ownerCtx)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.slug).toBe('new-slug')
      expect(result.data.name).toBe('New Name')
    }
    expect(mocks.update).toHaveBeenCalledTimes(1)
  })

  it('rejects empty input via schema refine', () => {
    const result = updateOrganizationSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('returns NOT_FOUND if organization does not exist', async () => {
    const { db, mocks } = createMockDb()

    setupTransaction(mocks)
    mocks.limit.mockResolvedValueOnce([])

    const result = await updateOrganization(db, { name: 'New Name' }, ownerCtx)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
  })
})
