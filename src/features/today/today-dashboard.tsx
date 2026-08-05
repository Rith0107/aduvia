"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { calculateRoutineEfficiency } from "@/lib/metrics";

import type { SideQuestSummary, TodayHabit } from "./types";

type TodayDashboardProps = {
  dateLabel: string;
  initialHabits: TodayHabit[];
  sideQuest: SideQuestSummary;
};

const navItems = [
  { label: "Today", href: "/" },
  { label: "Habits", href: "/habits" },
  { label: "Quests", href: "/quests" },
  { label: "Insights", href: "/insights" },
];

const statusStyles = {
  pending: "border-stone-300 bg-white text-transparent",
  complete: "border-[#174f3a] bg-[#174f3a] text-white",
  partial: "border-[#d79b35] bg-[#d79b35] text-white",
  skipped: "border-stone-400 bg-stone-400 text-white",
};

function nextHabitState(habit: TodayHabit): TodayHabit {
  if (habit.status === "pending") {
    return { ...habit, status: "complete", completion: 1 };
  }

  return { ...habit, status: "pending", completion: 0 };
}

function Sparkline() {
  return (
    <svg aria-hidden="true" className="h-14 w-full" viewBox="0 0 240 56">
      <path
        d="M2 44C24 40 35 22 56 27s28 16 47 7 26-25 47-20 29 24 48 17 23-19 40-22"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <circle cx="238" cy="9" fill="currentColor" r="4" />
    </svg>
  );
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
    <main className="quest-canvas min-h-screen p-3 text-[#17201c] sm:p-5">
      <div className="quest-shell mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1440px] overflow-hidden rounded-[28px] border border-[#174f3a]/15 sm:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[220px_1fr]">
        <aside className="quest-sidebar hidden border-r border-white/10 px-5 py-7 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 px-2">
            <div className="grid size-9 place-items-center rounded-xl bg-[#174f3a] text-sm font-semibold text-white">
              Q
            </div>
            <span className="text-lg font-semibold tracking-[-0.03em]">QuestLog</span>
          </div>

          <nav aria-label="Primary" className="mt-14 space-y-1">
            {navItems.map((item, index) => (
              <Link
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  index === 0
                    ? "bg-[#e5ece5] text-[#174f3a]"
                    : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                }`}
                href={item.href}
                key={item.label}
              >
                <span className={`size-1.5 rounded-full ${index === 0 ? "bg-[#174f3a]" : "bg-stone-300"}`} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/45">August focus</p>
            <p className="mt-2 text-sm font-semibold leading-5">Consistency over intensity.</p>
            <div className="mt-4 flex gap-1">
              {[1, 1, 1, 0, 1, 1, 0].map((active, index) => (
                <span
                  className={`h-1.5 flex-1 rounded-full ${active ? "bg-[#174f3a]" : "bg-stone-300"}`}
                  key={index}
                />
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0 px-5 py-6 sm:px-8 sm:py-8 xl:px-12 xl:py-10">
          <header className="flex items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 lg:hidden">
                <div className="grid size-7 place-items-center rounded-lg bg-[#174f3a] text-xs font-semibold text-white">Q</div>
                <span className="text-sm font-semibold">QuestLog</span>
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 lg:mt-0">{dateLabel}</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-[40px]">
                Make today count<span className="text-[#d89a42]">.</span>
              </h1>
            </div>
            <button
              aria-label="Open profile"
              className="grid size-11 shrink-0 place-items-center rounded-full border border-black/10 bg-white text-xs font-semibold shadow-sm transition hover:-translate-y-0.5"
              type="button"
            >
              QL
            </button>
          </header>

          <nav aria-label="Mobile navigation" className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item, index) => (
              <Link
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
                  index === 0 ? "bg-[#174f3a] text-white" : "bg-white text-stone-500"
                }`}
                href={item.href}
                key={item.label}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <section className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.8fr)]">
            <section className="rounded-[24px] border border-[#d8ded7] bg-[#f7faf7] p-5 shadow-[0_12px_35px_rgba(31,38,34,0.04)] sm:p-7">
              <div className="flex items-center justify-between gap-5 border-b border-black/[0.06] pb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Daily rhythm</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">Your routine</h2>
                  <p className="mt-1 text-sm text-stone-500">{completedCount} of {habits.length} complete</p>
                </div>
                <div
                  aria-label={`${completionRate}% of routine complete`}
                  className="grid size-[74px] place-items-center rounded-full"
                  role="progressbar"
                  style={{
                    background: `radial-gradient(circle at center, #f7faf7 61%, transparent 63%), conic-gradient(#174f3a ${completionRate}%, #dce5dc 0)`,
                  }}
                >
                  <span className="text-sm font-semibold">{completionRate}%</span>
                </div>
              </div>

              <div className="mt-2 divide-y divide-black/[0.06]">
                {habits.map((habit) => (
                  <article className="group flex items-center gap-3 py-4 sm:gap-4" key={habit.id}>
                    <button
                      aria-label={`${habit.status === "complete" ? "Undo" : "Complete"} ${habit.name}`}
                      className={`grid size-8 shrink-0 place-items-center rounded-[11px] border text-sm transition group-hover:scale-105 ${statusStyles[habit.status]}`}
                      onClick={() => toggleHabit(habit.id)}
                      type="button"
                    >
                      ✓
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`font-medium ${habit.status === "complete" ? "text-stone-400 line-through decoration-stone-300" : ""}`}>
                          {habit.name}
                        </h3>
                        {habit.priority === 3 && (
                          <span className="rounded-full bg-[#f8e8e2] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9c4b38]">
                            Priority
                          </span>
                        )}
                      </div>
                      <p className="truncate text-sm text-stone-400">{habit.target} · {habit.category}</p>
                    </div>
                    <button
                      className="rounded-full border border-black/[0.07] bg-[#faf9f5] px-3 py-1.5 text-xs font-semibold text-stone-500 transition hover:border-[#174f3a]/30 hover:text-[#174f3a]"
                      onClick={() => toggleHabit(habit.id)}
                      type="button"
                    >
                      {habit.status === "complete" ? "Undo" : "Check in"}
                    </button>
                  </article>
                ))}
              </div>

              <button className="mt-3 w-full rounded-xl border border-dashed border-stone-300 py-3 text-sm font-medium text-stone-400 transition hover:border-[#174f3a]/40 hover:text-[#174f3a]" type="button">
                + Add a habit
              </button>
            </section>

            <div className="grid content-start gap-5 sm:grid-cols-2 xl:grid-cols-1">
              <section className="relative overflow-hidden rounded-[24px] bg-[#173c30] p-6 text-white shadow-[0_15px_40px_rgba(23,60,48,0.16)]">
                <div className="absolute -right-12 -top-16 size-40 rounded-full border-[30px] border-white/[0.04]" />
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Efficiency</p>
                      <p className="mt-3 text-5xl font-semibold tracking-[-0.05em]">{efficiency}%</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-[#b9d4c8]">↗ 8%</span>
                  </div>
                  <div className="mt-6 text-[#8eb5a6]"><Sparkline /></div>
                  <p className="mt-2 text-xs leading-5 text-white/55" aria-live="polite">
                    {efficiency === 100 ? "Every scheduled commitment is complete." : "Priority habits carry more weight."}
                  </p>
                </div>
              </section>

              <section className="rounded-[24px] border border-black/[0.06] bg-[#eee7d5] p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#876f47]">Side quest</p>
                  <span className="text-xs font-semibold text-[#876f47]">{questProgress}%</span>
                </div>
                <h2 className="mt-4 max-w-[260px] text-xl font-semibold leading-7 tracking-[-0.025em]">{sideQuest.title}</h2>
                <div aria-label={`Side quest ${questProgress}% complete`} className="mt-7 h-1.5 overflow-hidden rounded-full bg-white/70" role="progressbar" aria-valuemax={100} aria-valuemin={0} aria-valuenow={questProgress}>
                  <div className="h-full rounded-full bg-[#876f47] transition-all" style={{ width: `${questProgress}%` }} />
                </div>
                <p className="mt-3 text-xs font-medium text-[#876f47]">{sideQuest.completedMilestones} of {sideQuest.totalMilestones} milestones complete</p>
              </section>
            </div>
          </section>

          <section className="mt-5 flex flex-col gap-4 rounded-[24px] border border-[#eadcc9] bg-[#fbf5eb] p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="sm:w-56">
              <p className="text-sm font-semibold">Daily note</p>
              <p className="mt-1 text-xs leading-5 text-stone-400">Capture one thing worth remembering.</p>
            </div>
            <label className="sr-only" htmlFor="daily-reflection">One-line reflection</label>
            <input
              className="min-h-12 min-w-0 flex-1 rounded-xl border border-black/[0.07] bg-[#f7f6f2] px-4 text-sm outline-none transition placeholder:text-stone-400 focus:border-[#174f3a]/50 focus:ring-2 focus:ring-[#174f3a]/10"
              id="daily-reflection"
              maxLength={180}
              onChange={(event) => setReflection(event.target.value)}
              placeholder="What made today better?"
              value={reflection}
            />
            <button className="min-h-12 rounded-xl bg-[#17201c] px-5 text-sm font-semibold text-white transition hover:bg-[#174f3a] disabled:cursor-not-allowed disabled:opacity-35" disabled={!reflection.trim()} type="button">
              Save note
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
