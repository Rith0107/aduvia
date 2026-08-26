import type { HabitDay, HabitSummary, HabitState } from "@/features/habits/types";
import { calendarKey, calendarParts } from "@/lib/calendar";

export type HabitCompletionMap = Record<string, Record<string, "complete" | "skipped">>;
export type ConsistencyCell = "done" | "missed" | "off" | "pending";

const weekdayKeys: HabitDay[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function scheduledDaysForConsistency(habit: HabitSummary): HabitDay[] {
  if (habit.scheduledDays?.length) return habit.scheduledDays;
  if (habit.frequency === "Daily") return weekdayKeys;
  if (habit.frequency === "Weekdays") return ["Mon", "Tue", "Wed", "Thu", "Fri"];
  if (habit.frequency === "3× weekly") return ["Sun", "Tue", "Thu"];
  return [];
}

function stateOnDate(habit: HabitSummary, date: Date): HabitState {
  const target = calendarKey(date);
  const events = [...(habit.statusHistory ?? [])]
    .filter((event) => calendarKey(new Date(event.effectiveAt)) <= target)
    .sort((a, b) => a.effectiveAt.localeCompare(b.effectiveAt));
  if (events.length) return events.at(-1)!.status;
  // Legacy/local data has no lifecycle ledger. Treat it as active historically;
  // the current state applies today until the first persisted event exists.
  return target === calendarKey(new Date()) ? habit.state : "active";
}

export function consistencyCell(
  habit: HabitSummary,
  date: Date,
  answer?: "complete" | "skipped",
  todayPending = false,
): ConsistencyCell {
  // An explicit answer is real history and wins over later lifecycle edits.
  if (answer) return answer === "complete" ? "done" : "missed";
  if (habit.createdAt && calendarKey(date) < calendarKey(new Date(habit.createdAt))) return "off";
  if (stateOnDate(habit, date) !== "active") return "off";
  if (!scheduledDaysForConsistency(habit).includes(calendarParts(date).weekday)) return "off";
  return todayPending ? "pending" : "missed";
}

export function monthlyConsistency(
  habits: HabitSummary[],
  completions: HabitCompletionMap,
  year: number,
  month: number,
  today = new Date(),
) {
  const currentMonth = year === today.getFullYear() && month === today.getMonth();
  const monthStart = new Date(year, month, 1);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const dayCount = currentMonth ? today.getDate() : monthStart < todayStart ? new Date(year, month + 1, 0).getDate() : 0;
  const todayKey = calendarKey(today);
  const scheduledToday = currentMonth
    ? habits.filter((habit) => consistencyCell(habit, today) !== "off")
    : [];
  const todayClosed = scheduledToday.length > 0 && scheduledToday.every((habit) => completions[todayKey]?.[habit.id]);
  const cells = habits.flatMap((habit) => Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(year, month, index + 1);
    const key = calendarKey(date);
    return consistencyCell(habit, date, completions[key]?.[habit.id], currentMonth && key === todayKey && !todayClosed);
  }));
  const counted = cells.filter((cell) => cell === "done" || cell === "missed");
  return counted.length ? Math.round(counted.filter((cell) => cell === "done").length / counted.length * 100) : 0;
}
