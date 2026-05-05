import type { AuthContext, OrgContext } from '@packages/types'
import type { DbClient } from '@packages/db'

export type AppEnv = {
  Variables: {
    db: DbClient | Record<string, never>
    authContext?: AuthContext
    orgContext?: OrgContext
  }
}
