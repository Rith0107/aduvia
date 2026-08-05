"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import type { QuestStatus, QuestSummary } from "./types";

type QuestsDashboardProps = { initialQuests: QuestSummary[] };

const navItems = [
  { label: "Today", href: "/" },
  { label: "Habits", href: "/habits" },
  { label: "Quests", href: "/quests" },
  { label: "Insights", href: "/insights" },
];

const accentStyles = {
  green: "bg-[#dce9df] text-[#174f3a]",
  amber: "bg-[#f3e7ca] text-[#876f47]",
  rose: "bg-[#f4dfd9] text-[#9c4b38]",
  blue: "bg-[#dfe8ed] text-[#3d6678]",
};

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
  const [milestones, setMilestones] = useState(4);

  const visibleQuests = useMemo(
    () => quests.filter((quest) => filter === "all" || quest.status === filter),
    [filter, quests],
  );
  const completed = quests.filter((quest) => quest.status === "completed").length;
  const overallProgress = Math.round(
    (quests.reduce((sum, quest) => sum + quest.completedMilestones, 0) /
      quests.reduce((sum, quest) => sum + quest.totalMilestones, 0)) *
      100,
  );

  function advanceQuest(id: string) {
    setQuests((current) =>
      current.map((quest) => {
        if (quest.id !== id || quest.status === "completed") return quest;
        const nextCompleted = Math.min(quest.completedMilestones + 1, quest.totalMilestones);
        return {
          ...quest,
          completedMilestones: nextCompleted,
          status: nextCompleted === quest.totalMilestones ? "completed" : "in-progress",
        };
      }),
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
        completedMilestones: 0,
        totalMilestones: milestones,
        dueLabel: "Aug 31",
        effortHours: 6,
        color: "green",
      },
    ]);
    setTitle("");
    setMilestones(4);
    setFilter("all");
    setIsCreating(false);
  }

  return (
    <main className="min-h-screen bg-[#f3f1eb] p-3 text-[#17201c] sm:p-5">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1440px] overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#faf9f5] shadow-[0_30px_80px_rgba(31,38,34,0.08)] sm:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[220px_1fr]">
        <aside className="hidden border-r border-black/[0.07] px-5 py-7 lg:flex lg:flex-col">
          <Link className="flex items-center gap-3 px-2" href="/"><span className="grid size-9 place-items-center rounded-xl bg-[#174f3a] text-sm font-semibold text-white">Q</span><span className="text-lg font-semibold tracking-[-0.03em]">QuestLog</span></Link>
          <nav aria-label="Primary" className="mt-14 space-y-1">
            {navItems.map((item) => (
              <Link className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${item.label === "Quests" ? "bg-[#e5ece5] text-[#174f3a]" : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"}`} href={item.href} key={item.label}><span className={`size-1.5 rounded-full ${item.label === "Quests" ? "bg-[#174f3a]" : "bg-stone-300"}`} />{item.label}</Link>
            ))}
          </nav>
          <div className="mt-auto rounded-2xl bg-[#f3e7ca] p-4 text-[#876f47]"><p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-60">August progress</p><p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{overallProgress}%</p><p className="mt-1 text-xs opacity-70">Across committed quests</p></div>
        </aside>

        <div className="min-w-0 px-5 py-6 sm:px-8 sm:py-8 xl:px-12 xl:py-10">
          <header className="flex items-end justify-between gap-5">
            <div>
              <Link className="flex items-center gap-2 lg:hidden" href="/"><span className="grid size-7 place-items-center rounded-lg bg-[#174f3a] text-xs font-semibold text-white">Q</span><span className="text-sm font-semibold">QuestLog</span></Link>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 lg:mt-0">August · 27 days left</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-[40px]">Side quests<span className="text-[#d89a42]">.</span></h1>
            </div>
            <button className="rounded-xl bg-[#174f3a] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(23,79,58,0.18)] transition hover:-translate-y-0.5 hover:bg-[#123f2e]" onClick={() => setIsCreating(true)} type="button">+ New quest</button>
          </header>

          <nav aria-label="Mobile navigation" className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">{navItems.map((item) => <Link className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${item.label === "Quests" ? "bg-[#174f3a] text-white" : "bg-white text-stone-500"}`} href={item.href} key={item.label}>{item.label}</Link>)}</nav>

          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[22px] bg-[#dce9df] p-5 text-[#174f3a]"><p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-60">Committed</p><p className="mt-3 text-3xl font-semibold">{quests.length}</p></div>
            <div className="rounded-[22px] bg-[#f3e7ca] p-5 text-[#876f47]"><p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-60">Completed</p><p className="mt-3 text-3xl font-semibold">{completed}</p></div>
            <div className="rounded-[22px] bg-[#dfe8ed] p-5 text-[#3d6678]"><p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-60">Total effort</p><p className="mt-3 text-3xl font-semibold">{quests.reduce((sum, quest) => sum + quest.effortHours, 0)}h</p></div>
          </section>

          <section className="mt-5 rounded-[24px] border border-[#e5dccb] bg-[#fbf7ee] p-5 sm:p-7">
            <div className="flex flex-col gap-4 border-b border-black/[0.06] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="text-xl font-semibold tracking-[-0.025em]">Monthly board</h2><p className="mt-1 text-sm text-stone-500">Meaningful goals beyond the daily routine.</p></div>
              <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-[#eee8dc] p-1">{(["all", "in-progress", "not-started", "blocked", "completed"] as const).map((option) => <button className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${filter === option ? "bg-white text-[#174f3a] shadow-sm" : "text-stone-500"}`} key={option} onClick={() => setFilter(option)} type="button">{option === "all" ? "All" : statusLabels[option]}</button>)}</div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {visibleQuests.map((quest) => {
                const progress = Math.round((quest.completedMilestones / quest.totalMilestones) * 100);
                return (
                  <article className="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_8px_25px_rgba(31,38,34,0.035)]" key={quest.id}>
                    <div className="flex items-start justify-between gap-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.09em] ${accentStyles[quest.color]}`}>{quest.category}</span><span className="text-xs font-medium text-stone-400">{quest.dueLabel}</span></div>
                    <h3 className="mt-4 min-h-14 text-lg font-semibold leading-6 tracking-[-0.02em]">{quest.title}</h3>
                    <div className="mt-5 flex items-center justify-between text-xs"><span className="font-medium text-stone-400">{statusLabels[quest.status]}</span><span className="font-semibold">{progress}%</span></div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-[#174f3a] transition-all" style={{ width: `${progress}%` }} /></div>
                    <div className="mt-5 flex items-center justify-between border-t border-black/[0.05] pt-4"><div><p className="text-xs text-stone-400">Milestones</p><p className="mt-0.5 text-sm font-semibold">{quest.completedMilestones} / {quest.totalMilestones}</p></div><button className="rounded-full bg-[#e5ece5] px-3 py-2 text-xs font-semibold text-[#174f3a] transition hover:bg-[#174f3a] hover:text-white disabled:opacity-40" disabled={quest.status === "completed"} onClick={() => advanceQuest(quest.id)} type="button">{quest.status === "completed" ? "Completed" : "+ Milestone"}</button></div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {isCreating && (
        <div aria-modal="true" className="fixed inset-0 z-20 grid place-items-center bg-[#17201c]/35 p-5 backdrop-blur-sm" role="dialog">
          <form className="w-full max-w-md rounded-[26px] bg-[#faf9f5] p-6 shadow-2xl sm:p-7" onSubmit={createQuest}>
            <div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#876f47]">August quest</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Add a side quest</h2></div><button aria-label="Close create quest" className="grid size-9 place-items-center rounded-full bg-stone-200 text-stone-500" onClick={() => setIsCreating(false)} type="button">×</button></div>
            <label className="mt-7 block text-sm font-semibold" htmlFor="quest-title">Quest title</label><input autoFocus className="mt-2 min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 outline-none focus:border-[#174f3a]/50 focus:ring-2 focus:ring-[#174f3a]/10" id="quest-title" onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Ship my portfolio" value={title} />
            <label className="mt-5 block text-sm font-semibold" htmlFor="quest-milestones">Number of milestones</label><input className="mt-2 min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 outline-none" id="quest-milestones" max={12} min={1} onChange={(event) => setMilestones(Number(event.target.value))} type="number" value={milestones} />
            <div className="mt-7 flex gap-3"><button className="min-h-12 flex-1 rounded-xl bg-stone-200 text-sm font-semibold text-stone-600" onClick={() => setIsCreating(false)} type="button">Cancel</button><button className="min-h-12 flex-1 rounded-xl bg-[#174f3a] text-sm font-semibold text-white disabled:opacity-40" disabled={!title.trim()} type="submit">Create quest</button></div>
          </form>
        </div>
      )}
    </main>
  );
}
