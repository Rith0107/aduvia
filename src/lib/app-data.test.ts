import { describe, expect, it } from "vitest";

import type { HabitSummary } from "@/features/habits/types";
import { isHabitScheduledOn, todaysHabits } from "./app-data";

const habits: HabitSummary[] = [
  { id: "daily", name: "Walk 20 minutes", category: "Fitness", frequency: "Daily", consistency: 0, streak: 0, state: "active", color: "green" },
  { id: "weekdays", name: "Deep work", category: "Career", frequency: "Weekdays", consistency: 0, streak: 0, state: "active", color: "blue" },
  { id: "custom", name: "Swim", category: "Fitness", frequency: "Custom", scheduledDays: ["Sun"], consistency: 0, streak: 0, state: "active", color: "amber" },
  { id: "paused", name: "Journal", category: "Mindfulness", frequency: "Daily", consistency: 0, streak: 0, state: "paused", color: "rose" },
];

describe("shared app scheduling", () => {
  it("shows only active habits scheduled for the selected weekday", () => {
    const sunday = new Date(2026, 7, 9);
    expect(todaysHabits(habits, {}, sunday).map((habit) => habit.id)).toEqual(["daily", "custom"]);
    expect(isHabitScheduledOn(habits[1], sunday)).toBe(false);
  });

  it("restores the completion state for that date", () => {
    const sunday = new Date(2026, 7, 9);
    const result = todaysHabits(habits, { "2026-08-09": { daily: "complete", custom: "skipped" } }, sunday);
    expect(result.map(({ id, status }) => [id, status])).toEqual([["daily", "complete"], ["custom", "skipped"]]);
  });
});
