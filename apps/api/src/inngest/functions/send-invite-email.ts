import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { eventType } from 'inngest'
import { inngest } from '../client'
import { createDb, organizations } from '@packages/db'
import { sendTransactional } from '../../shared/email/sender'

const inviteEventSchema = z.object({
  to: z.string().email(),
  orgName: z.string(),
  organizationId: z.string(),
  inviterName: z.string(),
  acceptLink: z.string().url(),
  role: z.string(),
  expiresAt: z.string().datetime(),
})

export const sendInviteEmail = inngest.createFunction(
  { id: 'send-invite-email', triggers: [eventType('invite.created')] },
  async ({ event }) => {
    const parsed = inviteEventSchema.safeParse(event.data)
    if (!parsed.success) {
      console.error('invalid invite event:', parsed.error.issues)
      return
    }

    let { to, orgName, organizationId, inviterName, acceptLink, role, expiresAt } = parsed.data

    if (!orgName) {
      const databaseUrl = process.env.DATABASE_URL
      if (databaseUrl) {
        const db = createDb(databaseUrl)
        const [org] = await db
          .select({ name: organizations.name })
          .from(organizations)
          .where(eq(organizations.id, organizationId))
          .limit(1)
        if (org) orgName = org.name
      }
    }

    await sendTransactional('invite', to, {
      orgName,
      inviterName,
      acceptLink,
      role,
      expiresAt: new Date(expiresAt),
    })
  },
)
