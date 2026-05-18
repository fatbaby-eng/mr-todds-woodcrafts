# Mr. Todd's Workshop Go-Live Checklist

This checklist gets `mrtoddsworkshop.com` live with the current app and Venmo checkout.

## 1) Prep accounts

- Domain registrar access for `mrtoddsworkshop.com`
- A hosting account (Render, Railway, or Fly.io)
- A MySQL database (PlanetScale, Railway MySQL, or another managed MySQL provider)
- Venmo business/personal handle ready for payments

## 2) Set required environment variables

Set these in your hosting dashboard:

- `NODE_ENV=production`
- `PORT=3000` (or let the host inject one)
- `DATABASE_URL=<mysql connection string>`
- `VITE_VENMO_USERNAME=<your venmo handle without @>`
- `JWT_SECRET=<long random string>`
- `OWNER_OPEN_ID=<your admin open id>` (needed for admin features)
- `VITE_APP_ID=<oauth app id>` (needed for admin sign-in)
- `OAUTH_SERVER_URL=<oauth base url>` (needed for admin sign-in)

## 3) Deploy the app

Use these build settings:

- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Start command: `pnpm start`

## 4) Run database migrations

After the first deploy, run:

```bash
pnpm db:push
```

Then seed real products if needed:

```bash
node seed-real-products.mjs
```

## 5) Point domain to hosting

In DNS records:

- Add `A`/`CNAME` records from your host for:
  - `mrtoddsworkshop.com`
  - `www.mrtoddsworkshop.com`

Then enable SSL/TLS in your host dashboard.

## 6) Go-live smoke test

- Visit homepage, shop, product page, and contact page
- Add product to cart and complete checkout
- Confirm order confirmation page shows:
  - Amount due
  - Venmo handle
  - Order number instruction
- Verify order appears in admin orders list

## 7) Launch messaging

- Add announcement banner/post: "Now live: mrtoddsworkshop.com"
- Include payment note: "Venmo accepted at checkout"
