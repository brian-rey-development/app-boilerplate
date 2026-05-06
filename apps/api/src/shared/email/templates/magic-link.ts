import type { EmailTemplate } from '../../lib/email'
import { emailFooter } from './footer'

interface MagicLinkParams {
  link: string
  expiresInMinutes: number
}

export function buildMagicLinkEmail(params: MagicLinkParams): EmailTemplate {
  const { link, expiresInMinutes } = params

  const safeLink = link.startsWith('https://') ? link : ''
  const encodedLink = encodeURI(safeLink)

  return {
    subject: 'Your sign-in link',
    html: `
      <h2>Sign in to your account</h2>
      <p>Click the button below to sign in. This link expires in ${expiresInMinutes} minutes.</p>
      <p>
        <a href="${encodedLink}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:white;border-radius:6px;text-decoration:none;">
          Sign In
        </a>
      </p>
      <p style="color:#6b7280;">If you didn't request this link, you can safely ignore this email.</p>
      ${emailFooter()}
    `,
    text: `Sign in to your account. This link expires in ${expiresInMinutes} minutes.`,
  }
}
