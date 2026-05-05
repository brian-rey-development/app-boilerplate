import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const sonnet = anthropic('claude-sonnet-4-6')
export const haiku = anthropic('claude-haiku-4-5')
export const gpt4o = openai('gpt-4o')
