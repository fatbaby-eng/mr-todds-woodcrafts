import type { Express, Request, Response } from "express";
import express from "express";
import type Stripe from "stripe";
import { markOrderPaid } from "../db";
import { ENV } from "./env";
import { getStripeClient } from "./stripe";

/**
 * Registers POST /api/stripe/webhook with a raw body parser so Stripe's
 * signature can be verified. Must be registered BEFORE express.json().
 */
export function registerStripeWebhook(app: Express) {
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      if (!ENV.stripeSecretKey || !ENV.stripeWebhookSecret) {
        res.status(503).send("Stripe webhook not yet configured");
        return;
      }

      const signature = req.headers["stripe-signature"];
      if (!signature || Array.isArray(signature)) {
        res.status(400).send("Missing stripe-signature header");
        return;
      }

      let event: Stripe.Event;
      try {
        const stripe = getStripeClient();
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          ENV.stripeWebhookSecret,
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[StripeWebhook] Signature verification failed:", msg);
        res.status(400).send(`Webhook Error: ${msg}`);
        return;
      }

      try {
        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;
          const orderIdRaw = session.metadata?.orderId;
          const orderId = orderIdRaw ? parseInt(orderIdRaw, 10) : NaN;
          if (Number.isInteger(orderId) && orderId > 0) {
            await markOrderPaid(orderId);
            console.log(
              `[StripeWebhook] Order ${orderId} marked PAID (session=${session.id})`,
            );
          } else {
            console.warn(
              `[StripeWebhook] checkout.session.completed missing orderId metadata (session=${session.id})`,
            );
          }
        } else {
          console.log(`[StripeWebhook] Unhandled event type: ${event.type}`);
        }
      } catch (err) {
        console.error("[StripeWebhook] Handler error:", err);
        res.status(500).send("Handler error");
        return;
      }

      res.json({ received: true });
    },
  );
}
