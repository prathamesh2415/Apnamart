import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(clientRoot, "..");
const entry = path.join(repoRoot, "server/src/vercelHandler.ts");
const targets = [
  path.join(clientRoot, "api/index.js"),
  path.join(clientRoot, "api/[...path].js"),
  path.join(repoRoot, "api/index.js"),
  path.join(repoRoot, "api/[...path].js"),
];

for (const outfile of targets) {
  fs.mkdirSync(path.dirname(outfile), { recursive: true });
  await build({
    absWorkingDir: repoRoot,
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    target: "node20",
    format: "esm",
    outfile,
    legalComments: "none",
    logLevel: "info",
    external: ["@prisma/client", "swagger-ui-express"],
    loader: { ".json": "json" },
  });
}

console.info("Bundled API handlers for Vercel.");
