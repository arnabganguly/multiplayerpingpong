import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1280, height: 720 }
]) {
  test(`single-player layout fits ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.getByRole("button", { name: /single player/i }).click();
    const court = page.getByLabel(/ping pong court/i);
    await expect(court).toBeVisible();
    const box = await court.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(viewport.width);
    expect(box?.height).toBeLessThanOrEqual(viewport.height);
  });
}
