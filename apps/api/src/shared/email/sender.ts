import { sendEmail, type EmailTemplate } from '../lib/email'
import { buildInviteEmail } from './templates/invite'
import { buildMagicLinkEmail } from './templates/magic-link'
import { buildPasswordResetEmail } from './templates/password-reset'
import { buildWelcomeEmail } from './templates/welcome'

type TemplateName = 'invite' | 'magic-link' | 'password-reset' | 'welcome'

type TemplateParams = {
  invite: Parameters<typeof buildInviteEmail>[0]
  'magic-link': Parameters<typeof buildMagicLinkEmail>[0]
  'password-reset': Parameters<typeof buildPasswordResetEmail>[0]
  welcome: Parameters<typeof buildWelcomeEmail>[0]
}

export async function sendTransactional<T extends TemplateName>(
  template: T,
  to: string,
  params: TemplateParams[T],
): Promise<void> {
  let emailInput: EmailTemplate

  switch (template) {
    case 'invite':
      emailInput = buildInviteEmail(params as TemplateParams['invite'])
      break
    case 'magic-link':
      emailInput = buildMagicLinkEmail(params as TemplateParams['magic-link'])
      break
    case 'password-reset':
      emailInput = buildPasswordResetEmail(params as TemplateParams['password-reset'])
      break
    case 'welcome':
      emailInput = buildWelcomeEmail(params as TemplateParams['welcome'])
      break
    default:
      throw new Error(`Unknown email template: ${template}`)
  }

  await sendEmail({ to, ...emailInput })
}
