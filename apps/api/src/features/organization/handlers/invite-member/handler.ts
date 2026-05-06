import type { Context } from 'hono'
import { inviteMember, inviteMemberSchema } from '@packages/core'
import { ok, error } from '../../../../shared/lib/response'
import { emit } from '../../../../shared/lib/events'

export async function inviteMemberHandler(c: Context) {
  const parseResult = inviteMemberSchema.safeParse(await c.req.json())
  if (!parseResult.success) {
    return error(c, {
      code: 'VALIDATION_ERROR',
      message: parseResult.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    })
  }

  const body = parseResult.data
  const db = c.get('db')
  const orgContext = c.get('orgContext')
  if (!orgContext) {
    return error(c, { code: 'UNAUTHORIZED', message: 'Authentication required' })
  }

  const result = await inviteMember(db, body, orgContext)
  if (!result.ok) return error(c, result.error)

  await emit('invite.created', {
    to: body.email,
    orgName: '',
    organizationId: orgContext.organizationId,
    inviterName: orgContext.userId,
    acceptLink: `${process.env.WEB_URL ?? 'http://localhost:5173'}/accept?org=${orgContext.organizationId}`,
    role: body.role,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  })

  return ok(c, result.data, 201)
}
