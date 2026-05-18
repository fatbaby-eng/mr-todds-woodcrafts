# Go Live on Railway — mrtoddsworkshop.com

This is the single, current runbook. It supersedes the other `cursor/venmo-*`
branches.

## Base branch

Deploy from **`cursor/venmo-checkout-deployment-8a7f`** (this branch is forked
from it). It has the production `Dockerfile`, `docker-compose.yml`, `.env.example`,
and the `0003_add_venmo_payment.sql` migration. Merging it to `main` first is
the cleanest move:

```bash
git checkout main
git merge --ff-only cursor/venmo-checkout-deployment-8a7f || \
git merge cursor/venmo-checkout-deployment-8a7f -m "Merge deployment baseline"
git push origin main
```

If you'd rather not touch `main` yet, Railway can deploy from any branch — just
pick this branch in step 2 below.

## 1. Create the Railway project

1. Sign in at https://railway.app with your GitHub account.
2. **New Project → Deploy from GitHub repo →** select `fatbaby-eng/mr-todds-woodcrafts`.
3. When prompted for a branch, choose `main` (after the merge above) or
   `cursor/venmo-checkout-deployment-8a7f` directly.
4. Railway will detect the `Dockerfile` and start the first build. **Let it
   fail this first time** — we haven't added the database or env vars yet.

## 2. Add the MySQL database

1. In the project view: **+ New → Database → Add MySQL**.
2. Railway provisions a MySQL 8 instance and exposes these variables on the
   MySQL service: `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`,
   `MYSQLPASSWORD`, and the convenience var **`MYSQL_URL`** (full connection
   string, what we want).

## 3. Set environment variables on the web service

Open the **web service → Variables tab** and add these. Use the
`${{ MySQL.MYSQL_URL }}` reference syntax for `DATABASE_URL` so Railway
auto-links them.

| Variable | Value |
|---|---|
| `DATABASE_URL` | `${{ MySQL.MYSQL_URL }}` |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `JWT_SECRET` | `openssl rand -hex 32` output (run locally, paste result) |
| `VITE_VENMO_HANDLE` | your Venmo `@handle` (with the `@`) — shown to customers at checkout |

Skip `VITE_APP_ID` / `OAUTH_SERVER_URL` / `OWNER_OPEN_ID` for now — see the
"Known limitation" section at the bottom.

Save. Railway redeploys automatically.

## 4. Run database migrations (one-time)

The `Dockerfile` doesn't run migrations on boot. After the first successful
deploy:

**Option A — Railway CLI (recommended):**

```bash
npm i -g @railway/cli
railway login
railway link            # pick your project
railway run pnpm db:push
```

**Option B — one-off shell in Railway:**

In the Railway dashboard, on the web service: **⋯ menu → Open Shell**, then:

```bash
pnpm db:push
```

If `pnpm` isn't on PATH in the runtime image, use:

```bash
npx drizzle-kit migrate
```

Verify in the MySQL service's **Data tab** that the tables exist:
`products`, `orders`, `order_items`, `wood_blanks`, `trade_shows`,
`subscribers`, `cart_sessions`, `users`, `sessions`.

## 5. Seed real products (one-time)

```bash
railway run node seed-real-products.mjs
```

Confirm in the **MySQL Data tab → products** that rows 30001–30004 exist.

## 6. Verify the deploy

Railway auto-assigns a URL like `mrtoddswoodcrafts-production.up.railway.app`.
Open it. You should see the homepage, `/shop` showing the four real products,
and the cart drawer working.

Smoke test:
- Add a product to the cart.
- Go through `/checkout` to the payment step.
- Confirm your Venmo handle and a QR code appear.

## 7. Custom domain

1. In Railway: web service → **Settings → Networking → Custom Domain**.
2. Enter `mrtoddsworkshop.com`. Railway shows a target value (a CNAME like
   `your-app.up.railway.app` and/or an A record IP).
3. Repeat for `www.mrtoddsworkshop.com`.
4. Railway will display a **TLS status: pending** until DNS resolves.

## 8. DNS at Cloudflare

In Cloudflare → `mrtoddsworkshop.com` → DNS:

| Type | Name | Target | Proxy |
|---|---|---|---|
| CNAME | `@` (apex) | the railway target Railway showed | **DNS only** (grey cloud) |
| CNAME | `www` | the railway target Railway showed | **DNS only** (grey cloud) |

Important: **turn the orange cloud OFF** (DNS only) for the initial
verification. Railway issues its own Let's Encrypt cert. Once that's
issued and the site loads on HTTPS, you *can* flip the proxy back on if
you want Cloudflare in front, but only if Cloudflare SSL/TLS mode is set
to **Full (strict)** — anything less will loop or break.

Propagation is usually 1–10 minutes. Railway's custom domain page will
turn green when ready.

## 9. Final smoke test on the live domain

1. Open https://mrtoddsworkshop.com — should match the Railway preview URL.
2. Add to cart, go through checkout, hit the payment step.
3. From a phone, scan the Venmo QR code — it should open the Venmo app
   with your handle, the order amount, and the order number in the memo
   pre-filled.
4. Send yourself $0.01 to confirm the deep link works end to end.

## Known limitation — admin login

The admin dashboard at `/admin` is wired to a Manus.space OAuth provider
(`server/_core/oauth.ts` + `server/_core/sdk.ts`). Off Manus there's no
OAuth server to call, so admin sign-in will fail with the message
"OAUTH_SERVER_URL is not configured."

The **public storefront, cart, and checkout work without it.** Orders
will land in the `orders` table when customers check out — you can read
them straight from the Railway MySQL Data tab in the meantime.

To fix properly (later, in a follow-up):
- Replace the Manus OAuth flow with either GitHub OAuth, magic-link email,
  or a simple username/password gated by `OWNER_OPEN_ID`.
- Or, simpler: add a single-user basic-auth middleware in front of
  `/admin/*` routes, reading credentials from env vars.

Don't block launch on this. Mark-as-paid can be done with one SQL update
from the Railway dashboard until admin auth is back:

```sql
UPDATE orders SET paymentStatus = 'PAID', status = 'CONFIRMED'
WHERE orderNumber = 'MTW-...';
```

## Troubleshooting

- **Build fails on `pnpm install --frozen-lockfile`** — Railway's Nixpacks
  may try to override the Dockerfile. Force Dockerfile builds: web service
  → **Settings → Build → Builder = Dockerfile**.
- **`DATABASE_URL` empty at runtime** — make sure the variable is exactly
  `${{ MySQL.MYSQL_URL }}` (note: it's the MySQL service's name; if you
  renamed it, use that name). Railway resolves it at deploy time.
- **`drizzle-kit migrate` errors with "Unknown database"** — your
  `MYSQL_URL` doesn't include the database name. Append `?database=railway`
  or copy individual fields and build the URL manually.
- **502 from Cloudflare** — your SSL/TLS mode is wrong. Set it to
  **Full (strict)** or turn the orange cloud off.
- **`PORT` mismatch** — Railway injects `PORT` automatically. The
  `Dockerfile` exposes 3000 and the server reads `process.env.PORT`. If
  you override `PORT` to a different value, make sure the container
  binds the same.

## What's left after this

1. Replace admin OAuth (above).
2. Optional: configure outgoing email for order confirmations (currently
   the code logs notifications via the Manus `sdk` — also broken off
   Manus). Resend or Postmark + a small adapter.
3. Optional: turn on Cloudflare proxy + caching once everything is stable.
