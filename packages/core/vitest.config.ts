import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 98,
        branches: 98,
        functions: 100,
      },
      include: ['src/**/*.ts'],
      exclude: ['src/**/index.ts'],
    },
  },
})
