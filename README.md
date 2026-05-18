# Mr. Todd's Woodcrafts

Production storefront for **mrtoddsworkshop.com** with:
- public shopping experience
- cart + checkout
- manual order workflow
- Venmo-first payment collection

## Quick start (local)

```bash
pnpm install
pnpm dev
```

The app runs at `http://localhost:3000` by default.

## Environment variables

Set these in your deployment platform before going live:

```bash
DATABASE_URL=...
JWT_SECRET=...
OWNER_OPEN_ID=...
OAUTH_SERVER_URL=...
VITE_OAUTH_PORTAL_URL=...
VITE_APP_ID=...
VITE_VENMO_USERNAME=mrtoddsworkshop
VITE_SUPPORT_EMAIL=todd@mrtodds.com
```

Optional analytics:

```bash
VITE_ANALYTICS_ENDPOINT=...
VITE_ANALYTICS_WEBSITE_ID=...
```

## Build and run

```bash
pnpm build
pnpm start
```

## Database migrations

After `DATABASE_URL` is set:

```bash
pnpm db:push
```

## Launch checklist for mrtoddsworkshop.com

1. **Deploy this app** on your host (Render, Railway, Fly.io, VPS, etc.) using:
   - Build command: `pnpm install --frozen-lockfile && pnpm build`
   - Start command: `pnpm start`
2. **Set all environment variables** above in production.
3. **Run migrations** (`pnpm db:push`) against production DB.
4. **Domain DNS setup**
   - point `mrtoddsworkshop.com` (apex) to your host target (A/ALIAS/ANAME per host docs)
   - point `www.mrtoddsworkshop.com` to the same host (usually CNAME)
   - set one canonical domain and 301 redirect the other to it
5. **Enable SSL** in your hosting provider and verify HTTPS is active for both apex and `www`.
6. **Smoke test production**
   - open home, shop, product detail, cart, checkout
   - place one test order
   - verify Venmo link opens with amount + order note
   - verify order appears in admin orders

## Venmo payment behavior

Checkout captures shipping/contact details and creates an order.  
The confirmation screen then shows a direct Venmo payment link with the exact order total and order number in the payment note.
