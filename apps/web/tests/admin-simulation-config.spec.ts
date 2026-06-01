import { expect, test } from "@playwright/test";

test("simulation form validates match count against player count", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /admin load testing/i }).click();
  await page.getByLabel(/administrator token/i).fill("local-admin-token");
  await page.getByRole("button", { name: /unlock load testing/i }).click();
  await page.getByLabel(/virtual players/i).fill("2");
  await page.getByLabel(/^matches$/i).fill("2");
  await page.getByRole("button", { name: /start simulation/i }).click();
  await expect(page.getByText(/matches cannot exceed/i)).toBeVisible();
});
