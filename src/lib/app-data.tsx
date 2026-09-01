"use client";

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import type { AuthChangeEvent } from "@supabase/supabase-js";

import { sampleHabitSummaries } from "@/features/habits/sample-data";
import type { HabitDay, HabitSummary } from "@/features/habits/types";
import { inferHabitCategory } from "@/features/habits/infer-category";
import { sampleQuests } from "@/features/quests/sample-data";
import type { QuestSummary } from "@/features/quests/types";
import type { TodayHabit } from "@/features/today/types";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { browserTimeZone, calendarKey, calendarParts, monthKey } from "@/lib/calendar";

type CompletionMap = Record<string, Record<string, "complete" | "skipped">>;
type PendingMutation =
  | { key: "habits"; kind: "habits"; habits: HabitSummary[] }
  | { key: "quests"; kind: "quests"; quests: QuestSummary[] }
  | { key: string; kind: "check-in"; habitId: string; date: string; status: "pending" | "complete" | "skipped" }
  | { key: string; kind: "reflection"; date: string; note: string };
type AppData = {
  accountCreatedAt: string | null;
  habits: HabitSummary[];
  setHabits: React.Dispatch<React.SetStateAction<HabitSummary[]>>;
  quests: QuestSummary[];
  setQuests: React.Dispatch<React.SetStateAction<QuestSummary[]>>;
  completions: CompletionMap;
  reflections: Record<string, string>;
  /** Null means no preference saved to the account yet — caller falls back
   *  to its own local default. Non-null once loaded or after the user picks one. */
  palette: string | null;
  typography: string | null;
  setPalette: (value: string) => void;
  setTypography: (value: string) => void;
  isLoading: boolean;
  isSyncing: boolean;
  syncError: string | null;
  pendingSyncCount: number;
  retrySync: () => Promise<boolean>;
  deleteHabit: (habitId: string) => Promise<boolean>;
  deleteQuest: (questId: string) => Promise<boolean>;
  /** Copies an unfinished quest from a past month into the current one and
   *  marks the original as reviewed, so it stops showing up to ask about. */
  carryQuestForward: (questId: string) => Promise<boolean>;
  /** Marks a past quest's rollover decision as resolved without carrying
   *  it forward — it stays exactly as it was, just in the archive now. */
  declineQuestRollover: (questId: string) => Promise<boolean>;
  completeOnboarding: (newHabits: HabitSummary[], newQuests: QuestSummary[]) => Promise<boolean>;
  setHabitStatus: (habitId: string, status: "pending" | "complete" | "skipped", date?: Date) => void;
  saveReflection: (note: string, date?: Date) => Promise<boolean>;
};

// v2: side quests gained targetMonth/completedAt/carriedFromId/rolloverReviewedAt
// as required fields — bumped so older cached shapes are discarded instead
// of crashing the quests dashboard on read.
const STORAGE_KEY = "aduvia-app-data-v2";
const PENDING_SYNC_KEY = "aduvia-pending-sync-v1";
const AppDataContext = createContext<AppData | null>(null);
const weekdayKeys: HabitDay[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dayNumbers: Record<HabitDay, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function mergePendingMutation<T extends { key: string }>(current: T[], mutation: T) {
  return [...current.filter((item) => item.key !== mutation.key), mutation];
}

// TOKEN_REFRESHED fires every time the access token silently rotates in the
// background — routine and frequent, not a sign that habits/quests/etc.
// changed. Reloading all remote data on every refresh turned a background
// token rotation into a full data-layer reload loop, hammering Supabase on
// a timer instead of only when the signed-in identity actually changes.
export function shouldReloadForAuthEvent(event: AuthChangeEvent) {
  return event === "SIGNED_IN" || event === "USER_UPDATED" || event === "SIGNED_OUT";
}

type RemoteCategory = { id: string; name: string; color: string | null };
type RemoteHabit = { id: string; created_at: string; updated_at: string; name: string; schedule: unknown; priority: number; status: "active" | "paused" | "archived"; category_id: string | null };
type RemoteHabitStatus = { habit_id: string; status: "active" | "paused" | "archived"; effective_at: string };
type RemoteQuest = { id: string; title: string; target_date: string | null; target_month: string; estimated_minutes: number | null; status: string; category_id: string | null; completed_at: string | null; carried_from_id: string | null; rollover_reviewed_at: string | null };
type RemoteCheckIn = { habit_id: string; scheduled_date: string; status: string };
type RemoteReflection = { reflection_date: string; note: string | null };

function hasRemoteConfiguration() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  return fallback;
}

