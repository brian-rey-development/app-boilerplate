import { Inngest } from 'inngest'

export const inngest = new Inngest({
  id: 'saas-boilerplate',
  eventKey: process.env.INNGEST_EVENT_KEY,
})
