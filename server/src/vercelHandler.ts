import type { IncomingMessage, ServerResponse } from "node:http";
import { createApp } from "./app.js";

const app = createApp();

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
  const withApi = pathname.startsWith("/api") ? pathname : pathname === "/" ? "/api" : `/api${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
  const existingQuery = (req.url ?? "").includes("?") ? (req.url ?? "").slice((req.url ?? "").indexOf("?")) : query ? `?${query}` : "";
  return `${withApi}${existingQuery}`;
}

export default function vercelHandler(req: IncomingMessage, res: ServerResponse): void {
  req.url = resolveUrl(req);
  app(req, res);
}
