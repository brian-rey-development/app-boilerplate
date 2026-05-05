import { organizations, orgMembers } from '@packages/db'
import type { DbClient } from '@packages/db'
import type { CreateOrganizationInput } from '../schemas'
import type { AuthContext, Organization, Result } from '@packages/types'
import { success, failure } from '@packages/types'

export async function createOrganization(
  db: DbClient,
  input: CreateOrganizationInput,
  ctx: AuthContext
): Promise<Result<Organization>> {
  try {
    const org = await db.transaction(async (tx) => {
      const rows = await tx
        .insert(organizations)
        .values({ slug: input.slug, name: input.name })
        .returning()

      const created = rows[0]!

      await tx
        .insert(orgMembers)
        .values({ orgId: created.id, userId: ctx.userId, role: 'owner' })

      return created
    })

    return success(org)
  /* v8 ignore start */
  } catch (err) {
    if ((err as { code?: string }).code === '23505') {
      return failure({ code: 'DUPLICATE_SLUG', message: `Organization with slug "${input.slug}" already exists` })
    }
    throw err
  }
  /* v8 ignore stop */
}
