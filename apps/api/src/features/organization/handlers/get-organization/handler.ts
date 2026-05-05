import type { Context } from 'hono'
import { getOrganization } from '@packages/core'
import { ok, error } from '../../../../shared/lib/response'

export async function getOrganizationHandler(c: Context) {
  const slug = c.req.param('slug') as string
  const db = c.get('db')

  const org = await getOrganization(db, slug)
  if (!org) return error(c, { code: 'NOT_FOUND', message: 'Organization not found' })

  return ok(c, org)
}
