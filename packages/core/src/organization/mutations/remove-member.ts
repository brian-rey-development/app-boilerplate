import { eq, and } from 'drizzle-orm'
import { orgMembers } from '@packages/db'
import type { DbClient } from '@packages/db'
import type { OrgContext, Result } from '@packages/types'
import { success, failure } from '@packages/types'

export async function removeMember(
  db: DbClient,
  targetUserId: string,
  ctx: OrgContext
): Promise<Result<void>> {
  if (targetUserId === ctx.userId) {
    return failure({ code: 'FORBIDDEN', message: 'Cannot remove yourself from the organization' })
  }

  if (ctx.role !== 'owner' && ctx.role !== 'admin') {
    return failure({ code: 'FORBIDDEN', message: 'Only owners and admins can remove members' })
  }

  const [target] = await db
    .select()
    .from(orgMembers)
    .where(and(eq(orgMembers.orgId, ctx.organizationId), eq(orgMembers.userId, targetUserId)))
    .limit(1)

  if (!target) {
    return failure({ code: 'NOT_FOUND', message: 'Member not found' })
  }

  if (ctx.role === 'admin' && target.role !== 'member') {
    return failure({ code: 'FORBIDDEN', message: 'Admins can only remove members' })
  }

  if (target.role === 'owner') {
    const owners = await db
      .select()
      .from(orgMembers)
      .where(and(eq(orgMembers.orgId, ctx.organizationId), eq(orgMembers.role, 'owner')))

    if (owners.length <= 1) {
      return failure({ code: 'FORBIDDEN', message: 'Cannot remove the last owner' })
    }
  }

  await db.delete(orgMembers).where(
    and(eq(orgMembers.orgId, ctx.organizationId), eq(orgMembers.userId, targetUserId))
  )

  return success(undefined as void)
}
