import { expect, test } from "@playwright/test";

test("shows online lobby create and join controls", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /online two-player/i }).click();
  await expect(page.getByLabel(/online lobby/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /create online session/i })).toBeVisible();
  await expect(page.getByLabel(/session id/i)).toBeVisible();
  await expect(page.getByLabel(/join code/i)).toBeVisible();
});
