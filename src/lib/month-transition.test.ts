import { describe, expect, it } from "vitest";

import type { HabitSummary } from "@/features/habits/types";
import type { QuestSummary } from "@/features/quests/types";
import { buildNewMonthSummary, newMonthWindow } from "./month-transition";

const dailyHabit: HabitSummary = {
  id: "habit-1", name: "Read", category: "Growth", frequency: "Daily", scheduledDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], consistency: 0, streak: 0, state: "active", color: "green", createdAt: "2026-08-30T12:00:00.000Z",
};
const quest = (overrides: Partial<QuestSummary> = {}): QuestSummary => ({
  id: "quest-1", title: "Finish a drawing", category: "Creative", status: "completed", dueLabel: "Completed", effortHours: 2, color: "green", targetMonth: "2026-08-01", completedAt: "2026-08-23T12:00:00.000Z", carriedFromId: null, rolloverReviewedAt: null, ...overrides,
});

describe("new month transition", () => {
  it("keeps the welcome open for the first four days and handles year boundaries", () => {
    expect(newMonthWindow(new Date("2026-09-04T12:00:00Z"), "UTC")).toMatchObject({ currentMonthKey: "2026-09-01", previousMonthKey: "2026-08-01" });
    expect(newMonthWindow(new Date("2026-09-05T12:00:00Z"), "UTC")).toBeNull();
    expect(newMonthWindow(new Date("2027-01-02T12:00:00Z"), "UTC")).toMatchObject({ currentMonthKey: "2027-01-01", previousMonthKey: "2026-12-01" });
  });

  it("counts consistency only after a habit existed and while it was active", () => {
    const habit = { ...dailyHabit, statusHistory: [{ status: "active" as const, effectiveAt: "2026-08-30T12:00:00.000Z" }, { status: "paused" as const, effectiveAt: "2026-09-01T12:00:00.000Z" }], state: "paused" as const };
    const summary = buildNewMonthSummary([habit], [quest()], {
      "2026-08-30": { "habit-1": "complete" },
      "2026-08-31": { "habit-1": "skipped" },
    }, new Date("2026-09-01T12:00:00Z"), "UTC");
    expect(summary).toMatchObject({ consistency: 50, activeHabitCount: 0, completedQuestCount: 1, previousQuestCount: 1 });
  });

  it("counts only quests belonging to the archived month", () => {
    const summary = buildNewMonthSummary([], [quest(), quest({ id: "sep", targetMonth: "2026-09-01" })], {}, new Date("2026-09-01T12:00:00Z"), "UTC");
    expect(summary).toMatchObject({ previousQuestCount: 1, completedQuestCount: 1 });
  });

  it("does not show an archive message to a new account with no previous activity", () => {
    expect(buildNewMonthSummary([], [], {}, new Date("2026-09-01T12:00:00Z"), "UTC")).toBeNull();
  });
});
