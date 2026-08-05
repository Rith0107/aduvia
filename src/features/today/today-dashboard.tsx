"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { ActivityIcon } from "@/components/activity-icon";
import { calculateRoutineEfficiency } from "@/lib/metrics";
import type { SideQuestSummary, TodayHabit } from "./types";

type TodayDashboardProps = { dateLabel: string; initialHabits: TodayHabit[]; sideQuest: SideQuestSummary };

function nextHabitState(habit: TodayHabit): TodayHabit {
  return habit.status === "complete" ? { ...habit, status: "pending", completion: 0 } : { ...habit, status: "complete", completion: 1 };
}

export function TodayDashboard({ dateLabel, initialHabits, sideQuest }: TodayDashboardProps) {
  const [habits, setHabits] = useState(initialHabits);
  const [reflection, setReflection] = useState("");
  const completedCount = habits.filter((habit) => habit.status === "complete").length;
  const completionRate = Math.round((habits.reduce((sum, habit) => sum + habit.completion, 0) / habits.length) * 100);
  const efficiency = useMemo(() => calculateRoutineEfficiency(habits.map(({ completion, priority }) => ({ completion, priority }))), [habits]);
  const questProgress = Math.round((sideQuest.completedMilestones / sideQuest.totalMilestones) * 100);

  function toggleHabit(id: string) {
    setHabits((current) => current.map((habit) => habit.id === id ? nextHabitState(habit) : habit));
  }

  return (
    <AppShell active="Today" eyebrow={dateLabel} title={<>A softer way<br />to show up.</>} action={<div className="max-w-xs border-l border-black/[0.12] pl-5"><p className="text-sm leading-6 text-[var(--soft-muted)]">You’ve already done {completedCount === 0 ? "the hard part: starting" : `${completedCount} of ${habits.length}`}. The rest can be light.</p></div>}>
      <section className="mt-12 grid gap-10 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,.62fr)] xl:gap-16">
        <div className="soft-flow soft-task-cards grid gap-3 sm:grid-cols-2">
          {habits.map((habit) => (
            <article className="group relative grid min-h-36 grid-cols-[52px_1fr_auto] items-center gap-4 border border-white/50 p-5 sm:grid-cols-[60px_1fr_auto]" key={habit.id}>
              <span className="grid size-12 place-items-center rounded-full bg-white/45 text-[var(--soft-ink)]"><ActivityIcon activity={`${habit.name} ${habit.category}`} /></span>
              <div className="min-w-0"><h2 className={`text-lg font-bold ${habit.status === "complete" ? "text-[var(--soft-muted)] line-through" : ""}`}>{habit.name}</h2><p className="mt-1 text-sm text-[var(--soft-muted)]">{habit.target} · {habit.category}</p></div>
              {habit.priority === 3 && <span className="absolute right-5 top-5 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--soft-accent)]">Today’s anchor</span>}
              <button aria-label={`${habit.status === "complete" ? "Undo" : "Complete"} ${habit.name}`} className={`grid size-13 shrink-0 place-items-center rounded-full border-2 text-lg transition ${habit.status === "complete" ? "border-[var(--soft-ink)] bg-[var(--soft-ink)] text-white" : "border-[color:rgb(41_50_44/15%)] text-transparent hover:border-[var(--soft-ink)]"}`} onClick={() => toggleHabit(habit.id)} type="button">✓</button>
            </article>
          ))}
        </div>

        <aside className="flex flex-col gap-4">
          <section className="relative flex-1 border-y border-black/[0.1] py-7">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--soft-muted)]">Today’s signal</p>
            <div className="mt-6 flex items-end gap-3"><p className="text-6xl font-semibold tracking-[-0.07em]">{efficiency}%</p><p className="pb-2 text-xs text-[var(--soft-muted)]">efficiency</p></div>
            <div className="mt-7 h-2 overflow-hidden rounded-full bg-black/[0.07]"><div className="h-full rounded-full bg-[var(--soft-ink)] transition-all" style={{ width: `${completionRate}%` }} /></div>
            <p className="mt-3 text-xs text-[var(--soft-muted)]">{completedCount} of {habits.length} complete</p>
            <Link className="mt-8 flex min-h-12 items-center justify-between border-t border-black/[0.1] pt-5 text-sm font-bold" href="/check-in"><span>Close the day</span><span>→</span></Link>
          </section>
          <section className="border-t border-black/[0.09] px-1 pt-6">
            <div className="flex items-center justify-between"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--soft-accent)]">Monthly quest</p><span className="text-xs font-bold">{questProgress}%</span></div>
            <p className="mt-3 text-lg font-bold">{sideQuest.title}</p>
            <div className="mt-5 h-1.5 rounded-full bg-black/[0.06]"><div className="h-full rounded-full bg-[var(--soft-accent)]" style={{ width: `${questProgress}%` }} /></div>
          </section>
        </aside>
      </section>

      <section className="mt-10 flex flex-col gap-4 border-t border-black/[0.09] py-7 sm:flex-row sm:items-center">
        <div className="sm:w-52"><p className="font-bold">One quiet note</p><p className="mt-1 text-xs leading-5 text-[var(--soft-muted)]">Optional. Keep it short.</p></div>
        <label className="sr-only" htmlFor="daily-reflection">One-line reflection</label>
        <input className="min-h-13 min-w-0 flex-1 rounded-full border border-white/65 bg-white/55 px-5 text-sm outline-none placeholder:text-[var(--soft-muted)] focus:border-[var(--soft-ink)]" id="daily-reflection" maxLength={180} onChange={(event) => setReflection(event.target.value)} placeholder="What felt good today?" value={reflection} />
        <button className="min-h-13 rounded-full bg-[var(--soft-ink)] px-6 text-sm font-bold text-white disabled:opacity-25" disabled={!reflection.trim()} type="button">Save note</button>
      </section>
    </AppShell>
  );
}
