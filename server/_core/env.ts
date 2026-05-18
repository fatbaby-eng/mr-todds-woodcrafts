export const ENV = {
  appId: process.env.VITE_APP_ID ?? "mrtodds",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "admin-owner",
  isProduction: process.env.NODE_ENV === "production",
};
