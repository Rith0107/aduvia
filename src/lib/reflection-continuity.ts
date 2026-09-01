import { calendarKey } from "@/lib/calendar";

export type PriorReflection = { dateKey: string; label: string; note: string };

function reflectionDate(dateKey: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 12);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

export function latestPriorReflection(reflections: Record<string, string>, today = new Date()): PriorReflection | null {
  const todayKey = calendarKey(today);
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 12);
  const yesterdayKey = calendarKey(yesterday);
  const latest = Object.entries(reflections)
    .filter(([dateKey, note]) => dateKey < todayKey && Boolean(note.trim()) && Boolean(reflectionDate(dateKey)))
    .sort(([a], [b]) => b.localeCompare(a))[0];
  if (!latest) return null;

  const [dateKey, note] = latest;
  const date = reflectionDate(dateKey)!;
  const label = dateKey === yesterdayKey
    ? "yesterday"
    : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
  return { dateKey, label, note: note.trim() };
}
