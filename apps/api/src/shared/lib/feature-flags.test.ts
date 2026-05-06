import { describe, it, expect, beforeEach, vi } from 'vitest'
import { isEnabled, getFeatureFlags, clearFeatureFlagCache } from './feature-flags'

describe('getFeatureFlags', () => {
  beforeEach(() => {
    clearFeatureFlagCache()
  })

  it('returns defaults when no env vars set', () => {
    const flags = getFeatureFlags()
    expect(flags.INVITE_MEMBERS).toBe(true)
    expect(flags.AI_CHAT).toBe(false)
    expect(flags.AUDIT_LOG).toBe(true)
  })

  it('overrides from env vars with FEATURE_ prefix', () => {
    process.env.FEATURE_AI_CHAT = 'true'
    const flags = getFeatureFlags()
    expect(flags.AI_CHAT).toBe(true)
    delete process.env.FEATURE_AI_CHAT
  })

  it('treats non-"true" values as false', () => {
    process.env.FEATURE_INVITE_MEMBERS = 'false'
    const flags = getFeatureFlags()
    expect(flags.INVITE_MEMBERS).toBe(false)
    delete process.env.FEATURE_INVITE_MEMBERS
  })
})

describe('isEnabled', () => {
  beforeEach(() => {
    clearFeatureFlagCache()
  })

  it('returns the flag value from defaults', () => {
    expect(isEnabled('INVITE_MEMBERS')).toBe(true)
    expect(isEnabled('AI_CHAT')).toBe(false)
  })

  it('respects env var overrides', () => {
    process.env.FEATURE_AI_CHAT = 'true'
    expect(isEnabled('AI_CHAT')).toBe(true)
    delete process.env.FEATURE_AI_CHAT
  })

  it('caches flags across calls', () => {
    process.env.FEATURE_AI_CHAT = 'true'
    isEnabled('INVITE_MEMBERS')

    delete process.env.FEATURE_AI_CHAT
    expect(isEnabled('AI_CHAT')).toBe(true)
  })

  it('clearFeatureFlagCache forces re-read of env vars', () => {
    process.env.FEATURE_AI_CHAT = 'true'
    isEnabled('AI_CHAT')

    delete process.env.FEATURE_AI_CHAT
    clearFeatureFlagCache()
    expect(isEnabled('AI_CHAT')).toBe(false)
  })
})
