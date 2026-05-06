import { z } from 'zod'
import { eventType } from 'inngest'
import { inngest } from '../client'
import { sendTransactional } from '../../shared/email/sender'

const welcomeEventSchema = z.object({
  to: z.string().email(),
  name: z.string().min(1),
})

export const sendWelcomeEmail = inngest.createFunction(
  { id: 'send-welcome-email', triggers: [eventType('user.registered')] },
  async ({ event }) => {
    const parsed = welcomeEventSchema.safeParse(event.data)
    if (!parsed.success) {
      console.error('invalid welcome event:', parsed.error.issues)
      return
    }

    const { to, name } = parsed.data

    await sendTransactional('welcome', to, { name })
  },
)
