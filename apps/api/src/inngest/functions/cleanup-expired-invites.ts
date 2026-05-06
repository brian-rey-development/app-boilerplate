import { cron } from 'inngest'
import { inngest } from '../client'
import { createDb } from '@packages/db'
import { orgInvites } from '@packages/db'
import { eq, lt, and } from 'drizzle-orm'
import { logger } from '../../shared/lib/logger'

export const cleanupExpiredInvites = inngest.createFunction(
  { id: 'cleanup-expired-invites', triggers: [cron('0 3 * * *')] },
  async () => {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      console.error('DATABASE_URL not set, skipping cleanup')
      return
    }

    const db = createDb(databaseUrl)
    const now = new Date()

    await db
      .update(orgInvites)
      .set({ status: 'expired' as const })
      .where(and(eq(orgInvites.status, 'pending'), lt(orgInvites.expiresAt, now)))

    logger.info('expired invites cleaned up')
  },
)
