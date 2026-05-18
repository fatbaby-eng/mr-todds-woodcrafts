import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Products ─────────────────────────────────────────────────────────────────
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  price: int("price").notNull(), // in cents
  woodType: mysqlEnum("woodType", ["CHERRY", "WALNUT", "MAPLE", "MIXED", "OTHER"]).notNull().default("MIXED"),
  category: mysqlEnum("category", ["SPOON", "KNIFE", "SCOOP", "SERVING", "CUSTOM"]).notNull().default("SPOON"),
  status: mysqlEnum("status", ["IN_STOCK", "MADE_TO_ORDER", "SOLD_OUT", "RETIRED"]).notNull().default("IN_STOCK"),
  quantity: int("quantity").notNull().default(0),
  leadTimeDays: int("leadTimeDays"),
  featured: boolean("featured").notNull().default(false),
  images: json("images").$type<string[]>().notNull(),
  dimensions: varchar("dimensions", { length: 100 }),
  careInstructions: text("careInstructions"),
  weight: int("weight"), // in grams
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 32 }).notNull().unique(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 32 }),
  shippingAddress: json("shippingAddress").$type<{
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }>().notNull(),
  status: mysqlEnum("status", ["PENDING", "CONFIRMED", "CARVING", "FINISHED", "SHIPPED", "DELIVERED", "CANCELLED"]).notNull().default("PENDING"),
  paymentStatus: mysqlEnum("paymentStatus", ["PENDING", "PAID", "REFUNDED"]).notNull().default("PENDING"),
  paymentMethod: mysqlEnum("paymentMethod", ["VENMO", "STRIPE", "PAYPAL", "CASH", "CHECK"]).notNull().default("VENMO"),
  totalAmount: int("totalAmount").notNull(), // cents
  shippingCost: int("shippingCost").notNull().default(0), // cents
  taxAmount: int("taxAmount").notNull().default(0), // cents
  trackingNumber: varchar("trackingNumber", { length: 128 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ─── Order Items ──────────────────────────────────────────────────────────────
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId"),
  productName: varchar("productName", { length: 255 }).notNull(),
  productSlug: varchar("productSlug", { length: 255 }),
  price: int("price").notNull(), // cents, snapshot at time of order
  quantity: int("quantity").notNull(),
  woodType: varchar("woodType", { length: 32 }),
  imageUrl: text("imageUrl"),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// ─── Wood Blanks (Inventory) ──────────────────────────────────────────────────
export const woodBlanks = mysqlTable("wood_blanks", {
  id: int("id").autoincrement().primaryKey(),
  woodType: mysqlEnum("woodType", ["CHERRY", "WALNUT", "MAPLE", "MIXED", "OTHER"]).notNull(),
  dimensions: varchar("dimensions", { length: 100 }),
  source: varchar("source", { length: 255 }),
  acquiredDate: timestamp("acquiredDate"),
  cost: int("cost").default(0), // cents
  status: mysqlEnum("status", ["RAW", "ROUGH_CUT", "CARVING", "FINISHED", "SOLD"]).notNull().default("RAW"),
  productId: int("productId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WoodBlank = typeof woodBlanks.$inferSelect;
export type InsertWoodBlank = typeof woodBlanks.$inferInsert;

// ─── Trade Shows ──────────────────────────────────────────────────────────────
export const tradeShows = mysqlTable("trade_shows", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  address: text("address"),
  boothNumber: varchar("boothNumber", { length: 64 }),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  isActive: boolean("isActive").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TradeShow = typeof tradeShows.$inferSelect;
export type InsertTradeShow = typeof tradeShows.$inferInsert;

// ─── Subscribers ──────────────────────────────────────────────────────────────
export const subscribers = mysqlTable("subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  source: mysqlEnum("source", ["WEBSITE", "TRADE_SHOW", "INSTAGRAM"]).notNull().default("WEBSITE"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = typeof subscribers.$inferInsert;

// ─── Cart Sessions (server-side persistence) ──────────────────────────────────
export const cartSessions = mysqlTable("cart_sessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull().unique(),
  items: json("items").$type<Array<{
    productId: number;
    quantity: number;
    price: number;
    name: string;
    imageUrl?: string;
    woodType?: string;
    slug: string;
  }>>().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CartSession = typeof cartSessions.$inferSelect;
export type InsertCartSession = typeof cartSessions.$inferInsert;

// ─── Site Settings (key/value, admin configurable) ────────────────────────────
// Used to store the shop's Venmo handle, contact email, and other small bits
// of business config without redeploying. Read by public storefront for the
// Venmo handle (so the checkout deep link / QR works); write is admin-only.
export const siteSettings = mysqlTable("site_settings", {
  settingKey: varchar("settingKey", { length: 64 }).notNull().primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;
