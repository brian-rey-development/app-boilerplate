import { z } from 'zod'

export const createOrganizationSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric characters and hyphens'),
})

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>
