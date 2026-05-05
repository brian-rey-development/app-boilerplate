import { z } from 'zod'

export const updateOrganizationSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    slug: z
      .string()
      .min(3)
      .max(50)
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric characters and hyphens')
      .optional(),
  })
  .refine((data) => data.name !== undefined || data.slug !== undefined, {
    message: 'At least one field must be provided',
  })

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>
