"use client";

import { FormEvent, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Flag, Flame, Gauge, ListChecks } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { ActivityIcon } from "@/components/activity-icon";
import type { HabitDay, HabitFrequency, HabitSummary } from "./types";

type HabitsDashboardProps = { initialHabits: HabitSummary[] };
const days: { short: HabitDay; label: string }[] = [
  { short: "Mon", label: "Monday" }, { short: "Tue", label: "Tuesday" },
  { short: "Wed", label: "Wednesday" }, { short: "Thu", label: "Thursday" },
  { short: "Fri", label: "Friday" }, { short: "Sat", label: "Saturday" },
  { short: "Sun", label: "Sunday" },
];

export function HabitsDashboard({ initialHabits }: HabitsDashboardProps) {
  const [habits, setHabits] = useState(initialHabits);
  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("Daily");
  const [selectedDays, setSelectedDays] = useState<HabitDay[]>([]);
  const [isAnchor, setIsAnchor] = useState(false);

  const visibleHabits = useMemo(
    () => habits.filter((habit) => filter === "all" || habit.state === filter),
    [filter, habits],
  );
  const averageConsistency = Math.round(
    habits.reduce((sum, habit) => sum + habit.consistency, 0) / habits.length,
  );

  function toggleState(id: string) {
    setHabits((current) =>
      current.map((habit) =>
        habit.id === id
          ? { ...habit, state: habit.state === "active" ? "paused" : "active" }
          : habit,
      ),
    );
  }

  function createHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;

    setHabits((current) => [
      ...current.map((habit) => isAnchor ? { ...habit, isAnchor: false } : habit),
      {
        id: `habit-${current.length + 1}`,
        name: name.trim(),
        category: "Personal",
        frequency,
        scheduledDays: frequency === "Custom" || frequency === "3× weekly" ? selectedDays : undefined,
        isAnchor,
        consistency: 0,
        streak: 0,
        state: "active",
        color: "green",
      },
    ]);
    setName("");
    setFrequency("Daily");
    setSelectedDays([]);
    setIsAnchor(false);
    setIsCreating(false);
    setFilter("all");
  }

  return (
    <AppShell active="Habits" eyebrow="Build your rhythm" title={<>Habits that feel<br />like your own.</>} action={<button className="rounded-full bg-[var(--soft-ink)] px-6 py-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5" onClick={() => setIsCreating(true)} type="button">+ New habit</button>}>
          <section className="mt-12 grid border-y border-black/[0.09] sm:grid-cols-[.7fr_1fr_1fr]">
            <div className="py-6 sm:border-r sm:border-black/[0.09] sm:pr-6"><p className="metric-label"><ListChecks aria-hidden className="text-[var(--soft-icon-green)]" />Active</p><p className="mt-4 text-5xl font-semibold tracking-[-0.06em]">{habits.filter((habit) => habit.state === "active").length}</p></div>
            <div className="border-t border-black/[0.09] py-6 sm:border-r sm:border-t-0 sm:px-6"><p className="metric-label"><Flame aria-hidden className="text-[var(--soft-icon-clay)]" />Best streak</p><p className="mt-4 text-4xl font-semibold tracking-[-0.05em]">{Math.max(...habits.map((habit) => habit.streak))} days</p></div>
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
              {visibleHabits.map((habit) => (
                <article className="grid min-h-32 gap-4 border border-white/50 p-5 sm:grid-cols-[minmax(0,1.4fr)_170px_110px_100px] sm:items-center sm:p-6" key={habit.id}>
                  <div className="flex items-center gap-4"><span className="grid size-11 shrink-0 place-items-center"><ActivityIcon activity={`${habit.name} ${habit.category}`} className="size-7" /></span><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{habit.name}</h3>{habit.isAnchor && <span className="inline-flex items-center gap-1 rounded-full bg-[#ecd8ce] px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#9a5d49]"><Flag size={10} fill="currentColor" />Anchor</span>}</div><p className="text-sm text-[var(--soft-muted)]">{habit.category} · {habit.scheduledDays?.length ? `${habit.frequency === "3× weekly" ? "3× · " : ""}${habit.scheduledDays.join(" · ")}` : habit.frequency}</p></div></div>
                  <div><p className="text-xs text-stone-400">Consistency</p><div className="mt-1.5 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200"><div className="h-full rounded-full bg-[#174f3a]" style={{ width: `${habit.consistency}%` }} /></div><span className="text-xs font-semibold">{habit.consistency}%</span></div></div>
                  <div><p className="text-xs text-stone-400">Streak</p><p className="mt-1 text-sm font-semibold">{habit.streak} days</p></div>
                  <button className={`rounded-full px-3 py-2 text-xs font-bold transition ${habit.state === "active" ? "bg-white/55" : "bg-[var(--soft-ink)] text-white"}`} onClick={() => toggleState(habit.id)} type="button">{habit.state === "active" ? "Pause" : "Resume"}</button>
                </article>
              ))}
            </div>
          </section>

      {isCreating && createPortal(
        <div aria-modal="true" className="creation-overlay" role="dialog">
          <form className="creation-sheet" onSubmit={createHabit}>
            <button aria-label="Close create habit" className="creation-close" onClick={() => setIsCreating(false)} type="button">×</button>
            <aside className="creation-aside creation-aside-habit">
              <p className="soft-kicker">New rhythm</p>
              <div className="creation-preview"><ActivityIcon activity={name || "calendar schedule"} className="size-9" /></div>
              <div><h2>Make it easy<br />to return.</h2><p>A useful habit is specific enough to start and gentle enough to repeat.</p></div>
              <span className="creation-step">01 · Habit details</span>
            </aside>
            <div className="creation-form">
              <div><p className="soft-kicker text-[var(--soft-accent)]">Create a habit</p><h3>What will you repeat?</h3><p>Choose a small action. You can refine it whenever you need.</p></div>
              <label className="creation-field-label" htmlFor="habit-name">Habit name</label>
              <input autoFocus className="creation-field" id="habit-name" onChange={(event) => setName(event.target.value)} placeholder="e.g. Stretch for 10 minutes" value={name} />
              <div><p className="creation-field-label">Quick starts</p><div className="creation-presets">{["Drink water", "Read 20 pages", "Walk 30 minutes", "Meditate"].map((preset) => <button aria-pressed={name === preset} key={preset} onClick={() => setName(preset)} type="button"><ActivityIcon activity={preset} className="size-4" />{preset}</button>)}</div></div>
              <fieldset><legend className="creation-field-label">Frequency</legend><div className="creation-options">{(["Daily", "Weekdays", "3× weekly", "Custom"] as HabitFrequency[]).map((option) => <button aria-pressed={frequency === option} key={option} onClick={() => { setFrequency(option); if (option === "3× weekly") setSelectedDays((current) => current.slice(0, 3)); }} type="button">{option}</button>)}</div></fieldset>
              {(frequency === "Custom" || frequency === "3× weekly") && <fieldset className="creation-days"><legend className="creation-field-label">{frequency === "3× weekly" ? "Choose three days" : "Choose your days"}</legend><div>{days.map((day) => <button aria-label={day.label} aria-pressed={selectedDays.includes(day.short)} disabled={frequency === "3× weekly" && selectedDays.length === 3 && !selectedDays.includes(day.short)} key={day.short} onClick={() => setSelectedDays((current) => current.includes(day.short) ? current.filter((item) => item !== day.short) : [...current, day.short])} type="button">{day.short.slice(0, 1)}</button>)}</div><p>{frequency === "3× weekly" ? `${selectedDays.length} of 3 selected` : selectedDays.length ? selectedDays.join(" · ") : "Select at least one day"}</p></fieldset>}
              <button aria-pressed={isAnchor} className={`flex w-full items-center gap-4 rounded-[18px] border p-4 text-left transition ${isAnchor ? "border-[#a86f5b]/35 bg-[#f0ddd4]" : "border-[#174f3a]/10 bg-[#e7eee9] hover:bg-[#dfeae4]"}`} onClick={() => setIsAnchor((current) => !current)} type="button"><span className={`grid size-10 shrink-0 place-items-center rounded-full ${isAnchor ? "bg-[#a35f49] text-white" : "bg-white/70 text-[#2f6f5e]"}`}><Flag size={17} fill={isAnchor ? "currentColor" : "none"} /></span><span className="flex-1"><span className="block text-sm font-bold">Make this my anchor</span><span className="mt-1 block text-xs leading-5 text-[var(--soft-muted)]">Highlight it as your highest-priority commitment on scheduled days.</span></span><span className={`h-6 w-11 rounded-full p-1 transition ${isAnchor ? "bg-[#a35f49]" : "bg-[#174f3a]/12"}`}><span className={`block size-4 rounded-full bg-white transition-transform ${isAnchor ? "translate-x-5" : ""}`} /></span></button>
              <div className="creation-actions"><button onClick={() => setIsCreating(false)} type="button">Cancel</button><button disabled={!name.trim() || (frequency === "Custom" && selectedDays.length === 0) || (frequency === "3× weekly" && selectedDays.length !== 3)} type="submit"><span>Create habit</span><span aria-hidden>→</span></button></div>
            </div>
          </form>
        </div>,
        document.body,
      )}
    </AppShell>
  );
}
