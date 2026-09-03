import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const here = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(here, "../..");
const repoRoot = path.resolve(serverRoot, "..");
const parentRoot = path.resolve(repoRoot, "..");

export function envFilePath(): string | null {
  const candidates = [
    path.join(parentRoot, ".env"),
    path.join(repoRoot, ".env"),
    path.join(serverRoot, ".env"),
  ];
  return candidates.find((file) => fs.existsSync(file)) ?? null;
}

export function loadEnv(): void {
  const file = envFilePath();
  if (file) {
    dotenv.config({ path: file });
  }
  if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
    process.env.DIRECT_URL = process.env.DATABASE_URL;
  }
}

loadEnv();
