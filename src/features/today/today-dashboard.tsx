"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { ActivityIcon } from "@/components/activity-icon";
import { todaysHabits, useAppData } from "@/lib/app-data";
import { calculateRoutineEfficiency } from "@/lib/metrics";
import type { SideQuestSummary, TodayHabit } from "./types";

type TodayDashboardProps = { dateLabel: string; initialHabits: TodayHabit[]; sideQuest: SideQuestSummary };

function nextHabitState(habit: TodayHabit): TodayHabit {
  return habit.status === "complete" ? { ...habit, status: "pending", completion: 0 } : { ...habit, status: "complete", completion: 1 };
}

export function TodayDashboard({ dateLabel, initialHabits, sideQuest }: TodayDashboardProps) {
  const appData = useAppData();
  const [localHabits, setLocalHabits] = useState(initialHabits);
  const habits = appData ? todaysHabits(appData.habits, appData.completions) : localHabits;
  const quests = appData?.quests ?? [];
  const [reflection, setReflection] = useState("");
  const completedCount = habits.filter((habit) => habit.status === "complete").length;
  const efficiency = useMemo(() => calculateRoutineEfficiency(habits.map(({ completion, priority }) => ({ completion, priority }))), [habits]);
  const completedQuests = quests.filter((quest) => quest.status === "completed").length;
  const questProgress = quests.length ? Math.round((completedQuests / quests.length) * 100) : Math.round((sideQuest.completedMilestones / sideQuest.totalMilestones) * 100);

  function toggleHabit(id: string) {
    if (appData) {
      const habit = habits.find((item) => item.id === id);
      appData.setHabitStatus(id, habit?.status === "complete" ? "pending" : "complete");
    } else setLocalHabits((current) => current.map((habit) => habit.id === id ? nextHabitState(habit) : habit));
  }

  function toggleQuest(id: string) {
    appData?.setQuests((current) => current.map((quest) => quest.id === id ? { ...quest, status: quest.status === "completed" ? "in-progress" : "completed", dueLabel: quest.status === "completed" ? "Aug 31" : "Completed" } : quest));
  }

  return (
    <AppShell active="Today" eyebrow={dateLabel} title={<>A softer way<br />to show up.</>} action={<div className="max-w-xs border-l border-black/[0.12] pl-5"><p className="text-sm leading-6 text-[var(--soft-muted)]">You’ve already done {completedCount === 0 ? "the hard part: starting" : `${completedCount} of ${habits.length}`}. The rest can be light.</p></div>}>
      <section className="mt-12">
        <div className="soft-flow soft-task-cards grid gap-3 sm:grid-cols-2">
          {habits.map((habit) => (
            <article className="group relative grid min-h-36 grid-cols-[52px_1fr_auto] items-center gap-4 border border-white/50 p-5 sm:min-h-36 sm:grid-cols-[58px_1fr_auto] sm:gap-5 sm:px-7 sm:py-5 xl:min-h-40 xl:grid-cols-[64px_1fr_auto] xl:px-10" key={habit.id}>
              <span className="grid size-11 place-items-center sm:size-12 xl:size-14"><ActivityIcon activity={`${habit.name} ${habit.category}`} className="size-7 sm:size-8 xl:size-9" /></span>
              <div className="min-w-0"><h2 className={`text-2xl font-bold tracking-[-0.035em] sm:text-3xl xl:text-[2rem] ${habit.status === "complete" ? "text-[var(--soft-muted)] line-through decoration-[var(--soft-muted)]/70" : ""}`}>{habit.name}</h2><p className="mt-1.5 text-sm font-medium text-[var(--soft-muted)] sm:text-base">{habit.category} · {habit.target}</p></div>
              {habit.priority === 3 && <span className="absolute right-5 top-5 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--soft-accent)]">Today’s anchor</span>}
              <button aria-label={`${habit.status === "complete" ? "Undo" : "Complete"} ${habit.name}`} className={`completion-control grid size-13 shrink-0 place-items-center rounded-full border-2 text-lg ${habit.status === "complete" ? "border-[var(--soft-ink)] bg-[var(--soft-ink)] text-white" : "border-[color:color-mix(in_srgb,var(--soft-ink)_15%,transparent)] text-transparent hover:border-[var(--soft-ink)]"}`} onClick={() => toggleHabit(habit.id)} type="button">✓</button>
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
          <div className="soft-orbit-mark" aria-hidden="true">{quests.slice(0, 4).map((quest, index) => <span className={quest.status === "completed" ? "complete" : ""} key={quest.id} style={{ "--orbit-index": index } as React.CSSProperties} />)}</div>
          <div className="soft-quest-feature">
            <p className="soft-quest-percentage">{questProgress}<span>%</span></p>
            <p className="mt-5 text-xs text-[var(--soft-muted)]">Monthly side quests</p>
            <h2>{quests.length ? `${quests.length} quests in your orbit` : sideQuest.title}</h2>
            {quests.length > 0 && <p className="mt-2 text-xs font-semibold text-[var(--soft-muted)]">{completedQuests} completed · {quests.length - completedQuests} still moving</p>}
          </div>
          <div><div className="soft-quest-track"><span style={{ width: `${questProgress}%` }} /></div><p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--soft-muted)]">Progress this month</p></div>
          {quests.length > 0 && <div className="mt-6 border-t border-black/[0.09] pt-4"><div className="flex items-center justify-between"><p className="soft-kicker text-[var(--soft-muted)]">Monthly side quests</p><Link className="text-[10px] font-black uppercase tracking-[0.13em] text-[var(--soft-accent)]" href="/quests">Manage</Link></div><div className="mt-3 grid gap-2">{quests.map((quest) => { const complete = quest.status === "completed"; return <button aria-label={`${complete ? "Undo" : "Complete"} ${quest.title}`} className="group flex w-full items-center gap-3 rounded-[14px] bg-white/35 px-3 py-2.5 text-left transition hover:bg-white/60" key={quest.id} onClick={() => toggleQuest(quest.id)} type="button"><span className={`grid size-6 shrink-0 place-items-center rounded-full border text-xs ${complete ? "border-[var(--soft-ink)] bg-[var(--soft-ink)] text-white" : "border-black/15 text-transparent"}`}>✓</span><span className={`min-w-0 flex-1 truncate text-xs font-bold ${complete ? "text-[var(--soft-muted)] line-through" : "text-[var(--soft-ink)]"}`}>{quest.title}</span></button>; })}</div></div>}
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
