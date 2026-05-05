import { eq } from 'drizzle-orm'
import { organizations } from '@packages/db'
import type { DbClient } from '@packages/db'
import type { Organization } from '@packages/types'

export async function getOrganization(
  db: DbClient,
  slug: string
): Promise<Organization | null> {
  const rows = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .limit(1)

  return rows[0] ?? null
}
