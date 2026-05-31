import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const backendPort = process.env.BACKEND_PORT ?? "8080";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true
      },
      "/ws": {
        target: `ws://localhost:${backendPort}`,
        ws: true
      }
    }
  },
  preview: {
    port: 5173
  },
  resolve: {
    alias: {
      "@pingpong/contracts": new URL("../../packages/contracts/src/index.ts", import.meta.url)
        .pathname,
      "@pingpong/game-core": new URL("../../packages/game-core/src/index.ts", import.meta.url)
        .pathname
    }
  }
});
