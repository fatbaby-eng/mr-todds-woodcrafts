# Mr. Todd's Woodcrafts

Hand-carved kitchen and home objects. Made in Omaha, Nebraska.
Live store at **[mrtoddsworkshop.com](https://mrtoddsworkshop.com)**

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, Tailwind CSS v4, shadcn/ui |
| Backend | Express + tRPC |
| Database | MySQL (Drizzle ORM) |
| Payments | Venmo (manual deep-link flow) |
| Images | AWS S3 |

---

## Deployment (Railway — recommended)

[Railway](https://railway.app) is the easiest one-click host for this stack. It provides Node.js hosting + MySQL in the same project.

### 1. Create a Railway project

1. Go to [railway.app](https://railway.app) → New Project
2. Add a **MySQL** plugin
3. Add a **GitHub** service pointing at this repo

### 2. Set environment variables

In the Railway service settings, add every variable from `.env.example`. The critical ones:

| Variable | What to put |
|----------|-------------|
| `DATABASE_URL` | Copy from the Railway MySQL plugin's `DATABASE_URL` variable |
| `JWT_SECRET` | Any random 32-byte hex string — run `openssl rand -hex 32` |
| `OWNER_OPEN_ID` | Your login sub (see step 5 below) |
| `VENMO_USERNAME` | Your Venmo handle **without** the @ (e.g. `todd-woodcrafts`) |
| `VITE_VENMO_USERNAME` | Same as above — used by the browser to build the one-tap link |
| `NODE_ENV` | `production` |

> **VITE_VENMO_USERNAME is a build-time variable.** Railway supports Docker build args. In the Railway service → Settings → Build → "Build Arguments", add `VITE_VENMO_USERNAME=your-handle`.

### 3. Apply database migrations

Once deployed, open the Railway shell and run:

```bash
pnpm run db:push
```

Or run the migration SQL directly against your database:

```bash
mysql -h HOST -u USER -pPASS DATABASE < drizzle/0000_normal_goblin_queen.sql
mysql -h HOST -u USER -pPASS DATABASE < drizzle/0001_curly_jasper_sitwell.sql
mysql -h HOST -u USER -pPASS DATABASE < drizzle/0002_high_centennial.sql
mysql -h HOST -u USER -pPASS DATABASE < drizzle/0003_add_venmo_payment.sql
```

### 4. Point your domain

In Railway → Service → Settings → Domains, add `mrtoddsworkshop.com` and `www.mrtoddsworkshop.com`. Then in your domain registrar's DNS:

- `A` record: `@` → Railway IP (shown in dashboard)
- `CNAME` record: `www` → your Railway hostname

### 5. Set yourself as admin

After first visiting the site and logging in with Google/GitHub:

```sql
SELECT * FROM users;
-- Copy your openId value
```

Set `OWNER_OPEN_ID` to that value in Railway, then redeploy. You can now access `/admin`.

### 6. Seed products

Run in the Railway shell:

```bash
node seed-real-products.mjs
```

---

## Alternative: Docker (any VPS / Fly.io / Render)

```bash
# Build with your Venmo username baked in
docker build \
  --build-arg VITE_VENMO_USERNAME=your-venmo-handle \
  -t mrtodds-woodcrafts .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://..." \
  -e JWT_SECRET="..." \
  -e OWNER_OPEN_ID="..." \
  -e VENMO_USERNAME="your-venmo-handle" \
  -e NODE_ENV=production \
  mrtodds-woodcrafts
```

---

## Local Development

```bash
# Install deps
pnpm install

# Copy and fill in environment
cp .env.example .env

# Start dev server (hot reload)
pnpm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## How Venmo Payments Work

The checkout flow is fully manual — no Venmo API or OAuth required:

1. Customer fills in contact info and shipping address
2. Customer clicks **"Place Order — Pay via Venmo"**
3. Order is saved in the database with status `PENDING` / payment `PENDING`
4. Customer is shown a payment card with:
   - Todd's Venmo handle
   - Exact dollar amount
   - Order number as the payment note
   - "Open Venmo App" deep-link button (works on mobile)
   - Fallback link to venmo.com on desktop
5. Todd receives the Venmo notification and can mark the order `CONFIRMED` in `/admin/orders`

**No customer Venmo account is required on the merchant side.** Todd just needs to have a Venmo account and set `VITE_VENMO_USERNAME` to his handle.

---

## Admin Panel

Visit `/admin` — only accessible after logging in as the owner (set via `OWNER_OPEN_ID`).

| Route | Purpose |
|-------|---------|
| `/admin` | Dashboard stats |
| `/admin/products` | Add / edit / delete products |
| `/admin/orders` | View orders, mark paid/shipped |
| `/admin/inventory` | Wood blank tracker |
| `/admin/subscribers` | Newsletter list |

---

## AWS S3 (optional — for image uploads)

Product image uploads in the admin panel require an S3 bucket. Set these env vars:

```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_BUCKET_NAME=
```

If these are not set, image upload will be unavailable but the rest of the site works fine.
