import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const clientRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve(clientRoot, "../dist"),
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
