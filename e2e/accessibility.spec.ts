import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", name: "landing" },
  { path: "/signup", name: "signup" },
  { path: "/today", name: "home" },
  { path: "/habits", name: "habits" },
  { path: "/quests", name: "quests" },
  { path: "/insights", name: "insights" },
  { path: "/check-in", name: "evening check-in" },
];

for (const route of routes) {
  test(`${route.name} has no detectable WCAG A or AA violations`, async ({ page }) => {
    await page.goto(route.path);
    await expect(page.locator("main")).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    if (results.violations.length > 0) {
      const summary = results.violations.map((violation) => {
        const nodes = violation.nodes.map((node) => `${node.target.join(" ")} — ${node.failureSummary ?? violation.help}`).join("\n");
        return `${violation.id} (${violation.impact ?? "unknown"})\n${nodes}`;
      }).join("\n\n");
      throw new Error(summary);
    }
  });
}

test("keyboard users can skip directly to app content", async ({ page }) => {
  await page.goto("/habits");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
});
