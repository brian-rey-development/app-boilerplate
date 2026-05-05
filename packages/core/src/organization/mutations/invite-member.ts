import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { profiles, orgMembers, orgInvites } from '@packages/db'
import type { DbClient } from '@packages/db'
import type { InviteMemberInput } from '../schemas'
import type { OrgContext, OrgInvite, Result } from '@packages/types'
import { success, failure } from '@packages/types'

const OrgRoleSchema = z.enum(['owner', 'admin', 'member'])
const InviteStatusSchema = z.enum(['pending', 'accepted', 'expired'])

export async function inviteMember(
  db: DbClient,
  input: InviteMemberInput,
  ctx: OrgContext
): Promise<Result<OrgInvite>> {
  if (ctx.role !== 'owner' && ctx.role !== 'admin') {
    return failure({ code: 'FORBIDDEN', message: 'Only owners and admins can invite members' })
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, input.email))
    .limit(1)

  if (profile) {
    const [existing] = await db
      .select()
      .from(orgMembers)
      .where(and(eq(orgMembers.orgId, ctx.organizationId), eq(orgMembers.userId, profile.id)))
      .limit(1)

    if (existing) {
      return failure({ code: 'VALIDATION_ERROR', message: 'User is already a member of this organization' })
    }
  }

  const [existingInvite] = await db
    .select()
    .from(orgInvites)
    .where(
      and(
        eq(orgInvites.orgId, ctx.organizationId),
        eq(orgInvites.email, input.email),
        eq(orgInvites.status, 'pending'),
      )
    )
    .limit(1)

  if (existingInvite) {
    return failure({ code: 'VALIDATION_ERROR', message: 'A pending invite already exists for this email' })
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const rows = await db
    .insert(orgInvites)
    .values({
      orgId: ctx.organizationId,
      email: input.email,
      role: input.role,
      invitedBy: ctx.userId,
      expiresAt,
    })
    .returning()

  const row = rows[0]!

  return success({
    id: row.id,
    organizationId: row.orgId,
    email: row.email,
    role: OrgRoleSchema.parse(row.role),
    status: InviteStatusSchema.parse(row.status),
    invitedBy: row.invitedBy,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
  })
}
