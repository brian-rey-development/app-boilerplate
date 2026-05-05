import { vi } from 'vitest'
import type { DbClient } from '@packages/db'

export function createMockDb<T>(result: T): DbClient {
  const thenable = { then: (resolve: (v: T) => void) => resolve(result) }
  const whereResult = {
    ...thenable,
    limit: vi.fn(() => thenable),
  }
  const fromResult = {
    where: vi.fn(() => whereResult),
    innerJoin: vi.fn(() => ({ where: vi.fn(() => whereResult) })),
  }

  return {
    select: vi.fn(() => ({ from: vi.fn(() => fromResult) })),
  } as unknown as DbClient
}
