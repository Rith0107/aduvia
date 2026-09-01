"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { calculateRoutineEfficiency } from "@/lib/metrics";
import type { TodayHabit } from "@/features/today/types";
import { ActivityIcon } from "@/components/activity-icon";
import { BrandLogo } from "@/components/brand-logo";
import { PaletteChooser } from "@/components/palette-chooser";
import { TypographyChooser } from "@/components/typography-chooser";
import { todaysHabits, useAppData } from "@/lib/app-data";
import { eveningGuidance } from "@/lib/guidance";
import { useViewerFirstName } from "@/lib/use-viewer-name";

type EveningCheckInProps = { initialHabits: TodayHabit[] };

export function EveningCheckIn({ initialHabits }: EveningCheckInProps) {
  const appData = useAppData();
  const firstName = useViewerFirstName();
  const sharedHabits = appData ? todaysHabits(appData.habits, appData.completions) : null;
  const [localHabits, setLocalHabits] = useState<TodayHabit[]>(initialHabits.map((habit) => ({ ...habit, completion: 0, status: "pending" })));
  const habits = sharedHabits ?? localHabits;
  const [isFinished, setIsFinished] = useState(false);
  const completedCount = habits.filter((habit) => habit.status === "complete").length;
  const answeredCount = habits.filter((habit) => habit.status !== "pending").length;
  const efficiency = useMemo(() => calculateRoutineEfficiency(habits.map(({ completion, priority }) => ({ completion, priority }))), [habits]);
  const allAnswered = habits.length > 0 && habits.every((habit) => habit.status !== "pending");
  const completionRatio = habits.length ? completedCount / habits.length : 0;
  const guidance = eveningGuidance({ answered: answeredCount, firstName, total: habits.length });

  function setHabitStatus(id: string, completed: boolean) {
    if (appData) appData.setHabitStatus(id, completed ? "complete" : "skipped");
    else setLocalHabits((current) => current.map((habit) => habit.id === id ? { ...habit, status: completed ? "complete" : "skipped", completion: completed ? 1 : 0 } : habit));
  }

  if (appData?.isLoading) {
    return <main className="soft-canvas grid min-h-screen place-items-center px-5 text-[var(--soft-ink)]"><section aria-busy="true" aria-live="polite" className="w-full max-w-lg rounded-[34px] border border-white/65 bg-white/35 p-9 text-center shadow-[0_26px_70px_-45px_rgba(28,43,35,.55)]"><span className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--soft-ink)]"><span className="size-3 animate-pulse rounded-full bg-[var(--chart-primary)]" /></span><h1 className="mt-6 text-3xl font-semibold tracking-[-.04em]">Preparing tonight’s check-in…</h1><p className="mt-3 text-sm text-[var(--soft-muted)]">We’re finding only the habits scheduled for today.</p></section></main>;
  }

  if (isFinished) {
    return (
      <main className="soft-canvas grid min-h-screen place-items-center text-[var(--soft-ink)]">
        <section className="relative w-full max-w-xl overflow-hidden p-8 text-center sm:p-14">
          <div className="absolute -right-20 -top-20 size-64 rounded-full bg-[var(--soft-tint-a)] blur-3xl" />
          <div className="relative">
            <span className="mx-auto grid size-20 place-items-center rounded-full bg-[var(--soft-ink)] text-2xl text-white">✓</span>
            <p className="mt-8 text-[11px] font-black uppercase tracking-[0.22em] text-[var(--soft-accent)]">Today is closed</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em]">{guidance.finished}</h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[var(--soft-muted)]">{completedCount} habits completed · {efficiency}% routine efficiency. You can leave the rest here and come back fresh tomorrow.</p>
            <Link className="mt-9 inline-flex min-h-13 items-center justify-center rounded-full bg-[var(--soft-ink)] px-7 text-sm font-bold text-white" href="/today">Return to Today</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="soft-canvas min-h-screen text-[var(--soft-ink)]">
      <a className="skip-link" href="#evening-content">Skip to check-in</a>
      <div className="soft-shell min-h-screen overflow-hidden">
        <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col justify-center px-5 py-6 sm:px-9 sm:py-8" id="evening-content">
          <header className="mb-5 flex items-center justify-between px-1 sm:mb-6">
            <BrandLogo href="/today" />
            <div className="flex items-center gap-2"><PaletteChooser /><TypographyChooser /><Link className="evening-exit-pill" href="/today"><span aria-hidden="true">←</span><span className="hidden sm:inline">Back to Today</span><span className="sm:hidden">Exit</span></Link><span className="evening-mode-pill"><span aria-hidden="true">☾</span><span className="hidden sm:inline">Evening mode</span></span></div>
          </header>
          <div className="evening-intro">
            <div>
              <p className="soft-kicker text-[var(--soft-accent)]">{guidance.salutation} · your evening reset</p>
              <h1>{guidance.headline}</h1>
            </div>
            <div className="evening-progress-dial" style={{ "--check-progress": `${completionRatio * 360}deg` } as React.CSSProperties}>
              <div><strong>{completedCount}</strong><span>of {habits.length} done</span></div>
            </div>
            <div className="evening-intro-copy">
              <p>{guidance.prompt}</p>
              <div aria-label="Completed habits" aria-valuemax={habits.length} aria-valuemin={0} aria-valuenow={completedCount} className="evening-progress-line" role="progressbar"><span style={{ width: `${completionRatio * 100}%` }} /></div>
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
            {!habits.length && <div className="col-span-full flex min-h-48 flex-col items-center justify-center rounded-[32px] border border-white/60 bg-white/35 px-6 text-center"><p className="soft-kicker text-[var(--soft-accent)]">Your evening is clear</p><h2 className="mt-3 text-2xl font-semibold">No habits were scheduled today.</h2><p className="mt-2 max-w-sm text-sm text-[var(--soft-muted)]">There is nothing to score or explain. Head home and let today be complete.</p><Link className="mt-6 rounded-full bg-[var(--soft-ink)] px-5 py-3 text-sm font-bold text-white" href="/today">Return home</Link></div>}
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
