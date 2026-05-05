import { Hono } from 'hono'
import { healthRoutes } from './features/health/routes'
import { authRoutes } from './features/auth/routes'
import { organizationRoutes } from './features/organization/routes'

export const routes = new Hono()
  .route('/health', healthRoutes)
  .route('/auth', authRoutes)
  .route('/organization', organizationRoutes)
