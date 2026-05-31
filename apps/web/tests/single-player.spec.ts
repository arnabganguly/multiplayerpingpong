import { expect, test } from "@playwright/test";

test("starts a single-player match and exposes match controls", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /single player/i }).click();
  await expect(page.getByLabel(/single-player match/i)).toBeVisible();
  await expect(page.getByLabel(/ping pong court/i)).toBeVisible();
  await page.getByRole("button", { name: /pause/i }).click();
  await expect(page.getByText(/paused/i)).toBeVisible();
  await page.getByRole("button", { name: /resume/i }).click();
  await page.getByRole("button", { name: /restart/i }).click();
  await expect(page.getByText(/Left 0/i)).toBeVisible();
});
