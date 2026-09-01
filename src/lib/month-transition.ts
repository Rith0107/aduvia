import type { HabitSummary } from "@/features/habits/types";
import type { QuestSummary } from "@/features/quests/types";
import { browserTimeZone, calendarParts } from "@/lib/calendar";
import { consistencyCell, type HabitCompletionMap } from "@/lib/habit-consistency";

export type NewMonthSummary = {
  activeHabitCount: number;
  completedQuestCount: number;
  consistency: number | null;
  currentMonthKey: string;
  currentMonthLabel: string;
  dismissalKey: string;
  previousMonthKey: string;
  previousMonthLabel: string;
  previousQuestCount: number;
};

const monthLabel = (year: number, monthIndex: number) => new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(Date.UTC(year, monthIndex, 1)));

export function newMonthWindow(today = new Date(), timeZone = browserTimeZone()) {
  const current = calendarParts(today, timeZone);
  if (current.day > 4) return null;

  const previousDate = new Date(Date.UTC(current.year, current.month - 2, 1));
  const previousYear = previousDate.getUTCFullYear();
  const previousMonthIndex = previousDate.getUTCMonth();
  const currentMonthIndex = current.month - 1;
  return {
    currentMonthIndex,
    currentMonthKey: `${current.year}-${String(current.month).padStart(2, "0")}-01`,
    currentMonthLabel: monthLabel(current.year, currentMonthIndex),
    currentYear: current.year,
    previousMonthIndex,
    previousMonthKey: `${previousYear}-${String(previousMonthIndex + 1).padStart(2, "0")}-01`,
    previousMonthLabel: monthLabel(previousYear, previousMonthIndex),
    previousYear,
  };
}

export function buildNewMonthSummary(
  habits: HabitSummary[],
  quests: QuestSummary[],
  completions: HabitCompletionMap,
  today = new Date(),
  timeZone = browserTimeZone(),
): NewMonthSummary | null {
  const window = newMonthWindow(today, timeZone);
  if (!window) return null;

  const dayCount = new Date(window.previousYear, window.previousMonthIndex + 1, 0).getDate();
  let completedHabitChecks = 0;
  let eligibleHabitChecks = 0;
  for (let day = 1; day <= dayCount; day += 1) {
    const date = new Date(window.previousYear, window.previousMonthIndex, day, 12);
    const dateKey = `${window.previousYear}-${String(window.previousMonthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    for (const habit of habits) {
      const cell = consistencyCell(habit, date, completions[dateKey]?.[habit.id]);
      if (cell === "done") {
        completedHabitChecks += 1;
        eligibleHabitChecks += 1;
      } else if (cell === "missed") eligibleHabitChecks += 1;
    }
  }

  const previousQuests = quests.filter((quest) => quest.targetMonth === window.previousMonthKey);
  // A brand-new account should not be told that an empty month was archived.
  if (!eligibleHabitChecks && !previousQuests.length) return null;

  return {
    activeHabitCount: habits.filter((habit) => habit.state === "active").length,
    completedQuestCount: previousQuests.filter((quest) => quest.status === "completed").length,
    consistency: eligibleHabitChecks ? Math.round((completedHabitChecks / eligibleHabitChecks) * 100) : null,
    currentMonthKey: window.currentMonthKey,
    currentMonthLabel: window.currentMonthLabel,
    dismissalKey: `aduvia-month-welcome-dismissed:${window.currentMonthKey}`,
    previousMonthKey: window.previousMonthKey,
    previousMonthLabel: window.previousMonthLabel,
    previousQuestCount: previousQuests.length,
  };
}
