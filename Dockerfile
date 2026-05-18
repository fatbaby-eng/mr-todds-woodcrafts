FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS production
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle
COPY package.json ./

EXPOSE 3000
CMD ["node", "dist/index.js"]
