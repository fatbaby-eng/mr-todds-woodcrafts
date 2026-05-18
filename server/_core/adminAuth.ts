import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { timingSafeEqual } from "node:crypto";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

function constantTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function ensureAdminUser(): Promise<void> {
  if (!ENV.adminUsername) return;
  const existing = await db.getUserByOpenId(ENV.adminUsername);
  if (existing && existing.role === "admin") return;
  await db.upsertUser({
    openId: ENV.adminUsername,
    name: existing?.name ?? "Admin",
    email: existing?.email ?? null,
    loginMethod: "password",
    role: "admin",
    lastSignedIn: existing?.lastSignedIn ?? new Date(),
  });
}

export function registerAdminAuthRoutes(app: Express) {
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    const { username, password } = (req.body ?? {}) as {
      username?: string;
      password?: string;
    };

    if (typeof username !== "string" || typeof password !== "string") {
      res.status(400).json({ error: "username and password are required" });
      return;
    }

    if (!ENV.adminUsername || !ENV.adminPassword) {
      res.status(503).json({ error: "Admin login is not configured" });
      return;
    }

    const usernameOk = constantTimeEqual(username, ENV.adminUsername);
    const passwordOk = constantTimeEqual(password, ENV.adminPassword);

    if (!usernameOk || !passwordOk) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    await db.upsertUser({
      openId: ENV.adminUsername,
      role: "admin",
      loginMethod: "password",
      lastSignedIn: new Date(),
    });

    const sessionToken = await sdk.createSessionToken(ENV.adminUsername, {
      name: ENV.adminUsername,
      expiresInMs: ONE_YEAR_MS,
    });

    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, {
      ...cookieOptions,
      maxAge: ONE_YEAR_MS,
    });

    res.json({ success: true });
  });

  app.post("/api/admin/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });
}
