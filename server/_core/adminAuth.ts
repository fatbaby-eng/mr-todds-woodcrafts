import type { Express, Request, Response } from "express";
import { SignJWT } from "jose";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import * as db from "../db";

export function registerAdminAuth(app: Express) {
  app.get("/api/admin/login", (_req: Request, res: Response) => {
    res.set("Content-Type", "text/html");
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Login - Mr. Todd's Woodcrafts</title>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #1A1008; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: Inter, sans-serif; }
    .card { background: #2D1A0E; border: 1px solid #5D4037; border-radius: 12px; padding: 40px; max-width: 400px; width: 90%; }
    h1 { font-family: Cinzel, serif; color: #C9A227; font-size: 1.25rem; text-align: center; margin-bottom: 8px; }
    .subtitle { color: #8D6E63; font-size: 0.8rem; text-align: center; margin-bottom: 28px; }
    label { display: block; color: #8D6E63; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 6px; }
    input { width: 100%; padding: 10px 14px; background: #1A1008; border: 1px solid #5D4037; border-radius: 6px; color: #F5F0EB; font-size: 0.9rem; outline: none; }
    input:focus { border-color: #C9A227; }
    .field { margin-bottom: 16px; }
    button { width: 100%; padding: 12px; background: #C9A227; color: #1A1008; border: none; border-radius: 6px; font-weight: 600; font-size: 0.85rem; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; margin-top: 8px; }
    button:hover { background: #D4B03A; }
    .error { color: #ef4444; font-size: 0.8rem; text-align: center; margin-top: 12px; display: none; }
    a { color: #8D6E63; text-decoration: none; display: block; text-align: center; margin-top: 16px; font-size: 0.8rem; }
    a:hover { color: #C9A227; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Admin Login</h1>
    <p class="subtitle">Mr. Todd's Woodcrafts</p>
    <form method="POST" action="/api/admin/login" id="loginForm">
      <div class="field">
        <label>Password</label>
        <input type="password" name="password" required autofocus autocomplete="current-password" />
      </div>
      <button type="submit">Sign In</button>
      <p class="error" id="error">Invalid password. Please try again.</p>
    </form>
    <a href="/">&larr; Back to Store</a>
  </div>
  <script>
    const params = new URLSearchParams(location.search);
    if (params.get("error") === "1") document.getElementById("error").style.display = "block";
  </script>
</body>
</html>`);
  });

  app.post("/api/admin/login", async (req: Request, res: Response) => {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      res.status(500).send("ADMIN_PASSWORD not configured");
      return;
    }

    const { password } = req.body;
    if (password !== adminPassword) {
      res.redirect(302, "/api/admin/login?error=1");
      return;
    }

    const adminOpenId = ENV.ownerOpenId || "admin-owner";

    await db.upsertUser({
      openId: adminOpenId,
      name: "Todd",
      email: null,
      role: "admin",
      lastSignedIn: new Date(),
    });

    const secretKey = new TextEncoder().encode(ENV.cookieSecret);
    const token = await new SignJWT({
      openId: adminOpenId,
      appId: ENV.appId || "mrtodds",
      name: "Todd",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS) / 1000))
      .sign(secretKey);

    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
    res.redirect(302, "/admin");
  });
}
