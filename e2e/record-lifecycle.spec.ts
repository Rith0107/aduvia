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
