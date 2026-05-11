import Stripe from "stripe";
import { ENV } from "./env";

let cachedClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!ENV.stripeSecretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to the Render environment.",
    );
  }
  if (!cachedClient) {
    cachedClient = new Stripe(ENV.stripeSecretKey);
  }
  return cachedClient;
}
