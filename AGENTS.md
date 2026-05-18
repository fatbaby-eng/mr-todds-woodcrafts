# Agents

## Cursor Cloud specific instructions

### Overview

Mr. Todd's Woodcrafts is a full-stack e-commerce app: Express + tRPC backend serving a React/Vite frontend via Vite dev middleware. All in a single `package.json` (not a monorepo).

### Running services

| Service | Command | Notes |
|---------|---------|-------|
| Dev server (Express + Vite) | `pnpm dev` | Requires `DATABASE_URL`, `JWT_SECRET` env vars. Serves on port 3000. |
| MySQL | `sudo mysqld --user=mysql --datadir=/var/lib/mysql &` | Must be running before dev server starts. |

### Environment variables

Required for dev server:
- `DATABASE_URL` — e.g. `mysql://root:password@127.0.0.1:3306/woodcrafts`
- `JWT_SECRET` — any string for cookie signing

Optional (external services, storefront works without them):
- `OAUTH_SERVER_URL`, `OWNER_OPEN_ID`, `VITE_OAUTH_PORTAL_URL` — for admin login
- `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` — for product image storage
- `VITE_APP_ID` — Manus app identifier

### Key commands

See `package.json` scripts. Summary:
- `pnpm dev` — start dev server (port 3000)
- `pnpm test` — run vitest (mocks DB, no MySQL needed)
- `pnpm check` — TypeScript type checking (`tsc --noEmit`)
- `pnpm format` — Prettier formatting
- `pnpm db:push` — generate and apply Drizzle migrations (needs `DATABASE_URL`)

### Database

MySQL 8. Schema managed by Drizzle ORM (`drizzle/schema.ts`). Seed data: `node seed.mjs` (needs `DATABASE_URL`).

### Gotchas

- The MySQL socket directory `/var/run/mysqld/` may have restrictive permissions after install; run `sudo chmod 755 /var/run/mysqld/` if you get socket permission errors.
- pnpm warns about unapproved build scripts for `@tailwindcss/oxide` and `esbuild`. These packages work fine without running their postinstall scripts because their native binaries are installed as optional platform-specific deps.
- The Vite dev server is embedded inside the Express server (not a separate process). Hot reload works for client code; server code restarts via `tsx watch`.
- Tests mock the database layer entirely — no MySQL connection needed to run `pnpm test`.
