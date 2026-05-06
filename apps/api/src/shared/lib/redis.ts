import Redis from 'ioredis'
import { logger } from './logger'

let redis: Redis | null = null

export function getRedis(): Redis | null {
  if (redis) return redis

  const url = process.env.REDIS_URL
  if (!url) {
    logger.warn('REDIS_URL not set, Redis features disabled')
    return null
  }

  redis = new Redis(url, {
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
    retryStrategy(times) {
      if (times > 3) {
        redis = null
        return null
      }
      return Math.min(times * 200, 2000)
    },
    lazyConnect: false,
  })

  redis.on('error', (err) => { logger.error({ err }, 'redis connection error') })
  redis.on('connect', () => { logger.info('redis connected') })

  return redis
}

export async function redisStartupCheck(): Promise<void> {
  if (!process.env.REDIS_URL) return

  const r = getRedis()
  if (!r) {
    throw new Error('Redis is configured but failed to connect')
  }

  try {
    await r.ping()
  } catch (cause) {
    throw new Error('Redis startup check failed', { cause })
  }
}

export async function redisHealth(): Promise<boolean> {
  try {
    const r = getRedis()
    if (!r) return false
    await r.ping()
    return true
  } catch {
    return false
  }
}
