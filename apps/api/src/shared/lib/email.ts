import { Resend } from 'resend'
import { logger } from './logger'

let resend: Resend | null = null

export function getResend(): Resend | null {
  if (resend) return resend

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null

  resend = new Resend(apiKey)
  return resend
}

export interface SendEmailInput {
  to: string
  subject: string
  html: string
  text?: string
}

export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

export async function sendEmail(input: SendEmailInput) {
  const client = getResend()
  if (!client) {
    throw new Error('RESEND_API_KEY not configured')
  }

  const from = process.env.EMAIL_FROM ?? 'noreply@example.com'
  const { data, error } = await client.emails.send({ from, ...input })

  if (error) {
    logger.error({ error }, 'resend api error')
    throw new Error('Failed to send email')
  }
  return data
}
