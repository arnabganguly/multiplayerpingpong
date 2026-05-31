import { expect, test } from "@playwright/test";

test("keyboard can navigate mode selection and match actions", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.getByLabel(/single-player match/i)).toBeVisible();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.getByText(/paused/i)).toBeVisible();
});
