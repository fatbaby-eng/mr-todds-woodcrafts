# 🚀 Mr. Todd's Woodcrafts - Launch Quickstart

## Pre-Launch Checklist (Do These Now)

- [ ] Have Stripe Account with test API keys ready
- [ ] Have MySQL database URL ready (AWS RDS, DigitalOcean, etc.)
- [ ] Generate a JWT_SECRET: `openssl rand -hex 32`
- [ ] Have Cloudflare dashboard access for DNS configuration

## Local Testing (5 minutes)

```bash
cd mr-todds-woodcrafts

# 1. Install
pnpm install

# 2. Create .env.development
cat > .env.development << EOF
DATABASE_URL=mysql://user:pass@localhost:3306/test
JWT_SECRET=test-secret-32-chars-or-more-long
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
NODE_ENV=development
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
EOF

# 3. Run locally
pnpm dev
# Visit http://localhost:3000
# Add item to cart
# Test checkout with card: 4242 4242 4242 4242, exp: 12/25, cvc: 123
```

## Build for Production

```bash
pnpm build
# Creates dist/ folder (~3-5 MB)
```

## Deploy (Choose One)

### Vercel (Easiest - 2 minutes)
```bash
npm install -g vercel
vercel deploy --prod

# Then in Vercel dashboard → Settings → Environment Variables:
# DATABASE_URL
# JWT_SECRET  
# STRIPE_PUBLISHABLE_KEY
# STRIPE_SECRET_KEY
# NODE_ENV=production
# VITE_STRIPE_PUBLISHABLE_KEY

# Redeploy
vercel deploy --prod
```

### Railway (3 minutes)
1. Go to railway.app
2. Connect GitHub repo
3. Add MySQL plugin
4. Add environment variables (same as above)
5. Auto-deploys

### Render (3 minutes)
1. Go to render.com
2. New Web Service → Connect GitHub
3. Buildcommand: `npm run build`
4. Start command: `npm run start`
5. Add environment variables
6. Deploy

## Configure Domain (Cloudflare)

1. Go to Cloudflare DNS
2. Add CNAME:
   - Name: www
   - Target: your-deployment-url.vercel.app (or railway/render equivalent)
3. Wait 5-30 minutes for DNS propagation
4. Test: `curl https://www.mrtoddsworkshop.com`

## Switch Stripe to Live (Last Step!)

1. Get live keys from Stripe dashboard
2. Update in production environment:
   - STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
   - STRIPE_SECRET_KEY=sk_live_xxxxx
3. Redeploy
4. Test with real card

## Verify Launch

- [ ] https://www.mrtoddsworkshop.com loads
- [ ] Shop page shows 4 products
- [ ] Add item → Cart works
- [ ] Checkout shows Stripe payment form
- [ ] Test payment processes (use test card if Stripe test mode)
- [ ] Order appears in /admin dashboard

## After Launch

- Monitor orders in /admin
- Check error logs in hosting platform
- (Optional) Set up email notifications
- (Optional) Configure Stripe webhooks
- Switch Stripe from test to live mode

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | `rm -rf node_modules && pnpm install && pnpm build` |
| Payment form not showing | Check VITE_STRIPE_PUBLISHABLE_KEY in env vars |
| Database connection error | Verify DATABASE_URL, check firewall rules |
| Domain not working | Wait for DNS, check CNAME record in Cloudflare |
| Can't access /admin | User needs admin role in database |

## Important Env Variables

```
DATABASE_URL=mysql://user:pass@host/dbname
JWT_SECRET=<random 32+ char string>
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx (→ pk_live_xxxxx after launch)
STRIPE_SECRET_KEY=sk_test_xxxxx (→ sk_live_xxxxx after launch)
NODE_ENV=production
VITE_STRIPE_PUBLISHABLE_KEY=<same as STRIPE_PUBLISHABLE_KEY>
```

## Need Help?

- See LAUNCH_INSTRUCTIONS.md for detailed steps
- Check .env.example for all available variables
- Review README.md for project overview

**Status: ✅ Ready to launch!**

Your site is production-ready. Follow the steps above and you'll be live in ~15-30 minutes.
