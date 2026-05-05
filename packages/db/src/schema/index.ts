import { relations } from 'drizzle-orm'
import { organizations } from './organizations'
import { profiles } from './profiles'
import { orgMembers } from './org-members'
import { orgInvites } from './org-invites'

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(orgMembers),
  invites: many(orgInvites),
}))

export const profilesRelations = relations(profiles, ({ many }) => ({
  memberships: many(orgMembers),
  sentInvites: many(orgInvites, { relationName: 'inviter' }),
}))

export const orgMembersRelations = relations(orgMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [orgMembers.orgId],
    references: [organizations.id],
  }),
  user: one(profiles, {
    fields: [orgMembers.userId],
    references: [profiles.id],
  }),
}))

export const orgInvitesRelations = relations(orgInvites, ({ one }) => ({
  organization: one(organizations, {
    fields: [orgInvites.orgId],
    references: [organizations.id],
  }),
  inviter: one(profiles, {
    fields: [orgInvites.invitedBy],
    references: [profiles.id],
    relationName: 'inviter',
  }),
}))

export { organizations } from './organizations'
export { profiles } from './profiles'
export { orgMembers } from './org-members'
export { orgInvites } from './org-invites'
