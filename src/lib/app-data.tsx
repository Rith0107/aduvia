"use client";

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { sampleHabitSummaries } from "@/features/habits/sample-data";
import type { HabitDay, HabitSummary } from "@/features/habits/types";
import { sampleQuests } from "@/features/quests/sample-data";
import type { QuestSummary } from "@/features/quests/types";
import type { TodayHabit } from "@/features/today/types";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type CompletionMap = Record<string, Record<string, "complete" | "skipped">>;
type AppData = {
  habits: HabitSummary[];
  setHabits: React.Dispatch<React.SetStateAction<HabitSummary[]>>;
  quests: QuestSummary[];
  setQuests: React.Dispatch<React.SetStateAction<QuestSummary[]>>;
  completions: CompletionMap;
  reflections: Record<string, string>;
  syncError: string | null;
  setHabitStatus: (habitId: string, status: "pending" | "complete" | "skipped", date?: Date) => void;
  saveReflection: (note: string, date?: Date) => Promise<boolean>;
};

const STORAGE_KEY = "aduvia-app-data-v1";
const AppDataContext = createContext<AppData | null>(null);
const weekdayKeys: HabitDay[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dayNumbers: Record<HabitDay, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

type RemoteCategory = { id: string; name: string; color: string | null };
type RemoteHabit = { id: string; name: string; schedule: unknown; priority: number; status: "active" | "paused" | "archived"; category_id: string | null };
type RemoteQuest = { id: string; title: string; target_date: string | null; estimated_minutes: number | null; status: string; category_id: string | null };
type RemoteCheckIn = { habit_id: string; scheduled_date: string; status: string };
type RemoteReflection = { reflection_date: string; note: string | null };

function hasRemoteConfiguration() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
}

function scheduleForRemote(habit: HabitSummary) {
  if (habit.frequency === "Daily") return { type: "daily" };
  if (habit.frequency === "Weekdays") return { type: "weekdays", days: [1, 2, 3, 4, 5] };
  return { type: habit.frequency === "3× weekly" ? "weekly" : "custom", days: scheduledDaysFor(habit).map((day) => dayNumbers[day]) };
}

function scheduleFromRemote(value: unknown): Pick<HabitSummary, "frequency" | "scheduledDays"> {
  const schedule = value && typeof value === "object" ? value as { type?: string; days?: number[] } : {};
  if (schedule.type === "daily") return { frequency: "Daily" };
  if (schedule.type === "weekdays") return { frequency: "Weekdays" };
  const scheduledDays = (schedule.days ?? []).map((day) => weekdayKeys[day]).filter(Boolean);
  return { frequency: schedule.type === "weekly" ? "3× weekly" : "Custom", scheduledDays };
}

function questStatusFromRemote(status: string): QuestSummary["status"] {
  if (status === "not_started") return "not-started";
  if (status === "in_progress") return "in-progress";
  if (status === "paused" || status === "blocked" || status === "completed") return status;
  return "paused";
}

function questStatusForRemote(status: QuestSummary["status"]) {
  return status.replace("-", "_");
}

function dateLabel(value: string | null, status: QuestSummary["status"]) {
  if (status === "completed") return "Completed";
  if (!value) return "This month";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function metricsForHabit(habitId: string, checkIns: RemoteCheckIn[]) {
  const records = checkIns.filter((item) => item.habit_id === habitId).sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date));
  const complete = records.filter((item) => item.status === "complete").length;
  let streak = 0;
  for (const record of records) {
    if (record.status !== "complete") break;
    streak += 1;
  }
  return { consistency: records.length ? Math.round(complete / records.length * 100) : 0, streak };
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function scheduledDaysFor(habit: HabitSummary): HabitDay[] {
  if (habit.scheduledDays?.length) return habit.scheduledDays;
  if (habit.frequency === "Daily") return weekdayKeys;
  if (habit.frequency === "Weekdays") return ["Mon", "Tue", "Wed", "Thu", "Fri"];
  if (habit.frequency === "3× weekly") return ["Sun", "Tue", "Thu"];
  return [];
}

export function isHabitScheduledOn(habit: HabitSummary, date: Date) {
  return habit.state === "active" && scheduledDaysFor(habit).includes(weekdayKeys[date.getDay()]);
}

function targetFor(habit: HabitSummary) {
  const match = habit.name.match(/(\d+\s*(?:minutes?|mins?|pages?|hours?|km|miles?))/i);
  return match?.[1] ?? habit.frequency;
}

