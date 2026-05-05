import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { orgMembers } from '@packages/db'
import type { DbClient } from '@packages/db'
import type { OrgContext, OrgMember, Result } from '@packages/types'
import { success, failure } from '@packages/types'

const OrgRoleSchema = z.enum(['owner', 'admin', 'member'])

export async function updateMemberRole(
  db: DbClient,
  targetUserId: string,
  newRole: 'admin' | 'member',
  ctx: OrgContext
): Promise<Result<OrgMember>> {
  if (ctx.role !== 'owner') {
    return failure({ code: 'FORBIDDEN', message: 'Only owners can change member roles' })
  }

  if (targetUserId === ctx.userId) {
    return failure({ code: 'FORBIDDEN', message: 'Cannot change your own role' })
  }

  const result = await db.transaction(async (tx): Promise<Result<OrgMember>> => {
    const [target] = await tx
      .select()
      .from(orgMembers)
      .where(and(eq(orgMembers.orgId, ctx.organizationId), eq(orgMembers.userId, targetUserId)))
      .limit(1)

    if (!target) {
      return failure({ code: 'NOT_FOUND', message: 'Member not found' })
    }

    if (target.role === 'owner') {
      const owners = await tx
        .select()
        .from(orgMembers)
        .where(and(eq(orgMembers.orgId, ctx.organizationId), eq(orgMembers.role, 'owner')))

      if (owners.length <= 1) {
        return failure({ code: 'FORBIDDEN', message: 'Cannot demote the last owner' })
      }
    }

    const rows = await tx
      .update(orgMembers)
      .set({ role: newRole })
      .where(and(eq(orgMembers.orgId, ctx.organizationId), eq(orgMembers.userId, targetUserId)))
      .returning()

    const updated = rows[0]!

    return success({
      organizationId: updated.orgId,
      userId: updated.userId,
      role: OrgRoleSchema.parse(updated.role),
      joinedAt: updated.joinedAt,
    })
  })

  return result
}
