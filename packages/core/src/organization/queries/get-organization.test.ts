import { describe, it, expect } from 'vitest'
import type { Organization } from '@packages/types'
import { createMockDb } from '../../__tests__/helpers'
import { getOrganization } from './get-organization'

const mockOrg: Organization = {
  id: 'org-1',
  slug: 'acme',
  name: 'Acme Inc',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('getOrganization', () => {
  it('returns organization when found by slug', async () => {
    const db = createMockDb([mockOrg])
    const result = await getOrganization(db, 'acme')

    expect(result).toEqual(mockOrg)
    expect(db.select).toHaveBeenCalledOnce()
  })

  it('returns null when no organization matches the slug', async () => {
    const db = createMockDb([])
    const result = await getOrganization(db, 'nonexistent')

    expect(result).toBeNull()
    expect(db.select).toHaveBeenCalledOnce()
  })
})
