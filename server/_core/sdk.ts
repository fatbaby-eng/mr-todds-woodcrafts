import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import { ENV } from "./env";

const ADMIN_OPEN_ID = "admin";

function getSessionSecret(): Uint8Array {
  if (!ENV.adminSessionSecret) {
    throw new Error(
      "ADMIN_SESSION_SECRET (or ADMIN_PASSWORD) must be set to sign admin sessions",
    );
  }
  return new TextEncoder().encode(ENV.adminSessionSecret);
}

function parseCookies(cookieHeader: string | undefined): Map<string, string> {
  if (!cookieHeader) return new Map();
  return new Map(Object.entries(parseCookieHeader(cookieHeader)));
}

function buildAdminUser(): User {
  const now = new Date();
  return {
    id: 0,
    openId: ADMIN_OPEN_ID,
    name: "Admin",
    email: null,
    loginMethod: "password",
    role: "admin",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
}

export async function signAdminSession(
  options: { expiresInMs?: number } = {},
): Promise<string> {
  const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
  const expirationSeconds = Math.floor((Date.now() + expiresInMs) / 1000);
  return new SignJWT({ openId: ADMIN_OPEN_ID, role: "admin" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(getSessionSecret());
}

async function verifyAdminSession(
  cookieValue: string | undefined,
): Promise<boolean> {
  if (!cookieValue) return false;
  try {
    const { payload } = await jwtVerify(cookieValue, getSessionSecret(), {
      algorithms: ["HS256"],
    });
    return payload.role === "admin" && payload.openId === ADMIN_OPEN_ID;
  } catch (error) {
    console.warn("[Auth] Session verification failed:", String(error));
    return false;
  }
}

export const sdk = {
  /**
   * Returns the synthesized admin User if the request has a valid session
   * cookie, otherwise null. Never throws.
   */
  async authenticateRequest(req: Request): Promise<User | null> {
    const cookies = parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const ok = await verifyAdminSession(sessionCookie);
    return ok ? buildAdminUser() : null;
  },

  signAdminSession,
};

export type AuthenticatedUser = User;
