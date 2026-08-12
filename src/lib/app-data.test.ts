import { describe, expect, it } from "vitest";

import type { HabitSummary } from "@/features/habits/types";
import { isHabitAvailableOn, isHabitScheduledOn, mergePendingMutation, shouldReloadForAuthEvent, todaysHabits } from "./app-data";

const habits: HabitSummary[] = [
  { id: "daily", name: "Walk 20 minutes", category: "Fitness", frequency: "Daily", consistency: 0, streak: 0, state: "active", color: "green" },
  { id: "weekdays", name: "Deep work", category: "Career", frequency: "Weekdays", consistency: 0, streak: 0, state: "active", color: "blue" },
  { id: "custom", name: "Swim", category: "Fitness", frequency: "Custom", scheduledDays: ["Sun"], consistency: 0, streak: 0, state: "active", color: "amber" },
  { id: "three-times", name: "Meditate", category: "Mindfulness", frequency: "3× weekly", consistency: 0, streak: 0, state: "active", color: "rose" },
  { id: "paused", name: "Journal", category: "Mindfulness", frequency: "Daily", consistency: 0, streak: 0, state: "paused", color: "rose" },
];

describe("shared app scheduling", () => {
  it("shows only active habits scheduled for the selected weekday", () => {
    const sunday = new Date(2026, 7, 9);
    expect(todaysHabits(habits, {}, sunday).map((habit) => habit.id)).toEqual(["daily", "custom", "three-times"]);
    expect(isHabitScheduledOn(habits[1], sunday)).toBe(false);
  });

  it("restores the completion state for that date", () => {
    const sunday = new Date(2026, 7, 9);
    const result = todaysHabits(habits, { "2026-08-09": { daily: "complete", custom: "skipped" } }, sunday);
    expect(result.map(({ id, status }) => [id, status])).toEqual([["daily", "complete"], ["custom", "skipped"], ["three-times", "pending"]]);
  });

  it("does not schedule a habit before the day it was created", () => {
    const newHabit = { ...habits[0], createdAt: "2026-08-11T18:00:00.000Z" };
    expect(isHabitAvailableOn(newHabit, new Date(2026, 7, 10))).toBe(false);
    expect(isHabitScheduledOn(newHabit, new Date(2026, 7, 10))).toBe(false);
    expect(isHabitAvailableOn(newHabit, new Date(2026, 7, 11))).toBe(true);
  });

  it("keeps only the latest pending write for the same record", () => {
    const queue = mergePendingMutation([
      { key: "check-in:2026-08-11:walk", status: "complete" },
      { key: "reflection:2026-08-11", status: "first note" },
    ], { key: "check-in:2026-08-11:walk", status: "skipped" });
    expect(queue).toEqual([
      { key: "reflection:2026-08-11", status: "first note" },
      { key: "check-in:2026-08-11:walk", status: "skipped" },
    ]);
  });

  it("reloads account data when authentication changes without requiring a page refresh", () => {
    expect(shouldReloadForAuthEvent("SIGNED_IN")).toBe(true);
    expect(shouldReloadForAuthEvent("TOKEN_REFRESHED")).toBe(true);
    expect(shouldReloadForAuthEvent("USER_UPDATED")).toBe(true);
    expect(shouldReloadForAuthEvent("SIGNED_OUT")).toBe(true);
    expect(shouldReloadForAuthEvent("INITIAL_SESSION")).toBe(false);
    expect(shouldReloadForAuthEvent("PASSWORD_RECOVERY")).toBe(false);
  });
});
