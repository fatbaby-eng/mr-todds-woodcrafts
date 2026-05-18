# Production image: Node serves the bundled API + static storefront.
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Bake public site URL / Venmo handle into the client bundle when building the image.
ARG VITE_PUBLIC_SITE_URL=https://mrtoddsworkshop.com
ARG VITE_VENMO_HANDLE=
ENV VITE_PUBLIC_SITE_URL=$VITE_PUBLIC_SITE_URL
ENV VITE_VENMO_HANDLE=$VITE_VENMO_HANDLE

RUN pnpm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache libc6-compat

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/drizzle ./drizzle

EXPOSE 3000
CMD ["node", "dist/index.js"]
