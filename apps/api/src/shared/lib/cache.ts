import { getRedis } from './redis'

const DEFAULT_TTL = 300

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis()
  if (!redis) return null

  const raw = await redis.get(key)
  if (!raw) return null

  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number = DEFAULT_TTL): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
}

export async function cacheDelete(pattern: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  let cursor = '0'
  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100)
    cursor = nextCursor
    if (keys.length > 0) {
      await redis.unlink(...keys)
    }
  } while (cursor !== '0')
}

export function cacheKey(resource: string, identifier: string, orgId?: string): string {
  if (orgId) return `cache:${orgId}:${resource}:${identifier}`
  return `cache:${resource}:${identifier}`
}
