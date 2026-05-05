import { tool } from 'ai'
import { z } from 'zod'

export interface ToolContext {
  userId?: string
  organizationId?: string
  role?: string
}

export function defineTool<Input extends z.ZodTypeAny>({
  description,
  schema,
  execute,
}: {
  description: string
  schema: Input
  execute: (input: z.infer<Input>, ctx?: ToolContext) => Promise<unknown>
}) {
  return tool({
    description,
    inputSchema: schema,
    execute: (input: z.infer<Input>) => execute(input),
  })
}
