import { describe, expect, it } from "vitest";

import type { HabitSummary } from "@/features/habits/types";
import { habitHealth } from "./habit-health";

const habit: HabitSummary = { id: "habit", createdAt: "2026-08-01T12:00:00Z", name: "Read", category: "Learning", frequency: "Daily", consistency: 0, streak: 0, state: "active", color: "green" };
const today = new Date(2026, 8, 10, 12);
const checks = (states: Array<"complete" | "skipped">) => Object.fromEntries(states.map((state, index) => [`2026-09-${String(9 - index).padStart(2, "0")}`, { habit: state }]));

describe("habitHealth", () => {
  it("waits for enough evidence before assigning a performance signal", () => {
    expect(habitHealth({ ...habit, createdAt: "2026-09-07T12:00:00Z" }, checks(["complete", "skipped", "complete"]), today)).toMatchObject({ tone: "learning", sampleSize: 3 });
  });

  it("classifies the latest eight eligible check-ins", () => {
    expect(habitHealth(habit, checks(["complete", "complete", "complete", "complete", "complete", "complete", "complete", "skipped"]), today)).toMatchObject({ tone: "strong", rate: 88 });
    expect(habitHealth(habit, checks(["complete", "skipped", "complete", "complete", "skipped", "complete", "skipped", "complete"]), today)).toMatchObject({ tone: "steady", rate: 63 });
    expect(habitHealth(habit, checks(["skipped", "skipped", "complete", "skipped", "skipped", "complete", "skipped", "skipped"]), today)).toMatchObject({ tone: "reset", rate: 25 });
  });

  it("does not count an unanswered current day as a miss", () => {
    const result = habitHealth(habit, checks(["complete", "complete", "complete", "complete", "complete", "complete", "complete", "complete"]), today);
    expect(result).toMatchObject({ tone: "strong", rate: 100, sampleSize: 8 });
  });

  it("uses lifecycle labels instead of health scores for inactive habits", () => {
    expect(habitHealth({ ...habit, state: "paused" }, {}, today)).toMatchObject({ tone: "paused", rate: null });
    expect(habitHealth({ ...habit, state: "completed" }, {}, today)).toMatchObject({ tone: "completed", rate: null });
  });
});
