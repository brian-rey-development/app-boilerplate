import { eq } from 'drizzle-orm'
import { organizations } from '@packages/db'
import type { DbClient } from '@packages/db'
import type { UpdateOrganizationInput } from '../schemas'
import type { OrgContext, Organization, Result } from '@packages/types'
import { success, failure } from '@packages/types'

export async function updateOrganization(
  db: DbClient,
  input: UpdateOrganizationInput,
  ctx: OrgContext
): Promise<Result<Organization>> {
  if (ctx.role !== 'owner' && ctx.role !== 'admin') {
    return failure({ code: 'FORBIDDEN', message: 'Only owners and admins can update the organization' })
  }

  try {
    const result = await db.transaction(async (tx): Promise<Result<Organization>> => {
      const [org] = await tx
        .select()
        .from(organizations)
        .where(eq(organizations.id, ctx.organizationId))
        .limit(1)

      if (!org) {
        return failure({ code: 'NOT_FOUND', message: 'Organization not found' })
      }

      if (input.slug && input.slug !== org.slug) {
        const existing = await tx
          .select()
          .from(organizations)
          .where(eq(organizations.slug, input.slug))
          .limit(1)

        if (existing.length > 0) {
          return failure({ code: 'DUPLICATE_SLUG', message: `Organization with slug "${input.slug}" already exists` })
        }
      }

      const rows = await tx
        .update(organizations)
        .set({
          ...(input.name && { name: input.name }),
          ...(input.slug && { slug: input.slug }),
        })
        .where(eq(organizations.id, ctx.organizationId))
        .returning()

      const updated = rows[0]!

      return success(updated)
    })

    return result
  /* v8 ignore start */
  } catch (err) {
    if ((err as { code?: string }).code === '23505') {
      return failure({ code: 'DUPLICATE_SLUG', message: `Organization with slug "${input.slug}" already exists` })
    }
    throw err
  }
  /* v8 ignore stop */
}