export function todaysHabits(habits: HabitSummary[], completions: CompletionMap, date = new Date()): TodayHabit[] {
  const dayCompletions = completions[dateKey(date)] ?? {};
  return habits.filter((habit) => isHabitScheduledOn(habit, date)).map((habit) => {
    const status = dayCompletions[habit.id] ?? "pending";
    const complete = status === "complete";
    return {
      id: habit.id,
      name: habit.name,
      category: habit.category,
      target: targetFor(habit),
      priority: habit.isAnchor ? 3 : 2,
      completion: complete ? 1 : 0,
      status,
    };
  });
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState(sampleHabitSummaries);
  const [quests, setQuests] = useState(sampleQuests);
  const [completions, setCompletions] = useState<CompletionMap>({});
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);
  const [remoteUserId, setRemoteUserId] = useState<string | null>(null);
  const [categoryIds, setCategoryIds] = useState<Record<string, string>>({});
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasRemoteConfiguration()) return;
    let active = true;
    void (async () => {
      const supabase = createBrowserSupabaseClient();
      const { data: authData } = await supabase.auth.getUser();
      if (!active || !authData.user) return;
      const userId = authData.user.id;
      const [{ data: categoryRows, error: categoryError }, { data: habitRows, error: habitError }, { data: questRows, error: questError }, { data: checkInRows, error: checkInError }, { data: reflectionRows, error: reflectionError }] = await Promise.all([
        supabase.from("categories").select("id,name,color").eq("user_id", userId),
        supabase.from("habits").select("id,name,schedule,priority,status,category_id").eq("user_id", userId),
        supabase.from("side_quests").select("id,title,target_date,estimated_minutes,status,category_id").eq("user_id", userId),
        supabase.from("habit_check_ins").select("habit_id,scheduled_date,status").eq("user_id", userId),
        supabase.from("daily_reflections").select("reflection_date,note").eq("user_id", userId),
      ]);
      const error = categoryError || habitError || questError || checkInError || reflectionError;
      if (error) throw error;
      if (!active) return;
      const categories = (categoryRows ?? []) as RemoteCategory[];
      const categoryById = new Map(categories.map((category) => [category.id, category]));
      const checks = (checkInRows ?? []) as RemoteCheckIn[];
      setCategoryIds(Object.fromEntries(categories.map((category) => [category.name, category.id])));
      setHabits(((habitRows ?? []) as RemoteHabit[]).map((row) => {
        const category = row.category_id ? categoryById.get(row.category_id) : undefined;
        return { id: row.id, name: row.name, category: category?.name ?? "Personal", ...scheduleFromRemote(row.schedule), isAnchor: row.priority === 3, ...metricsForHabit(row.id, checks), state: row.status === "paused" ? "paused" : "active", color: (category?.color as HabitSummary["color"]) ?? "green" };
      }));
      setQuests(((questRows ?? []) as RemoteQuest[]).map((row) => {
        const status = questStatusFromRemote(row.status);
        const category = row.category_id ? categoryById.get(row.category_id) : undefined;
        return { id: row.id, title: row.title, category: category?.name ?? "Personal", status, dueLabel: dateLabel(row.target_date, status), effortHours: Math.max(1, Math.round((row.estimated_minutes ?? 60) / 60)), color: (category?.color as QuestSummary["color"]) ?? "green" };
      }));
      const completionState: CompletionMap = {};
      checks.forEach((check) => {
        const status = check.status === "complete" ? "complete" : "skipped";
        completionState[check.scheduled_date] = { ...(completionState[check.scheduled_date] ?? {}), [check.habit_id]: status };
      });
      setCompletions(completionState);
      setReflections(Object.fromEntries(((reflectionRows ?? []) as RemoteReflection[]).map((reflection) => [reflection.reflection_date, reflection.note ?? ""])));
      setRemoteUserId(userId);
      setHydrated(true);
    })().catch((error: unknown) => {
      if (!active) return;
      setHabits([]);
      setQuests([]);
      setCompletions({});
      setReflections({});
      setSyncError(error instanceof Error ? error.message : "Unable to load your Aduvia data.");
      setHydrated(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (hasRemoteConfiguration()) return;
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Partial<{ habits: HabitSummary[]; quests: QuestSummary[]; completions: CompletionMap; reflections: Record<string, string> }>;
          if (parsed.habits) setHabits(parsed.habits);
          if (parsed.quests) setQuests(parsed.quests);
          if (parsed.completions) setCompletions(parsed.completions);
          if (parsed.reflections) setReflections(parsed.reflections);
        } catch { /* Keep the safe sample state if storage is malformed. */ }
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated && !hasRemoteConfiguration()) window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ habits, quests, completions, reflections }));
  }, [completions, habits, hydrated, quests, reflections]);

  async function ensureCategories(names: string[]) {
    if (!remoteUserId) return categoryIds;
    const missing = [...new Set(names)].filter((name) => !categoryIds[name]);
    if (!missing.length) return categoryIds;
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase.from("categories").upsert(missing.map((name) => ({ user_id: remoteUserId, name })), { onConflict: "user_id,name" }).select("id,name");
    if (error) throw error;
    const next = { ...categoryIds, ...Object.fromEntries(((data ?? []) as Pick<RemoteCategory, "id" | "name">[]).map((category) => [category.name, category.id])) };
    setCategoryIds(next);
    return next;
  }

  function updateHabits(update: React.SetStateAction<HabitSummary[]>) {
    setHabits((current) => {
      const next = typeof update === "function" ? update(current) : update;
      if (remoteUserId) void (async () => {
        const categories = await ensureCategories(next.map((habit) => habit.category));
        const { error } = await createBrowserSupabaseClient().from("habits").upsert(next.map((habit) => ({ id: habit.id, user_id: remoteUserId, category_id: categories[habit.category] ?? null, name: habit.name, schedule: scheduleForRemote(habit), priority: habit.isAnchor ? 3 : 2, status: habit.state })));
        if (error) throw error;
      })().catch((error: unknown) => setSyncError(error instanceof Error ? error.message : "Unable to save habit changes."));
      return next;
    });
  }

  function updateQuests(update: React.SetStateAction<QuestSummary[]>) {
    setQuests((current) => {
      const next = typeof update === "function" ? update(current) : update;
      if (remoteUserId) void (async () => {
        const categories = await ensureCategories(next.map((quest) => quest.category));
        const month = new Date();
        const targetMonth = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-01`;
        const { error } = await createBrowserSupabaseClient().from("side_quests").upsert(next.map((quest) => ({ id: quest.id, user_id: remoteUserId, category_id: categories[quest.category] ?? null, title: quest.title, target_month: targetMonth, estimated_minutes: quest.effortHours * 60, progress: quest.status === "completed" ? 1 : 0, status: questStatusForRemote(quest.status) })));
        if (error) throw error;
      })().catch((error: unknown) => setSyncError(error instanceof Error ? error.message : "Unable to save quest changes."));
      return next;
    });
  }

  const value = useMemo<AppData>(() => ({
    habits, setHabits: updateHabits, quests, setQuests: updateQuests, completions, reflections, syncError,
    async saveReflection(note, date = new Date()) {
      const key = dateKey(date);
      const cleanNote = note.trim();
      setReflections((current) => ({ ...current, [key]: cleanNote }));
      if (!remoteUserId) return true;
      const { error } = await createBrowserSupabaseClient().from("daily_reflections").upsert({ user_id: remoteUserId, reflection_date: key, note: cleanNote }, { onConflict: "user_id,reflection_date" });
      if (error) {
        setSyncError(error.message);
        return false;
      }
      return true;
    },
    setHabitStatus(habitId, status, date = new Date()) {
      const key = dateKey(date);
      setCompletions((current) => {
        const day = { ...(current[key] ?? {}) };
        if (status === "pending") delete day[habitId];
        else day[habitId] = status;
        return { ...current, [key]: day };
      });
      if (remoteUserId) {
        const supabase = createBrowserSupabaseClient();
        const request = status === "pending"
          ? supabase.from("habit_check_ins").delete().eq("habit_id", habitId).eq("scheduled_date", key)
          : supabase.from("habit_check_ins").upsert({ user_id: remoteUserId, habit_id: habitId, scheduled_date: key, status: status === "complete" ? "complete" : "skipped", completion: status === "complete" ? 1 : 0, completed_at: status === "complete" ? new Date().toISOString() : null }, { onConflict: "habit_id,scheduled_date" });
        void (async () => {
          const result = await request;
          if (result.error) setSyncError(result.error.message);
        })();
      }
    },
  // The dispatcher functions intentionally use the latest render's remote identity and category map.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [categoryIds, completions, habits, quests, reflections, remoteUserId, syncError]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  return useContext(AppDataContext);
}
