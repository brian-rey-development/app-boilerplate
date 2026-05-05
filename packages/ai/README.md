# @packages/ai

## Purpose

AI SDK integration with Langfuse tracing, model configuration, and chat pipelines.

## Exports

- Model instances: `sonnet`, `haiku`, `gpt4o`
- `Langfuse` client
- `getPrompt()` -- retrieve a Langfuse prompt
- `defineTool()` -- define a typed AI tool
- `chat()` -- non-streaming chat
- `chatStream()` -- streaming chat

## Dependencies

- `ai` -- Vercel AI SDK core
- `@ai-sdk/anthropic` -- Anthropic provider (Claude models)
- `@ai-sdk/openai` -- OpenAI provider (GPT models)
- `langfuse` -- observability and tracing
- `zod` -- tool parameter schemas

## Commands

- `pnpm typecheck` -- TypeScript type checking
- `pnpm lint` -- TypeScript type checking (same as typecheck)
- `pnpm test` -- Run unit tests with Vitest
- `pnpm eval` -- Run AI evals
