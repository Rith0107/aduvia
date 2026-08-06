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
  const efficiency = useMemo(() => calculateRoutineEfficiency(habits.map(({ completion, priority }) => ({ completion, priority }))), [habits]);
  const questProgress = Math.round((sideQuest.completedMilestones / sideQuest.totalMilestones) * 100);

  function toggleHabit(id: string) {
    setHabits((current) => current.map((habit) => habit.id === id ? nextHabitState(habit) : habit));
  }

  return (
    <AppShell active="Today" eyebrow={dateLabel} title={<>A softer way<br />to show up.</>} action={<div className="max-w-xs border-l border-black/[0.12] pl-5"><p className="text-sm leading-6 text-[var(--soft-muted)]">You’ve already done {completedCount === 0 ? "the hard part: starting" : `${completedCount} of ${habits.length}`}. The rest can be light.</p></div>}>
      <section className="mt-12">
        <div className="soft-flow soft-task-cards grid gap-3 sm:grid-cols-2">
          {habits.map((habit) => (
            <article className="group relative grid min-h-40 grid-cols-[58px_1fr_auto] items-center gap-5 border border-white/50 p-6 sm:min-h-44 sm:grid-cols-[68px_1fr_auto] sm:gap-6 sm:p-7 xl:min-h-52 xl:grid-cols-[78px_1fr_auto] xl:pl-14 xl:pr-9 2xl:pl-16" key={habit.id}>
              <span className="grid size-12 place-items-center sm:size-14 xl:size-16"><ActivityIcon activity={`${habit.name} ${habit.category}`} className="size-8 sm:size-9 xl:size-10" /></span>
              <div className="min-w-0"><h2 className={`text-2xl font-bold tracking-[-0.035em] sm:text-3xl xl:text-4xl ${habit.status === "complete" ? "text-[#53635b] line-through decoration-[#53635b]/65" : ""}`}>{habit.name}</h2><p className="mt-2 text-sm font-medium text-[var(--soft-muted)] sm:text-base xl:text-lg">{habit.category} · {habit.target}</p></div>
              {habit.priority === 3 && <span className="absolute right-5 top-5 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--soft-accent)]">Today’s anchor</span>}
              <button aria-label={`${habit.status === "complete" ? "Undo" : "Complete"} ${habit.name}`} className={`completion-control grid size-13 shrink-0 place-items-center rounded-full border-2 text-lg ${habit.status === "complete" ? "border-[var(--soft-ink)] bg-[var(--soft-ink)] text-white" : "border-[color:rgb(41_50_44/15%)] text-transparent hover:border-[var(--soft-ink)]"}`} onClick={() => toggleHabit(habit.id)} type="button">✓</button>
            </article>
          ))}
        </div>
      </section>

      <section className="soft-closing-stage mt-10 grid gap-3 lg:grid-cols-[1.25fr_.75fr]">
        <div className="soft-signal-panel">
          <div className="soft-signal-dial" style={{ "--signal-progress": `${efficiency * 3.6}deg` } as React.CSSProperties}>
            <div><strong>{efficiency}%</strong><small>efficiency</small></div>
          </div>
          <div className="soft-signal-copy">
            <p className="soft-kicker">Today’s signal</p>
            <h2>{completedCount === habits.length ? "You kept your word today." : "A gentle finish is still a finish."}</h2>
            <p>{completedCount} of {habits.length} rituals complete. Take a breath, leave one thought, and let today be enough.</p>
            <span className="sr-only">{completedCount} of {habits.length} complete</span>
            <Link className="soft-close-action" href="/check-in"><span>Close the day</span><span aria-hidden="true">↗</span></Link>
          </div>
        </div>

        <div className="soft-quest-signal">
          <div className="flex items-center justify-between"><p className="soft-kicker text-[var(--soft-accent)]">In your orbit</p><span className="soft-quest-status">On course</span></div>
          <div className="soft-orbit-mark" aria-hidden="true"><span style={{ transform: `rotate(${questProgress * 3.6}deg)` }} /></div>
          <div className="soft-quest-feature">
            <p className="soft-quest-percentage">{questProgress}<span>%</span></p>
            <p className="mt-5 text-xs text-[var(--soft-muted)]">Current monthly quest</p>
            <h2>{sideQuest.title}</h2>
          </div>
          <div><div className="soft-quest-track"><span style={{ width: `${questProgress}%` }} /></div><p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--soft-muted)]">Progress this month</p></div>
        </div>

        <div className="soft-note-ribbon lg:col-span-2">
          <div><p className="soft-kicker">One quiet note</p><p className="mt-2 text-sm text-[var(--soft-muted)]">Keep the feeling, not the full story.</p></div>
          <label className="sr-only" htmlFor="daily-reflection">One-line reflection</label>
          <input id="daily-reflection" maxLength={180} onChange={(event) => setReflection(event.target.value)} placeholder="What felt good today?" value={reflection} />
          <button aria-label="Save note" disabled={!reflection.trim()} type="button"><span>{reflection.trim() ? "Keep note" : "Write a thought"}</span><span aria-hidden="true">→</span></button>
        </div>
      </section>
    </AppShell>
  );
}
