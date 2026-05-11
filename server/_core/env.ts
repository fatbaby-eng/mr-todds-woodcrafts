export const ENV = {
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  adminSessionSecret:
    process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  baseUrl: process.env.BASE_URL ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  isProduction: process.env.NODE_ENV === "production",
};
