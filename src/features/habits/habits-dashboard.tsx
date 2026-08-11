"use client";

import { FormEvent, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Flag, Flame, Gauge, ListChecks } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { ActivityIcon } from "@/components/activity-icon";
import { scheduledDaysFor, useAppData } from "@/lib/app-data";
import { inferHabitCategory } from "./infer-category";
import type { HabitDay, HabitFrequency, HabitSummary } from "./types";

type HabitsDashboardProps = { initialHabits: HabitSummary[] };
const days: { short: HabitDay; label: string }[] = [
  { short: "Mon", label: "Monday" }, { short: "Tue", label: "Tuesday" },
  { short: "Wed", label: "Wednesday" }, { short: "Thu", label: "Thursday" },
  { short: "Fri", label: "Friday" }, { short: "Sat", label: "Saturday" },
  { short: "Sun", label: "Sunday" },
];

export function HabitsDashboard({ initialHabits }: HabitsDashboardProps) {
  const appData = useAppData();
  const [localHabits, setLocalHabits] = useState(initialHabits);
  const habits = appData?.habits ?? localHabits;
  const setHabits = appData?.setHabits ?? setLocalHabits;
  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");
  const [isCreating, setIsCreating] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("Daily");
  const [selectedDays, setSelectedDays] = useState<HabitDay[]>([]);
  const [isAnchor, setIsAnchor] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [scheduleDraft, setScheduleDraft] = useState<HabitDay[]>([]);

  const visibleHabits = useMemo(
    () => habits.filter((habit) => filter === "all" || habit.state === filter),
    [filter, habits],
  );
  const averageConsistency = habits.length
    ? Math.round(habits.reduce((sum, habit) => sum + habit.consistency, 0) / habits.length)
    : 0;

  function toggleState(id: string) {
    setHabits((current) =>
      current.map((habit) =>
        habit.id === id
          ? { ...habit, state: habit.state === "active" ? "paused" : "active" }
          : habit,
      ),
    );
  }

  function beginScheduleEdit(habit: HabitSummary) {
    setEditingScheduleId(habit.id);
    setScheduleDraft(scheduledDaysFor(habit));
  }

  function saveSchedule(id: string) {
    if (!scheduleDraft.length) return;
    setHabits((current) => current.map((habit) => habit.id === id ? { ...habit, frequency: scheduleDraft.length === 7 ? "Daily" : "Custom", scheduledDays: scheduleDraft } : habit));
    setEditingScheduleId(null);
    setScheduleDraft([]);
  }

  function resetHabitForm() {
    setName("");
    setFrequency("Daily");
    setSelectedDays([]);
    setIsAnchor(false);
    setEditingHabitId(null);
    setConfirmingDelete(false);
    setIsCreating(false);
  }

  function openCreateHabit() {
    resetHabitForm();
    setIsCreating(true);
  }

  function openEditHabit(habit: HabitSummary) {
    setName(habit.name);
    setFrequency(habit.frequency);
    setSelectedDays(habit.scheduledDays ?? []);
    setIsAnchor(Boolean(habit.isAnchor));
    setEditingHabitId(habit.id);
    setConfirmingDelete(false);
    setIsCreating(true);
  }

  function saveHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;

    const inferred = inferHabitCategory(name.trim());
    setHabits((current) => editingHabitId ? current.map((habit) => {
      if (habit.id !== editingHabitId) return isAnchor ? { ...habit, isAnchor: false } : habit;
      return { ...habit, name: name.trim(), category: inferred.category, color: inferred.color, frequency, scheduledDays: frequency === "Custom" || frequency === "3× weekly" ? selectedDays : undefined, isAnchor };
    }) : [
      ...current.map((habit) => isAnchor ? { ...habit, isAnchor: false } : habit), {
        id: crypto.randomUUID(),
        name: name.trim(),
        category: inferred.category,
        frequency,
        scheduledDays: frequency === "Custom" || frequency === "3× weekly" ? selectedDays : undefined,
        isAnchor,
        consistency: 0,
        streak: 0,
        state: "active",
        color: inferred.color,
      },
    ]);
    resetHabitForm();
    setFilter("all");
  }

  async function deleteEditingHabit() {
    if (!editingHabitId) return;
    const deleted = appData ? await appData.deleteHabit(editingHabitId) : (setLocalHabits((current) => current.filter((habit) => habit.id !== editingHabitId)), true);
    if (deleted) resetHabitForm();
  }

  return (
    <AppShell active="Habits" eyebrow="Build your rhythm" title={<>Habits that feel<br />like your own.</>} action={<button className="rounded-full bg-[var(--soft-ink)] px-6 py-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5" onClick={openCreateHabit} type="button">+ New habit</button>}>
          <section className="mt-12 grid border-y border-black/[0.09] sm:grid-cols-[.7fr_1fr_1fr]">
            <div className="py-6 sm:border-r sm:border-black/[0.09] sm:pr-6"><p className="metric-label"><ListChecks aria-hidden className="text-[var(--soft-icon-green)]" />Active</p><p className="mt-4 text-5xl font-semibold tracking-[-0.06em]">{habits.filter((habit) => habit.state === "active").length}</p></div>
            <div className="border-t border-black/[0.09] py-6 sm:border-r sm:border-t-0 sm:px-6"><p className="metric-label"><Flame aria-hidden className="text-[var(--soft-icon-clay)]" />Best streak</p><p className="mt-4 text-4xl font-semibold tracking-[-0.05em]">{Math.max(0, ...habits.map((habit) => habit.streak))} days</p></div>
            <div className="border-t border-black/[0.09] py-6 sm:border-t-0 sm:pl-6"><p className="metric-label"><Gauge aria-hidden className="text-[var(--soft-icon-blue)]" />Consistency</p><p className="mt-4 text-4xl font-semibold tracking-[-0.05em]">{averageConsistency}%</p></div>
          </section>

          <section className="mt-10 border-t border-black/[0.09] pt-7">
            <div className="flex flex-col gap-4 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="text-xl font-semibold tracking-[-0.025em]">Habit library</h2><p className="mt-1 text-sm text-stone-500">Small systems that shape your days.</p></div>
              <div className="flex rounded-full bg-white/45 p-1">
                {(["all", "active", "paused"] as const).map((option) => (
                  <button className={`rounded-full px-4 py-2 text-xs font-bold capitalize transition ${filter === option ? "bg-[var(--soft-ink)] text-white" : "text-[var(--soft-muted)]"}`} key={option} onClick={() => setFilter(option)} type="button">{option}</button>
                ))}
              </div>
            </div>

            <div className="soft-flow soft-task-cards grid gap-3">
              {visibleHabits.map((habit) => {
                const scheduled = scheduledDaysFor(habit);
                return (
                  <article className="grid min-h-36 gap-5 border border-white/50 p-5 sm:p-6 lg:grid-cols-[minmax(250px,.9fr)_minmax(270px,1.1fr)_180px_90px_100px] lg:items-center xl:grid-cols-[minmax(300px,.9fr)_minmax(340px,1.2fr)_200px_100px_110px] xl:px-8" key={habit.id}>
                    <div className="flex items-center gap-5"><span className="grid size-12 shrink-0 place-items-center"><ActivityIcon activity={`${habit.name} ${habit.category}`} className="size-8" /></span><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-bold tracking-[-0.025em]">{habit.name}</h3>{habit.isAnchor && <span className="inline-flex items-center gap-1 rounded-full bg-[var(--soft-tint-b)] px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--soft-icon-clay)]"><Flag size={10} fill="currentColor" />Anchor</span>}</div><p className="mt-1 text-sm text-[var(--soft-muted)]">{habit.category} · {habit.scheduledDays?.length ? `${habit.frequency === "3× weekly" ? "3× · " : ""}${habit.scheduledDays.join(" · ")}` : habit.frequency}</p></div></div>
                    <div>{editingScheduleId === habit.id ? <div><div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[var(--soft-muted)]">Choose active days</p><button className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--soft-muted)]" onClick={() => setEditingScheduleId(null)} type="button">Cancel</button></div><div className="mt-2.5 grid max-w-sm grid-cols-7 gap-1.5">{days.map((day) => { const active = scheduleDraft.includes(day.short); return <button aria-label={`${day.label}: ${active ? "selected" : "not selected"}`} aria-pressed={active} className={`grid aspect-square max-w-9 place-items-center rounded-[10px] text-[10px] font-bold ${active ? "bg-[var(--soft-icon-green)] text-white" : "bg-white/45 text-[var(--soft-muted)] opacity-55"}`} key={day.short} onClick={() => setScheduleDraft((current) => current.includes(day.short) ? current.filter((item) => item !== day.short) : [...current, day.short])} type="button">{day.short.slice(0, 2)}</button>; })}</div><button className="mt-2 text-[10px] font-black uppercase tracking-[.1em] text-[var(--soft-icon-green)] disabled:opacity-35" disabled={!scheduleDraft.length} onClick={() => saveSchedule(habit.id)} type="button">Save schedule</button></div> : <div><div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[var(--soft-muted)]">Weekly cadence</p><button aria-label={`Edit schedule for ${habit.name}`} className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--soft-icon-green)]" onClick={() => beginScheduleEdit(habit)} type="button">Edit</button></div><div className="mt-2.5 grid max-w-sm grid-cols-7 gap-1.5">{days.map((day) => { const isScheduled = scheduled.includes(day.short); return <span aria-label={`${day.label}: ${isScheduled ? "scheduled" : "rest day"}`} className={`grid aspect-square max-w-9 place-items-center rounded-[10px] text-[10px] font-bold ${isScheduled ? "bg-[var(--soft-icon-green)] text-white" : "bg-white/45 text-[var(--soft-muted)] opacity-45"}`} key={day.short}>{day.short.slice(0, 2)}</span>; })}</div></div>}</div>
                    <div><p className="text-xs text-[var(--soft-muted)]">Consistency</p><div className="mt-2 flex items-center gap-2"><div className="h-2 flex-1 overflow-hidden rounded-full bg-white/55"><div className="h-full rounded-full bg-[var(--soft-icon-green)]" style={{ width: `${habit.consistency}%` }} /></div><span className="text-xs font-semibold">{habit.consistency}%</span></div></div>
                    <div><p className="text-xs text-stone-400">Streak</p><p className="mt-1 text-base font-semibold">{habit.streak} days</p></div>
                    <div className="grid gap-2"><button aria-label={`Edit ${habit.name}`} className="rounded-full bg-white/45 px-3 py-2 text-xs font-bold text-[var(--soft-muted)] transition hover:bg-white/70" onClick={() => openEditHabit(habit)} type="button">Edit</button><button className={`rounded-full px-3 py-2.5 text-xs font-bold transition ${habit.state === "active" ? "bg-white/55" : "bg-[var(--soft-ink)] text-white"}`} onClick={() => toggleState(habit.id)} type="button">{habit.state === "active" ? "Pause" : "Resume"}</button></div>
                  </article>
                );
              })}
            </div>
          </section>

      {isCreating && createPortal(
        <div aria-modal="true" className="creation-overlay" role="dialog">
          <form className="creation-sheet" onSubmit={saveHabit}>
            <button aria-label={`Close ${editingHabitId ? "edit" : "create"} habit`} className="creation-close" onClick={resetHabitForm} type="button">×</button>
            <aside className="creation-aside creation-aside-habit">
              <p className="soft-kicker">{editingHabitId ? "Refine rhythm" : "New rhythm"}</p>
              <div className="creation-preview"><ActivityIcon activity={name || "calendar schedule"} className="size-9" /></div>
              <div><h2>{editingHabitId ? <>Keep it true<br />to your life.</> : <>Make it easy<br />to return.</>}</h2><p>A useful habit is specific enough to start and gentle enough to repeat.</p></div>
              <span className="creation-step">01 · Habit details</span>
            </aside>
            <div className="creation-form">
              <div><p className="soft-kicker text-[var(--soft-accent)]">{editingHabitId ? "Edit habit" : "Create a habit"}</p><h3>{editingHabitId ? "What should change?" : "What will you repeat?"}</h3><p>Choose a small action. You can refine it whenever you need.</p></div>
              <label className="creation-field-label" htmlFor="habit-name">Habit name</label>
              <input autoFocus className="creation-field" id="habit-name" onChange={(event) => setName(event.target.value)} placeholder="e.g. Stretch for 10 minutes" value={name} />
              <div><p className="creation-field-label">Quick starts</p><div className="creation-presets">{["Drink water", "Read 20 pages", "Walk 30 minutes", "Meditate"].map((preset) => <button aria-pressed={name === preset} key={preset} onClick={() => setName(preset)} type="button"><ActivityIcon activity={preset} className="size-4" />{preset}</button>)}</div></div>
              <fieldset><legend className="creation-field-label">Frequency</legend><div className="creation-options">{(["Daily", "Weekdays", "3× weekly", "Custom"] as HabitFrequency[]).map((option) => <button aria-pressed={frequency === option} key={option} onClick={() => { setFrequency(option); if (option === "3× weekly") setSelectedDays((current) => current.slice(0, 3)); }} type="button">{option}</button>)}</div></fieldset>
              {(frequency === "Custom" || frequency === "3× weekly") && <fieldset className="creation-days"><legend className="creation-field-label">{frequency === "3× weekly" ? "Choose three days" : "Choose your days"}</legend><div>{days.map((day) => { const active = selectedDays.includes(day.short); return <button aria-label={`${day.label}: ${active ? "selected" : "not selected"}`} aria-pressed={active} disabled={frequency === "3× weekly" && selectedDays.length === 3 && !active} key={day.short} onClick={() => setSelectedDays((current) => current.includes(day.short) ? current.filter((item) => item !== day.short) : [...current, day.short])} type="button">{day.short.slice(0, 2)}</button>; })}</div><p>{frequency === "3× weekly" ? `${selectedDays.length} of 3 selected` : selectedDays.length ? selectedDays.join(" · ") : "Select at least one day"}</p></fieldset>}
              <button aria-pressed={isAnchor} className={`flex w-full items-center gap-4 rounded-[18px] border p-4 text-left transition ${isAnchor ? "border-[color:color-mix(in_srgb,var(--soft-accent)_35%,transparent)] bg-[var(--soft-tint-b)]" : "border-[color:color-mix(in_srgb,var(--soft-icon-green)_12%,transparent)] bg-[var(--soft-tint-a)] hover:brightness-[.98]"}`} onClick={() => setIsAnchor((current) => !current)} type="button"><span className={`grid size-10 shrink-0 place-items-center rounded-full ${isAnchor ? "bg-[var(--soft-icon-clay)] text-white" : "bg-white/70 text-[var(--soft-icon-green)]"}`}><Flag size={17} fill={isAnchor ? "currentColor" : "none"} /></span><span className="flex-1"><span className="block text-sm font-bold">Make this my anchor</span><span className="mt-1 block text-xs leading-5 text-[var(--soft-muted)]">Highlight it as your highest-priority commitment on scheduled days.</span></span><span className={`h-6 w-11 rounded-full p-1 transition ${isAnchor ? "bg-[var(--soft-icon-clay)]" : "bg-[color:color-mix(in_srgb,var(--soft-icon-green)_14%,transparent)]"}`}><span className={`block size-4 rounded-full bg-white transition-transform ${isAnchor ? "translate-x-5" : ""}`} /></span></button>
              {editingHabitId && (confirmingDelete ? <div className="rounded-[18px] border border-[var(--soft-icon-clay)]/25 bg-[var(--soft-tint-b)] p-4"><p className="text-sm font-bold">Delete this habit and its check-in history?</p><p className="mt-1 text-xs text-[var(--soft-muted)]">This cannot be undone.</p><div className="mt-3 flex gap-2"><button className="rounded-full bg-white/60 px-4 py-2 text-xs font-bold" onClick={() => setConfirmingDelete(false)} type="button">Keep habit</button><button className="rounded-full bg-[var(--soft-icon-clay)] px-4 py-2 text-xs font-bold text-white" onClick={() => void deleteEditingHabit()} type="button">Delete permanently</button></div></div> : <button className="self-start text-xs font-bold text-[var(--soft-icon-clay)]" onClick={() => setConfirmingDelete(true)} type="button">Delete habit</button>)}
              <div className="creation-actions"><button onClick={resetHabitForm} type="button">Cancel</button><button disabled={!name.trim() || (frequency === "Custom" && selectedDays.length === 0) || (frequency === "3× weekly" && selectedDays.length !== 3)} type="submit"><span>{editingHabitId ? "Save changes" : "Create habit"}</span><span aria-hidden>→</span></button></div>
            </div>
          </form>
        </div>,
        document.body,
      )}
    </AppShell>
  );
}
