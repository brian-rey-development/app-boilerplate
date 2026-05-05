import { createMiddleware } from 'hono/factory'
import { eq, and } from 'drizzle-orm'
import { orgMembers } from '@packages/db'
import type { DbClient } from '@packages/db'
import type { OrgContext } from '@packages/types'

type Env = {
  Variables: {
    authContext?: { userId: string }
    orgContext?: OrgContext
    db: DbClient
  }
}

export const orgMiddleware = createMiddleware<Env>(async (c, next) => {
  const orgId = c.req.header('x-organization-id')
  if (!orgId) {
    return c.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Organization context required' } }, 403)
  }

  const authCtx = c.get('authContext')
  if (!authCtx) {
    return c.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Auth required' } }, 401)
  }

  const db = c.get('db')

  const [membership] = await db
    .select()
    .from(orgMembers)
    .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.userId, authCtx.userId)))
    .limit(1)

  if (!membership) {
    return c.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Not a member of this organization' } }, 403)
  }

  c.set('orgContext', {
    userId: authCtx.userId,
    organizationId: orgId,
    role: membership.role as OrgContext['role'],
  })

  await next()
})
