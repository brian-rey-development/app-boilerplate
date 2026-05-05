export interface AuthContext {
  userId: string
}

export interface OrgContext extends AuthContext {
  organizationId: string
  role: OrganizationRole
}

export type OrganizationRole = 'owner' | 'admin' | 'member'
