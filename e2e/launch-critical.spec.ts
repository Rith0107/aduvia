import { expect, test } from "@playwright/test";

test("a new visitor can reach signup from the landing page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Make your days visible." })).toBeVisible();
  await page.getByRole("link", { name: "Start your story" }).click();
  await expect(page).toHaveURL(/\/signup$/);
  await expect(page.getByRole("button", { name: "Create my account" })).toBeVisible();
});

test("a habit can be created with a custom cadence and survives reload", async ({ page }) => {
  await page.goto("/habits");
  await page.getByRole("button", { name: "+ New habit" }).click();
  await page.getByLabel("Habit name").fill("Evening stretch");
  await page.getByRole("button", { name: "Custom", exact: true }).click();
  await page.getByRole("button", { name: "Monday: not selected" }).click();
  await page.getByRole("button", { name: "Wednesday: not selected" }).click();
  await page.getByRole("button", { name: "Friday: not selected" }).click();
  await page.getByRole("button", { name: "Make this my anchor" }).click();
  await page.getByRole("button", { name: "Create habit", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Evening stretch" })).toBeVisible();
  await expect(page.getByText("Fitness · Mon · Wed · Fri")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Evening stretch" })).toBeVisible();
});

test("mobile navigation keeps every primary destination reachable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/today");
  const navigation = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(navigation).toBeVisible();
  for (const destination of ["Today", "Habits", "Quests", "Insights"]) {
    await expect(navigation.getByRole("link", { name: destination })).toBeVisible();
  }
});

test("an interrupted connection gives calm, immediate feedback", async ({ context, page }) => {
  await page.goto("/today");
  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await expect(page.getByRole("status")).toContainText("You’re offline. Saved changes will sync when you reconnect.");
  await context.setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect(page.getByText("You’re offline. Saved changes will sync when you reconnect.")).toBeHidden();
});
