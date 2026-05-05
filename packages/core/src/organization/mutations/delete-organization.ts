import { eq } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import { organizations, orgMembers } from '@packages/db'
import type { DbClient } from '@packages/db'
import type { OrgContext, Result } from '@packages/types'
import { success, failure } from '@packages/types'

export async function deleteOrganization(
  db: DbClient,
  ctx: OrgContext
): Promise<Result<void>> {
  if (ctx.role !== 'owner') {
    return failure({ code: 'FORBIDDEN', message: 'Only the owner can delete the organization' })
  }

  const result = await db.transaction(async (tx): Promise<Result<void>> => {
    const [org] = await tx
      .select()
      .from(organizations)
      .where(eq(organizations.id, ctx.organizationId))
      .limit(1)

    if (!org) {
      return failure({ code: 'NOT_FOUND', message: 'Organization not found' })
    }

    const [memberCount] = await tx
      .select({ count: sql<number>`count(*)` })
      .from(orgMembers)
      .where(eq(orgMembers.orgId, ctx.organizationId))

    if (!memberCount || Number(memberCount.count) === 0) {
      return failure({ code: 'VALIDATION_ERROR', message: 'Organization has no members' })
    }

    await tx.delete(organizations).where(eq(organizations.id, ctx.organizationId))

    return success(undefined as void)
  })

  return result
}
