import type { OrganizationRole } from '../shared/context'

export type InviteStatus = 'pending' | 'accepted' | 'expired'

export interface OrgInvite {
  id: string
  organizationId: string
  email: string
  role: OrganizationRole
  status: InviteStatus
  invitedBy: string
  expiresAt: Date
  createdAt: Date
}
