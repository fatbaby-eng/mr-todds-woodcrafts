import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn(),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getProducts: vi.fn().mockResolvedValue([
    {
      id: 1, name: "Cherry Spoon", slug: "cherry-spoon", description: "A hand-carved spoon.",
      price: 3800, woodType: "CHERRY", category: "SPOON", status: "IN_STOCK",
      quantity: 6, featured: true, images: ["/manus-storage/cherry-spoon.jpg"],
      dimensions: '12" × 2" × 0.5"', careInstructions: "Hand wash only.",
      leadTimeDays: null, createdAt: new Date(), updatedAt: new Date(),
    },
    {
      id: 2, name: "Walnut Spreader", slug: "walnut-spreader", description: "A butter spreader.",
      price: 2800, woodType: "WALNUT", category: "KNIFE", status: "IN_STOCK",
      quantity: 8, featured: true, images: ["/manus-storage/walnut-spreader.jpg"],
      dimensions: '8" × 1.5" × 0.4"', careInstructions: "Hand wash only.",
      leadTimeDays: null, createdAt: new Date(), updatedAt: new Date(),
    },
  ]),
  getProductBySlug: vi.fn().mockResolvedValue({
    id: 1, name: "Cherry Spoon", slug: "cherry-spoon", description: "A hand-carved spoon.",
    price: 3800, woodType: "CHERRY", category: "SPOON", status: "IN_STOCK",
    quantity: 6, featured: true, images: ["/manus-storage/cherry-spoon.jpg"],
    dimensions: '12" × 2" × 0.5"', careInstructions: "Hand wash only.",
    leadTimeDays: null, createdAt: new Date(), updatedAt: new Date(),
  }),
  createProduct: vi.fn().mockResolvedValue({ insertId: 10 }),
  updateProduct: vi.fn().mockResolvedValue(undefined),
  deleteProduct: vi.fn().mockResolvedValue(undefined),
  getOrders: vi.fn().mockResolvedValue([]),
  getOrderById: vi.fn().mockResolvedValue(null),
  createOrder: vi.fn().mockResolvedValue({ orderId: 42, orderNumber: "WT-20260001" }),
  updateOrderStatus: vi.fn().mockResolvedValue(undefined),
  getTradeShows: vi.fn().mockResolvedValue([
    {
      id: 1, name: "Nebraska Craft Fair", location: "Omaha, NE",
      address: "1804 Capitol Ave", boothNumber: "42",
      startDate: new Date("2026-06-14"), endDate: new Date("2026-06-15"),
      isActive: true, notes: null, createdAt: new Date(), updatedAt: new Date(),
    },
  ]),
  createTradeShow: vi.fn().mockResolvedValue(undefined),
  updateTradeShow: vi.fn().mockResolvedValue(undefined),
  deleteTradeShow: vi.fn().mockResolvedValue(undefined),
  getWoodBlanks: vi.fn().mockResolvedValue([]),
  createWoodBlank: vi.fn().mockResolvedValue(undefined),
  updateWoodBlank: vi.fn().mockResolvedValue(undefined),
  deleteWoodBlank: vi.fn().mockResolvedValue(undefined),
  getSubscribers: vi.fn().mockResolvedValue([]),
  addSubscriber: vi.fn().mockResolvedValue(undefined),
  getDashboardStats: vi.fn().mockResolvedValue({
    totalProducts: 7, totalOrders: 0, pendingOrders: 0, totalRevenue: 0,
    lowStockProducts: [{ id: 4, name: "Walnut Serving Board", quantity: 2 }],
  }),
  createContactMessage: vi.fn().mockResolvedValue(undefined),
  getProductById: vi.fn().mockResolvedValue({
    id: 1, name: "Cherry Spoon", slug: "cherry-spoon", description: "A hand-carved spoon.",
    price: 3800, woodType: "CHERRY", category: "SPOON", status: "IN_STOCK",
    quantity: 6, featured: true, images: ["/manus-storage/cherry-spoon.jpg"],
    dimensions: '12" × 2" × 0.5"', careInstructions: "Hand wash only.",
    leadTimeDays: null, createdAt: new Date(), updatedAt: new Date(),
  }),
  getOrderByNumber: vi.fn().mockResolvedValue({ id: 42, orderNumber: "WT-20260001", customerName: "Jane Doe", customerEmail: "jane@example.com", status: "PENDING", totalAmount: 4695, shippingCost: 895, shippingAddress: {}, createdAt: new Date(), updatedAt: new Date() }),
  createOrderItems: vi.fn().mockResolvedValue(undefined),
  getOrderItems: vi.fn().mockResolvedValue([]),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

beforeEach(() => {
  vi.mocked(db.getDb).mockResolvedValue({} as never);
  vi.mocked(notifyOwner).mockResolvedValue(true);
});

