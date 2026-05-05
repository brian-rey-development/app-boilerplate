import type { OrganizationRole } from '../shared/context'

export interface OrgMember {
  organizationId: string
  userId: string
  role: OrganizationRole
  joinedAt: Date
}
