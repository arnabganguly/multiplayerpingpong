import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true
      },
      "/ws": {
        target: "ws://localhost:8080",
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
