import { describe, it, expect, vi, beforeEach } from 'vitest'
import { inviteMember } from './invite-member'
import type { OrgContext } from '@packages/types'
import type { InviteMemberInput } from '../schemas'

function createMockDb() {
  const limit = vi.fn()
  const where = vi.fn(() => ({ limit }))
  const from = vi.fn(() => ({ where }))
  const select = vi.fn(() => ({ from }))

  const returning = vi.fn()
  const values = vi.fn(() => ({ returning }))
  const insert = vi.fn(() => ({ values }))

  const db = { select, insert } as any

  return { db, mocks: { limit, where, from, select, returning, values, insert } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('inviteMember', () => {
  const orgId = 'org-1'
  const input: InviteMemberInput = { email: 'new@example.com', role: 'member' }

  const ownerCtx: OrgContext = { userId: 'user-1', organizationId: orgId, role: 'owner' }
  const adminCtx: OrgContext = { userId: 'user-2', organizationId: orgId, role: 'admin' }
  const memberCtx: OrgContext = { userId: 'user-3', organizationId: orgId, role: 'member' }

  const now = new Date()
  const inviteRow = {
    id: 'invite-1',
    orgId,
    email: 'new@example.com',
    role: 'member',
    status: 'pending',
    invitedBy: 'user-1',
    expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    createdAt: now,
  }

  it('owner invites new member', async () => {
    const { db, mocks } = createMockDb()

    mocks.limit
      .mockResolvedValueOnce([])  // no profile found with that email
      .mockResolvedValueOnce([])  // no pending invite
    mocks.returning.mockResolvedValue([inviteRow])

    const result = await inviteMember(db, input, ownerCtx)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.email).toBe('new@example.com')
      expect(result.data.role).toBe('member')
      expect(result.data.organizationId).toBe(orgId)
    }
    expect(mocks.select).toHaveBeenCalledTimes(2)
    expect(mocks.insert).toHaveBeenCalledTimes(1)
  })

  it('admin invites new member', async () => {
    const { db, mocks } = createMockDb()

    mocks.limit
      .mockResolvedValueOnce([])  // no profile found
      .mockResolvedValueOnce([])  // no pending invite
    mocks.returning.mockResolvedValue([inviteRow])

    const result = await inviteMember(db, input, adminCtx)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.email).toBe('new@example.com')
    }
  })

  it('member gets FORBIDDEN', async () => {
    const { db } = createMockDb()

    const result = await inviteMember(db, input, memberCtx)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
  })

  it('fails if user already a member', async () => {
    const { db, mocks } = createMockDb()

    mocks.limit
      .mockResolvedValueOnce([{ id: 'existing-user', email: 'new@example.com' }])
      .mockResolvedValueOnce([{ orgId, userId: 'existing-user', role: 'member' }])

    const result = await inviteMember(db, input, ownerCtx)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
    expect(mocks.insert).not.toHaveBeenCalled()
  })

  it('fails if pending invite already exists', async () => {
    const { db, mocks } = createMockDb()

    mocks.limit
      .mockResolvedValueOnce([])  // no profile found with that email
      .mockResolvedValueOnce([inviteRow])  // pending invite exists

    const result = await inviteMember(db, input, ownerCtx)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
    expect(mocks.insert).not.toHaveBeenCalled()
  })

  it('creates invite with 7-day expiry', async () => {
    const { db, mocks } = createMockDb()

    mocks.limit
      .mockResolvedValueOnce([])  // no profile found
      .mockResolvedValueOnce([])  // no pending invite
    mocks.returning.mockImplementation(async () => {
      const row = { ...inviteRow }
      return [row]
    })

    const result = await inviteMember(db, input, ownerCtx)

    expect(result.ok).toBe(true)
    if (result.ok) {
      const diffMs = result.data.expiresAt.getTime() - Date.now()
      const diffDays = diffMs / (24 * 60 * 60 * 1000)
      expect(diffDays).toBeGreaterThan(6.9)
      expect(diffDays).toBeLessThan(7.1)
    }
  })
})
