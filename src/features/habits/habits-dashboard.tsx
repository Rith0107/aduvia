"use client";

import { FormEvent, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { ActivityIcon } from "@/components/activity-icon";
import type { HabitFrequency, HabitSummary } from "./types";

type HabitsDashboardProps = { initialHabits: HabitSummary[] };

export function HabitsDashboard({ initialHabits }: HabitsDashboardProps) {
  const [habits, setHabits] = useState(initialHabits);
  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("Daily");

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
      ...current,
      {
        id: `habit-${current.length + 1}`,
        name: name.trim(),
        category: "Personal",
        frequency,
        consistency: 0,
        streak: 0,
        state: "active",
        color: "green",
      },
    ]);
    setName("");
    setFrequency("Daily");
    setIsCreating(false);
    setFilter("all");
  }

  return (
    <AppShell active="Habits" eyebrow="Build your rhythm" title={<>Habits that feel<br />like your own.</>} action={<button className="rounded-full bg-[var(--soft-ink)] px-6 py-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5" onClick={() => setIsCreating(true)} type="button">+ New habit</button>}>
          <section className="mt-12 grid border-y border-black/[0.09] sm:grid-cols-[.7fr_1fr_1fr]">
            <div className="py-6 sm:border-r sm:border-black/[0.09] sm:pr-6"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--soft-muted)]">Active</p><p className="mt-4 text-5xl font-semibold tracking-[-0.06em]">{habits.filter((habit) => habit.state === "active").length}</p></div>
            <div className="border-t border-black/[0.09] py-6 sm:border-r sm:border-t-0 sm:px-6"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--soft-muted)]">Best streak</p><p className="mt-4 text-4xl font-semibold tracking-[-0.05em]">{Math.max(...habits.map((habit) => habit.streak))} days</p></div>
            <div className="border-t border-black/[0.09] py-6 sm:border-t-0 sm:pl-6"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--soft-muted)]">Consistency</p><p className="mt-4 text-4xl font-semibold tracking-[-0.05em]">{averageConsistency}%</p></div>
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
                  <div className="flex items-center gap-4"><span className="grid size-11 shrink-0 place-items-center"><ActivityIcon activity={`${habit.name} ${habit.category}`} className="size-7" /></span><div><h3 className="font-bold">{habit.name}</h3><p className="text-sm text-[var(--soft-muted)]">{habit.category} · {habit.frequency}</p></div></div>
                  <div><p className="text-xs text-stone-400">Consistency</p><div className="mt-1.5 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200"><div className="h-full rounded-full bg-[#174f3a]" style={{ width: `${habit.consistency}%` }} /></div><span className="text-xs font-semibold">{habit.consistency}%</span></div></div>
                  <div><p className="text-xs text-stone-400">Streak</p><p className="mt-1 text-sm font-semibold">{habit.streak} days</p></div>
                  <button className={`rounded-full px-3 py-2 text-xs font-bold transition ${habit.state === "active" ? "bg-white/55" : "bg-[var(--soft-ink)] text-white"}`} onClick={() => toggleState(habit.id)} type="button">{habit.state === "active" ? "Pause" : "Resume"}</button>
                </article>
              ))}
            </div>
          </section>

      {isCreating && (
        <div aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-[var(--soft-ink)]/30 p-5 backdrop-blur-md" role="dialog">
          <form className="w-full max-w-lg overflow-hidden rounded-[34px] bg-[var(--soft-surface)] shadow-2xl" onSubmit={createHabit}>
            <div className="p-6 sm:p-8"><div className="flex items-start justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--soft-accent)]">New rhythm</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Create a habit</h2><p className="mt-2 text-sm text-[var(--soft-muted)]">Start small. Refine it later.</p></div><button aria-label="Close create habit" className="grid size-10 place-items-center rounded-full bg-white/55" onClick={() => setIsCreating(false)} type="button">×</button></div></div>
            <div className="p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Quick starts</p>
            <div className="mt-3 flex flex-wrap gap-2">{["Drink water", "Read 20 pages", "Walk 30 minutes", "Meditate"].map((preset) => <button className="rounded-full border border-[#174f3a]/10 bg-[#e5ece5] px-3 py-2 text-xs font-semibold text-[#174f3a] transition hover:bg-[#d8e6da]" key={preset} onClick={() => setName(preset)} type="button">{preset}</button>)}</div>
            <label className="mt-7 block text-sm font-semibold" htmlFor="habit-name">Habit name</label>
            <input autoFocus className="mt-2 min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 outline-none focus:border-[#174f3a]/50 focus:ring-2 focus:ring-[#174f3a]/10" id="habit-name" onChange={(event) => setName(event.target.value)} placeholder="e.g. Stretch for 10 minutes" value={name} />
            <label className="mt-5 block text-sm font-semibold" htmlFor="habit-frequency">Frequency</label>
            <select className="mt-2 min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 outline-none" id="habit-frequency" onChange={(event) => setFrequency(event.target.value as HabitFrequency)} value={frequency}><option>Daily</option><option>Weekdays</option><option>3× weekly</option><option>Custom</option></select>
            <div className="mt-7 flex gap-3"><button className="min-h-13 flex-1 rounded-full bg-white/55 text-sm font-bold" onClick={() => setIsCreating(false)} type="button">Cancel</button><button className="min-h-13 flex-1 rounded-full bg-[var(--soft-ink)] text-sm font-bold text-white disabled:opacity-30" disabled={!name.trim()} type="submit">Create habit</button></div>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
