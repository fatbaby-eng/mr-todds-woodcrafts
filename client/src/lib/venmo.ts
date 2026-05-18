const rawVenmoUsername = import.meta.env.VITE_VENMO_USERNAME as string | undefined;

export const venmoUsername = rawVenmoUsername?.trim().replace(/^@/, "") ?? "";
export const venmoDisplayName = venmoUsername ? `@${venmoUsername}` : "Venmo";

export function formatVenmoAmount(cents: number) {
  return (cents / 100).toFixed(2);
}

export function buildVenmoPaymentUrl(orderNumber: string, amountCents: number) {
  if (!venmoUsername) return undefined;

  const url = new URL("https://venmo.com/");
  url.searchParams.set("txn", "pay");
  url.searchParams.set("audience", "private");
  url.searchParams.set("recipients", venmoUsername);
  url.searchParams.set("amount", formatVenmoAmount(amountCents));
  url.searchParams.set("note", `Mr. Todd's Woodcrafts order ${orderNumber}`);
  return url.toString();
}
