"use client";

import { FormEvent, useMemo, useState } from "react";
import { ChartNoAxesColumnIncreasing, CircleCheckBig, Flag } from "lucide-react";
import { createPortal } from "react-dom";

import { AppShell } from "@/components/app-shell";
import { ActivityIcon } from "@/components/activity-icon";
import type { QuestStatus, QuestSummary } from "./types";

type QuestsDashboardProps = { initialQuests: QuestSummary[] };

const statusLabels: Record<QuestStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  blocked: "Blocked",
  completed: "Completed",
};

export function QuestsDashboard({ initialQuests }: QuestsDashboardProps) {
  const [quests, setQuests] = useState(initialQuests);
  const [filter, setFilter] = useState<"all" | QuestStatus>("all");
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");

  const visibleQuests = useMemo(
    () => quests.filter((quest) => filter === "all" || quest.status === filter),
    [filter, quests],
  );
  const completed = quests.filter((quest) => quest.status === "completed").length;
  const overallProgress = Math.round((completed / quests.length) * 100);

  function toggleQuestCompletion(id: string) {
    setQuests((current) =>
      current.map((quest) =>
        quest.id === id
          ? {
              ...quest,
              status: quest.status === "completed" ? "in-progress" : "completed",
              dueLabel: quest.status === "completed" ? "Aug 31" : "Completed",
            }
          : quest,
      ),
    );
  }

  function createQuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    setQuests((current) => [
      ...current,
      {
        id: `quest-${current.length + 1}`,
        title: title.trim(),
        category: "Personal",
        status: "not-started",
        dueLabel: "Aug 31",
        effortHours: 6,
        color: "green",
      },
    ]);
    setTitle("");
    setFilter("all");
    setIsCreating(false);
  }

  return (
    <AppShell active="Quests" eyebrow="August · 27 days left" title={<>A few things worth<br />finishing.</>} action={<button className="rounded-full bg-[var(--soft-ink)] px-6 py-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5" onClick={() => setIsCreating(true)} type="button">+ New quest</button>}>
          <section className="mt-12 grid border-y border-black/[0.09] sm:grid-cols-[1fr_1fr_1.4fr]">
            <div className="py-6 sm:border-r sm:border-black/[0.09] sm:pr-6"><p className="metric-label"><Flag aria-hidden className="text-[var(--soft-icon-clay)]" />Committed</p><p className="mt-4 text-5xl font-semibold tracking-[-0.06em]">{quests.length}</p></div>
            <div className="border-t border-black/[0.09] py-6 sm:border-r sm:border-t-0 sm:px-6"><p className="metric-label"><CircleCheckBig aria-hidden className="text-[var(--soft-icon-green)]" />Completed</p><p className="mt-4 text-5xl font-semibold tracking-[-0.06em]">{completed}</p></div>
            <div className="border-t border-black/[0.09] py-6 sm:border-t-0 sm:pl-6"><div className="flex items-start justify-between"><p className="metric-label"><ChartNoAxesColumnIncreasing aria-hidden className="text-[var(--soft-icon-blue)]" />Month progress</p><p className="text-4xl font-semibold tracking-[-0.05em]">{overallProgress}%</p></div><div className="mt-8 h-2 overflow-hidden rounded-full bg-black/[0.07]"><div className="h-full rounded-full bg-[var(--soft-ink)]" style={{ width: `${overallProgress}%` }} /></div></div>
          </section>

          <section className="mt-10 border-t border-black/[0.09] pt-7">
            <div className="flex flex-col gap-4 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="text-xl font-semibold tracking-[-0.025em]">Monthly board</h2><p className="mt-1 text-sm text-stone-500">Meaningful goals beyond the daily routine.</p></div>
              <div className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-white/45 p-1">{(["all", "in-progress", "not-started", "blocked", "completed"] as const).map((option) => <button className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${filter === option ? "bg-[var(--soft-ink)] text-white" : "text-[var(--soft-muted)]"}`} key={option} onClick={() => setFilter(option)} type="button">{option === "all" ? "All" : statusLabels[option]}</button>)}</div>
            </div>

            <div className="soft-flow soft-task-cards mt-5 grid gap-3 xl:grid-cols-2">
              {visibleQuests.map((quest) => {
                const isComplete = quest.status === "completed";
                return (
                  <article className="grid min-h-40 gap-5 border border-white/50 p-5 md:grid-cols-[56px_minmax(0,1fr)_auto] md:items-center md:p-6" key={quest.id}>
                    <span className="grid size-11 place-items-center"><ActivityIcon activity={`${quest.title} ${quest.category}`} className="size-7" /></span>
                    <div><div className="flex flex-wrap items-center gap-3"><span className="text-[10px] font-black uppercase tracking-[0.13em] text-[var(--soft-accent)]">{quest.category}</span><span className="text-xs text-[var(--soft-muted)]">{quest.dueLabel}</span></div><h3 className={`mt-2 text-xl font-bold tracking-[-0.025em] ${isComplete ? "text-[var(--soft-muted)] line-through" : ""}`}>{quest.title}</h3><p className="mt-1 text-xs text-[var(--soft-muted)]">{statusLabels[quest.status]}</p></div>
                    <button className={`min-h-12 rounded-full px-5 text-xs font-bold transition ${isComplete ? "bg-white/55 text-[var(--soft-muted)]" : "bg-[var(--soft-ink)] text-white"}`} onClick={() => toggleQuestCompletion(quest.id)} type="button">{isComplete ? "Mark incomplete" : "Mark complete"}</button>
                  </article>
                );
              })}
            </div>
          </section>
      {isCreating && createPortal(
        <div aria-modal="true" className="creation-overlay" role="dialog">
          <form className="creation-sheet" onSubmit={createQuest}>
            <button aria-label="Close create quest" className="creation-close" onClick={() => setIsCreating(false)} type="button">×</button>
            <aside className="creation-aside creation-aside-quest">
              <p className="soft-kicker">August quest</p>
              <div className="creation-preview"><ActivityIcon activity={title || "goal target"} className="size-9" /></div>
              <div><h2>Choose one<br />clear finish.</h2><p>A quest is an outcome you can point to—not another routine to maintain.</p></div>
              <span className="creation-step">01 · Define the outcome</span>
            </aside>
            <div className="creation-form">
              <div><p className="soft-kicker text-[var(--soft-accent)]">Create a quest</p><h3>What would feel meaningful?</h3><p>Name the result, not the effort it takes to get there.</p></div>
              <label className="creation-field-label" htmlFor="quest-title">Quest title</label>
              <input autoFocus className="creation-field" id="quest-title" onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Publish my portfolio" value={title} />
              <div><p className="creation-field-label">A little inspiration</p><div className="creation-presets creation-presets-quest">{["Finish a course", "Publish my portfolio", "Read one book"].map((preset) => <button aria-pressed={title === preset} key={preset} onClick={() => setTitle(preset)} type="button"><ActivityIcon activity={preset} className="size-4" />{preset}</button>)}</div></div>
              <div className="creation-guidance"><span aria-hidden>◇</span><p><strong>One finish line.</strong> When the outcome exists, the quest is complete.</p></div>
              <div className="creation-actions"><button onClick={() => setIsCreating(false)} type="button">Cancel</button><button disabled={!title.trim()} type="submit"><span>Create quest</span><span aria-hidden>→</span></button></div>
            </div>
          </form>
        </div>,
        document.body,
      )}
    </AppShell>
  );
}
