# Mr. Todd's Woodcrafts - Launch Instructions

## ✅ What's Been Completed

- Full React + Node.js e-commerce site built
- Stripe payment integration (Payment Elements)
- Database schema ready (MySQL)
- Admin dashboard for order/inventory management  
- Responsive design & accessibility
- Kiosk mode for trade shows

## 🚀 Launch Checklist

### Step 1: Local Testing (Do This First)
```bash
cd mr-todds-woodcrafts

# Install dependencies
pnpm install

# Create .env.development for local testing
# Copy .env.example to .env.development and fill in:
# - DATABASE_URL (local or dev database)
# - STRIPE_PUBLISHABLE_KEY (test key from Stripe)
# - JWT_SECRET (any random 32+ character string)

# Start dev server
pnpm dev
# Visit http://localhost:3000

# Run tests (optional but recommended)
pnpm test

# Verify checkout works (use Stripe test card: 4242 4242 4242 4242)
```

### Step 2: Build Production Bundle
```bash
pnpm build
# Creates dist/ folder with compiled code
```

### Step 3: Set Up Stripe

1. **Get Stripe Keys**:
   - Go to https://dashboard.stripe.com
   - Sidebar → Developers → API Keys
   - Copy both test and live keys
   - You'll switch from test to live keys after launch

2. **Set Test Keys Locally** (for final testing):
   - Add to `.env.development`:
     ```
     STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
     STRIPE_SECRET_KEY=sk_test_xxxxx
     ```

3. **Stripe Webhook** (optional but recommended for production):
   - Dashboard → Developers → Webhooks
   - Add endpoint: `https://www.mrtoddsworkshop.com/api/stripe-webhook`
   - Subscribe to: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Add webhook signing secret to production `.env`:
     ```
     STRIPE_WEBHOOK_SECRET=whsec_xxxxx
     ```

### Step 4: Database Setup

1. **Get or Create MySQL Database**:
   - Options: AWS RDS, DigitalOcean, Render, Planetscale, etc.
   - Get your DATABASE_URL (format: `mysql://user:pass@host:3306/dbname`)

2. **Run Migrations**:
   ```bash
   pnpm db:push
   # Creates all tables in your database
   ```

3. **Seed Products** (if not already done):
   ```bash
   pnpm node seed-real-products.mjs
   # This populates products you've already set up
   ```

### Step 5: Deploy to Hosting

#### Option A: Vercel (Recommended - Easiest)
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel deploy

# 3. Set up environment variables in Vercel Dashboard:
#    Go to Settings → Environment Variables
#    Add all from .env.example:
#    - DATABASE_URL
#    - JWT_SECRET  
#    - STRIPE_SECRET_KEY
#    - STRIPE_PUBLISHABLE_KEY
#    - (others from .env.example)

# 4. Redeploy after setting env vars
vercel deploy --prod
```

#### Option B: Railway
```bash
# 1. Connect GitHub repo to Railway
# 2. Add MySQL plugin for database
# 3. Set environment variables in Railway dashboard
# 4. Deploy automatically
```

#### Option C: Render
Similar to Railway - connect repo, set env vars, deploy

### Step 6: Point Domain to Hosting

1. **In Cloudflare Dashboard**:
   - Go to DNS settings for mrtoddsworkshop.com
   - Add CNAME record pointing to your hosting:
     - **Vercel**: `cname.vercel-dns.com`
     - **Railway/Render**: Check their docs for your deployment's DNS
   - Wait for DNS propagation (usually 5-30 minutes)

2. **Test Domain**:
   ```bash
   curl https://www.mrtoddsworkshop.com
   # Should return HTML (no certificate errors)
   ```

### Step 7: Final Production Setup

1. **Switch Stripe to Live Mode**:
   - Update `.env` in production with live keys:
     ```
     STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
     STRIPE_SECRET_KEY=sk_live_xxxxx
     ```
   - Redeploy to production

2. **Test End-to-End**:
   - Visit https://www.mrtoddsworkshop.com/shop
   - Add item to cart
   - Checkout with real card (or test card for Stripe)
   - Verify order appears in admin dashboard

3. **Admin Access**:
   - Set up admin account (requires OAuth or manual setup)
   - Go to `/admin` to manage orders/inventory

### Step 8: Post-Launch Monitoring

- Check error logs (Vercel/Railway dashboard)
- Monitor orders in admin dashboard
- Set up email notifications (optional):
  - Consider: SendGrid, Resend, or AWS SES for transactional emails
  - Send order confirmations + shipping updates

## 📋 Environment Variables Reference

```env
# REQUIRED
DATABASE_URL=mysql://user:password@host:3306/dbname
JWT_SECRET=your-secret-min-32-characters
STRIPE_PUBLISHABLE_KEY=pk_test_or_pk_live_xxxxx
STRIPE_SECRET_KEY=sk_test_or_sk_live_xxxxx

# OPTIONAL
STRIPE_WEBHOOK_SECRET=whsec_xxxxx (for webhook verification)
NODE_ENV=production
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_or_pk_live_xxxxx (same as above)
```

## 🔧 Troubleshooting

### Build Fails
```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### Database Connection Error
- Check DATABASE_URL is correct
- Ensure database is accessible from hosting platform
- Verify credentials and port (usually 3306)

### Stripe Payment Form Not Showing
- Check STRIPE_PUBLISHABLE_KEY is set in Vercel/Railway env vars
- Verify key starts with `pk_test_` or `pk_live_`
- Check browser console for errors

### Domain Not Resolving
- Wait for Cloudflare DNS propagation (5-30 min)
- Run `nslookup mrtoddsworkshop.com` to check DNS
- Ensure CNAME record is correct in Cloudflare

## 📞 Support & Next Steps

- **Stripe Docs**: https://stripe.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Database Setup**: Depends on provider (see their docs)
- **Email Setup** (optional): Look into SendGrid, Resend, or AWS SES

## Summary

The site is production-ready. Main steps:
1. Install dependencies locally
2. Build production bundle
3. Set up Stripe + Database
4. Deploy to Vercel/Railway/Render  
5. Point domain via Cloudflare
6. Switch Stripe to live mode
7. Test everything works!

Good luck! 🎉
