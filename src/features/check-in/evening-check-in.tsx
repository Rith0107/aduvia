"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { calculateRoutineEfficiency } from "@/lib/metrics";

import type { TodayHabit } from "@/features/today/types";

type EveningCheckInProps = { initialHabits: TodayHabit[] };

export function EveningCheckIn({ initialHabits }: EveningCheckInProps) {
  const [habits, setHabits] = useState<TodayHabit[]>(
    initialHabits.map((habit) => ({ ...habit, completion: 0, status: "pending" })),
  );
  const [isFinished, setIsFinished] = useState(false);

  const completedCount = habits.filter((habit) => habit.status === "complete").length;
  const efficiency = useMemo(
    () => calculateRoutineEfficiency(habits.map(({ completion, priority }) => ({ completion, priority }))),
    [habits],
  );

  function setHabitStatus(id: string, completed: boolean) {
    setHabits((current) =>
      current.map((habit) =>
        habit.id === id
          ? { ...habit, status: completed ? "complete" : "skipped", completion: completed ? 1 : 0 }
          : habit,
      ),
    );
  }

  const allAnswered = habits.every((habit) => habit.status !== "pending");

  if (isFinished) {
    return (
      <main className="quest-canvas grid min-h-screen place-items-center p-5 text-[#17201c]">
        <section className="w-full max-w-lg rounded-[32px] border border-[#174f3a]/15 bg-[#f7f3e9] p-8 text-center shadow-[0_35px_100px_rgba(21,54,43,0.18)] sm:p-12">
          <span className="mx-auto grid size-16 place-items-center rounded-[22px] bg-[#174f3a] text-2xl text-white">✓</span>
          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-[#174f3a]">Day closed</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">You’re done for today.</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-stone-500">{completedCount} habits completed · {efficiency}% routine efficiency. No more decisions tonight.</p>
          <Link className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#17201c] px-6 text-sm font-semibold text-white" href="/">Back to Today</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="quest-canvas min-h-screen p-3 text-[#17201c] sm:p-5">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-[30px] border border-[#174f3a]/15 bg-[#f7f3e9] shadow-[0_35px_100px_rgba(21,54,43,0.18)]">
        <header className="bg-[#143d31] px-6 py-7 text-white sm:px-9 sm:py-9">
          <div className="flex items-center justify-between">
            <Link className="flex items-center gap-2 text-sm font-semibold" href="/"><span className="grid size-8 place-items-center rounded-xl bg-[#d89a42] text-[#143d31]">Q</span>QuestLog</Link>
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/70">Evening mode</span>
          </div>
          <p className="mt-9 text-xs font-semibold uppercase tracking-[0.18em] text-[#d5b77c]">60-second check-in</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">How did today go?</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-white/60">No typing required. Answer each row, then close the day.</p>
        </header>

        <section className="p-4 sm:p-7">
          <div className="mb-5 flex items-center justify-between text-xs font-medium text-stone-500"><span>{habits.filter((habit) => habit.status !== "pending").length} of {habits.length} answered</span><span>{efficiency}% efficiency</span></div>
          <div className="space-y-3">
            {habits.map((habit) => (
              <article className={`rounded-[20px] border p-4 transition sm:flex sm:items-center sm:gap-5 ${habit.status === "complete" ? "border-[#174f3a]/20 bg-[#e5efe6]" : habit.status === "skipped" ? "border-[#9c4b38]/15 bg-[#f7e9e4]" : "border-black/[0.07] bg-[#fffdf8]"}`} key={habit.id}>
                <div className="min-w-0 flex-1"><h2 className="font-semibold">{habit.name}</h2><p className="mt-0.5 text-sm text-stone-400">{habit.target} · {habit.category}</p></div>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-0 sm:w-60">
                  <button aria-pressed={habit.status === "complete"} className={`min-h-12 rounded-xl text-sm font-semibold transition ${habit.status === "complete" ? "bg-[#174f3a] text-white" : "bg-[#e5ece5] text-[#174f3a] hover:bg-[#d7e4d9]"}`} onClick={() => setHabitStatus(habit.id, true)} type="button">✓ Done</button>
                  <button aria-pressed={habit.status === "skipped"} className={`min-h-12 rounded-xl text-sm font-semibold transition ${habit.status === "skipped" ? "bg-[#9c4b38] text-white" : "bg-[#f3e4de] text-[#9c4b38] hover:bg-[#edd8d0]"}`} onClick={() => setHabitStatus(habit.id, false)} type="button">Not today</button>
                </div>
              </article>
            ))}
          </div>
          <button className="mt-6 min-h-14 w-full rounded-2xl bg-[#17201c] text-base font-semibold text-white transition hover:bg-[#174f3a] disabled:cursor-not-allowed disabled:opacity-30" disabled={!allAnswered} onClick={() => setIsFinished(true)} type="button">Finish my day</button>
          {!allAnswered && <p className="mt-3 text-center text-xs text-stone-400">Answer every habit to finish—one tap each.</p>}
        </section>
      </div>
    </main>
  );
}
