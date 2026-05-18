FROM node:22-slim AS base
RUN corepack enable pnpm

WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN cd node_modules/esbuild && node install.js 2>/dev/null || true
RUN cd node_modules/@tailwindcss/oxide && npm run postinstall 2>/dev/null || true

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

FROM base AS production
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/shared ./shared

RUN mkdir -p /app/uploads

EXPOSE 3000
CMD ["node", "dist/index.js"]
