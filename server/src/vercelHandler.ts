import type { IncomingMessage, ServerResponse } from "node:http";
import { createApp } from "./app.js";

let app: ReturnType<typeof createApp> | null = null;

function headerValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function resolveUrl(req: IncomingMessage): string {
  const fromHeader =
    headerValue(req.headers["x-invoke-path"]) ||
    headerValue(req.headers["x-forwarded-uri"]) ||
    headerValue(req.headers["x-vercel-original-path"]);
  const raw = fromHeader || req.url || "/";
  const [pathname, query] = raw.split("?");
  const withApi = pathname.startsWith("/api")
    ? pathname
    : pathname === "/"
      ? "/api"
      : `/api${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
  const existingQuery = (req.url ?? "").includes("?")
    ? (req.url ?? "").slice((req.url ?? "").indexOf("?"))
    : query
      ? `?${query}`
      : "";
  return `${withApi}${existingQuery}`;
}

function getApp() {
  if (!app) {
    app = createApp();
  }
  return app;
}

export default function vercelHandler(req: IncomingMessage, res: ServerResponse): void {
  try {
    req.url = resolveUrl(req);
    getApp()(req, res);
  } catch (error) {
    const message = error instanceof Error ? error.message : "API failed to start";
    console.error(error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ error: message }));
    }
  }
}
