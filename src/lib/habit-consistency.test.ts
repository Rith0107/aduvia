import { describe, expect, it } from "vitest";
import type { HabitSummary } from "@/features/habits/types";
import { consistencyCell, monthlyConsistency, overallHabitConsistency } from "./habit-consistency";

const habit: HabitSummary = {
  id: "habit-1", createdAt: "2026-08-01T10:00:00Z", name: "Walk", category: "Fitness",
  frequency: "Daily", consistency: 0, streak: 0, state: "paused", color: "green",
  statusHistory: [
    { status: "active", effectiveAt: "2026-08-01T10:00:00Z" },
    { status: "paused", effectiveAt: "2026-08-05T10:00:00Z" },
    { status: "active", effectiveAt: "2026-08-08T10:00:00Z" },
    { status: "paused", effectiveAt: "2026-08-10T10:00:00Z" },
  ],
};

describe("habit consistency", () => {
  it("counts only the dates when a habit was active", () => {
    expect(consistencyCell(habit, new Date(2026, 7, 4))).toBe("missed");
    expect(consistencyCell(habit, new Date(2026, 7, 6))).toBe("off");
    expect(consistencyCell(habit, new Date(2026, 7, 9))).toBe("missed");
    expect(consistencyCell(habit, new Date(2026, 7, 11))).toBe("off");
  });

  it("keeps an explicit historical answer even after a lifecycle transition", () => {
    expect(consistencyCell(habit, new Date(2026, 7, 6), "complete")).toBe("done");
  });

  it("uses one month-to-date calculation for all screens", () => {
    const completions = {
      "2026-08-01": { "habit-1": "complete" as const },
      "2026-08-02": { "habit-1": "complete" as const },
      "2026-08-03": { "habit-1": "skipped" as const },
      "2026-08-04": { "habit-1": "complete" as const },
      "2026-08-08": { "habit-1": "complete" as const },
      "2026-08-09": { "habit-1": "complete" as const },
    };
    expect(monthlyConsistency([habit], completions, 2026, 7, new Date(2026, 7, 11))).toBe(83);
    expect(overallHabitConsistency([habit], completions, new Date(2026, 7, 11))).toBe(83);
  });
});
