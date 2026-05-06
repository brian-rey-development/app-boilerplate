import type { Context, MiddlewareHandler } from 'hono'
import { logAuditEvent } from '@packages/core'

interface AuditOptions {
  action: string
  resource: string
  getResourceId?: (c: Context) => string | undefined
}

export function auditLog(options: AuditOptions): MiddlewareHandler {
  return async (c, next) => {
    await next()

    if (c.res.status < 200 || c.res.status >= 300) return

    const db = c.get('db')
    const authContext = c.get('authContext')
    const orgContext = c.get('orgContext')

    const orgId = orgContext?.organizationId
    if (!orgId) return

    try {
      await logAuditEvent(db, {
        orgId,
        userId: authContext?.userId,
        action: options.action,
        resource: options.resource,
        resourceId: options.getResourceId?.(c),
      })
    } catch (err) {
      console.error('audit log failed:', err)
    }
  }
}
