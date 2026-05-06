import type { FeatureFlag, FeatureFlags } from '@packages/types'
import { DEFAULT_FEATURE_FLAGS } from '@packages/types'

/** Keep in sync with apps/web/src/shared/lib/feature-flags.ts */

export function getFeatureFlags(): FeatureFlags {
  const flags = { ...DEFAULT_FEATURE_FLAGS }
  for (const key of Object.keys(flags) as FeatureFlag[]) {
    const envVar = process.env[`FEATURE_${key}`]
    if (envVar !== undefined) {
      flags[key] = envVar === 'true'
    }
  }
  return flags
}

let cachedFlags: FeatureFlags | null = null
let cacheExpiry = 0
const CACHE_TTL = 60_000 // 1 minute

export function isEnabled(flag: FeatureFlag): boolean {
  const now = Date.now()
  if (!cachedFlags || now > cacheExpiry) {
    cachedFlags = getFeatureFlags()
    cacheExpiry = now + CACHE_TTL
  }
  return cachedFlags[flag]
}

export function clearFeatureFlagCache() {
  cachedFlags = null
  cacheExpiry = 0
}
