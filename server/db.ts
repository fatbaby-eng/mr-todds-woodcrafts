import { and, or, asc, desc, eq, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  cartSessions,
  orderItems,
  orders,
  products,
  subscribers,
  tradeShows,
  users,
  woodBlanks,
  contactMessages,
  siteContent,
  type InsertProduct,
  type InsertOrder,
  type InsertOrderItem,
  type InsertWoodBlank,
  type InsertTradeShow,
  type InsertSubscriber,
  type InsertCartSession,
  type InsertContactMessage,
  type InsertSiteContent,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value !== undefined) {
      values[field] = value ?? null;
      updateSet[field] = value ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── Products ─────────────────────────────────────────────────────────────────
export async function getProducts(opts?: {
  category?: string;
  woodType?: string;
  status?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(products).$dynamic();
  const conditions = [];
  if (opts?.category) conditions.push(eq(products.category, opts.category as any));
  if (opts?.woodType) conditions.push(eq(products.woodType, opts.woodType as any));
  if (opts?.status) conditions.push(eq(products.status, opts.status as any));
  if (opts?.featured !== undefined) conditions.push(eq(products.featured, opts.featured));
  if (opts?.search) {
    conditions.push(
      or(
        like(products.name, `%${opts.search}%`),
        like(products.description, `%${opts.search}%`)
      )
    );
  }
  // Exclude retired by default for public
  if (!opts?.status) conditions.push(sql`${products.status} != 'RETIRED'`);
  if (conditions.length > 0) query = query.where(and(...conditions));
  query = query.orderBy(desc(products.createdAt));
  if (opts?.limit) query = query.limit(opts.limit);
  if (opts?.offset) query = query.offset(opts.offset);
  return query;
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0];
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(products).values(data);
  return result;
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(products).where(eq(products.id, id));
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function getOrders(opts?: { status?: string; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(orders).$dynamic();
  if (opts?.status) query = query.where(eq(orders.status, opts.status as any));
  query = query.orderBy(desc(orders.createdAt));
  if (opts?.limit) query = query.limit(opts.limit);
  if (opts?.offset) query = query.offset(opts.offset);
  return query;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0];
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result[0];
}

export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(orders).values(data);
  return result;
}

export async function updateOrderStatus(id: number, status: string, trackingNumber?: string) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const updateData: Record<string, unknown> = { status };
  if (trackingNumber) updateData.trackingNumber = trackingNumber;
  await db.update(orders).set(updateData).where(eq(orders.id, id));
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function createOrderItems(items: InsertOrderItem[]) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  if (items.length === 0) return;
  await db.insert(orderItems).values(items);
}

export async function deleteOrder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(orderItems).where(eq(orderItems.orderId, id));
  await db.delete(orders).where(eq(orders.id, id));
}

// ─── Wood Blanks ──────────────────────────────────────────────────────────────
export async function getWoodBlanks(opts?: { woodType?: string; status?: string }) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(woodBlanks).$dynamic();
  const conditions = [];
  if (opts?.woodType) conditions.push(eq(woodBlanks.woodType, opts.woodType as any));
  if (opts?.status) conditions.push(eq(woodBlanks.status, opts.status as any));
  if (conditions.length > 0) query = query.where(and(...conditions));
  return query.orderBy(desc(woodBlanks.createdAt));
}

export async function createWoodBlank(data: InsertWoodBlank) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(woodBlanks).values(data);
}

export async function updateWoodBlank(id: number, data: Partial<InsertWoodBlank>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(woodBlanks).set(data).where(eq(woodBlanks.id, id));
}

export async function deleteWoodBlank(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(woodBlanks).where(eq(woodBlanks.id, id));
}

// ─── Trade Shows ──────────────────────────────────────────────────────────────
export async function getTradeShows(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(tradeShows).$dynamic();
  if (activeOnly) query = query.where(eq(tradeShows.isActive, true));
  return query.orderBy(asc(tradeShows.startDate));
}

export async function createTradeShow(data: InsertTradeShow) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(tradeShows).values(data);
}

export async function updateTradeShow(id: number, data: Partial<InsertTradeShow>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(tradeShows).set(data).where(eq(tradeShows.id, id));
}

export async function deleteTradeShow(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(tradeShows).where(eq(tradeShows.id, id));
}

// ─── Subscribers ──────────────────────────────────────────────────────────────
export async function addSubscriber(data: InsertSubscriber) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(subscribers).values(data).onDuplicateKeyUpdate({ set: { source: data.source } });
}

export async function getSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscribers).orderBy(desc(subscribers.createdAt));
}

export async function deleteSubscriber(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(subscribers).where(eq(subscribers.id, id));
}

// ─── Contact Messages ─────────────────────────────────────────────────────────
export async function getContactMessages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
}

export async function createContactMessage(data: InsertContactMessage) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(contactMessages).values(data);
}

export async function updateContactMessageStatus(id: number, status: "unread" | "read" | "archived") {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id));
}

