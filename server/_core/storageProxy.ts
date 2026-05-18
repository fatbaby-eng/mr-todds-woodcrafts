import type { Express } from "express";
import express from "express";
import path from "node:path";

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.resolve("uploads");

export function registerStorageProxy(app: Express) {
  app.use("/uploads", express.static(UPLOADS_DIR, { maxAge: "7d" }));
}
