import { inngest } from '../../inngest/client'

type EventPayloads = {
  'invite.created': {
    to: string
    orgName: string
    organizationId: string
    inviterName: string
    acceptLink: string
    role: string
    expiresAt: string
  }
  'user.registered': {
    to: string
    name: string
  }
}

type EventName = keyof EventPayloads

export async function emit<E extends EventName>(
  name: E,
  payload: EventPayloads[E],
): Promise<void> {
  await inngest.send({ name, data: payload })
}
