# Mr. Todd's Woodcrafts — Project TODO

## Phase 1: Schema, API, Dependencies
- [x] Install qrcode, stripe packages
- [x] Define full DB schema (products, orders, order_items, wood_blanks, trade_shows, subscribers, cart_sessions)
- [x] Generate and apply DB migration SQL
- [x] Write server/db.ts query helpers for all tables
- [x] Write tRPC routers: products, orders, inventory, tradeShows, cart, checkout, subscribers
- [x] Seed demo products and trade show data

## Phase 2: Brand Assets
- [x] Generate hero banner image (workshop/woodcraft scene)
- [x] Generate 6 product placeholder images (spoons, knives, scoops, serving boards)
- [x] Upload all assets via manus-upload-file --webdev

## Phase 3: Design System & Layout
- [x] Configure Tailwind with wood color tokens (--wood-dark, --wood-medium, --wood-light, --amber, --cream, --gold)
- [x] Add Cinzel + Lora + Inter fonts from Google Fonts
- [x] Build PublicLayout (top nav + footer)
- [x] Build navigation with cart icon + item count badge
- [x] Build Footer with newsletter signup

## Phase 4: Public Pages
- [x] Homepage: hero, featured products, brand story, process steps, newsletter CTA
- [x] Shop page: product grid, category filter, search, sort
- [x] Product Detail page: image gallery, add to cart, request custom version
- [x] About page: story, process, workshop gallery
- [x] Contact page: contact form + trade show schedule table

## Phase 5: E-Commerce Engine
- [x] Cart context (localStorage persistence, no login required)
- [x] Cart drawer (slide-in from right, quantity controls, remove item)
- [x] Checkout flow: Step 1 customer info, Step 2 shipping, Step 3 payment placeholder, Step 4 confirmation
- [x] Order confirmation page with order number

## Phase 6: Admin Dashboard
- [x] Admin layout with sidebar navigation (protected, owner-only)
- [x] Products CRUD: list, create, edit, delete with image upload
- [x] Orders list with status update workflow
- [x] Inventory tracker: wood blanks list, add/edit, low-stock alerts
- [x] Trade show schedule: add/edit/delete shows
- [x] Dashboard home with summary stats (products, orders, low stock alerts)

## Phase 7: Kiosk Mode
- [x] /kiosk route: fullscreen auto-rotating product showcase
- [x] 30-second interval rotation with progress indicator
- [x] Large typography for 5-10 ft viewing distance
- [x] QR code per product (scan to buy)
- [x] No navigation chrome, touch-friendly
- [x] Screensaver/attract loop after 2 minutes of inactivity

## Phase 8: Polish & Delivery
- [x] Write vitest tests for core tRPC procedures (23 tests, all passing)
- [x] Responsive design verification (mobile, tablet, desktop, 1920x1080)
- [x] Accessibility pass (contrast, alt text, keyboard nav)
- [x] Save checkpoint and deliver

## Site Revisions (May 10, 2026)
- [x] Rewrite About page bio with real origin story (three trees, mother-in-law, walnut kills cherry/apricot)
- [x] Remove "Upcoming Shows" section from About page entirely (fake shows)
- [x] Remove "Upcoming Shows" section from Home page (conditional render, but delete trade show data too)
- [x] Remove placeholder products (ids 1-7) from database — keep only real products (30001-30004)
- [x] Replace "Featured Pieces" section on homepage with "New pieces coming soon. Sign up below to be notified." holding message (shown only when no products exist; real products now show instead)
- [x] Update tagline on homepage hero from generic copy to "Measured in Grain and Grace"
- [x] Update Brand Story section on homepage with real copy (no grandfather, no rural Nebraska)
- [x] Update Values section — remove "Sustainably Sourced" (marketing language), fix wood species to cherry/walnut/apricot only
- [x] Delete fake trade show records from database

## Product & Copy Fixes (May 10, 2026)
- [x] Upload second photo of wave spoon (20260509_065935.jpg — bowl side view) to storage
- [x] Update product 30003: rename from "Cherry Wood Wave Sculpture" to "Cherry Wood Wave Spoon", change category from CUSTOM to SPOON, update description to reflect it is a spoon with a wave handle and a bowl, add second photo to images array
- [x] Fix origin story copy on About page and Home page: "2 cherry and 2 apricot trees" (not "a couple of cherry and a couple of apricot"), note 3 harvested so far with 1 apricot still standing
- [x] Update Etsy listing and Instagram post in new_product_listings_and_posts.md to match corrected product description

## Image Display Fix (May 10, 2026)
- [x] Fix product detail page image: too tightly cropped on mobile, cutting off top and bottom of piece. Change from object-cover fill to object-contain so full piece is always visible with background padding.
- [x] Add second photo to coffee scoop (20260510_193238.jpg — full piece on table, ring handle and bowl both visible)

## Brief v2 Updates (May 11, 2026)
- [x] Fix bio voice: rewrite "Started with Four Trees" section to first person on both About and Home pages, include confirmed apricot line in first person
- [x] Update homepage hero copy to: "Hand-carved kitchen and home objects shaped by the wood as much as the hand. Cherry, walnut, apricot, and other hardwoods. One of one."
- [x] Remove "From Tree to Table — The Process" section from homepage entirely
- [x] Apply real product descriptions to all 4 products in database (three-beat format: what it is, wood origin, practical details)
- [x] Update footer brand statement to: "Hand-carved kitchen and home objects. Material-led, one of one. Made in Omaha, Nebraska."
- [x] Add visible placeholder note in admin/site flagging hero image as needing replacement with real workshop photo (TODO comment in code + dimmed overlay on About page workshop image)
- [x] Enforce voice guardrails: first person, "one of one", no em dashes, no marketing language throughout

## Launch — Venmo Payments + mrtoddsworkshop.com Go-Live (May 18, 2026)
- [x] Add `site_settings` table + DB helpers for owner-configurable shop config
- [x] Add `VENMO` to the `orders.paymentMethod` enum and default new orders to VENMO
- [x] Surface `settings.publicAll` to the storefront and `settings.adminAll` + `update` to the admin
- [x] Replace the "Todd will contact you within 24 hours" checkout step with a real Venmo payment screen: amount, recipient, memo, `venmo://` deep link, web fallback, QR code
- [x] Notify the shop owner via `notifyOwner` on every new order (line items, total, shipping address)
- [x] Build `/admin/settings` page: Venmo handle, contact email, contact phone, shop-live toggle
- [x] Add payment column + "Mark as Paid" quick action to the admin orders list/detail
- [x] Wire the public contact page to the admin-configured contact email/phone
- [x] Write `DEPLOYMENT.md` (settings, db migration, deploy, DNS for mrtoddsworkshop.com, smoke test, day-to-day workflow)
- [ ] **Owner action** — log in to `/admin/settings`, fill in your Venmo handle and contact email, save
- [ ] **Owner action** — push migration to prod (`pnpm db:push` with prod `DATABASE_URL`)
- [ ] **Owner action** — click Deploy in the Manus dashboard
- [ ] **Owner action** — point `mrtoddsworkshop.com` DNS at the Manus deployment (see `DEPLOYMENT.md`)
