"use client";

import { useMemo, useState } from "react";

import { calculateRoutineEfficiency } from "@/lib/metrics";

import type { SideQuestSummary, TodayHabit } from "./types";

type TodayDashboardProps = {
  dateLabel: string;
  initialHabits: TodayHabit[];
  sideQuest: SideQuestSummary;
};

const statusStyles = {
  pending: "border-slate-300 bg-white text-transparent",
  complete: "border-emerald-700 bg-emerald-700 text-white",
  partial: "border-amber-600 bg-amber-500 text-white",
  skipped: "border-slate-400 bg-slate-400 text-white",
};

function nextHabitState(habit: TodayHabit): TodayHabit {
  if (habit.status === "pending") {
    return { ...habit, status: "complete", completion: 1 };
  }

  return { ...habit, status: "pending", completion: 0 };
}

export function TodayDashboard({
  dateLabel,
  initialHabits,
  sideQuest,
}: TodayDashboardProps) {
  const [habits, setHabits] = useState(initialHabits);
  const [reflection, setReflection] = useState("");

  const completedCount = habits.filter((habit) => habit.status === "complete").length;
  const completionRate = Math.round(
    (habits.reduce((total, habit) => total + habit.completion, 0) / habits.length) * 100,
  );
  const efficiency = useMemo(
    () =>
      calculateRoutineEfficiency(
        habits.map(({ completion, priority }) => ({ completion, priority })),
      ),
    [habits],
  );
  const questProgress = Math.round(
    (sideQuest.completedMilestones / sideQuest.totalMilestones) * 100,
  );

  function toggleHabit(id: string) {
    setHabits((current) =>
      current.map((habit) => (habit.id === id ? nextHabitState(habit) : habit)),
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 px-5 py-7 text-slate-950 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-9 flex items-center justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              QuestLog
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Good morning. Here’s today.
            </h1>
          </div>
          <div
            aria-label="QuestLog profile"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-slate-950 text-sm font-semibold text-white"
          >
            QL
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-[1.55fr_1fr]">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{dateLabel}</p>
                <h2 className="mt-1 text-2xl font-semibold">Daily routine</h2>
              </div>
              <div className="text-right">
                <p className="text-3xl font-semibold text-emerald-700">{completionRate}%</p>
                <p className="text-xs text-slate-500">
                  {completedCount} of {habits.length} complete
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-3">
              {habits.map((habit) => (
                <article
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 sm:gap-4"
                  key={habit.id}
                >
                  <button
                    aria-label={`${habit.status === "complete" ? "Undo" : "Complete"} ${habit.name}`}
                    className={`grid size-8 shrink-0 place-items-center rounded-full border text-sm transition ${statusStyles[habit.status]}`}
                    onClick={() => toggleHabit(habit.id)}
                    type="button"
                  >
                    ✓
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{habit.name}</h3>
                      {habit.priority === 3 && (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-rose-700">
                          High priority
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-slate-500">
                      {habit.target} · {habit.category}
                    </p>
                  </div>
                  <button
                    className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium transition hover:bg-slate-200 sm:px-4"
                    onClick={() => toggleHabit(habit.id)}
                    type="button"
                  >
                    {habit.status === "complete" ? "Done" : "Check in"}
                  </button>
                </article>
              ))}
            </div>
          </div>

          <aside className="grid content-start gap-5">
            <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
              <p className="text-sm font-medium text-slate-400">Routine efficiency</p>
              <p className="mt-3 text-5xl font-semibold">{efficiency}%</p>
              <p className="mt-5 text-sm leading-6 text-slate-300" aria-live="polite">
                {efficiency === 100
                  ? "Every scheduled commitment is complete."
                  : "High-priority habits contribute more to this score."}
              </p>
            </section>

            <section className="rounded-3xl bg-amber-200 p-6 shadow-sm sm:p-8">
              <p className="text-sm font-medium text-amber-900/70">This month’s side quest</p>
              <h2 className="mt-2 text-xl font-semibold">{sideQuest.title}</h2>
              <div
                aria-label={`Side quest ${questProgress}% complete`}
                className="mt-6 h-2 overflow-hidden rounded-full bg-white/70"
                role="progressbar"
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={questProgress}
              >
                <div
                  className="h-full rounded-full bg-amber-950 transition-all"
                  style={{ width: `${questProgress}%` }}
                />
              </div>
              <div className="mt-3 flex justify-between text-sm font-medium">
                <span>
                  {sideQuest.completedMilestones} of {sideQuest.totalMilestones} milestones
                </span>
                <span>{questProgress}%</span>
              </div>
            </section>
          </aside>
        </section>

        <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-8">
          <label className="text-lg font-semibold" htmlFor="daily-reflection">
            One-line reflection
          </label>
          <p className="mt-1 text-sm text-slate-500">What helped—or got in the way—today?</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              className="min-h-12 flex-1 rounded-2xl border border-slate-200 bg-stone-50 px-4 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
              id="daily-reflection"
              maxLength={180}
              onChange={(event) => setReflection(event.target.value)}
              placeholder="Today felt focused because…"
              value={reflection}
            />
            <button
              className="min-h-12 rounded-2xl bg-emerald-700 px-6 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!reflection.trim()}
              type="button"
            >
              Save reflection
            </button>
          </div>
        </section>

        <p className="mt-7 text-center text-sm text-slate-500">
          Interactive product slice · changes remain local sample data for now
        </p>
      </div>
    </main>
  );
}
