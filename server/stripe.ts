import Stripe from "stripe";
import { ENV } from "./_core/env";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!ENV.stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    stripeInstance = new Stripe(ENV.stripeSecretKey);
  }
  return stripeInstance;
}

export interface CreatePaymentIntentInput {
  amount: number; // in cents
  customerEmail: string;
  customerName: string;
  orderId: string;
  metadata?: Record<string, string>;
}

export async function createPaymentIntent(
  input: CreatePaymentIntentInput
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe();
  
  return stripe.paymentIntents.create({
    amount: input.amount,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
    receipt_email: input.customerEmail,
    description: `Order from ${input.customerName}`,
    metadata: {
      orderId: input.orderId,
      customerName: input.customerName,
      ...input.metadata,
    },
  });
}

export async function retrievePaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe();
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

export async function constructWebhookEvent(
  body: string,
  signature: string,
  webhookSecret: string
): Promise<Stripe.Event> {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}
