# Mr. Todd's Woodcrafts launch checklist

Use this checklist before pointing `mrtoddsworkshop.com` at production.

## Required environment

- `DATABASE_URL`: production MySQL connection string.
- `VITE_VENMO_HANDLE`: Venmo username without `@`. Defaults to `mrtoddsworkshop` if unset; verify this is the correct recipient before launch.
- Existing platform auth/notification settings used by the app, including owner/admin identity and notification service secrets.

## Database

1. Run migrations:

   ```sh
   pnpm db:push
   ```

2. Seed real product listings if production is empty:

   ```sh
   node seed-real-products.mjs
   ```

3. Sign in as the owner/admin and confirm:
   - products have correct prices, photos, quantities, and statuses;
   - out-of-stock one-of-a-kind pieces are `SOLD_OUT`;
   - made-to-order pieces have realistic lead times.

## Launch verification

1. Place a low-value test order through `/shop`.
2. Confirm the order confirmation page shows:
   - the expected Venmo handle;
   - the exact order total;
   - the order number in the Venmo note.
3. Confirm the order appears in `/admin/orders`.
4. Mark the order payment status as `PAID` after the Venmo payment arrives.
5. Point DNS for `mrtoddsworkshop.com` to the deployed app and verify the HTTPS certificate.
