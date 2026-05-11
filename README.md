# Mr. Todd's Woodcrafts - E-Commerce Site

A beautifully designed, made-to-order woodcraft e-commerce platform with Stripe payment processing, admin dashboard, and kiosk mode for trade shows.

## Features

- **Shop**: Browse hand-carved wooden pieces (spoons, serving boards, knives, scoops)
- **Cart & Checkout**: Add to cart, multi-step checkout with shipping info
- **Stripe Payments**: Secure payment processing via Stripe
- **Admin Dashboard**: Manage products, orders, inventory, and trade show schedules
- **Kiosk Mode**: Full-screen auto-rotating product showcase with QR codes
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Product Management**: Upload images, set prices, manage stock
- **Order Tracking**: See order status from admin panel

## Tech Stack

**Frontend**:
- React 19
- TypeScript
- Vite (fast dev server & builds)
- Tailwind CSS
- Radix UI components
- tRPC (type-safe API)

**Backend**:
- Node.js + Express
- tRPC (RPC framework)
- Drizzle ORM (database)
- Stripe SDK
- MySQL/MariaDB

**Deployment**:
- Vercel (recommended)
- Cloudflare DNS
- AWS S3 (optional, for image hosting)

## Quick Start

### Development
```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
# Open http://localhost:3000

# Run tests
pnpm test

# Type checking
pnpm check
```

### Production Build
```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
mr-todds-woodcrafts/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components (Shop, Checkout, Admin, etc.)
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts (Cart, Auth, etc.)
│   │   ├── lib/           # Utilities (tRPC client, etc.)
│   │   └── index.css      # Tailwind CSS
│   └── public/
├── server/                 # Node.js backend
│   ├── _core/             # Core server setup
│   ├── routers.ts         # tRPC procedures
│   ├── db.ts              # Database queries
│   ├── stripe.ts          # Stripe utilities
│   └── storage.ts         # File upload handling
├── shared/                # Shared types & constants
├── drizzle/               # Database schema & migrations
├── package.json           # Dependencies
├── vite.config.ts         # Vite config
└── vercel.json            # Vercel deployment config
```

## Environment Variables

See `.env.example` for all variables. Key ones:

```env
DATABASE_URL=mysql://...
JWT_SECRET=...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

## Deployment

See **LAUNCH_INSTRUCTIONS.md** for detailed deployment steps.

**Quick summary**:
1. `pnpm install` → Install dependencies
2. `pnpm build` → Build production bundle
3. Deploy to Vercel/Railway/Render
4. Set environment variables in hosting platform
5. Point domain via Cloudflare
6. Switch Stripe to live mode

## Product Catalog

Currently includes 4 real handmade pieces:
- Cherry Wood Wave Spoon (SPOON)
- Cherry Wood Serving Spoon (SPOON)  
- Coffee Scoop (SCOOP)
- Cherry Wood Serving Board (SERVING)

All made from cherry, walnut, and apricot wood harvested from 4 trees.

## Admin Dashboard

Access at `/admin` (requires authentication).

Features:
- **Products**: List, create, edit, delete products with image uploads
- **Orders**: View orders, update status, add tracking numbers
- **Inventory**: Track wood blanks and stock levels
- **Dashboard**: Sales stats and low-stock alerts
- **Trade Shows**: Manage show schedules

## Kiosk Mode

Full-screen product showcase for trade shows:
- Access at `/kiosk`
- Auto-rotates products every 30 seconds
- Shows QR code for each product (scan to buy)
- Attractive for 5-10 ft viewing distance
- Screensaver mode after 2 minutes inactivity

## Payment Processing

Stripe integration:
- **Test Mode**: Use Stripe test cards (4242 4242 4242 4242) before launch
- **Live Mode**: Switch to live keys in production
- **Automatic**: Payment intents created server-side for security
- **Webhook**: (Optional) Configure Stripe webhook for payment confirmation

## Support

For questions or issues:
- Check LAUNCH_INSTRUCTIONS.md for deployment help
- Review environment variables in .env.example
- Check browser console and server logs for errors
- See package.json for available npm scripts

## License

© Mr. Todd's Woodcrafts - All rights reserved

---

**Made with ❤️ for beautiful handcrafted wood goods**
