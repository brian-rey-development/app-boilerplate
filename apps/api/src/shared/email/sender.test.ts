import { describe, it, expect, vi } from 'vitest'
import { sendTransactional } from './sender'

vi.mock('../lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ id: 'email-id' }),
}))

describe('sendTransactional', () => {
  it('dispatches invite template correctly', async () => {
    const { sendEmail } = await import('../lib/email')

    await sendTransactional('invite', 'user@example.com', {
      orgName: 'Acme Corp',
      inviterName: 'Jane Doe',
      acceptLink: 'https://app.example.com/accept',
      role: 'admin',
      expiresAt: new Date('2026-06-15T12:00:00Z'),
    })

    expect(sendEmail).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: expect.stringContaining('Jane Doe'),
      html: expect.stringContaining('Acme Corp'),
      text: expect.any(String),
    })
  })

  it('dispatches welcome template correctly', async () => {
    const { sendEmail } = await import('../lib/email')

    await sendTransactional('welcome', 'user@example.com', { name: 'Alice' })

    expect(sendEmail).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: expect.stringContaining('Alice'),
      html: expect.stringContaining('Alice'),
      text: expect.any(String),
    })
  })

  it('dispatches magic-link template correctly', async () => {
    const { sendEmail } = await import('../lib/email')

    await sendTransactional('magic-link', 'user@example.com', {
      link: 'https://app.example.com/magic',
      expiresInMinutes: 15,
    })

    expect(sendEmail).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: expect.stringContaining('sign-in'),
      html: expect.stringContaining('15'),
      text: expect.any(String),
    })
  })

  it('dispatches password-reset template correctly', async () => {
    const { sendEmail } = await import('../lib/email')

    await sendTransactional('password-reset', 'user@example.com', {
      link: 'https://app.example.com/reset',
      expiresInMinutes: 30,
    })

    expect(sendEmail).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: expect.stringContaining('password'),
      html: expect.stringContaining('30'),
      text: expect.any(String),
    })
  })

  it('throws on unknown template', async () => {
    await expect(
      sendTransactional('unknown' as any, 'user@example.com', {} as any),
    ).rejects.toThrow('Unknown email template')
  })
})
