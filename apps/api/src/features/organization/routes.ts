import { Hono } from 'hono'
import { authMiddleware } from '../../shared/middleware/auth'
import { orgMiddleware } from './middleware'
import { createOrganizationHandler } from './handlers/create-organization/handler'
import { getOrganizationHandler } from './handlers/get-organization/handler'
import { listMembersHandler } from './handlers/list-members/handler'

export const organizationRoutes = new Hono()
  .post('/', authMiddleware, createOrganizationHandler)
  .get('/:slug', getOrganizationHandler)
  .get('/:slug/members', authMiddleware, orgMiddleware, listMembersHandler)
