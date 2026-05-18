# Going Live — mrtoddsworkshop.com

This is the one-page checklist for taking the site from "built" to "selling".
Everything in this list happens *outside* of the codebase (settings UI, DNS,
deploy button) — the code already supports Venmo checkout end to end.

## 0. Before you start

You need:

- An admin login on the site (your Manus account is already the owner).
- Your Venmo username (the `@handle` people pay — sign in at
  https://account.venmo.com to confirm yours).
- Access to whoever controls the `mrtoddsworkshop.com` DNS records.

## 1. Configure shop settings

1. Open `/admin/settings` after logging in as the owner.
2. Fill in:
   - **Venmo Username** — your `@handle` without the `@`. Customers will see
     the deep link `venmo://paycharge?recipients=<this>&amount=...&note=Order ...`.
   - **Contact Email** — replaces the placeholder shown on the Contact page
     and used in customer copy.
   - **Contact Phone** *(optional)* — shown on the Contact page if filled.
   - **Shop is live and accepting orders** — keep this checked.
3. Click **Save Settings**.
4. Verify by opening `/checkout` in a private window (add something to the
   cart from `/shop` first). On the payment step you should see your `@handle`,
   a tappable "Open Venmo" button, and a QR code that contains the same deep
   link.

## 2. Push the database migration

This release adds a `site_settings` table and a `VENMO` value to the
`orders.paymentMethod` enum.

From a shell with `DATABASE_URL` set:

```bash
pnpm db:push
```

`db:push` runs `drizzle-kit generate && drizzle-kit migrate`. The generated
SQL is already committed at `drizzle/0003_venmo_and_site_settings.sql`, so
in most environments `drizzle-kit migrate` alone is enough.

## 3. Deploy

Use the Manus dashboard's **Deploy** button on the project. The build
command is `pnpm build`; the runtime command is `pnpm start`.

The deployment endpoint will be served at `https://<your-project>.manus.space`
by default — confirm it works there before pointing your custom domain.

## 4. Point mrtoddsworkshop.com at the deployment

In the Manus project dashboard:

1. Open **Domains** (or **Settings → Domains**).
2. Add `mrtoddsworkshop.com` and `www.mrtoddsworkshop.com`.
3. Manus will show one or two DNS records to add at your registrar:
   - typically an `A` record (or `CNAME` for `www`) pointing to a Manus
     edge address, plus a `TXT` record for ownership verification.
4. At your DNS provider, add those records exactly as shown. Propagation is
   usually 5–30 minutes.
5. Once Manus reports the domain as **Verified**, it will automatically
   provision a Let's Encrypt TLS certificate. The site will be reachable at
   `https://mrtoddsworkshop.com`.

## 5. Smoke test the live site

1. Open `https://mrtoddsworkshop.com` in a fresh browser.
2. Browse to `/shop`, add a piece to the cart, go through checkout.
3. Use a **real Venmo handle and a $0.01 amount** for your first test (you
   can refund yourself afterwards). Verify:
   - The "Open Venmo" button opens the Venmo app pre-filled.
   - The QR code scans to the same URL from a different phone.
   - The owner notification arrives in your Manus notifications.
   - The order shows up in `/admin/orders` with payment status PENDING.
4. From `/admin/orders`, click the test order and hit **Mark as Paid**. The
   order should automatically advance from PENDING to CONFIRMED.

## 6. Day-to-day workflow

When a customer places an order:

1. You get a Manus notification "New order #MTW-... — Name — $Amount".
2. Watch Venmo for an incoming payment with that exact order number in the
   memo.
3. When it arrives, open `/admin/orders`, find the order, click **Mark as
   Paid**. Status auto-advances to CONFIRMED.
4. Move it through CARVING → FINISHED → SHIPPED as you work it. Adding a
   tracking number is optional but supported.
5. If a payment never lands, you can leave it PENDING or mark the order
   CANCELLED in the same modal — stock automatically returns on next
   checkout reconciliation.

## Troubleshooting

- **"Venmo handle not yet configured" on the payment step.** You haven't
  saved a value in `/admin/settings` yet. Save it; the storefront re-fetches
  on the next page load.
- **Deep link doesn't open the app.** Test on a real mobile device — desktop
  browsers fall back to the "Or open in browser" link, which loads the
  Venmo web profile.
- **DNS won't verify.** Check that you copied the records exactly (including
  trailing dots in CNAME values) and that you haven't disabled DNSSEC at the
  registrar in a way that blocks new records. Run
  `dig mrtoddsworkshop.com +short` to confirm.
- **Migration error about an unknown enum value.** Make sure you ran
  `pnpm db:push` against the *production* `DATABASE_URL`, not a stale dev DB.
