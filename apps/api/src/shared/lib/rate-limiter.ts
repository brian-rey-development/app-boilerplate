import { getRedis } from './redis'

const WINDOW_MS = 60_000
const MAX_REQUESTS = 100

const slidingWindowScript = `
  local key = KEYS[1]
  local now = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  local limit = tonumber(ARGV[3])
  local member = ARGV[4]

  redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
  local count = redis.call('ZCARD', key)

  if count < limit then
    redis.call('ZADD', key, now, member)
    redis.call('EXPIRE', key, math.ceil(window / 1000) + 1)
    return {1, limit - count - 1}
  else
    return {0, 0}
  end
`

const fallbackMap = new Map<string, { count: number; resetAt: number }>()

function fallbackRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = fallbackMap.get(key)

  if (!entry || now > entry.resetAt) {
    fallbackMap.set(key, { count: 1, resetAt: now + 60_000 })
    return { allowed: true, remaining: 99 }
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: MAX_REQUESTS - entry.count }
}

export async function redisRateLimit(key: string): Promise<{ allowed: boolean; remaining: number }> {
  const redis = getRedis()
  if (!redis) {
    if (fallbackMap.size > 10_000) {
      const now = Date.now()
      for (const [k, entry] of fallbackMap) {
        if (now > entry.resetAt) {
          fallbackMap.delete(k)
        }
      }
    }
    return fallbackRateLimit(key)
  }

  const now = Date.now()
  const uniqueMember = crypto.randomUUID()

  const result = (await redis.eval(
    slidingWindowScript,
    1,
    key,
    now.toString(),
    WINDOW_MS.toString(),
    MAX_REQUESTS.toString(),
    uniqueMember,
  )) as [number, number]

  const [allowed, remaining] = result
  return { allowed: allowed === 1, remaining }
}
