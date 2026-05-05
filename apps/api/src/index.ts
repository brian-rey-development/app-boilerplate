import { createApp } from './shared/lib/create-app'

const app = createApp()

export default {
  port: Number(process.env.PORT) || 3001,
  fetch: app.fetch,
}
