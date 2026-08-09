"use client";

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { sampleHabitSummaries } from "@/features/habits/sample-data";
import type { HabitDay, HabitSummary } from "@/features/habits/types";
import { sampleQuests } from "@/features/quests/sample-data";
import type { QuestSummary } from "@/features/quests/types";
import type { TodayHabit } from "@/features/today/types";

type CompletionMap = Record<string, Record<string, "complete" | "skipped">>;
type AppData = {
  habits: HabitSummary[];
  setHabits: React.Dispatch<React.SetStateAction<HabitSummary[]>>;
  quests: QuestSummary[];
  setQuests: React.Dispatch<React.SetStateAction<QuestSummary[]>>;
  completions: CompletionMap;
  setHabitStatus: (habitId: string, status: "pending" | "complete" | "skipped", date?: Date) => void;
};

const STORAGE_KEY = "aduvia-app-data-v1";
const AppDataContext = createContext<AppData | null>(null);
const weekdayKeys: HabitDay[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function scheduledDaysFor(habit: HabitSummary): HabitDay[] {
  if (habit.scheduledDays?.length) return habit.scheduledDays;
  if (habit.frequency === "Daily") return weekdayKeys;
  if (habit.frequency === "Weekdays") return ["Mon", "Tue", "Wed", "Thu", "Fri"];
  if (habit.frequency === "3× weekly") return ["Mon", "Wed", "Fri"];
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
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Partial<{ habits: HabitSummary[]; quests: QuestSummary[]; completions: CompletionMap }>;
          if (parsed.habits) setHabits(parsed.habits);
          if (parsed.quests) setQuests(parsed.quests);
          if (parsed.completions) setCompletions(parsed.completions);
        } catch { /* Keep the safe sample state if storage is malformed. */ }
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ habits, quests, completions }));
  }, [completions, habits, hydrated, quests]);

  const value = useMemo<AppData>(() => ({
    habits, setHabits, quests, setQuests, completions,
    setHabitStatus(habitId, status, date = new Date()) {
      const key = dateKey(date);
      setCompletions((current) => {
        const day = { ...(current[key] ?? {}) };
        if (status === "pending") delete day[habitId];
        else day[habitId] = status;
        return { ...current, [key]: day };
      });
    },
  }), [completions, habits, quests]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  return useContext(AppDataContext);
}
