import { describe, it, expect, vi } from 'vitest'
import { register } from './register'
import { registerSchema } from '../schemas'
import type { DbClient } from '@packages/db'

function createMockDb() {
  const limit = vi.fn()
  const where = vi.fn(() => ({ limit }))
  const from = vi.fn(() => ({ where }))
  const select = vi.fn(() => ({ from }))

  const returning = vi.fn()
  const values = vi.fn(() => ({ returning }))
  const insert = vi.fn(() => ({ values }))

  const db = { insert, select } as unknown as DbClient

  return { db, mocks: { limit, where, from, select, returning, values, insert } }
}

const profileData = {
  id: 'user-1',
  email: 'test@example.com',
  fullName: 'Test User',
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('registerSchema', () => {
  it('accepts valid input', () => {
    expect(registerSchema.safeParse({ email: 'test@example.com' }).success).toBe(true)
  })

  it('rejects invalid email', () => {
    expect(registerSchema.safeParse({ email: 'not-an-email' }).success).toBe(false)
  })
})

describe('register', () => {
  it('creates profile and returns user', async () => {
    const { db, mocks } = createMockDb()

    mocks.returning.mockResolvedValue([profileData])

    const result = await register(db, { email: 'test@example.com', fullName: 'Test User' }, 'user-1')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.email).toBe('test@example.com')
      expect(result.data.fullName).toBe('Test User')
    }
    expect(mocks.insert).toHaveBeenCalledOnce()
    expect(mocks.values).toHaveBeenCalledWith({
      id: 'user-1',
      email: 'test@example.com',
      fullName: 'Test User',
    })
  })

  it('accepts registration without fullName', async () => {
    const { db, mocks } = createMockDb()

    mocks.returning.mockResolvedValue([{ ...profileData, fullName: null }])

    const result = await register(db, { email: 'test@example.com' }, 'user-1')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.fullName).toBeNull()
    }
    expect(mocks.values).toHaveBeenCalledWith({
      id: 'user-1',
      email: 'test@example.com',
      fullName: null,
    })
  })
})
