import { expect, test } from "@playwright/test";

test("a habit can be renamed, rescheduled, paused, and resumed", async ({ page }) => {
  await page.goto("/habits");
  await page.getByRole("button", { name: "+ New habit" }).click();
  await page.getByLabel("Habit name").fill("Lunch walk");
  await page.getByRole("button", { name: "Weekdays", exact: true }).click();
  await page.getByRole("button", { name: "Create habit", exact: true }).click();

  const habit = page.getByRole("article").filter({ hasText: "Lunch walk" });
  await habit.getByRole("button", { name: "Edit Lunch walk" }).click();
  await page.getByLabel("Habit name").fill("After-lunch walk");
  await page.getByRole("button", { name: "Custom", exact: true }).click();
  await page.getByRole("button", { name: "Tuesday: not selected" }).click();
  await page.getByRole("button", { name: "Thursday: not selected" }).click();
  await page.getByRole("button", { name: "Save changes" }).click();

  const editedHabit = page.getByRole("article").filter({ hasText: "After-lunch walk" });
  await expect(editedHabit).toContainText("Tue · Thu");
  await editedHabit.getByRole("button", { name: "Pause" }).click();
  await page.reload();
  await expect(page.getByRole("article").filter({ hasText: "After-lunch walk" }).getByRole("button", { name: "Resume" })).toBeVisible();
  await page.getByRole("article").filter({ hasText: "After-lunch walk" }).getByRole("button", { name: "Resume" }).click();
  await expect(page.getByRole("article").filter({ hasText: "After-lunch walk" }).getByRole("button", { name: "Pause" })).toBeVisible();
});

test("a quest can move through every status and persists", async ({ page }) => {
  await page.goto("/quests");
  await page.getByRole("button", { name: "+ New quest" }).click();
  await page.getByLabel("Quest title").fill("Publish launch notes");
  await page.getByRole("button", { name: "Create quest", exact: true }).click();

  const quest = page.getByRole("article").filter({ hasText: "Publish launch notes" });
  for (const status of ["In progress", "Paused", "Blocked", "Completed"] as const) {
    await quest.getByRole("button", { name: "Change status for Publish launch notes" }).click();
    await page.getByRole("menuitem", { name: status }).click();
    await expect(quest).toContainText(status);
  }

  await page.reload();
  await expect(page.getByRole("article").filter({ hasText: "Publish launch notes" })).toContainText("Completed");
});

test("Today and Evening mode share check-ins and private reflections", async ({ page }) => {
  await page.goto("/habits");
  await page.getByRole("button", { name: "+ New habit" }).click();
  await page.getByLabel("Habit name").fill("Nightly proof");
  await page.getByRole("button", { name: "Create habit", exact: true }).click();

  await page.goto("/today");
  await page.getByRole("button", { name: "Complete Nightly proof" }).click();
  await expect(page.getByRole("button", { name: "Undo Nightly proof" })).toBeVisible();

  await page.goto("/check-in");
  const eveningHabit = page.getByRole("article").filter({ hasText: "Nightly proof" });
  await eveningHabit.getByRole("button", { name: "Not today" }).click();
  await expect(eveningHabit).toContainText("Incomplete");

  await page.goto("/today");
  await expect(page.getByRole("button", { name: "Complete Nightly proof" })).toBeVisible();
  await page.goto("/check-in");
  await page.getByRole("article").filter({ hasText: "Nightly proof" }).getByRole("button", { name: "✓ Done" }).click();

  await page.goto("/today");
  await expect(page.getByRole("button", { name: "Undo Nightly proof" })).toBeVisible();
  await page.getByLabel("One-line reflection").fill("I kept one small promise.");
  await page.getByRole("button", { name: "Save note" }).click();
  await expect(page.getByRole("button", { name: "Save note" })).toContainText("Note kept");
  await page.reload();
  await expect(page.getByLabel("One-line reflection")).toHaveValue("I kept one small promise.");

  await page.getByRole("button", { name: "Undo Nightly proof" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Complete Nightly proof" })).toBeVisible();
});
