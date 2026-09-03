import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import express, { type Express } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { config } from "./config.js";
import { createMailer } from "./lib/mailer.js";
import { authRouter } from "./routes/auth.js";
import { catalogRouter } from "./routes/catalog.js";
import { sellerRouter } from "./routes/seller.js";
import { adminRouter } from "./routes/admin.js";

const require = createRequire(import.meta.url);
const openapi = require("./openapi.json") as object;

function allowedOrigins(): Set<string> {
  const extras = [
    config.clientOrigin,
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
  const mailer = createMailer(config.sendgridApiKey, config.mailFrom);
  const origins = allowedOrigins();

  if (!process.env.VERCEL) {
    fs.mkdirSync(config.uploadDir, { recursive: true });
    app.use("/uploads", express.static(path.resolve(config.uploadDir)));
  }

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
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapi));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, brand: "ApnaMart" });
  });

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
