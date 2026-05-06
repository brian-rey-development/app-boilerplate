/** Feature flag identifiers. Add new flags here as the app grows. */
export type FeatureFlag = 'INVITE_MEMBERS' | 'AI_CHAT' | 'AUDIT_LOG'

/** Map of feature flag to its enabled state */
export type FeatureFlags = Record<FeatureFlag, boolean>

/** Default flags used when no env override is set */
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  INVITE_MEMBERS: true,
  AI_CHAT: false,
  AUDIT_LOG: true,
}
