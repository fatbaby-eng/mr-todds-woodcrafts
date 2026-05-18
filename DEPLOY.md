# Deploying mrtoddsworkshop.com

## Quick Start (Docker)

1. Copy the environment file and configure it:
   ```bash
   cp .env.example .env
   # Edit .env with your real values (especially VITE_VENMO_HANDLE and JWT_SECRET)
   ```

2. Build and start:
   ```bash
   docker compose up -d
   ```

3. Run database migrations:
   ```bash
   docker compose exec app node -e "
     const mysql = require('mysql2/promise');
     const fs = require('fs');
     async function migrate() {
       const conn = await mysql.createConnection(process.env.DATABASE_URL);
       const files = fs.readdirSync('./drizzle').filter(f => f.endsWith('.sql')).sort();
       for (const file of files) {
         const sql = fs.readFileSync('./drizzle/' + file, 'utf8');
         for (const stmt of sql.split(';').filter(s => s.trim())) {
           await conn.execute(stmt);
         }
       }
       await conn.end();
       console.log('Migrations complete');
     }
     migrate();
   "
   ```

4. Visit http://localhost:3000

## Deploying to a VPS (DigitalOcean, Linode, etc.)

### Option A: Docker on VPS

1. SSH into your server
2. Install Docker and Docker Compose
3. Clone the repo, set up `.env`, run `docker compose up -d`
4. Point your domain (mrtoddsworkshop.com) DNS A record to your server IP
5. Set up a reverse proxy (nginx/caddy) for HTTPS:

   ```bash
   # Install Caddy (auto-HTTPS)
   sudo apt install -y caddy

   # Create /etc/caddy/Caddyfile:
   # mrtoddsworkshop.com {
   #     reverse_proxy localhost:3000
   # }

   sudo systemctl restart caddy
   ```

### Option B: Railway / Render / Fly.io

These platforms support Docker deployments out of the box:

1. Connect your GitHub repo
2. Set environment variables in the platform dashboard
3. Deploy — the Dockerfile handles the build
4. Add your custom domain in the platform settings

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@host:3306/db` |
| `VITE_VENMO_HANDLE` | Your Venmo username shown at checkout | `@MrToddsWoodcrafts` |
| `JWT_SECRET` | Random secret for session tokens | `your-random-secret-here` |
| `PORT` | Server port (default 3000) | `3000` |
| `NODE_ENV` | Set to `production` for live | `production` |

## DNS Setup for mrtoddsworkshop.com

1. Log into your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
2. Set an **A record** pointing to your server's IP address:
   - Type: `A`
   - Name: `@` (or blank)
   - Value: your server IP (e.g. `143.198.x.x`)
   - TTL: 300
3. Optionally add a `www` CNAME:
   - Type: `CNAME`
   - Name: `www`
   - Value: `mrtoddsworkshop.com`

## Venmo Configuration

The Venmo handle displayed to customers during checkout is controlled by the `VITE_VENMO_HANDLE` environment variable. Update it to match your actual Venmo username.

The checkout flow works like this:
1. Customer fills out info and shipping
2. Customer sees your Venmo handle and the total amount
3. Customer places order (reserves items, decrements stock)
4. Customer sends Venmo payment with order number in the note
5. You mark the order as paid in the admin dashboard
