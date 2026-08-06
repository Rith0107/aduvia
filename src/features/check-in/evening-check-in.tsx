"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { calculateRoutineEfficiency } from "@/lib/metrics";
import type { TodayHabit } from "@/features/today/types";
import { ActivityIcon } from "@/components/activity-icon";
import { BrandLogo } from "@/components/brand-logo";

type EveningCheckInProps = { initialHabits: TodayHabit[] };

export function EveningCheckIn({ initialHabits }: EveningCheckInProps) {
  const [habits, setHabits] = useState<TodayHabit[]>(initialHabits.map((habit) => ({ ...habit, completion: 0, status: "pending" })));
  const [isFinished, setIsFinished] = useState(false);
  const completedCount = habits.filter((habit) => habit.status === "complete").length;
  const answeredCount = habits.filter((habit) => habit.status !== "pending").length;
  const efficiency = useMemo(() => calculateRoutineEfficiency(habits.map(({ completion, priority }) => ({ completion, priority }))), [habits]);
  const allAnswered = habits.every((habit) => habit.status !== "pending");

  function setHabitStatus(id: string, completed: boolean) {
    setHabits((current) => current.map((habit) => habit.id === id ? { ...habit, status: completed ? "complete" : "skipped", completion: completed ? 1 : 0 } : habit));
  }

  if (isFinished) {
    return (
      <main className="soft-canvas grid min-h-screen place-items-center text-[var(--soft-ink)]">
        <section className="relative w-full max-w-xl overflow-hidden p-8 text-center sm:p-14">
          <div className="absolute -right-20 -top-20 size-64 rounded-full bg-[var(--soft-tint-a)] blur-3xl" />
          <div className="relative">
            <span className="mx-auto grid size-20 place-items-center rounded-full bg-[var(--soft-ink)] text-2xl text-white">✓</span>
            <p className="mt-8 text-[11px] font-black uppercase tracking-[0.22em] text-[var(--soft-accent)]">Today is closed</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em]">Let the day be enough.</h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[var(--soft-muted)]">{completedCount} habits completed · {efficiency}% routine efficiency. You can leave the rest here and come back fresh tomorrow.</p>
            <Link className="mt-9 inline-flex min-h-13 items-center justify-center rounded-full bg-[var(--soft-ink)] px-7 text-sm font-bold text-white" href="/">Return to Today</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="soft-canvas min-h-screen text-[var(--soft-ink)]">
      <div className="soft-shell min-h-screen overflow-hidden">
        <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col justify-center px-5 py-6 sm:px-9 sm:py-8">
          <header className="mb-5 flex items-center justify-between px-1 sm:mb-6">
            <BrandLogo />
            <span className="evening-mode-pill"><span aria-hidden="true">☾</span> Evening mode</span>
          </header>
          <div className="evening-intro">
            <div>
              <p className="soft-kicker text-[var(--soft-accent)]">Your evening reset · under a minute</p>
              <h1>Four choices.<br />Then rest.</h1>
            </div>
            <div className="evening-progress-dial" style={{ "--check-progress": `${(completedCount / habits.length) * 360}deg` } as React.CSSProperties}>
              <div><strong>{completedCount}</strong><span>of {habits.length} done</span></div>
            </div>
            <div className="evening-intro-copy">
              <p>Choose what happened.<br />No scoring. No explanations.</p>
              <div aria-label="Completed habits" aria-valuemax={habits.length} aria-valuemin={0} aria-valuenow={completedCount} className="evening-progress-line" role="progressbar"><span style={{ width: `${(completedCount / habits.length) * 100}%` }} /></div>
              <small>{allAnswered ? "Ready to let go" : `${habits.length - answeredCount} choices left`}</small>
            </div>
          </div>

          <section className="evening-habit-grid mt-8">
            {habits.map((habit, index) => (
              <article className={`evening-habit-card ${habit.status}`} key={habit.id} style={{ "--row-index": index } as React.CSSProperties}>
                <div className="evening-habit-identity">
                  <ActivityIcon activity={`${habit.name} ${habit.category}`} className="evening-habit-icon" />
                  <div><div className="evening-habit-meta"><p className="soft-kicker text-[var(--soft-muted)]">{habit.category}</p>{habit.status !== "pending" && <span className="evening-result">{habit.status === "complete" ? "Completed" : "Incomplete"}</span>}</div><h2>{habit.name}</h2><p>{habit.target}</p></div>
                </div>
                <div className="evening-choice" role="group" aria-label={`Check in ${habit.name}`}>
                  <button aria-label="✓ Done" aria-pressed={habit.status === "complete"} onClick={() => setHabitStatus(habit.id, true)} type="button"><span aria-hidden="true">✓</span> Done</button>
                  <button aria-pressed={habit.status === "skipped"} onClick={() => setHabitStatus(habit.id, false)} type="button"><span aria-hidden="true">—</span> {habit.status === "skipped" ? "Incomplete" : "Not today"}</button>
                </div>
              </article>
            ))}
          </section>

          <div className="evening-finish-dock">
            <p><span>{allAnswered ? "Every habit has an answer." : "One choice per habit."}</span><small>{allAnswered ? "Nothing else is required tonight." : "No explanations needed."}</small></p>
            <button disabled={!allAnswered} onClick={() => setIsFinished(true)} type="button"><span>Finish my day</span><span aria-hidden="true">→</span></button>
          </div>
        </div>
      </div>
    </main>
  );
}
