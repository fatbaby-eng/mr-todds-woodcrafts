export const PAYMENT_METHODS = [
  "VENMO",
  "STRIPE",
  "PAYPAL",
  "CASH",
  "CHECK",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const DEFAULT_PAYMENT_METHOD: PaymentMethod = "VENMO";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  VENMO: "Venmo",
  STRIPE: "Stripe",
  PAYPAL: "PayPal",
  CASH: "Cash",
  CHECK: "Check",
};
