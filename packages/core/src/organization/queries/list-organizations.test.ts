import { describe, it, expect } from 'vitest'
import type { Organization } from '@packages/types'
import { createMockDb } from '../../__tests__/helpers'
import { listOrganizations } from './list-organizations'

const orgA: Organization = {
  id: 'org-1',
  slug: 'acme',
  name: 'Acme Inc',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

const orgB: Organization = {
  id: 'org-2',
  slug: 'beta',
  name: 'Beta Corp',
  createdAt: new Date('2024-02-01'),
  updatedAt: new Date('2024-02-01'),
}

const orgC: Organization = {
  id: 'org-3',
  slug: 'gamma',
  name: 'Gamma LLC',
  createdAt: new Date('2024-03-01'),
  updatedAt: new Date('2024-03-01'),
}

describe('listOrganizations', () => {
  it('returns empty array for user with no organization memberships', async () => {
    const db = createMockDb([])
    const result = await listOrganizations(db, 'user-without-orgs')

    expect(result).toEqual([])
    expect(db.select).toHaveBeenCalledOnce()
  })

  it('returns all organizations the user is a member of', async () => {
    const rows = [
      { organizations: orgA, orgMembers: {} },
      { organizations: orgB, orgMembers: {} },
    ]
    const db = createMockDb(rows)
    const result = await listOrganizations(db, 'user-1')

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual(orgA)
    expect(result[1]).toEqual(orgB)
    expect(db.select).toHaveBeenCalledOnce()
  })

  it('does not return organizations the user is not a member of', async () => {
    const rows = [{ organizations: orgC, orgMembers: {} }]
    const db = createMockDb(rows)
    const result = await listOrganizations(db, 'user-2')

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(orgC)
    expect(db.select).toHaveBeenCalledOnce()
  })
})
