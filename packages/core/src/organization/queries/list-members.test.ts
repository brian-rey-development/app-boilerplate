import { describe, it, expect } from 'vitest'
import { createMockDb } from '../../__tests__/helpers'
import { listMembers } from './list-members'

const dbRowA = { orgId: 'org-1', userId: 'user-1', role: 'owner', joinedAt: new Date('2024-01-01') }
const dbRowB = { orgId: 'org-1', userId: 'user-2', role: 'admin', joinedAt: new Date('2024-01-15') }
const dbRowC = { orgId: 'org-1', userId: 'user-3', role: 'member', joinedAt: new Date('2024-02-01') }

describe('listMembers', () => {
  it('returns all members of an organization', async () => {
    const db = createMockDb([dbRowA, dbRowB, dbRowC])
    const result = await listMembers(db, 'org-1')

    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ organizationId: 'org-1', userId: 'user-1', role: 'owner', joinedAt: dbRowA.joinedAt })
    expect(result[1]).toEqual({ organizationId: 'org-1', userId: 'user-2', role: 'admin', joinedAt: dbRowB.joinedAt })
    expect(result[2]).toEqual({ organizationId: 'org-1', userId: 'user-3', role: 'member', joinedAt: dbRowC.joinedAt })
    expect(db.select).toHaveBeenCalledOnce()
  })

  it('returns empty array for organization with no members', async () => {
    const db = createMockDb([])
    const result = await listMembers(db, 'org-empty')

    expect(result).toEqual([])
    expect(db.select).toHaveBeenCalledOnce()
  })
})
