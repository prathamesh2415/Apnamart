import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import express, { type Express } from "express";
import cors from "cors";
import { config } from "./config.js";
import { createMailer } from "./lib/mailer.js";
import { authRouter } from "./routes/auth.js";
import { catalogRouter } from "./routes/catalog.js";
import { sellerRouter } from "./routes/seller.js";
import { adminRouter } from "./routes/admin.js";

const require = createRequire(import.meta.url);

function allowedOrigins(): Set<string> {
  const extras = [
    process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "",
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
  ]
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
  return new Set(extras);
}

export function createApp(): Express {
  const app = express();
  const origins = allowedOrigins();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || origins.has(origin) || origin.endsWith(".vercel.app")) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      brand: "ApnaMart",
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      hasJwtSecret: Boolean(process.env.JWT_SECRET),
    });
  });

  const mailer = createMailer(config.sendgridApiKey, config.mailFrom);

  if (!process.env.VERCEL) {
    fs.mkdirSync(config.uploadDir, { recursive: true });
    app.use("/uploads", express.static(path.resolve(config.uploadDir)));
    try {
      const swaggerUi = require("swagger-ui-express") as typeof import("swagger-ui-express");
      const openapi = require("./openapi.json") as object;
      app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapi));
    } catch {
      // ignore missing swagger in slim installs
    }
  }

  app.use("/api/auth", authRouter(mailer));
  app.use("/api", catalogRouter(mailer));
  app.use("/api/seller", sellerRouter());
  app.use("/api/admin", adminRouter(mailer));

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error(err);
    res.status(500).json({ error: message });
  });

  return app;
}
