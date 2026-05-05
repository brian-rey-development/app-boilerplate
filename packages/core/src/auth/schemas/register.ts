import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1).max(100).optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
