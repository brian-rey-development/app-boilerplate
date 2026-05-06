import { Hono } from 'hono'
import { authMiddleware } from '../../shared/middleware/auth'
import { auditLog } from '../../shared/middleware/audit'
import { orgMiddleware } from './middleware'
import { createOrganizationHandler } from './handlers/create-organization/handler'
import { getOrganizationHandler } from './handlers/get-organization/handler'
import { listMembersHandler } from './handlers/list-members/handler'
import { inviteMemberHandler } from './handlers/invite-member/handler'

export const organizationRoutes = new Hono()
  .post('/', authMiddleware, auditLog({ action: 'organization.created', resource: 'organization' }), createOrganizationHandler)
  .get('/:slug', getOrganizationHandler)
  .get('/:slug/members', authMiddleware, orgMiddleware, listMembersHandler)
  .post('/invites', authMiddleware, orgMiddleware, auditLog({ action: 'member.invited', resource: 'invite' }), inviteMemberHandler)
