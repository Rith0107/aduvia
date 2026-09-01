import type { HabitSummary } from "@/features/habits/types";
import { calendarKey } from "@/lib/calendar";
import { consistencyCell, type HabitCompletionMap } from "@/lib/habit-consistency";

export type HabitHealth = {
  detail: string;
  label: string;
  rate: number | null;
  sampleSize: number;
  tone: "strong" | "steady" | "reset" | "learning" | "paused" | "completed";
};

export function habitHealth(habit: HabitSummary, completions: HabitCompletionMap, today = new Date()): HabitHealth {
  if (habit.state === "paused") return { detail: "Not currently scheduled", label: "Paused", rate: null, sampleSize: 0, tone: "paused" };
  if (habit.state === "completed") return { detail: "Kept as finished history", label: "Completed", rate: null, sampleSize: 0, tone: "completed" };

  const cells: Array<"done" | "missed"> = [];
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  for (let scanned = 0; scanned < 90 && cells.length < 8; scanned += 1) {
    const key = calendarKey(cursor);
    const answer = completions[key]?.[habit.id];
    const isToday = key === calendarKey(today);
    // An open current day is not a miss. It becomes evidence only after the
    // user explicitly checks in.
    if (!isToday || answer) {
      const cell = consistencyCell(habit, cursor, answer);
      if (cell === "done" || cell === "missed") cells.push(cell);
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  const completed = cells.filter((cell) => cell === "done").length;
  const rate = cells.length ? Math.round((completed / cells.length) * 100) : null;
  if (cells.length < 4 || rate === null) return { detail: `${cells.length} eligible ${cells.length === 1 ? "day" : "days"} so far`, label: "Learning your rhythm", rate, sampleSize: cells.length, tone: "learning" };
  if (rate >= 80) return { detail: `${completed} of ${cells.length} recent scheduled days`, label: "Strong rhythm", rate, sampleSize: cells.length, tone: "strong" };
  if (rate >= 55) return { detail: `${completed} of ${cells.length} recent scheduled days`, label: "Finding its pace", rate, sampleSize: cells.length, tone: "steady" };
  return { detail: `${completed} of ${cells.length} recent scheduled days`, label: "Ready for a reset", rate, sampleSize: cells.length, tone: "reset" };
}

export function habitHealthFromSummary(habit: HabitSummary): HabitHealth {
  if (habit.state !== "active") return habitHealth(habit, {});
  const sampleSize = habit.checkInCount ?? 0;
  if (sampleSize < 4) return { detail: `${sampleSize} eligible ${sampleSize === 1 ? "day" : "days"} so far`, label: "Learning your rhythm", rate: sampleSize ? habit.consistency : null, sampleSize, tone: "learning" };
  const completed = Math.round(sampleSize * habit.consistency / 100);
  if (habit.consistency >= 80) return { detail: `${completed} of ${sampleSize} recorded check-ins`, label: "Strong rhythm", rate: habit.consistency, sampleSize, tone: "strong" };
  if (habit.consistency >= 55) return { detail: `${completed} of ${sampleSize} recorded check-ins`, label: "Finding its pace", rate: habit.consistency, sampleSize, tone: "steady" };
  return { detail: `${completed} of ${sampleSize} recorded check-ins`, label: "Ready for a reset", rate: habit.consistency, sampleSize, tone: "reset" };
}
