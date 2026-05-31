import { expect, test } from "@playwright/test";

test("mode selection exposes accessible controls and status text", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /choose a match/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /single player/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /local two-player/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /online two-player/i })).toBeVisible();
});