export async function deleteContactMessage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
}

// ─── Cart Sessions ────────────────────────────────────────────────────────────
export async function getCartSession(sessionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(cartSessions).where(eq(cartSessions.sessionId, sessionId)).limit(1);
  return result[0];
}

export async function upsertCartSession(sessionId: string, items: InsertCartSession["items"]) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db
    .insert(cartSessions)
    .values({ sessionId, items: items ?? [] })
    .onDuplicateKeyUpdate({ set: { items: items ?? [] } });
}

// ─── Analytics helpers ────────────────────────────────────────────────────────
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { totalProducts: 0, totalOrders: 0, pendingOrders: 0, lowStockProducts: [], totalRevenue: 0 };

  const [productCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(products).where(sql`${products.status} != 'RETIRED'`);
  const [orderCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(orders);
  const [pendingCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(orders).where(eq(orders.status, "PENDING"));
  const [revenueResult] = await db.select({ total: sql<number>`COALESCE(SUM(totalAmount), 0)` }).from(orders).where(eq(orders.paymentStatus, "PAID"));

  const lowStock = await db.select().from(products).where(
    and(
      sql`${products.quantity} <= 3`,
      sql`${products.quantity} > 0`,
      sql`${products.status} = 'IN_STOCK'`
    )
  );

  return {
    totalProducts: productCount?.count ?? 0,
    totalOrders: orderCount?.count ?? 0,
    pendingOrders: pendingCount?.count ?? 0,
    lowStockProducts: lowStock,
    totalRevenue: revenueResult?.total ?? 0,
  };
}

// ─── Site Content (CMS) ────────────────────────────────────────────────────────

export async function getAllSiteContent() {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return await db.select().from(siteContent);
}

export async function updateSiteContent(key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  
  await db
    .update(siteContent)
    .set({ value })
    .where(eq(siteContent.key, key));
}

export async function seedSiteContent() {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const existing = await db.select().from(siteContent);
  if (existing.length > 0) return;

  const defaultContent: InsertSiteContent[] = [
    // General
    { key: "site_title", label: "Site Title", value: "Mr. Todd's Woodcrafts", category: "General", type: "text" },
    { key: "theme_color_primary", label: "Primary Theme Color (Gold)", value: "#C9A227", category: "General", type: "color" },
    { key: "theme_color_bg", label: "Dark Background Color", value: "#1A1A1A", category: "General", type: "color" },
    { key: "theme_color_text", label: "Light Text Color", value: "#F5F0EB", category: "General", type: "color" },
    { key: "logo_url", label: "Logo Image URL", value: "/mrtodd-logo.jpg", category: "General", type: "image" },
    // Home
    { key: "hero_subtitle", label: "Hero Subtitle", value: "Handcrafted in Omaha, Nebraska", category: "Home", type: "text" },
    { key: "hero_title", label: "Hero Main Title", value: "Mr. Todd's Workshop", category: "Home", type: "text" },
    { key: "hero_tagline", label: "Hero Tagline", value: "Measured in Grain and Grace.", category: "Home", type: "text" },
    { key: "home_about_title", label: "Home About Title", value: "Generations of Craft", category: "Home", type: "text" },
    { key: "home_about_text", label: "Home About Text", value: "Every spoon, knife, and board is carved with precision and care, honoring the natural beauty of the wood.", category: "Home", type: "textarea" },
    { key: "home_about_image", label: "Home About Image", value: "/mrtodd-logo.jpg", category: "Home", type: "image" },
    // About
    { key: "about_story_title", label: "Our Story Title", value: "Started with\nFour Trees", category: "About", type: "text" },
    { key: "about_story_text", label: "Our Story Text", value: "Mr. Todd's Workshop started with trees that died in a yard in southeast Omaha. Two cherry and two apricot, planted by my mother-in-law about 35 years ago, taken down slowly by a nearby walnut. When the trees finally came down I could not bring myself to haul the wood off as firewood.\n\nI have cut down three of the four. The last apricot is still standing, dead, waiting.\n\nThe first piece was a cane for her. The second was a baby toy. After that the work just kept going.\n\nHand tools mostly. Food-safe oil finishes. The grain decides as much as the maker does. No two pieces come out the same, and they aren't meant to be.\n\nRun out of a workshop in Omaha, Nebraska, by Todd Boswell. Designer by trade, carver by accident.", category: "About", type: "textarea" },
    { key: "about_story_image", label: "Our Story Image", value: "/mrtodd-logo.jpg", category: "About", type: "image" },
    // Contact
    { key: "contact_email", label: "Contact Email", value: "hello@mrtoddsworkshop.com", category: "Contact", type: "text" },
    { key: "contact_text", label: "Contact Description", value: "Have a question or custom request? Reach out to us below.", category: "Contact", type: "textarea" },
  ];

  await db.insert(siteContent).values(defaultContent);
}
