import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { orgMembers } from '@packages/db'
import type { DbClient } from '@packages/db'
import type { OrgMember } from '@packages/types'

const OrgRoleSchema = z.enum(['owner', 'admin', 'member'])

export async function listMembers(
  db: DbClient,
  organizationId: string
): Promise<OrgMember[]> {
  const rows = await db
    .select()
    .from(orgMembers)
    .where(eq(orgMembers.orgId, organizationId))

  return rows.map((row) => ({
    organizationId: row.orgId,
    userId: row.userId,
    role: OrgRoleSchema.parse(row.role),
    joinedAt: row.joinedAt,
  }))
}
