import { eq } from 'drizzle-orm'
import { organizations, orgMembers } from '@packages/db'
import type { DbClient } from '@packages/db'
import type { Organization } from '@packages/types'

export async function listOrganizations(
  db: DbClient,
  userId: string
): Promise<Organization[]> {
  const rows = await db
    .select()
    .from(organizations)
    .innerJoin(orgMembers, eq(organizations.id, orgMembers.orgId))
    .where(eq(orgMembers.userId, userId))

  return rows.map((row) => row.organizations)
}
