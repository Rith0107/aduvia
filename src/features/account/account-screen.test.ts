import { describe, expect, it } from "vitest";

import { buildDataExport } from "./account-screen";

describe("buildDataExport", () => {
  it("includes progress, private reflections, identity, and visual preferences", () => {
    const exported = buildDataExport({
      habits: [{ id: "habit-1", name: "Walk", category: "Fitness", frequency: "Daily", consistency: 80, streak: 3, state: "active", color: "green" }],
      quests: [{ id: "quest-1", title: "Ship portfolio", category: "Career", status: "not-started", dueLabel: "Aug 31", effortHours: 4, color: "blue", targetMonth: "2026-08-01", completedAt: null, carriedFromId: null, rolloverReviewedAt: null }],
      completions: { "2026-08-10": { "habit-1": "complete" } },
      reflections: { "2026-08-10": "A calm day." },
    }, { name: "Rithwik", email: "rithwik@example.com" }, { palette: "coastal", typography: "soft-journal" }, "2026-08-11T12:00:00.000Z");

    expect(exported).toMatchObject({
      format: "aduvia-data-export",
      version: 1,
      exportedAt: "2026-08-11T12:00:00.000Z",
      account: { displayName: "Rithwik", email: "rithwik@example.com" },
      preferences: { palette: "coastal", typography: "soft-journal" },
      checkIns: { "2026-08-10": { "habit-1": "complete" } },
      reflections: { "2026-08-10": "A calm day." },
    });
  });
});
