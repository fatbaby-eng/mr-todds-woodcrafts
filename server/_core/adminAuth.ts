import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

export function registerAdminAuthRoutes(app: Express) {
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    const password =
      typeof req.body?.password === "string" ? req.body.password : "";

    if (!ENV.adminPassword) {
      res.status(500).json({ error: "Admin password not configured" });
      return;
    }

    if (password !== ENV.adminPassword) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }

    try {
      const sessionToken = await sdk.signAdminSession({
        expiresInMs: ONE_YEAR_MS,
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });
      res.json({ ok: true });
    } catch (error) {
      console.error("[AdminAuth] Login failed:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
}
