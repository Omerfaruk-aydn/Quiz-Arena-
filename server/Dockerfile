FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.8.0 --activate

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY server/package.json ./server/
COPY shared/package.json ./shared/
RUN pnpm install --frozen-lockfile --filter @quizarena/server...

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules
COPY shared ./shared
COPY server ./server
WORKDIR /app/server
RUN pnpm run build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/shared ./shared
EXPOSE 4000
CMD ["node", "dist/index.js"]