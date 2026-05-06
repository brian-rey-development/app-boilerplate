import { createMiddleware } from 'hono/factory'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { AuthContext } from '@packages/types'

type Env = { Variables: { authContext?: AuthContext } }

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET

if (!SUPABASE_URL && !SUPABASE_JWT_SECRET) {
  throw new Error('Auth middleware requires SUPABASE_URL or SUPABASE_JWT_SECRET to be configured')
}

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined
if (SUPABASE_URL) {
  jwks = createRemoteJWKSet(new URL(`${SUPABASE_URL}/.well-known/jwks.json`))
}

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) {
    return c.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token' } }, 401)
  }

  const token = header.slice(7)

  try {
    if (jwks) {
      const { payload } = await jwtVerify(token, jwks, {
        issuer: SUPABASE_URL ? `${SUPABASE_URL}/auth/v1` : undefined,
      })
      if (!payload.sub) {
        return c.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token payload' } }, 401)
      }
      c.set('authContext', { userId: payload.sub })
    } else {
      const secretKey = new TextEncoder().encode(SUPABASE_JWT_SECRET!)
      const { payload } = await jwtVerify(token, secretKey)
      if (!payload.sub) {
        return c.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token payload' } }, 401)
      }
      c.set('authContext', { userId: payload.sub })
    }
  } catch {
    return c.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }, 401)
  }

  await next()
})
