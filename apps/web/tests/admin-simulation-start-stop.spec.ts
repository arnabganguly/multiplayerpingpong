import { expect, test } from "@playwright/test";

test("administrator can start and stop a simulation from load testing controls", async ({
  page
}) => {
  let active = false;
  const run = {
    runId: "sim_e2e",
    status: "running",
    configuration: {
      virtualPlayers: 2,
      matches: 1,
      durationSeconds: 30,
      behaviorProfile: "balanced",
      updateFrequencyHz: 5,
      disconnectRatePerMinute: 0,
      reconnectRatePerMinute: 0
    },
    activeVirtualPlayers: 2,
    activeSimulatedMatches: 1,
    websocketConnections: 2,
    messagesPerSecond: 10,
    failures: 0,
    elapsedSeconds: 1,
    remainingSeconds: 29,
    createdAt: new Date().toISOString(),
    startedAt: new Date().toISOString()
  };

  await page.route("**/api/simulator/status", async (route) => {
    await route.fulfill({
      json: {
        enabled: true,
        environment: "e2e",
        activeRun: active ? run : null,
        recentRuns: active ? [run] : [],
        limits: {
          maxVirtualPlayers: 1000,
          maxDurationSeconds: 1800,
          maxUpdateFrequencyHz: 20
        }
      }
    });
  });
  await page.route("**/api/simulator/start", async (route) => {
    active = true;
    await route.fulfill({ status: 201, json: run });
  });
  await page.route("**/api/simulator/stop", async (route) => {
    active = false;
    await route.fulfill({ status: 202, json: { ...run, status: "completed" } });
  });

  await page.goto("/");
  await page.getByRole("button", { name: /admin load testing/i }).click();
  await expect(page.getByRole("heading", { name: /load testing/i })).toBeVisible();
  await page.getByLabel(/administrator token/i).fill("local-admin-token");
  await page.getByRole("button", { name: /unlock load testing/i }).click();
  await expect(page.getByLabel(/simulation configuration/i)).toBeVisible();
  await expect(page.getByLabel(/simulation status/i)).toBeVisible();
  await page.getByLabel(/virtual players/i).fill("2");
  await page.getByLabel(/^matches$/i).fill("1");
  await page.getByLabel(/duration seconds/i).fill("30");
  await page.getByRole("button", { name: /start simulation/i }).click();
  await expect(page.getByRole("heading", { name: /running/i })).toBeVisible();
  await expect(page.getByText("2").first()).toBeVisible();
  await page.getByRole("button", { name: /^stop$/i }).click();
  await expect(page.getByRole("heading", { name: /idle/i })).toBeVisible();
});
