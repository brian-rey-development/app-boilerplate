import type { Context } from 'hono'
import { listMembers } from '@packages/core'
import { ok } from '../../../../shared/lib/response'

export async function listMembersHandler(c: Context) {
  const orgCtx = c.get('orgContext')
  if (!orgCtx) {
    return c.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Auth required' } }, 401)
  }

  const db = c.get('db')
  const members = await listMembers(db, orgCtx.organizationId)
  return ok(c, members)
}
