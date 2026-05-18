/**
 * Public storefront URL — set VITE_PUBLIC_SITE_URL when previewing on another host.
 * Default matches production DNS for mrtoddsworkshop.com.
 */
export const siteOrigin = (
  import.meta.env.VITE_PUBLIC_SITE_URL?.replace(/\/$/, "").trim() ||
  "https://mrtoddsworkshop.com"
).trim();

const rawVenmo = import.meta.env.VITE_VENMO_HANDLE?.trim() ?? "";
const venmoUser = rawVenmo.startsWith("@") ? rawVenmo.slice(1) : rawVenmo;

/** Venmo username without @ — from VITE_VENMO_HANDLE */
export const venmoHandle = venmoUser;

export const venmoProfileUrl = venmoUser
  ? `https://venmo.com/${encodeURIComponent(venmoUser)}`
  : "";

export const venmoDisplay = venmoUser ? `@${venmoUser}` : "";
