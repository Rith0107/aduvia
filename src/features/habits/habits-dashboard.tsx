"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import type { HabitFrequency, HabitSummary } from "./types";

type HabitsDashboardProps = { initialHabits: HabitSummary[] };

const navItems = [
  { label: "Today", href: "/" },
  { label: "Habits", href: "/habits" },
  { label: "Quests", href: "/quests" },
  { label: "Insights", href: "/insights" },
];

const accentStyles = {
  green: "bg-[#dce9df] text-[#174f3a]",
  amber: "bg-[#f3e7ca] text-[#876f47]",
  rose: "bg-[#f4dfd9] text-[#9c4b38]",
  blue: "bg-[#dfe8ed] text-[#3d6678]",
};

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
    <main className="min-h-screen bg-[#f3f1eb] p-3 text-[#17201c] sm:p-5">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1440px] overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#faf9f5] shadow-[0_30px_80px_rgba(31,38,34,0.08)] sm:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[220px_1fr]">
        <aside className="hidden border-r border-black/[0.07] px-5 py-7 lg:flex lg:flex-col">
          <Link className="flex items-center gap-3 px-2" href="/">
            <span className="grid size-9 place-items-center rounded-xl bg-[#174f3a] text-sm font-semibold text-white">Q</span>
            <span className="text-lg font-semibold tracking-[-0.03em]">QuestLog</span>
          </Link>
          <nav aria-label="Primary" className="mt-14 space-y-1">
            {navItems.map((item) => (
              <Link className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${item.label === "Habits" ? "bg-[#e5ece5] text-[#174f3a]" : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"}`} href={item.href} key={item.label}>
                <span className={`size-1.5 rounded-full ${item.label === "Habits" ? "bg-[#174f3a]" : "bg-stone-300"}`} />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto rounded-2xl bg-[#dfe8ed] p-4 text-[#3d6678]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-60">Consistency</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{averageConsistency}%</p>
            <p className="mt-1 text-xs opacity-70">Across all habits</p>
          </div>
        </aside>

        <div className="min-w-0 px-5 py-6 sm:px-8 sm:py-8 xl:px-12 xl:py-10">
          <header className="flex items-end justify-between gap-5">
            <div>
              <Link className="flex items-center gap-2 lg:hidden" href="/">
                <span className="grid size-7 place-items-center rounded-lg bg-[#174f3a] text-xs font-semibold text-white">Q</span>
                <span className="text-sm font-semibold">QuestLog</span>
              </Link>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 lg:mt-0">Build your rhythm</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-[40px]">Your habits<span className="text-[#d89a42]">.</span></h1>
            </div>
            <button className="rounded-xl bg-[#174f3a] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(23,79,58,0.18)] transition hover:-translate-y-0.5 hover:bg-[#123f2e]" onClick={() => setIsCreating(true)} type="button">+ New habit</button>
          </header>

          <nav aria-label="Mobile navigation" className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => (
              <Link className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${item.label === "Habits" ? "bg-[#174f3a] text-white" : "bg-white text-stone-500"}`} href={item.href} key={item.label}>{item.label}</Link>
            ))}
          </nav>

          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[22px] bg-[#dce9df] p-5 text-[#174f3a]"><p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-60">Active</p><p className="mt-3 text-3xl font-semibold">{habits.filter((habit) => habit.state === "active").length}</p></div>
            <div className="rounded-[22px] bg-[#f3e7ca] p-5 text-[#876f47]"><p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-60">Best streak</p><p className="mt-3 text-3xl font-semibold">{Math.max(...habits.map((habit) => habit.streak))} days</p></div>
            <div className="rounded-[22px] bg-[#f4dfd9] p-5 text-[#9c4b38]"><p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-60">Consistency</p><p className="mt-3 text-3xl font-semibold">{averageConsistency}%</p></div>
          </section>

          <section className="mt-5 rounded-[24px] border border-[#d8ded7] bg-[#f7faf7] p-5 sm:p-7">
            <div className="flex flex-col gap-4 border-b border-black/[0.06] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="text-xl font-semibold tracking-[-0.025em]">Habit library</h2><p className="mt-1 text-sm text-stone-500">Small systems that shape your days.</p></div>
              <div className="flex rounded-xl bg-[#e9eee9] p-1">
                {(["all", "active", "paused"] as const).map((option) => (
                  <button className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${filter === option ? "bg-white text-[#174f3a] shadow-sm" : "text-stone-500"}`} key={option} onClick={() => setFilter(option)} type="button">{option}</button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-black/[0.06]">
              {visibleHabits.map((habit) => (
                <article className="grid gap-4 py-5 sm:grid-cols-[minmax(0,1.4fr)_130px_100px_90px] sm:items-center" key={habit.id}>
                  <div className="flex items-center gap-3"><span className={`grid size-10 shrink-0 place-items-center rounded-xl text-sm font-semibold ${accentStyles[habit.color]}`}>{habit.name.charAt(0)}</span><div><h3 className="font-semibold">{habit.name}</h3><p className="text-sm text-stone-400">{habit.category} · {habit.frequency}</p></div></div>
                  <div><p className="text-xs text-stone-400">Consistency</p><div className="mt-1.5 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200"><div className="h-full rounded-full bg-[#174f3a]" style={{ width: `${habit.consistency}%` }} /></div><span className="text-xs font-semibold">{habit.consistency}%</span></div></div>
                  <div><p className="text-xs text-stone-400">Streak</p><p className="mt-1 text-sm font-semibold">{habit.streak} days</p></div>
                  <button className={`rounded-full px-3 py-2 text-xs font-semibold transition ${habit.state === "active" ? "bg-[#e5ece5] text-[#174f3a] hover:bg-[#f4dfd9] hover:text-[#9c4b38]" : "bg-stone-200 text-stone-500 hover:bg-[#dce9df] hover:text-[#174f3a]"}`} onClick={() => toggleState(habit.id)} type="button">{habit.state === "active" ? "Pause" : "Resume"}</button>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>

      {isCreating && (
        <div aria-modal="true" className="fixed inset-0 z-20 grid place-items-center bg-[#17201c]/35 p-5 backdrop-blur-sm" role="dialog">
          <form className="w-full max-w-md rounded-[26px] bg-[#faf9f5] p-6 shadow-2xl sm:p-7" onSubmit={createHabit}>
            <div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#174f3a]">New rhythm</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Create a habit</h2></div><button aria-label="Close create habit" className="grid size-9 place-items-center rounded-full bg-stone-200 text-stone-500" onClick={() => setIsCreating(false)} type="button">×</button></div>
            <label className="mt-7 block text-sm font-semibold" htmlFor="habit-name">Habit name</label>
            <input autoFocus className="mt-2 min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 outline-none focus:border-[#174f3a]/50 focus:ring-2 focus:ring-[#174f3a]/10" id="habit-name" onChange={(event) => setName(event.target.value)} placeholder="e.g. Stretch for 10 minutes" value={name} />
            <label className="mt-5 block text-sm font-semibold" htmlFor="habit-frequency">Frequency</label>
            <select className="mt-2 min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 outline-none" id="habit-frequency" onChange={(event) => setFrequency(event.target.value as HabitFrequency)} value={frequency}><option>Daily</option><option>Weekdays</option><option>3× weekly</option><option>Custom</option></select>
            <div className="mt-7 flex gap-3"><button className="min-h-12 flex-1 rounded-xl bg-stone-200 text-sm font-semibold text-stone-600" onClick={() => setIsCreating(false)} type="button">Cancel</button><button className="min-h-12 flex-1 rounded-xl bg-[#174f3a] text-sm font-semibold text-white disabled:opacity-40" disabled={!name.trim()} type="submit">Create habit</button></div>
          </form>
        </div>
      )}
    </main>
  );
}
