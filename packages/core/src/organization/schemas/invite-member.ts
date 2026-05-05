import { z } from 'zod'

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member']),
})

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
