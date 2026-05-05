import type { Context } from 'hono'
import { ok } from '../../../../shared/lib/response'

export async function loginHandler(c: Context) {
  return ok(c, { message: 'Login handled by Supabase client' })
}
