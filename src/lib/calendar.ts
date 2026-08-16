import type { HabitDay } from "@/features/habits/types";

export type CalendarParts = { year: number; month: number; day: number; weekday: HabitDay };

const weekdayMap: Record<string, HabitDay> = { Sun: "Sun", Mon: "Mon", Tue: "Tue", Wed: "Wed", Thu: "Thu", Fri: "Fri", Sat: "Sat" };

export function browserTimeZone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; }
  catch { return "UTC"; }
}

export function calendarParts(date = new Date(), timeZone = browserTimeZone()): CalendarParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return { year: Number(value("year")), month: Number(value("month")), day: Number(value("day")), weekday: weekdayMap[value("weekday")] ?? "Sun" };
}

export function calendarKey(date = new Date(), timeZone = browserTimeZone()) {
  const { year, month, day } = calendarParts(date, timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Matches side_quests.target_month's format — the first of the month, for
// whichever month `date` falls in.
export function monthKey(date = new Date(), timeZone = browserTimeZone()) {
  const { year, month } = calendarParts(date, timeZone);
  return `${year}-${String(month).padStart(2, "0")}-01`;
}
