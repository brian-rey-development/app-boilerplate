import type { EmailTemplate } from '../../lib/email'
import { escapeHtml } from './escape'
import { emailFooter } from './footer'

interface WelcomeParams {
  name: string
  appUrl?: string
}

export function buildWelcomeEmail(params: WelcomeParams): EmailTemplate {
  const { name } = params
  const appUrl = params.appUrl ?? process.env.WEB_URL ?? 'http://localhost:5173'

  return {
    subject: `Welcome, ${name}!`,
    html: `
      <h2>Welcome to the platform</h2>
      <p>Hi ${escapeHtml(name)}, your account has been created successfully.</p>
      <p>You can now create or join an organization to get started.</p>
      <p>
        <a href="${appUrl}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:white;border-radius:6px;text-decoration:none;">
          Get Started
        </a>
      </p>
      ${emailFooter()}
    `,
    text: `Welcome, ${name}! Your account has been created successfully. You can now create or join an organization to get started.`,
  }
}