// A tab left open across a sleep or a long idle period can hold an access
// token that expired before its background refresh timer ever fired. A
// write sent with that token isn't rejected outright — PostgREST evaluates
// auth.uid() as if the request were unauthenticated, so it silently fails
// "row violates row-level security policy" instead of a clean 401. Forcing
// a refresh here whenever the token is near or past expiry avoids that.
async function ensureFreshSession(supabase: ReturnType<typeof createBrowserSupabaseClient>) {
  const { data } = await supabase.auth.getSession();
  const expiresAt = data.session?.expires_at;
  if (expiresAt && expiresAt * 1000 - Date.now() < 60_000) {
    await supabase.auth.refreshSession();
  }
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

// Older rows may still carry a status from before the status model was
// trimmed to just not-started/completed (e.g. "in_progress", "blocked") —
// anything but a literal "completed" folds into "not-started" rather than
// producing a value the UI no longer knows how to render.
function questStatusFromRemote(status: string): QuestSummary["status"] {
  return status === "completed" ? "completed" : "not-started";
}

function questStatusForRemote(status: QuestSummary["status"]) {
  return status.replace("-", "_");
}

// The DB's habit_status enum already had a third value ("archived") that the
// client never wired up — "completed" reuses it rather than adding a new one.
function habitStateFromRemote(status: string): HabitSummary["state"] {
  return status === "paused" ? "paused" : status === "archived" ? "completed" : "active";
}

function habitStateForRemote(state: HabitSummary["state"]) {
  return state === "completed" ? "archived" : state;
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
  return { consistency: records.length ? Math.round(complete / records.length * 100) : 0, checkInCount: records.length, streak };
}

export function scheduledDaysFor(habit: HabitSummary): HabitDay[] {
  if (habit.scheduledDays?.length) return habit.scheduledDays;
  if (habit.frequency === "Daily") return weekdayKeys;
  if (habit.frequency === "Weekdays") return ["Mon", "Tue", "Wed", "Thu", "Fri"];
  if (habit.frequency === "3× weekly") return ["Sun", "Tue", "Thu"];
  return [];
}

export function isHabitScheduledOn(habit: HabitSummary, date: Date) {
  return habit.state === "active" && isHabitAvailableOn(habit, date) && scheduledDaysFor(habit).includes(calendarParts(date).weekday);
}

export function isHabitAvailableOn(habit: HabitSummary, date: Date) {
  if (!habit.createdAt) return true;
  const created = new Date(habit.createdAt);
  return !Number.isNaN(created.getTime()) && calendarKey(date) >= calendarKey(created);
}

function targetFor(habit: HabitSummary) {
  const match = habit.name.match(/(\d+\s*(?:minutes?|mins?|pages?|hours?|km|miles?))/i);
  return match?.[1] ?? habit.frequency;
}

export function todaysHabits(habits: HabitSummary[], completions: CompletionMap, date = new Date()): TodayHabit[] {
  const dayCompletions = completions[calendarKey(date)] ?? {};
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
  // Sample content is only for an unconfigured local design preview. A real
  // account must render empty until its own Supabase rows have loaded.
  const [habits, setHabits] = useState(() => hasRemoteConfiguration() ? [] : sampleHabitSummaries);
  const [quests, setQuests] = useState(() => hasRemoteConfiguration() ? [] : sampleQuests);
  const [completions, setCompletions] = useState<CompletionMap>({});
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [palette, setPaletteState] = useState<string | null>(null);
  const [typography, setTypographyState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [remoteUserId, setRemoteUserId] = useState<string | null>(null);
  const [accountCreatedAt, setAccountCreatedAt] = useState<string | null>(null);
  const [categoryIds, setCategoryIds] = useState<Record<string, string>>({});
  const [syncError, setSyncError] = useState<string | null>(null);
  const [pendingMutations, setPendingMutations] = useState<PendingMutation[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!hasRemoteConfiguration()) return;
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(PENDING_SYNC_KEY);
        if (saved) setPendingMutations(JSON.parse(saved) as PendingMutation[]);
      } catch { /* A malformed retry queue must not block the app. */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasRemoteConfiguration()) return;
    try {
      if (pendingMutations.length) window.localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pendingMutations));
      else window.localStorage.removeItem(PENDING_SYNC_KEY);
    } catch { /* The current session can still retry even if storage is unavailable. */ }
  }, [pendingMutations]);

  useEffect(() => {
    if (!hydrated || !remoteUserId || !pendingMutations.length) return;
    const timer = window.setTimeout(() => {
      for (const mutation of pendingMutations) {
        if (mutation.kind === "habits") setHabits(mutation.habits);
        else if (mutation.kind === "quests") setQuests(mutation.quests);
        else if (mutation.kind === "reflection") setReflections((current) => ({ ...current, [mutation.date]: mutation.note }));
        else setCompletions((current) => {
          const day = { ...(current[mutation.date] ?? {}) };
          if (mutation.status === "pending") delete day[mutation.habitId];
          else day[mutation.habitId] = mutation.status;
          return { ...current, [mutation.date]: day };
        });
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [hydrated, pendingMutations, remoteUserId]);

  useEffect(() => {
    if (!hasRemoteConfiguration()) return;
    let active = true;
    const supabase = createBrowserSupabaseClient();

    const clearRemoteData = () => {
      setHabits([]);
      setQuests([]);
      setCompletions({});
      setReflections({});
      setCategoryIds({});
      setPaletteState(null);
      setTypographyState(null);
      setRemoteUserId(null);
      setAccountCreatedAt(null);
      setSyncError(null);
    };

    const loadRemoteData = async () => {
      setHydrated(false);
      const supabase = createBrowserSupabaseClient();
      const { data: authData } = await supabase.auth.getUser();
      if (!active) return;
      if (!authData.user) {
        clearRemoteData();
        setHydrated(true);
        return;
      }
      const userId = authData.user.id;
      setAccountCreatedAt(authData.user.created_at ?? null);
      const detectedTimeZone = browserTimeZone();
      void supabase.from("profiles").update({ timezone: detectedTimeZone }).eq("id", userId);
      const [{ data: categoryRows, error: categoryError }, { data: habitRows, error: habitError }, { data: questRows, error: questError }, { data: checkInRows, error: checkInError }, { data: reflectionRows, error: reflectionError }, { data: profileRow, error: profileError }] = await Promise.all([
        supabase.from("categories").select("id,name,color").eq("user_id", userId),
        supabase.from("habits").select("id,created_at,updated_at,name,schedule,priority,status,category_id").eq("user_id", userId),
        supabase.from("side_quests").select("id,title,target_date,target_month,estimated_minutes,status,category_id,completed_at,carried_from_id,rollover_reviewed_at").eq("user_id", userId),
        supabase.from("habit_check_ins").select("habit_id,scheduled_date,status").eq("user_id", userId),
        supabase.from("daily_reflections").select("reflection_date,note").eq("user_id", userId),
        supabase.from("profiles").select("palette,typography").eq("id", userId).maybeSingle(),
      ]);
      const { data: statusRows, error: statusError } = await supabase.from("habit_status_history").select("habit_id,status,effective_at").eq("user_id", userId).order("effective_at");
      // Deployments remain readable while the additive lifecycle migration is
      // rolling out. PGRST205 is PostgREST's "table not found in schema cache";
      // all other errors still surface because they indicate a real auth/data issue.
      const historyTableUnavailable = statusError?.code === "PGRST205" || statusError?.code === "42P01";
      const error = categoryError || habitError || questError || checkInError || reflectionError || profileError || (historyTableUnavailable ? null : statusError);
      if (error) throw error;
      if (!active) return;
      setPaletteState(profileRow?.palette ?? null);
      setTypographyState(profileRow?.typography ?? null);
      const categories = (categoryRows ?? []) as RemoteCategory[];
      const categoryById = new Map(categories.map((category) => [category.id, category]));
      const checks = (checkInRows ?? []) as RemoteCheckIn[];
      const statuses = (statusRows ?? []) as RemoteHabitStatus[];
      setCategoryIds(Object.fromEntries(categories.map((category) => [category.name, category.id])));
      setHabits(((habitRows ?? []) as RemoteHabit[]).map((row) => {
        const category = row.category_id ? categoryById.get(row.category_id) : undefined;
        const inferred = inferHabitCategory(row.name);
        const useInferred = !category || category.name === "Personal";
        const state = habitStateFromRemote(row.status);
        const storedHistory = statuses.filter((event) => event.habit_id === row.id).map((event) => ({ status: habitStateFromRemote(event.status), effectiveAt: event.effective_at }));
        const fallbackHistory = [{ status: "active" as const, effectiveAt: row.created_at }, ...(state === "active" ? [] : [{ status: state, effectiveAt: row.updated_at }])];
        return { id: row.id, createdAt: row.created_at, statusHistory: storedHistory.length ? storedHistory : fallbackHistory, name: row.name, category: useInferred ? inferred.category : category.name, ...scheduleFromRemote(row.schedule), isAnchor: row.priority === 3, ...metricsForHabit(row.id, checks), state, color: useInferred ? inferred.color : (category.color as HabitSummary["color"]) ?? inferred.color };
      }));
      setQuests(((questRows ?? []) as RemoteQuest[]).map((row) => {
        const status = questStatusFromRemote(row.status);
        const category = row.category_id ? categoryById.get(row.category_id) : undefined;
        return { id: row.id, title: row.title, category: category?.name ?? "Personal", status, dueLabel: dateLabel(row.target_date, status), effortHours: Math.max(1, Math.round((row.estimated_minutes ?? 60) / 60)), color: (category?.color as QuestSummary["color"]) ?? "green", targetMonth: row.target_month, completedAt: row.completed_at, carriedFromId: row.carried_from_id, rolloverReviewedAt: row.rollover_reviewed_at };
      }));
      const completionState: CompletionMap = {};
      checks.forEach((check) => {
        const status = check.status === "complete" ? "complete" : "skipped";
        completionState[check.scheduled_date] = { ...(completionState[check.scheduled_date] ?? {}), [check.habit_id]: status };
      });
      setCompletions(completionState);
      setReflections(Object.fromEntries(((reflectionRows ?? []) as RemoteReflection[]).map((reflection) => [reflection.reflection_date, reflection.note ?? ""])));
      setRemoteUserId(userId);
      setSyncError(null);
      setHydrated(true);
    };

    // Belt-and-suspenders against any burst of auth events still landing
    // close together: a reload already in flight absorbs the rest rather
    // than each one kicking off its own overlapping fetch.
    let loadInFlight = false;
    const loadSafely = () => {
      if (loadInFlight) return;
      loadInFlight = true;
      void loadRemoteData().catch((error: unknown) => {
        if (!active) return;
        clearRemoteData();
        setSyncError(errorMessage(error, "Unable to load your Aduvia data."));
        setHydrated(true);
      }).finally(() => { loadInFlight = false; });
    };

    loadSafely();
    const { data: authListener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (shouldReloadForAuthEvent(event)) {
        window.setTimeout(loadSafely, 0);
      }
    });
    window.addEventListener("aduvia:session-changed", loadSafely);

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
      window.removeEventListener("aduvia:session-changed", loadSafely);
    };
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

  function queueMutation(mutation: PendingMutation) {
    setPendingMutations((current) => mergePendingMutation(current, mutation));
    setSyncError("Your change is saved on this device and waiting to sync.");
  }

  async function saveHabitsRemote(next: HabitSummary[]) {
    if (!remoteUserId) throw new Error("Your session is unavailable.");
    const categories = await ensureCategories(next.map((habit) => habit.category));
    const { error } = await createBrowserSupabaseClient().from("habits").upsert(next.map((habit) => ({ id: habit.id, user_id: remoteUserId, category_id: categories[habit.category] ?? null, name: habit.name, schedule: scheduleForRemote(habit), priority: habit.isAnchor ? 3 : 2, status: habitStateForRemote(habit.state) })));
    if (error) throw error;
  }

  async function saveQuestsRemote(next: QuestSummary[]) {
    if (!remoteUserId) throw new Error("Your session is unavailable.");
    const categories = await ensureCategories(next.map((quest) => quest.category));
    // target_month is intentionally omitted here: it's set once, either by
    // the DB default (new quest) or when carrying a quest forward — an
    // ordinary edit must never move a quest into a different month.
    // completed_at is trigger-managed for the same reason.
    const { error } = await createBrowserSupabaseClient().from("side_quests").upsert(next.map((quest) => ({ id: quest.id, user_id: remoteUserId, category_id: categories[quest.category] ?? null, title: quest.title, estimated_minutes: quest.effortHours * 60, progress: quest.status === "completed" ? 1 : 0, status: questStatusForRemote(quest.status) })));
    if (error) throw error;
  }

  async function applyPendingMutation(mutation: PendingMutation) {
    if (!remoteUserId) throw new Error("Your session is unavailable.");
    const supabase = createBrowserSupabaseClient();
    await ensureFreshSession(supabase);
    if (mutation.kind === "habits") return saveHabitsRemote(mutation.habits);
    if (mutation.kind === "quests") return saveQuestsRemote(mutation.quests);
    if (mutation.kind === "reflection") {
      const { error } = await supabase.from("daily_reflections").upsert({ user_id: remoteUserId, reflection_date: mutation.date, note: mutation.note }, { onConflict: "user_id,reflection_date" });
      if (error) throw error;
      return;
    }
    const request = mutation.status === "pending"
      ? supabase.from("habit_check_ins").delete().eq("user_id", remoteUserId).eq("habit_id", mutation.habitId).eq("scheduled_date", mutation.date)
      : supabase.from("habit_check_ins").upsert({ user_id: remoteUserId, habit_id: mutation.habitId, scheduled_date: mutation.date, status: mutation.status === "complete" ? "complete" : "skipped", completion: mutation.status === "complete" ? 1 : 0, completed_at: mutation.status === "complete" ? new Date().toISOString() : null }, { onConflict: "habit_id,scheduled_date" });
    const { error } = await request;
    if (error) throw error;
  }

  function updateHabits(update: React.SetStateAction<HabitSummary[]>) {
    setHabits((current) => {
      const proposed = typeof update === "function" ? update(current) : update;
      const changedAt = new Date().toISOString();
      const next = proposed.map((habit) => {
        const previous = current.find((item) => item.id === habit.id);
        if (!previous || previous.state === habit.state) return habit;
        return { ...habit, statusHistory: [...(habit.statusHistory ?? previous.statusHistory ?? []), { status: habit.state, effectiveAt: changedAt }] };
      });
      if (remoteUserId) void saveHabitsRemote(next).then(() => setPendingMutations((items) => items.filter((item) => item.key !== "habits"))).catch(() => queueMutation({ key: "habits", kind: "habits", habits: next }));
      return next;
    });
  }

  function updateQuests(update: React.SetStateAction<QuestSummary[]>) {
    setQuests((current) => {
      const next = typeof update === "function" ? update(current) : update;
      if (remoteUserId) void saveQuestsRemote(next).then(() => setPendingMutations((items) => items.filter((item) => item.key !== "quests"))).catch(() => queueMutation({ key: "quests", kind: "quests", quests: next }));
      return next;
    });
  }

  const value = useMemo<AppData>(() => ({
    accountCreatedAt, habits, setHabits: updateHabits, quests, setQuests: updateQuests, completions, reflections, palette, typography, isLoading: !hydrated, isSyncing, syncError, pendingSyncCount: pendingMutations.length,
    setPalette(next) {
      setPaletteState(next);
      if (!remoteUserId) return;
      // A previous version of this call never checked its result — a
      // failed write, or an update that matched zero rows (e.g. because
      // remoteUserId no longer matches the row RLS allows), looked
      // identical to success and left the account silently un-synced.
      void createBrowserSupabaseClient().from("profiles").update({ palette: next }).eq("id", remoteUserId).select("id").then(({ data, error }: { data: unknown[] | null; error: unknown }) => {
        if (error) setSyncError(errorMessage(error, "Could not save your palette."));
        else if (!data?.length) setSyncError("Your palette didn't save — please try again.");
      });
    },
    setTypography(next) {
      setTypographyState(next);
      if (!remoteUserId) return;
      void createBrowserSupabaseClient().from("profiles").update({ typography: next }).eq("id", remoteUserId).select("id").then(({ data, error }: { data: unknown[] | null; error: unknown }) => {
        if (error) setSyncError(errorMessage(error, "Could not save your typography."));
        else if (!data?.length) setSyncError("Your typography didn't save — please try again.");
      });
    },
    async retrySync() {
      if (!remoteUserId || !pendingMutations.length || isSyncing) return pendingMutations.length === 0;
      setIsSyncing(true);
      let remaining = [...pendingMutations];
      for (const mutation of pendingMutations) {
        try {
          await applyPendingMutation(mutation);
          remaining = remaining.filter((item) => item.key !== mutation.key);
          setPendingMutations(remaining);
        } catch (error) {
          setSyncError(errorMessage(error, "Aduvia is still unable to sync. Your changes remain saved on this device."));
          setIsSyncing(false);
          return false;
        }
      }
      setSyncError(null);
      setIsSyncing(false);
      return true;
    },
    async deleteHabit(habitId) {
      if (remoteUserId) {
        const { error } = await createBrowserSupabaseClient().from("habits").delete().eq("user_id", remoteUserId).eq("id", habitId);
        if (error) {
          setSyncError(error.message);
          return false;
        }
      }
      setHabits((current) => current.filter((habit) => habit.id !== habitId));
      setCompletions((current) => Object.fromEntries(Object.entries(current).map(([date, day]) => {
        const nextDay = { ...day };
        delete nextDay[habitId];
        return [date, nextDay];
      })));
      return true;
    },
    async deleteQuest(questId) {
      if (remoteUserId) {
        const { error } = await createBrowserSupabaseClient().from("side_quests").delete().eq("user_id", remoteUserId).eq("id", questId);
        if (error) {
          setSyncError(error.message);
          return false;
        }
      }
      setQuests((current) => current.filter((quest) => quest.id !== questId));
      return true;
    },
    async carryQuestForward(questId) {
      const source = quests.find((quest) => quest.id === questId);
      if (!source) return false;
      const reviewedAt = new Date().toISOString();
      const carried: QuestSummary = { ...source, id: crypto.randomUUID(), targetMonth: monthKey(), dueLabel: "This month", completedAt: null, carriedFromId: questId, rolloverReviewedAt: null };
      if (remoteUserId) {
        try {
          const categories = await ensureCategories([carried.category]);
          const supabase = createBrowserSupabaseClient();
          const { error: insertError } = await supabase.from("side_quests").insert({ id: carried.id, user_id: remoteUserId, category_id: categories[carried.category] ?? null, title: carried.title, estimated_minutes: carried.effortHours * 60, progress: 0, status: questStatusForRemote(carried.status), carried_from_id: questId });
          if (insertError) throw insertError;
          const { error: reviewError } = await supabase.from("side_quests").update({ rollover_reviewed_at: reviewedAt }).eq("user_id", remoteUserId).eq("id", questId);
          if (reviewError) throw reviewError;
        } catch (error) {
          setSyncError(errorMessage(error, "Could not carry that quest forward."));
          return false;
        }
      }
      setQuests((current) => [...current, carried].map((quest) => quest.id === questId ? { ...quest, rolloverReviewedAt: reviewedAt } : quest));
      return true;
    },
    async declineQuestRollover(questId) {
      const reviewedAt = new Date().toISOString();
      if (remoteUserId) {
        const { error } = await createBrowserSupabaseClient().from("side_quests").update({ rollover_reviewed_at: reviewedAt }).eq("user_id", remoteUserId).eq("id", questId);
        if (error) {
          setSyncError(error.message);
          return false;
        }
      }
      setQuests((current) => current.map((quest) => quest.id === questId ? { ...quest, rolloverReviewedAt: reviewedAt } : quest));
      return true;
    },
    async completeOnboarding(newHabits, newQuests) {
      try {
        if (hasRemoteConfiguration()) {
          const supabase = createBrowserSupabaseClient();
          const userId = remoteUserId ?? (await supabase.auth.getUser()).data.user?.id;
          if (!userId) throw new Error("Your session has expired. Please log in again.");
          const categoryNames = [...new Set([...newHabits.map((habit) => habit.category), ...newQuests.map((quest) => quest.category)])];
          const { data: categories, error: categoryError } = await supabase.from("categories").upsert(categoryNames.map((name) => ({ user_id: userId, name })), { onConflict: "user_id,name" }).select("id,name");
          if (categoryError) throw categoryError;
          const ids = Object.fromEntries(((categories ?? []) as Pick<RemoteCategory, "id" | "name">[]).map((category) => [category.name, category.id]));
          if (newHabits.length) {
            const { error } = await supabase.from("habits").upsert(newHabits.map((habit) => ({ id: habit.id, user_id: userId, category_id: ids[habit.category] ?? null, name: habit.name, schedule: scheduleForRemote(habit), priority: habit.isAnchor ? 3 : 2, status: habitStateForRemote(habit.state) })));
            if (error) throw error;
          }
          if (newQuests.length) {
            const { error } = await supabase.from("side_quests").upsert(newQuests.map((quest) => ({ id: quest.id, user_id: userId, category_id: ids[quest.category] ?? null, title: quest.title, estimated_minutes: quest.effortHours * 60, progress: 0, status: questStatusForRemote(quest.status) })));
            if (error) throw error;
          }
          const { error: profileError } = await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", userId);
          if (profileError) throw profileError;
          setRemoteUserId(userId);
          setCategoryIds((current) => ({ ...current, ...ids }));
        }
        setHabits(newHabits);
        setQuests(newQuests);
        setSyncError(null);
        return true;
      } catch (error) {
        setSyncError(errorMessage(error, "Unable to finish setup."));
        return false;
      }
    },
    async saveReflection(note, date = new Date()) {
      const key = calendarKey(date);
      const cleanNote = note.trim();
      setReflections((current) => ({ ...current, [key]: cleanNote }));
      if (!remoteUserId) return true;
      const supabase = createBrowserSupabaseClient();
      await ensureFreshSession(supabase);
      const { error } = await supabase.from("daily_reflections").upsert({ user_id: remoteUserId, reflection_date: key, note: cleanNote }, { onConflict: "user_id,reflection_date" });
      if (error) {
        queueMutation({ key: `reflection:${key}`, kind: "reflection", date: key, note: cleanNote });
        return false;
      }
      setPendingMutations((items) => items.filter((item) => item.key !== `reflection:${key}`));
      return true;
    },
    setHabitStatus(habitId, status, date = new Date()) {
      const key = calendarKey(date);
      setCompletions((current) => {
        const day = { ...(current[key] ?? {}) };
        if (status === "pending") delete day[habitId];
        else day[habitId] = status;
        return { ...current, [key]: day };
      });
      if (remoteUserId) {
        const supabase = createBrowserSupabaseClient();
        void (async () => {
          await ensureFreshSession(supabase);
          const request = status === "pending"
            ? supabase.from("habit_check_ins").delete().eq("habit_id", habitId).eq("scheduled_date", key)
            : supabase.from("habit_check_ins").upsert({ user_id: remoteUserId, habit_id: habitId, scheduled_date: key, status: status === "complete" ? "complete" : "skipped", completion: status === "complete" ? 1 : 0, completed_at: status === "complete" ? new Date().toISOString() : null }, { onConflict: "habit_id,scheduled_date" });
          const result = await request;
          const mutationKey = `check-in:${key}:${habitId}`;
          if (result.error) queueMutation({ key: mutationKey, kind: "check-in", habitId, date: key, status });
          else setPendingMutations((items) => items.filter((item) => item.key !== mutationKey));
        })();
      }
    },
  // The dispatcher functions intentionally use the latest render's remote identity and category map.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [accountCreatedAt, categoryIds, completions, habits, hydrated, isSyncing, palette, pendingMutations, quests, reflections, remoteUserId, syncError, typography]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  return useContext(AppDataContext);
}
