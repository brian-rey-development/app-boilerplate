import { describe, it, expect } from 'vitest'
import { buildInviteEmail } from './invite'

describe('buildInviteEmail', () => {
  const params = {
    orgName: 'Acme Corp',
    inviterName: 'Jane Doe',
    acceptLink: 'https://app.example.com/accept?token=abc123',
    role: 'admin',
    expiresAt: new Date('2026-06-15T12:00:00Z'),
  }

  it('includes org and inviter names in subject', () => {
    const result = buildInviteEmail(params)

    expect(result.subject).toContain('Jane Doe')
    expect(result.subject).toContain('Acme Corp')
  })

  it('escapes HTML in org name', () => {
    const result = buildInviteEmail({ ...params, orgName: '<script>alert("xss")</script>' })

    expect(result.html).not.toContain('<script>')
    expect(result.html).toContain('&lt;script&gt;')
  })

  it('escapes HTML in inviter name', () => {
    const result = buildInviteEmail({ ...params, inviterName: '<b>Bold</b>' })

    expect(result.html).not.toContain('<b>Bold</b>')
    expect(result.html).toContain('&lt;b&gt;Bold&lt;/b&gt;')
  })

  it('rejects non-https accept links', () => {
    const result = buildInviteEmail({ ...params, acceptLink: 'javascript:alert(1)' })

    expect(result.html).not.toContain('javascript:')
    expect(result.html).not.toContain('http://')
  })

  it('encodes the accept link', () => {
    const result = buildInviteEmail({ ...params, acceptLink: 'https://app.example.com/accept?token=a b' })

    expect(result.html).toContain('a%20b')
  })

  it('includes role in the body', () => {
    const result = buildInviteEmail(params)

    expect(result.html).toContain('admin')
  })

  it('includes expiry date', () => {
    const result = buildInviteEmail(params)

    expect(result.html).toContain('June 15, 2026')
  })

  it('includes a plain-text version', () => {
    const result = buildInviteEmail(params)

    expect(result.text).toBeDefined()
    expect(result.text!.length).toBeGreaterThan(0)
  })
})
