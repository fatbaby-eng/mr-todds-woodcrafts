# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Copy dependency manifests first for layer caching
COPY package.json pnpm-lock.yaml ./
COPY patches/ patches/

# Install all dependencies (including devDeps needed for build)
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build frontend (Vite) + backend (esbuild)
# VITE_VENMO_USERNAME must be passed as a build arg so it is baked into the JS bundle
ARG VITE_VENMO_USERNAME
ENV VITE_VENMO_USERNAME=$VITE_VENMO_USERNAME

ARG VITE_APP_ID
ENV VITE_APP_ID=$VITE_APP_ID

RUN pnpm run build

# ─── Runtime stage ────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Only copy production deps
COPY package.json pnpm-lock.yaml ./
COPY patches/ patches/
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
