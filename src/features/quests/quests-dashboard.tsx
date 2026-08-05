"use client";

import { FormEvent, useMemo, useState } from "react";

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
            <div className="py-6 sm:border-r sm:border-black/[0.09] sm:pr-6"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--soft-muted)]">Committed</p><p className="mt-4 text-5xl font-semibold tracking-[-0.06em]">{quests.length}</p></div>
            <div className="border-t border-black/[0.09] py-6 sm:border-r sm:border-t-0 sm:px-6"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--soft-muted)]">Completed</p><p className="mt-4 text-5xl font-semibold tracking-[-0.06em]">{completed}</p></div>
            <div className="border-t border-black/[0.09] py-6 sm:border-t-0 sm:pl-6"><div className="flex items-start justify-between"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--soft-muted)]">Month progress</p><p className="text-4xl font-semibold tracking-[-0.05em]">{overallProgress}%</p></div><div className="mt-8 h-2 overflow-hidden rounded-full bg-black/[0.07]"><div className="h-full rounded-full bg-[var(--soft-ink)]" style={{ width: `${overallProgress}%` }} /></div></div>
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
                    <span className="grid size-14 place-items-center rounded-full bg-white/45"><ActivityIcon activity={`${quest.title} ${quest.category}`} /></span>
                    <div><div className="flex flex-wrap items-center gap-3"><span className="text-[10px] font-black uppercase tracking-[0.13em] text-[var(--soft-accent)]">{quest.category}</span><span className="text-xs text-[var(--soft-muted)]">{quest.dueLabel}</span></div><h3 className={`mt-2 text-xl font-bold tracking-[-0.025em] ${isComplete ? "text-[var(--soft-muted)] line-through" : ""}`}>{quest.title}</h3><p className="mt-1 text-xs text-[var(--soft-muted)]">{statusLabels[quest.status]}</p></div>
                    <button className={`min-h-12 rounded-full px-5 text-xs font-bold transition ${isComplete ? "bg-white/55 text-[var(--soft-muted)]" : "bg-[var(--soft-ink)] text-white"}`} onClick={() => toggleQuestCompletion(quest.id)} type="button">{isComplete ? "Mark incomplete" : "Mark complete"}</button>
                  </article>
                );
              })}
            </div>
          </section>
      {isCreating && (
        <div aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-[var(--soft-ink)]/30 p-5 backdrop-blur-md" role="dialog">
          <form className="w-full max-w-lg overflow-hidden rounded-[34px] bg-[var(--soft-surface)] shadow-2xl" onSubmit={createQuest}>
            <div className="p-6 sm:p-8"><div className="flex items-start justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--soft-accent)]">August quest</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">One clear finish line</h2><p className="mt-2 text-sm text-[var(--soft-muted)]">An outcome, not an ongoing habit.</p></div><button aria-label="Close create quest" className="grid size-10 place-items-center rounded-full bg-white/55" onClick={() => setIsCreating(false)} type="button">×</button></div></div>
            <div className="p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Examples</p><div className="mt-3 flex flex-wrap gap-2">{["Finish a course", "Publish my portfolio", "Read one book"].map((preset) => <button className="rounded-full bg-[#f3e7ca] px-3 py-2 text-xs font-semibold text-[#6e5b3c]" key={preset} onClick={() => setTitle(preset)} type="button">{preset}</button>)}</div>
            <label className="mt-7 block text-sm font-semibold" htmlFor="quest-title">Quest title</label><input autoFocus className="mt-2 min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 outline-none focus:border-[#174f3a]/50 focus:ring-2 focus:ring-[#174f3a]/10" id="quest-title" onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Ship my portfolio" value={title} />
            <p className="mt-5 rounded-xl bg-[#f3e7ca] p-4 text-sm leading-6 text-[#6e5b3c]">Keep it concrete: a quest has one clear finish line. Mark it complete when the outcome is achieved.</p>
            <div className="mt-7 flex gap-3"><button className="min-h-13 flex-1 rounded-full bg-white/55 text-sm font-bold" onClick={() => setIsCreating(false)} type="button">Cancel</button><button className="min-h-13 flex-1 rounded-full bg-[var(--soft-ink)] text-sm font-bold text-white disabled:opacity-30" disabled={!title.trim()} type="submit">Create quest</button></div>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
