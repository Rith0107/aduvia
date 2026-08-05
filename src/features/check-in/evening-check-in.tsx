"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { calculateRoutineEfficiency } from "@/lib/metrics";
import type { TodayHabit } from "@/features/today/types";

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
        <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6 sm:px-9">
          <Link className="text-xl font-black tracking-[-0.055em]" href="/">quest<span className="text-[var(--soft-accent)]">/</span>log</Link>
          <span className="rounded-full bg-white/45 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-[var(--soft-muted)]">Evening mode</span>
        </header>

        <div className="mx-auto max-w-3xl px-5 pb-10 pt-8 sm:px-9 sm:pt-12">
          <div className="text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--soft-accent)]">60-second check-in</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Tap. Finish. Rest.</h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[var(--soft-muted)]">No typing and no scoring yourself. Just tell us what happened.</p>
          </div>

          <div className="mx-auto mt-9 flex max-w-sm items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.06]"><div className="h-full rounded-full bg-[var(--soft-accent)] transition-all" style={{ width: `${(answeredCount / habits.length) * 100}%` }} /></div><span className="text-xs font-bold text-[var(--soft-muted)]">{answeredCount}/{habits.length}</span></div>

          <section className="mt-8 space-y-3">
            {habits.map((habit, index) => (
              <article className={`grid gap-4 rounded-[28px] border border-white/55 p-5 transition sm:grid-cols-[1fr_270px] sm:items-center ${habit.status === "complete" ? "bg-[var(--soft-tint-a)]" : habit.status === "skipped" ? "bg-[var(--soft-tint-b)]" : index % 2 ? "bg-white/30" : "bg-[var(--soft-tint-c)]/55"}`} key={habit.id}>
                <div><h2 className="text-lg font-bold">{habit.name}</h2><p className="mt-1 text-sm text-[var(--soft-muted)]">{habit.target}</p></div>
                <div className="grid grid-cols-2 gap-2">
                  <button aria-pressed={habit.status === "complete"} className={`min-h-14 rounded-full text-sm font-bold transition ${habit.status === "complete" ? "bg-[var(--soft-ink)] text-white" : "bg-white/55 hover:bg-white"}`} onClick={() => setHabitStatus(habit.id, true)} type="button">✓ Done</button>
                  <button aria-pressed={habit.status === "skipped"} className={`min-h-14 rounded-full text-sm font-bold transition ${habit.status === "skipped" ? "bg-[var(--soft-accent)] text-white" : "bg-white/35 text-[var(--soft-muted)] hover:bg-white/65"}`} onClick={() => setHabitStatus(habit.id, false)} type="button">Not today</button>
                </div>
              </article>
            ))}
          </section>

          <button className="mt-6 min-h-16 w-full rounded-full bg-[var(--soft-ink)] text-base font-bold text-white shadow-xl transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-20 disabled:shadow-none" disabled={!allAnswered} onClick={() => setIsFinished(true)} type="button">Finish my day</button>
          {!allAnswered && <p className="mt-3 text-center text-xs text-[var(--soft-muted)]">One tap per habit. Then you’re free.</p>}
        </div>
      </div>
    </main>
  );
}
