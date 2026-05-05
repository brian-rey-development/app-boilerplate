import { chat } from '../src/pipelines/chat'

// Placeholder eval — replace with real eval cases
;(async () => {
  const result = await chat({
    messages: [{ role: 'user', content: 'Hello, who are you?' }],
    system: 'You are a helpful assistant. Respond concisely.',
  })

  console.log('Chat eval:', result.text)
})().catch((err) => {
  console.error('Chat eval failed:', err)
  process.exit(1)
})
