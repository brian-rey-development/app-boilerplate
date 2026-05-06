import type { FeatureFlag } from '@packages/types'
import { isEnabled } from '../lib/feature-flags'
import type { MiddlewareHandler } from 'hono'

export function featureGate(flag: FeatureFlag): MiddlewareHandler {
  return async (c, next) => {
    if (!isEnabled(flag)) {
      return c.json(
        {
          ok: false,
          error: {
            code: 'FEATURE_DISABLED',
            message: 'This feature is not available',
          },
        },
        403,
      )
    }
    await next()
  }
}
