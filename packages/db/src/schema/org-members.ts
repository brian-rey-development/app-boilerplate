import { pgTable, text, timestamp, uuid, primaryKey, check } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { organizations } from './organizations'
import { profiles } from './profiles'

export const orgMembers = pgTable('org_members', {
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('member'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.orgId, table.userId] }),
  roleCheck: check('role_check', sql`${table.role} IN ('owner', 'admin', 'member')`),
}))
