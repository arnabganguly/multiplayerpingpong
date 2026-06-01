import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "apps/web/tests",
  testMatch: /.*\.spec\.ts/,
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry"
  },
  webServer: [
    {
      command:
        "SESSION_TOKEN_SIGNING_SECRET=local-dev-secret npm run dev --workspace apps/realtime",
      url: "http://127.0.0.1:8080/api/health/live",
      reuseExistingServer: true,
      timeout: 20_000
    },
    {
      command:
        "APP_ENV=local PORT=8090 SIMULATION_ENABLED=true SIMULATION_ADMIN_TOKEN=local-admin-token SIMULATION_TARGET_BASE_URL=http://127.0.0.1:5173 SIMULATION_TARGET_API_URL=http://127.0.0.1:8080/api SIMULATION_TARGET_REALTIME_URL=ws://127.0.0.1:8080/ws npm run dev --workspace apps/simulator",
      url: "http://127.0.0.1:8090/api/health/live",
      reuseExistingServer: true,
      timeout: 20_000
    },
    {
      command: "BACKEND_PORT=8080 SIMULATOR_PORT=8090 npm run dev --workspace apps/web",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: true,
      timeout: 20_000
    }
  ],
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } }
  ]
});
