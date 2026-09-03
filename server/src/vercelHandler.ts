import type { IncomingMessage, ServerResponse } from "node:http";
import { createApp } from "./app.js";

const app = createApp();

export default function vercelHandler(req: IncomingMessage, res: ServerResponse): void {
  const url = req.url ?? "/";
  if (!url.startsWith("/api")) {
    req.url = url === "/" ? "/api" : `/api${url.startsWith("/") ? url : `/${url}`}`;
  }
  app(req, res);
}
