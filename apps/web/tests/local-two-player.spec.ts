import { expect, test } from "@playwright/test";

test("starts a local two-player match with separate controls", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /local two-player/i }).click();
  await expect(page.getByLabel(/local two-player match/i)).toBeVisible();
  await page.keyboard.down("w");
  await page.keyboard.down("ArrowDown");
  await page.keyboard.up("w");
  await page.keyboard.up("ArrowDown");
  await page.getByRole("button", { name: /restart/i }).click();
  await expect(page.getByText(/Left 0/i)).toBeVisible();
});
