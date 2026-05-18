const normalizedVenmoUsername = (import.meta.env.VITE_VENMO_USERNAME ?? "mrtoddsworkshop")
  .trim()
  .replace(/^@/, "");

export const STOREFRONT = {
  businessName: "Mr. Todd's Woodcrafts",
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL ?? "todd@mrtodds.com",
  venmoUsername: normalizedVenmoUsername,
  venmoDisplayHandle: `@${normalizedVenmoUsername}`,
  venmoProfileUrl: `https://venmo.com/${normalizedVenmoUsername}`,
  shippingFlatRateCents: 895,
  freeShippingThresholdCents: 7500,
} as const;

export function buildVenmoPaymentLink(amountCents: number, note: string) {
  const params = new URLSearchParams({
    txn: "pay",
    amount: (amountCents / 100).toFixed(2),
    note,
  });
  return `${STOREFRONT.venmoProfileUrl}?${params.toString()}`;
}
