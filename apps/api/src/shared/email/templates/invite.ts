import type { EmailTemplate } from '../../lib/email'
import { escapeHtml } from './escape'
import { emailFooter } from './footer'

interface InviteEmailParams {
  orgName: string
  inviterName: string
  acceptLink: string
  role: string
  expiresAt: Date
}

export function buildInviteEmail(params: InviteEmailParams): EmailTemplate {
  const { orgName, inviterName, acceptLink, role, expiresAt } = params
  const expiryDate = expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const safeLink = acceptLink.startsWith('https://') ? acceptLink : ''
  const encodedLink = encodeURI(safeLink)

  return {
    subject: `${inviterName} invited you to join ${orgName}`,
    html: `
      <h2>You've been invited</h2>
      <p>${escapeHtml(inviterName)} has invited you to join <strong>${escapeHtml(orgName)}</strong> as a <strong>${escapeHtml(role)}</strong>.</p>
      <p>This invite expires on ${expiryDate}.</p>
      <p>
        <a href="${encodedLink}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:white;border-radius:6px;text-decoration:none;">
          Accept Invitation
        </a>
      </p>
      <p style="color:#6b7280;">If you didn't expect this invite, you can safely ignore it.</p>
      ${emailFooter()}
    `,
    text: `${inviterName} invited you to join ${orgName} as a ${role}. This invite expires on ${expiryDate}.`,
  }
}
