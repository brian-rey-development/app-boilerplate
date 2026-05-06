import type { EmailTemplate } from '../../lib/email'
import { emailFooter } from './footer'

interface PasswordResetParams {
  link: string
  expiresInMinutes: number
}

export function buildPasswordResetEmail(params: PasswordResetParams): EmailTemplate {
  const { link, expiresInMinutes } = params

  const safeLink = link.startsWith('https://') ? link : ''
  const encodedLink = encodeURI(safeLink)

  return {
    subject: 'Reset your password',
    html: `
      <h2>Password reset request</h2>
      <p>Click the button below to reset your password. This link expires in ${expiresInMinutes} minutes.</p>
      <p>
        <a href="${encodedLink}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:white;border-radius:6px;text-decoration:none;">
          Reset Password
        </a>
      </p>
      <p style="color:#6b7280;">If you didn't request this, please secure your account immediately by changing your password and contacting support.</p>
      ${emailFooter()}
    `,
    text: `Reset your password. This link expires in ${expiresInMinutes} minutes. If you didn't request this, please secure your account immediately by changing your password and contacting support.`,
  }
}
