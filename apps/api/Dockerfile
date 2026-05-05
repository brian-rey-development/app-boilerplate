FROM node:22-alpine
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/tsconfig.json apps/api/
COPY packages/types/package.json packages/types/tsconfig.json packages/types/
COPY packages/core/package.json packages/core/tsconfig.json packages/core/
COPY packages/db/package.json packages/db/tsconfig.json packages/db/
RUN pnpm install --frozen-lockfile --filter @apps/api...
COPY . .
RUN pnpm --filter @apps/api build
EXPOSE 3001
CMD ["node", "apps/api/dist/index.js"]
