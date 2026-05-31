import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["packages/**/*.test.ts", "apps/realtime/**/*.test.ts", "apps/web/**/*.test.ts"],
    coverage: {
      reporter: ["text", "lcov"]
    }
  },
  resolve: {
    alias: {
      "@pingpong/contracts": new URL("./packages/contracts/src/index.ts", import.meta.url).pathname,
      "@pingpong/game-core": new URL("./packages/game-core/src/index.ts", import.meta.url).pathname
    }
  }
});