// ─── Context helpers ──────────────────────────────────────────────────────────
function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeAdminCtx(): TrpcContext {
  return {
    user: {
      id: 1, openId: "admin-open-id", email: "admin@example.com",
      name: "Mr. Todd", loginMethod: "manus", role: "admin",
      createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeUserCtx(): TrpcContext {
  return {
    user: {
      id: 2, openId: "user-open-id", email: "user@example.com",
      name: "Jane Doe", loginMethod: "manus", role: "user",
      createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Products ─────────────────────────────────────────────────────────────────
describe("products.list", () => {
  it("returns products for public users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.products.list({});
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0].name).toBe("Cherry Spoon");
  });

  it("returns products for authenticated users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.products.list({});
    expect(result.length).toBe(2);
  });
});

describe("products.bySlug", () => {
  it("returns a product by slug", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.products.bySlug({ slug: "cherry-spoon" });
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Cherry Spoon");
    expect(result?.price).toBe(3800);
  });
});

describe("products.create", () => {
  it("allows admin to create a product", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.products.create({
      name: "Test Spoon", slug: "test-spoon", price: 4500,
      woodType: "MAPLE", category: "SPOON", status: "IN_STOCK", quantity: 3,
      images: ["/manus-storage/test.jpg"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-admin users from creating products", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.products.create({
        name: "Unauthorized Spoon", slug: "unauth-spoon", price: 1000,
        woodType: "CHERRY", category: "SPOON", status: "IN_STOCK", quantity: 1,
      })
    ).rejects.toThrow();
  });

  it("rejects unauthenticated users from creating products", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.products.create({
        name: "Anon Spoon", slug: "anon-spoon", price: 1000,
        woodType: "CHERRY", category: "SPOON", status: "IN_STOCK", quantity: 1,
      })
    ).rejects.toThrow();
  });
});

describe("products.delete", () => {
  it("allows admin to delete a product", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.products.delete({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects non-admin from deleting products", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.products.delete({ id: 1 })).rejects.toThrow();
  });
});

// ─── Orders ───────────────────────────────────────────────────────────────────
describe("orders.create", () => {
  it("allows anyone to create an order", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.orders.create({
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      shippingAddress: { line1: "123 Main St", city: "Omaha", state: "NE", zip: "68102", country: "US" },
      items: [{ productId: 1, productName: "Cherry Spoon", quantity: 1, price: 3800 }],
      shippingCost: 895,
      totalAmount: 4695,
    });
    expect(result.orderNumber).toMatch(/^MTW-\d{4}-\d+$/);
    expect(result.orderId).toBe(42);
  });

  it("falls back to manual notification when the database is unavailable", async () => {
    vi.mocked(db.getDb).mockResolvedValue(null as never);

    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.orders.create({
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      shippingAddress: { line1: "123 Main St", city: "Omaha", state: "NE", zip: "68102", country: "US" },
      items: [{ productId: 1, productName: "Cherry Spoon", quantity: 1, price: 3800 }],
      shippingCost: 895,
    });

    expect(result.orderNumber).toMatch(/^MTW-\d{4}-\d+$/);
    expect(result.orderId).toBeNull();
    expect(notifyOwner).toHaveBeenCalled();
  });
});

describe("orders.updateStatus", () => {
  it("allows admin to update order status", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.orders.updateStatus({ id: 1, status: "CONFIRMED" });
    expect(result.success).toBe(true);
  });

  it("rejects non-admin from updating order status", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.orders.updateStatus({ id: 1, status: "CONFIRMED" })).rejects.toThrow();
  });
});

// ─── Trade Shows ──────────────────────────────────────────────────────────────
describe("tradeShows.list", () => {
  it("returns trade shows for public users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.tradeShows.list({});
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].name).toBe("Nebraska Craft Fair");
    expect(result[0].boothNumber).toBe("42");
  });
});

describe("tradeShows.create", () => {
  it("allows admin to create a trade show", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.tradeShows.create({
      name: "Test Show", location: "Lincoln, NE",
      startDate: new Date("2026-08-01"), endDate: new Date("2026-08-02"),
      isActive: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-admin from creating trade shows", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.tradeShows.create({
        name: "Unauthorized Show", location: "Omaha, NE",
        startDate: new Date("2026-08-01"), endDate: new Date("2026-08-02"),
        isActive: true,
      })
    ).rejects.toThrow();
  });
});

// ─── Admin Stats ──────────────────────────────────────────────────────────────
describe("admin.stats", () => {
  it("returns stats for admin users", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.admin.stats();
    expect(result.totalProducts).toBe(7);
    expect(result.totalOrders).toBe(0);
    expect(Array.isArray(result.lowStockProducts)).toBe(true);
    expect(result.lowStockProducts[0].name).toBe("Walnut Serving Board");
  });

  it("rejects non-admin from viewing admin stats", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("rejects unauthenticated users from viewing admin stats", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.admin.stats()).rejects.toThrow();
  });
});

// ─── Subscribers ──────────────────────────────────────────────────────────────
describe("subscribers.subscribe", () => {
  it("allows anyone to subscribe", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.subscribers.subscribe({ email: "test@example.com", source: "WEBSITE" });
    expect(result.success).toBe(true);
  });
});

describe("subscribers.list", () => {
  it("allows admin to list subscribers", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.subscribers.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("rejects unauthenticated users from listing subscribers", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.subscribers.list()).rejects.toThrow();
  });
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated users", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.auth.me();
    expect(result?.role).toBe("admin");
    expect(result?.name).toBe("Mr. Todd");
  });
});
