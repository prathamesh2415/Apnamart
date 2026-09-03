import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const clientRoot = path.dirname(fileURLToPath(import.meta.url));

function copyDistToRepoRoot() {
  return {
    name: "copy-dist-to-repo-root",
    closeBundle() {
      const from = path.resolve(clientRoot, "dist");
      const to = path.resolve(clientRoot, "../dist");
      if (!fs.existsSync(from)) return;
      fs.cpSync(from, to, { recursive: true });
    },
  };
}

export default defineConfig({
  plugins: [react(), copyDistToRepoRoot()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4000",
      "/uploads": "http://localhost:4000",
    },
  },
});
