import { Langfuse } from 'langfuse'

export const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_HOST,
})

export async function getPrompt(name: string) {
  const prompt = await langfuse.getPrompt(name)
  return prompt.compile()
}
