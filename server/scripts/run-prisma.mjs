import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const PRISMA_VERSION = "6.19.3";
const serverDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(serverDir, "..");
const parentRoot = path.resolve(repoRoot, "..");

function applyEnvFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim().replace(/^export\s+/, "");
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function resolveLocalPrismaEntry() {
  const candidates = [
    path.join(serverDir, "node_modules", "prisma", "build", "index.js"),
    path.join(repoRoot, "node_modules", "prisma", "build", "index.js"),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

const envFile = [path.join(parentRoot, ".env"), path.join(repoRoot, ".env")].find((candidate) =>
  fs.existsSync(candidate),
);
if (envFile) {
  applyEnvFile(envFile);
}
if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

const args = process.argv.slice(2);
const localPrisma = resolveLocalPrismaEntry();
const result = localPrisma
  ? spawnSync(process.execPath, [localPrisma, ...args], {
      cwd: serverDir,
      stdio: "inherit",
      env: process.env,
    })
  : spawnSync(
      "npx",
      ["--yes", `--package=prisma@${PRISMA_VERSION}`, "prisma", ...args],
      {
        cwd: serverDir,
        stdio: "inherit",
        shell: true,
        env: process.env,
      },
    );

process.exit(result.status ?? 1);
