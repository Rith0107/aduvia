"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { calculateRoutineEfficiency } from "@/lib/metrics";
import type { TodayHabit } from "@/features/today/types";
import { ActivityIcon } from "@/components/activity-icon";

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
            <p className="mt-8 text-[11px] font-black uppercase tracking-[0.22em] text-[var(--soft-accent)]">Day closed</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em]">You’re done for today.</h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[var(--soft-muted)]">{completedCount} habits completed · {efficiency}% routine efficiency. Nothing else needs your attention tonight.</p>
            <Link className="mt-9 inline-flex min-h-13 items-center justify-center rounded-full bg-[var(--soft-ink)] px-7 text-sm font-bold text-white" href="/">Return to Today</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="soft-canvas min-h-screen text-[var(--soft-ink)]">
      <div className="soft-shell min-h-screen overflow-hidden">
        <header className="premium-toolbar mx-auto flex max-w-[1500px] items-center justify-between px-5 py-6 sm:px-9">
          <Link className="text-xl font-black tracking-[-0.055em]" href="/">quest<span className="text-[var(--soft-accent)]">/</span>log</Link>
          <span className="evening-mode-pill"><span aria-hidden="true">☾</span> Evening mode</span>
        </header>

        <div className="mx-auto max-w-6xl px-5 pb-12 pt-8 sm:px-9 sm:pt-12">
          <div className="evening-intro">
            <div>
              <p className="soft-kicker text-[var(--soft-accent)]">60-second check-in</p>
              <h1>Tap. Finish.<br />Rest.</h1>
            </div>
            <div className="evening-progress-dial" style={{ "--check-progress": `${(completedCount / habits.length) * 360}deg` } as React.CSSProperties}>
              <div><strong>{completedCount}</strong><span>of {habits.length} done</span></div>
            </div>
            <div className="evening-intro-copy">
              <p>No typing. No judgement.<br />Just tell us what happened.</p>
              <div aria-label="Completed habits" aria-valuemax={habits.length} aria-valuemin={0} aria-valuenow={completedCount} className="evening-progress-line" role="progressbar"><span style={{ width: `${(completedCount / habits.length) * 100}%` }} /></div>
              <small>{allAnswered ? "Ready to close" : `${habits.length - answeredCount} left to answer`}</small>
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
            <p><span>{allAnswered ? "Everything is accounted for." : "One tap per habit."}</span><small>{allAnswered ? "You can let today go." : "Then you’re free."}</small></p>
            <button disabled={!allAnswered} onClick={() => setIsFinished(true)} type="button"><span>Finish my day</span><span aria-hidden="true">→</span></button>
          </div>
        </div>
      </div>
    </main>
  );
}
