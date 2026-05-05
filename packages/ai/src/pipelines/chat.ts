import { generateText, streamText } from 'ai'
import type { ToolSet } from 'ai'
import { sonnet } from '../model'

const MAX_MESSAGE_LENGTH = 4000
const MAX_SYSTEM_LENGTH = 8000

interface ChatInput<Tools extends ToolSet = ToolSet> {
  messages: { role: 'user' | 'assistant'; content: string }[]
  system?: string
  tools?: Tools
}

function validateMessages(messages: ChatInput['messages']): void {
  if (messages.length === 0) {
    throw new Error('At least one message is required')
  }
  for (const msg of messages) {
    if (!msg.content || msg.content.trim().length === 0) {
      throw new Error('Message content cannot be empty')
    }
    if (msg.content.length > MAX_MESSAGE_LENGTH) {
      throw new Error(`Message content exceeds ${MAX_MESSAGE_LENGTH} character limit`)
    }
  }
}

function validateSystem(system?: string): void {
  if (system && system.length > MAX_SYSTEM_LENGTH) {
    throw new Error(`System prompt exceeds ${MAX_SYSTEM_LENGTH} character limit`)
  }
}

export function chat<Tools extends ToolSet = ToolSet>(input: ChatInput<Tools>) {
  validateMessages(input.messages)
  validateSystem(input.system)

  return generateText({
    model: sonnet,
    system: input.system,
    messages: input.messages,
    tools: input.tools,
  })
}

export function chatStream<Tools extends ToolSet = ToolSet>(input: ChatInput<Tools>) {
  validateMessages(input.messages)
  validateSystem(input.system)

  return streamText({
    model: sonnet,
    system: input.system,
    messages: input.messages,
    tools: input.tools,
  })
}
