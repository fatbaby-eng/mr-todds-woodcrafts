import { TRPCError } from "@trpc/server";
import { notifyOwner } from "./_core/notification";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  addSubscriber,
  createOrder,
  createOrderItems,
  createProduct,
  createTradeShow,
  createWoodBlank,
  deleteProduct,
  deleteTradeShow,
  deleteWoodBlank,
  getDashboardStats,
  getOrderById,
  getOrderByNumber,
  getOrderItems,
  getOrders,
  getProductById,
  getProductBySlug,
  getProducts,
  getSubscribers,
  getTradeShows,
  getWoodBlanks,
  getCartSession,
  upsertCartSession,
  updateOrderStatus,
  updateProduct,
  updateTradeShow,
  updateWoodBlank,
} from "./db";
import { storagePut } from "./storage";

// ─── Admin guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ─── Shared Zod schemas ───────────────────────────────────────────────────────
const cartItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().int().min(1),
  price: z.number(),
  name: z.string(),
  imageUrl: z.string().optional(),
  woodType: z.string().optional(),
  slug: z.string(),
});

export const appRouter = router({
  system: systemRouter,

  // ─── Auth ─────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Products (public) ────────────────────────────────────────────────────
  products: router({
    list: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        woodType: z.string().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
        featured: z.boolean().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(({ input }) => getProducts(input ?? {})),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const product = await getProductBySlug(input.slug);
        if (!product) throw new TRPCError({ code: "NOT_FOUND" });
        return product;
      }),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await getProductById(input.id);
        if (!product) throw new TRPCError({ code: "NOT_FOUND" });
        return product;
      }),

    // Admin CRUD
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        price: z.number().int().min(0),
        woodType: z.enum(["CHERRY", "WALNUT", "MAPLE", "MIXED", "OTHER"]),
        category: z.enum(["SPOON", "KNIFE", "SCOOP", "SERVING", "CUSTOM"]),
        status: z.enum(["IN_STOCK", "MADE_TO_ORDER", "SOLD_OUT", "RETIRED"]),
        quantity: z.number().int().min(0),
        leadTimeDays: z.number().int().optional(),
        featured: z.boolean().optional(),
        images: z.array(z.string()),
        dimensions: z.string().optional(),
        careInstructions: z.string().optional(),
        weight: z.number().int().optional(),
      }))
      .mutation(async ({ input }) => {
        await createProduct({ ...input, images: input.images });
        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        price: z.number().int().min(0).optional(),
        woodType: z.enum(["CHERRY", "WALNUT", "MAPLE", "MIXED", "OTHER"]).optional(),
        category: z.enum(["SPOON", "KNIFE", "SCOOP", "SERVING", "CUSTOM"]).optional(),
        status: z.enum(["IN_STOCK", "MADE_TO_ORDER", "SOLD_OUT", "RETIRED"]).optional(),
        quantity: z.number().int().min(0).optional(),
        leadTimeDays: z.number().int().optional(),
        featured: z.boolean().optional(),
        images: z.array(z.string()).optional(),
        dimensions: z.string().optional(),
        careInstructions: z.string().optional(),
        weight: z.number().int().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateProduct(id, data as any);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteProduct(input.id);
        return { success: true };
      }),

    uploadImage: adminProcedure
      .input(z.object({
        filename: z.string(),
        contentType: z.string(),
        dataUrl: z.string(),
      }))
      .mutation(async ({ input }) => {
        const base64 = input.dataUrl.split(",")[1];
        if (!base64) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid image data" });
        const buffer = Buffer.from(base64, "base64");
        const key = `products/${Date.now()}-${input.filename}`;
        const { url } = await storagePut(key, buffer, input.contentType);
        return { url };
      }),
  }),

  // ─── Orders ───────────────────────────────────────────────────────────────
  orders: router({
    list: adminProcedure
      .input(z.object({
        status: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(({ input }) => getOrders(input ?? {})),

    byId: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const order = await getOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        const items = await getOrderItems(input.id);
        return { ...order, items };
      }),

    lookup: publicProcedure
      .input(z.object({ orderNumber: z.string(), email: z.string() }))
      .query(async ({ input }) => {
        const order = await getOrderByNumber(input.orderNumber);
        if (!order || order.customerEmail.toLowerCase() !== input.email.toLowerCase()) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        }
        const items = await getOrderItems(order.id);
        return { ...order, items };
      }),

    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["PENDING", "CONFIRMED", "CARVING", "FINISHED", "SHIPPED", "DELIVERED", "CANCELLED"]),
        trackingNumber: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateOrderStatus(input.id, input.status, input.trackingNumber);
        return { success: true };
      }),

    // Public checkout creates an order
    create: publicProcedure
      .input(z.object({
        customerEmail: z.string().email(),
        customerName: z.string().min(1),
        customerPhone: z.string().optional(),
        shippingAddress: z.object({
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          zip: z.string(),
          country: z.string(),
        }),
        paymentMethod: z.enum(["STRIPE", "PAYPAL", "CASH", "CHECK", "VENMO"]).default("VENMO"),
        items: z.array(z.object({
          productId: z.number().optional(),
          productName: z.string(),
          productSlug: z.string().optional(),
          price: z.number().int(),
          quantity: z.number().int().min(1),
          woodType: z.string().optional(),
          imageUrl: z.string().optional(),
        })),
        shippingCost: z.number().int().default(0),
        taxAmount: z.number().int().default(0),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const subtotal = input.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const totalAmount = subtotal + input.shippingCost + input.taxAmount;
        const orderNumber = `MTW-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

        await createOrder({
          orderNumber,
          customerEmail: input.customerEmail,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          shippingAddress: input.shippingAddress,
          paymentMethod: input.paymentMethod,
          totalAmount,
          shippingCost: input.shippingCost,
          taxAmount: input.taxAmount,
          notes: input.notes,
          status: "PENDING",
          paymentStatus: "PENDING",
        });

        const order = await getOrderByNumber(orderNumber);
        if (!order) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await createOrderItems(
          input.items.map((item) => ({
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            productSlug: item.productSlug,
            price: item.price,
            quantity: item.quantity,
            woodType: item.woodType,
            imageUrl: item.imageUrl,
          }))
        );

        // Decrement stock for in-stock products
        for (const item of input.items) {
          if (item.productId) {
            const product = await getProductById(item.productId);
            if (product && product.status === "IN_STOCK") {
              const newQty = Math.max(0, product.quantity - item.quantity);
              await updateProduct(item.productId, {
                quantity: newQty,
                status: newQty === 0 ? "SOLD_OUT" : "IN_STOCK",
              });
            }
          }
        }

        return { orderNumber, orderId: order.id };
      }),
  }),

  // ─── Inventory (Wood Blanks) ───────────────────────────────────────────────
  inventory: router({
    list: adminProcedure
      .input(z.object({ woodType: z.string().optional(), status: z.string().optional() }).optional())
      .query(({ input }) => getWoodBlanks(input ?? {})),

    create: adminProcedure
      .input(z.object({
        woodType: z.enum(["CHERRY", "WALNUT", "MAPLE", "MIXED", "OTHER"]),
        dimensions: z.string().optional(),
        source: z.string().optional(),
        acquiredDate: z.date().optional(),
        cost: z.number().int().optional(),
        status: z.enum(["RAW", "ROUGH_CUT", "CARVING", "FINISHED", "SOLD"]).optional(),
        productId: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await createWoodBlank(input as any);
        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        woodType: z.enum(["CHERRY", "WALNUT", "MAPLE", "MIXED", "OTHER"]).optional(),
        dimensions: z.string().optional(),
        source: z.string().optional(),
        cost: z.number().int().optional(),
        status: z.enum(["RAW", "ROUGH_CUT", "CARVING", "FINISHED", "SOLD"]).optional(),
        productId: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateWoodBlank(id, data as any);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteWoodBlank(input.id);
        return { success: true };
      }),
  }),

  // ─── Trade Shows ──────────────────────────────────────────────────────────
  tradeShows: router({
    list: publicProcedure
      .input(z.object({ activeOnly: z.boolean().optional() }).optional())
      .query(({ input }) => getTradeShows(input?.activeOnly ?? false)),

    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        location: z.string().min(1),
        address: z.string().optional(),
        boothNumber: z.string().optional(),
        startDate: z.date(),
        endDate: z.date(),
        isActive: z.boolean().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await createTradeShow(input as any);
        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        location: z.string().optional(),
        address: z.string().optional(),
        boothNumber: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        isActive: z.boolean().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateTradeShow(id, data as any);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteTradeShow(input.id);
        return { success: true };
      }),
  }),

  // ─── Newsletter / Subscribers ─────────────────────────────────────────────
  subscribers: router({
    subscribe: publicProcedure
      .input(z.object({
        email: z.string().email(),
        source: z.enum(["WEBSITE", "TRADE_SHOW", "INSTAGRAM"]).optional(),
      }))
      .mutation(async ({ input }) => {
        await addSubscriber({ email: input.email, source: input.source ?? "WEBSITE" });
        return { success: true };
      }),

    list: adminProcedure.query(() => getSubscribers()),
  }),

  // ─── Cart (session-based, no login required) ──────────────────────────────
  cart: router({
    get: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const session = await getCartSession(input.sessionId);
        return session?.items ?? [];
      }),

    set: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        items: z.array(cartItemSchema),
      }))
      .mutation(async ({ input }) => {
        await upsertCartSession(input.sessionId, input.items);
        return { success: true };
      }),
  }),

  // ─── Contact ────────────────────────────────────────────────────────────────
  contact: router({
    send: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        subject: z.string(),
        message: z.string().min(5),
      }))
      .mutation(async ({ input }) => {
        // Notify the owner via built-in notification
        await notifyOwner({
          title: `New Contact: ${input.subject} from ${input.name}`,
          content: `From: ${input.name} <${input.email}>\n\n${input.message}`,
        });
        return { success: true };
      }),
  }),
  // ─── Admin Dashboard ──────────────────────────────────────────────────────
  admin: router({
    stats: adminProcedure.query(() => getDashboardStats()),
  }),
});

export type AppRouter = typeof appRouter;
