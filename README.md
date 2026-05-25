# Mr. Todd's Woodcrafts

A custom e-commerce web application and administration platform for Mr. Todd's Woodcrafts, an Omaha-based woodworking business specializing in handmade culinary boards, spatulas, and custom commissions.

## Features

- **Storefront**: A beautifully designed public storefront featuring a premium, dark-mode inspired aesthetic.
- **Dynamic Cart & Checkout**: A session-based shopping cart and a streamlined checkout flow.
- **Custom Product Builder**: Products can be configured with complex custom options (e.g. wood type, sizes, add-ons) which automatically adjust pricing.
- **Admin Dashboard**: A secure, mobile-optimized admin panel to manage the business:
  - **Orders**: View, manage, and process incoming customer orders.
  - **Products**: A visual builder to add and manage product listings, manage image galleries, and configure custom pricing logic.
  - **Inventory**: Track raw material (Wood Blanks) inventory and sources.
  - **Inbox**: Intercepts public contact form submissions and organizes them in a direct admin inbox.
  - **Trade Shows**: Manage upcoming physical trade show appearances, which automatically appear on the public site.
  - **Subscribers**: Manage email newsletter signups.
- **Kiosk Mode**: A dedicated POS/Display view designed to be run on a tablet during in-person Trade Shows to showcase products.

## Tech Stack

- **Frontend**: React, TypeScript, Wouter (Routing), TailwindCSS
- **Backend**: Node.js, Express, tRPC
- **Database**: MySQL, Drizzle ORM
- **UI Components**: shadcn/ui, Radix UI, Lucide React (Icons)
- **Styling**: Vanilla CSS + Tailwind, utilizing premium typography (Cinzel, Lora, Inter).

## Mobile Optimization

The Admin Dashboard and public Storefront are both heavily optimized for mobile devices (tested for Galaxy S25 Ultra and modern iPhones), ensuring you can manage inventory, process orders, and reply to customers directly from your phone while on the go or at a trade show.

## Recent Updates
- Overhauled the Admin Dashboard for responsive mobile displays.
- Added an **Admin Inbox** to capture and manage customer messages from the public Contact page.
- Implemented robust parsing for Custom Product Options to handle complex dropdown logic securely.
- Updated to use real email addresses for communication parsing.
