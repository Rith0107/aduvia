import { expect, test } from "@playwright/test";

const productRoutes = ["/today", "/habits", "/quests", "/insights", "/check-in"];

for (const route of productRoutes) {
  test(`${route} fits the viewport without page-level horizontal overflow`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    const dimensions = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
  });
}

test("touch targets in mobile navigation meet the 44px minimum", async ({ page }) => {
  test.skip(!test.info().project.name.includes("phone") && test.info().project.name !== "tablet", "Touch viewport check");
  await page.goto("/today");
  const links = page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link");
  for (let index = 0; index < await links.count(); index += 1) {
    const box = await links.nth(index).boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
});
