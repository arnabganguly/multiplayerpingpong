import { expect, test } from "@playwright/test";

test("simulation dashboard shows idle metrics", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /admin load testing/i }).click();
  await page.getByLabel(/administrator token/i).fill("local-admin-token");
  await page.getByRole("button", { name: /unlock load testing/i }).click();
  await expect(page.getByRole("heading", { name: /idle/i })).toBeVisible();
  await expect(page.getByText(/active virtual players/i)).toBeVisible();
  await expect(page.getByText(/websocket connections/i)).toBeVisible();
});
