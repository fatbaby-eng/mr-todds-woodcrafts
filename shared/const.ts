export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

// ─── Site Settings keys ──────────────────────────────────────────────────────
// Settings exposed to the public storefront (read by anyone, write by admin).
// Anything not in this list is admin-only on both read and write.
export const SETTING_VENMO_USERNAME = "venmoUsername";
export const SETTING_CONTACT_EMAIL = "contactEmail";
export const SETTING_CONTACT_PHONE = "contactPhone";
export const SETTING_SHOP_LIVE = "shopLive";

export const PUBLIC_SETTING_KEYS = [
  SETTING_VENMO_USERNAME,
  SETTING_CONTACT_EMAIL,
  SETTING_CONTACT_PHONE,
  SETTING_SHOP_LIVE,
] as const;

export type PublicSettingKey = (typeof PUBLIC_SETTING_KEYS)[number];

export const ALL_SETTING_KEYS = [...PUBLIC_SETTING_KEYS] as const;
export type SettingKey = (typeof ALL_SETTING_KEYS)[number];
