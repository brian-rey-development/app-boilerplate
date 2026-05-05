import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createOrganization } from './create-organization'
import { createOrganizationSchema } from '../schemas'
import type { DbClient } from '@packages/db'

function createMockDb() {
  const limit = vi.fn()
  const where = vi.fn(() => ({ limit }))
  const from = vi.fn(() => ({ where }))
  const select = vi.fn(() => ({ from }))

  const returning = vi.fn()
  const values = vi.fn(() => ({ returning }))
  const insert = vi.fn(() => ({ values }))

  const transaction = vi.fn()

  const db = { insert, select, transaction } as unknown as DbClient

  return { db, mocks: { limit, where, from, select, returning, values, insert, transaction } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createOrganization', () => {
  const validInput = { slug: 'test-org', name: 'Test Organization' }
  const ctx = { userId: 'user-1' }
  const orgData = { id: 'org-1', slug: 'test-org', name: 'Test Organization', createdAt: new Date(), updatedAt: new Date() }

  it('creates org and adds creator as owner', async () => {
    const { db, mocks } = createMockDb()

    const txReturning = vi.fn().mockResolvedValue([orgData])
    const txValues = vi.fn().mockReturnValue({ returning: txReturning })
    const txInsert = vi.fn().mockReturnValue({ values: txValues })

    mocks.transaction.mockImplementation(async (cb: (tx: any) => Promise<any>) => {
      return cb({ insert: txInsert })
    })

    const result = await createOrganization(db, validInput, ctx)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual(orgData)
    }

    expect(mocks.transaction).toHaveBeenCalledTimes(1)
    expect(txInsert).toHaveBeenCalledTimes(2)
    expect(txValues).toHaveBeenNthCalledWith(1, { slug: validInput.slug, name: validInput.name })
    expect(txValues).toHaveBeenNthCalledWith(2, { orgId: orgData.id, userId: ctx.userId, role: 'owner' })
  })

  it('fails with DUPLICATE_SLUG when slug exists', async () => {
    const { db, mocks } = createMockDb()

    mocks.transaction.mockRejectedValue({ code: '23505' })

    const result = await createOrganization(db, validInput, ctx)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('DUPLICATE_SLUG')
    }

    expect(mocks.transaction).toHaveBeenCalledTimes(1)
  })

  it('fails with VALIDATION_ERROR when name empty (handled by schema)', () => {
    const result = createOrganizationSchema.safeParse({ slug: 'test-org', name: '' })
    expect(result.success).toBe(false)
  })

  it('rolls back if owner membership insert fails', async () => {
    const { db, mocks } = createMockDb()

    const txValues = vi.fn()
    txValues.mockReturnValueOnce({ returning: vi.fn().mockResolvedValue([orgData]) })
    txValues.mockImplementationOnce(() => { throw new Error('DB error') })
    const txInsert = vi.fn().mockReturnValue({ values: txValues })

    mocks.transaction.mockImplementation(async (cb: (tx: any) => Promise<any>) => {
      return cb({ insert: txInsert })
    })

    await expect(createOrganization(db, validInput, ctx)).rejects.toThrow('DB error')

    expect(mocks.transaction).toHaveBeenCalledTimes(1)
  })
})
