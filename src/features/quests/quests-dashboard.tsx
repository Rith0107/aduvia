"use client";

import { FormEvent, useMemo, useState, useSyncExternalStore } from "react";
import { Archive, ChartNoAxesColumnIncreasing, Check, ChevronDown, CircleCheckBig, Flag, Pencil, Trash2 } from "lucide-react";
import { createPortal } from "react-dom";

import { AppShell } from "@/components/app-shell";
import { ActivityIcon } from "@/components/activity-icon";
import { useAppData } from "@/lib/app-data";
import { monthKey } from "@/lib/calendar";
import { getMonthContext } from "@/lib/month-context";
import type { QuestStatus, QuestSummary } from "./types";

type QuestsDashboardProps = { initialQuests: QuestSummary[] };

type QuestCategory = "Career" | "Learning" | "Personal" | "Creative" | "Finance" | "Wellness";

function inferQuestCategory(title: string): QuestCategory {
  const value = title.toLowerCase();
  if (/budget|saving|save |invest|money|finance|debt|expense|income/.test(value)) return "Finance";
  if (/course|learn|study|read|book|class|language|certif|exam/.test(value)) return "Learning";
  if (/portfolio|job|career|resume|cv|interview|client|business|launch|ship|work/.test(value)) return "Career";
  if (/write|paint|draw|music|photo|film|design|creative|story|publish/.test(value)) return "Creative";
  if (/fitness|workout|run|hike|walk|health|sleep|meditat|yoga|wellness/.test(value)) return "Wellness";
  return "Personal";
}

const statusLabels: Record<QuestStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  paused: "Paused",
  blocked: "Blocked",
  completed: "Completed",
};

const statusColors: Record<QuestStatus, string> = {
  "not-started": "bg-stone-400",
  "in-progress": "bg-[var(--soft-icon-green)]",
  paused: "bg-[var(--soft-icon-gold)]",
  blocked: "bg-[var(--soft-icon-clay)]",
  completed: "bg-[var(--soft-ink)]",
};

export function QuestsDashboard({ initialQuests }: QuestsDashboardProps) {
  const monthContext = getMonthContext();
  const appData = useAppData();
  const [localQuests, setLocalQuests] = useState(initialQuests);
  const quests = appData?.quests ?? localQuests;
  const setQuests = appData?.setQuests ?? setLocalQuests;
  const [filter, setFilter] = useState<"all" | QuestStatus>("all");
  const [view, setView] = useState<"current" | "archive">("current");
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);
  const [editingQuest, setEditingQuest] = useState<QuestSummary | null>(null);

  const thisMonth = monthKey();
  // The board is scoped to the current month's quests — a quest entered in
  // August is meant to be finished in August, not linger indefinitely.
  // Anything from an earlier month lives in the Archive instead.
  const currentQuests = useMemo(() => quests.filter((quest) => quest.targetMonth === thisMonth), [quests, thisMonth]);
  const archivedQuests = useMemo(
    () => quests.filter((quest) => quest.targetMonth !== thisMonth).sort((a, b) => b.targetMonth.localeCompare(a.targetMonth)),
    [quests, thisMonth],
  );
  const visibleQuests = useMemo(
    () => currentQuests.filter((quest) => filter === "all" || quest.status === filter),
    [filter, currentQuests],
  );
  const completed = currentQuests.filter((quest) => quest.status === "completed").length;
  const overallProgress = currentQuests.length ? Math.round((completed / currentQuests.length) * 100) : 0;

  // Unfinished quests from a month that's already passed, where nobody has
  // decided yet whether to carry them into this month or let them go.
  // Ordinary edits never touch rolloverReviewedAt, so this list only ever
  // shrinks via an explicit decision below — it can't reappear once resolved.
  const needsRolloverDecision = useMemo(
    () => quests.filter((quest) => quest.targetMonth < thisMonth && quest.status !== "completed" && !quest.rolloverReviewedAt),
    [quests, thisMonth],
  );
  const [dismissedRollover, setDismissedRollover] = useState(false);
  const [rolloverBusyId, setRolloverBusyId] = useState<string | null>(null);
  // The other portals here default to closed, so they never reach
  // createPortal during SSR. This one can be open on first render (a
  // fresh month with an already-loaded quest list), so it needs an
  // explicit client-only guard — useSyncExternalStore is the sanctioned
  // way to read a value that's legitimately false on the server and
  // during hydration, then true right after, with no setState-in-effect.
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  async function resolveRollover(questId: string, carryForward: boolean) {
    if (!appData) {
      // Local-preview mode: no backend to reconcile, so just resolve in place.
      const reviewedAt = new Date().toISOString();
      setQuests((current) => {
        const source = current.find((quest) => quest.id === questId);
        const next = current.map((quest) => quest.id === questId ? { ...quest, rolloverReviewedAt: reviewedAt } : quest);
        return carryForward && source ? [...next, { ...source, id: crypto.randomUUID(), targetMonth: thisMonth, dueLabel: monthContext.monthEndLabel, completedAt: null, carriedFromId: questId, rolloverReviewedAt: null }] : next;
      });
      return;
    }
    setRolloverBusyId(questId);
    await (carryForward ? appData.carryQuestForward(questId) : appData.declineQuestRollover(questId));
    setRolloverBusyId(null);
  }

  function toggleQuestCompletion(id: string) {
    setQuests((current) =>
      current.map((quest) =>
        quest.id === id
          ? {
              ...quest,
              status: quest.status === "completed" ? "in-progress" : "completed",
              dueLabel: quest.status === "completed" ? monthContext.monthEndLabel : "Completed",
            }
          : quest,
      ),
    );
  }

  function updateQuestStatus(id: string, status: QuestStatus) {
    setQuests((current) =>
      current.map((quest) =>
        quest.id === id
          ? {
              ...quest,
              status,
              dueLabel: status === "completed" ? "Completed" : quest.dueLabel === "Completed" ? monthContext.monthEndLabel : quest.dueLabel,
            }
          : quest,
      ),
    );
    setOpenStatusId(null);
  }

  function createQuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    setQuests((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        category: inferQuestCategory(title),
        status: "not-started",
        dueLabel: monthContext.monthEndLabel,
        effortHours: 6,
        color: "green",
        targetMonth: monthKey(),
        completedAt: null,
        carriedFromId: null,
        rolloverReviewedAt: null,
      },
    ]);
    setTitle("");
    setFilter("all");
    setIsCreating(false);
  }

  function openQuestEditor(quest: QuestSummary) {
    setEditingQuest(quest);
    setTitle(quest.title);
  }

  function closeQuestEditor() {
    setEditingQuest(null);
    setTitle("");
  }

  function saveQuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!editingQuest || !cleanTitle) return;
    setQuests((current) => current.map((quest) => quest.id === editingQuest.id
      ? { ...quest, title: cleanTitle, category: inferQuestCategory(cleanTitle) }
      : quest));
    closeQuestEditor();
  }

  async function deleteQuest() {
    if (!editingQuest || !window.confirm(`Delete “${editingQuest.title}”? This cannot be undone.`)) return;
    const removed = appData ? await appData.deleteQuest(editingQuest.id) : (setQuests((current) => current.filter((quest) => quest.id !== editingQuest.id)), true);
    if (removed) closeQuestEditor();
  }

  return (
    <AppShell active="Quests" eyebrow={`${monthContext.monthName} · ${monthContext.countdownLabel}`} title={<>A few things worth<br />finishing.</>} action={<button className="rounded-full bg-[var(--soft-ink)] px-6 py-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5" onClick={() => setIsCreating(true)} type="button">+ New quest</button>}>
          <section className="mt-12 grid border-y border-black/[0.09] sm:grid-cols-[1fr_1fr_1.4fr]">
            <div className="py-6 sm:border-r sm:border-black/[0.09] sm:pr-6"><p className="metric-label"><Flag aria-hidden className="text-[var(--soft-icon-clay)]" />Committed</p><p className="mt-4 text-5xl font-semibold tracking-[-0.06em]">{currentQuests.length}</p></div>
            <div className="border-t border-black/[0.09] py-6 sm:border-r sm:border-t-0 sm:px-6"><p className="metric-label"><CircleCheckBig aria-hidden className="text-[var(--soft-icon-green)]" />Completed</p><p className="mt-4 text-5xl font-semibold tracking-[-0.06em]">{completed}</p></div>
            <div className="border-t border-black/[0.09] py-6 sm:border-t-0 sm:pl-6"><div className="flex items-start justify-between"><p className="metric-label"><ChartNoAxesColumnIncreasing aria-hidden className="text-[var(--soft-icon-blue)]" />Month progress</p><p className="text-4xl font-semibold tracking-[-0.05em]">{overallProgress}%</p></div><div className="mt-8 h-2 overflow-hidden rounded-full bg-black/[0.07]"><div className="h-full rounded-full bg-[var(--soft-ink)]" style={{ width: `${overallProgress}%` }} /></div></div>
          </section>

          <section className="mt-10 border-t border-black/[0.09] pt-7">
            <div className="flex flex-col gap-4 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold tracking-[-0.025em]">{view === "current" ? "Monthly board" : "Archive"}</h2>
                  <div className="flex gap-1 rounded-full bg-white/45 p-1">
                    <button aria-pressed={view === "current"} className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[.08em] transition ${view === "current" ? "bg-[var(--soft-ink)] text-white" : "text-[var(--soft-muted)]"}`} onClick={() => setView("current")} type="button">This month</button>
                    <button aria-pressed={view === "archive"} className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[.08em] transition ${view === "archive" ? "bg-[var(--soft-ink)] text-white" : "text-[var(--soft-muted)]"}`} onClick={() => setView("archive")} type="button"><Archive className="size-3" />Archive{archivedQuests.length > 0 ? ` (${archivedQuests.length})` : ""}</button>
                  </div>
                </div>
                <p className="mt-1 text-sm text-stone-500">{view === "current" ? "Meaningful goals beyond the daily routine." : "Past months, kept for the record."}</p>
              </div>
              {view === "current" && <div className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-white/45 p-1">{(["all", "in-progress", "not-started", "paused", "blocked", "completed"] as const).map((option) => <button className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${filter === option ? "bg-[var(--soft-ink)] text-white" : "text-[var(--soft-muted)]"}`} key={option} onClick={() => setFilter(option)} type="button">{option === "all" ? "All" : statusLabels[option]}</button>)}</div>}
            </div>

            {view === "archive" && (archivedQuests.length
              ? <div className="soft-flow mt-5 flex flex-col gap-2">
                  {archivedQuests.map((quest) => <div className="flex flex-wrap items-center gap-3 rounded-[20px] border border-white/50 bg-white/35 px-5 py-4" key={quest.id}>
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/60"><ActivityIcon activity={`${quest.title} ${quest.category}`} className="size-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{quest.title}</p>
                      <p className="mt-0.5 text-[11px] text-[var(--soft-muted)]">{new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(`${quest.targetMonth}T00:00:00`))} · {quest.category}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[.08em] ${quest.status === "completed" ? "bg-[var(--soft-icon-green)]/15 text-[var(--soft-icon-green)]" : "bg-black/[0.06] text-[var(--soft-muted)]"}`}>{quest.status === "completed" && quest.completedAt ? `Completed ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(quest.completedAt))}` : statusLabels[quest.status]}</span>
                  </div>)}
                </div>
              : <div className="mt-5 flex min-h-40 flex-col items-center justify-center rounded-[34px] border border-dashed border-[var(--soft-accent)]/25 bg-white/30 px-6 py-10 text-center"><Archive className="size-6 text-[var(--soft-icon-clay)]" /><p className="mt-4 text-sm text-[var(--soft-muted)]">Nothing archived yet — past months will collect here.</p></div>
            )}

            {view === "current" && <div className="soft-flow soft-task-cards mt-5 grid gap-3 xl:grid-cols-2">
              {visibleQuests.map((quest) => {
                const isComplete = quest.status === "completed";
                return (
                  <article className={`grid min-h-40 gap-5 border border-white/50 p-5 md:grid-cols-[56px_minmax(0,1fr)_170px_auto] md:items-center md:p-6 ${openStatusId === quest.id ? "!z-30 !overflow-visible" : ""}`} key={quest.id}>
                    <span className="grid size-11 place-items-center"><ActivityIcon activity={`${quest.title} ${quest.category}`} className="size-7" /></span>
                    <div><div className="flex flex-wrap items-center gap-3"><span className="text-[10px] font-black uppercase tracking-[0.13em] text-[var(--soft-accent)]">{quest.category}</span><span className="text-xs text-[var(--soft-muted)]">{quest.dueLabel}</span><button aria-label={`Edit ${quest.title}`} className="inline-flex items-center gap-1 rounded-full bg-white/45 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.1em] text-[var(--soft-icon-green)] transition hover:bg-white/75" onClick={() => openQuestEditor(quest)} type="button"><Pencil className="size-3" />Edit</button></div><h3 className={`mt-2 text-xl font-bold tracking-[-0.025em] ${isComplete ? "text-[var(--soft-muted)] line-through" : ""}`}>{quest.title}</h3><p className="mt-1 text-xs text-[var(--soft-muted)]">{statusLabels[quest.status]}</p></div>
                    <div className="relative"><button aria-expanded={openStatusId === quest.id} aria-haspopup="menu" aria-label={`Change status for ${quest.title}`} className="flex min-h-12 w-full items-center gap-2 rounded-full border border-black/[0.08] bg-white/60 px-4 text-left text-xs font-bold text-[var(--soft-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,.8)] transition hover:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[color:color-mix(in_srgb,var(--soft-icon-green)_12%,transparent)]" onClick={() => setOpenStatusId((current) => current === quest.id ? null : quest.id)} type="button"><span className={`size-2 rounded-full ${statusColors[quest.status]}`} /><span className="flex-1">{statusLabels[quest.status]}</span><ChevronDown className={`size-3.5 transition ${openStatusId === quest.id ? "rotate-180" : ""}`} /></button>{openStatusId === quest.id && <div aria-label={`Status options for ${quest.title}`} className="absolute bottom-[calc(100%+8px)] right-0 z-50 w-full min-w-48 rounded-[20px] border border-white/80 bg-[color:color-mix(in_srgb,var(--theme-paper)_95%,transparent)] p-2 text-[var(--soft-ink)] shadow-[0_22px_60px_-18px_rgba(24,43,35,.45)] backdrop-blur-2xl md:bottom-auto md:top-[calc(100%+8px)]" role="menu">{(Object.keys(statusLabels) as QuestStatus[]).map((status) => <button className={`flex min-h-11 w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left text-xs font-bold transition hover:bg-[var(--soft-tint-a)] ${quest.status === status ? "bg-[color:color-mix(in_srgb,var(--soft-tint-a)_82%,white)]" : ""}`} key={status} onClick={() => updateQuestStatus(quest.id, status)} role="menuitem" type="button"><span className={`size-2 rounded-full ${statusColors[status]}`} /><span className="flex-1">{statusLabels[status]}</span>{quest.status === status && <Check className="size-3.5 text-[var(--soft-icon-green)]" strokeWidth={2.5} />}</button>)}</div>}</div>
                    <button className={`min-h-12 rounded-full px-5 text-xs font-bold transition ${isComplete ? "bg-white/55 text-[var(--soft-muted)]" : "bg-[var(--soft-ink)] text-white"}`} onClick={() => toggleQuestCompletion(quest.id)} type="button">{isComplete ? "Mark incomplete" : "Mark complete"}</button>
                  </article>
                );
              })}
              {!visibleQuests.length && <div className="xl:col-span-2 flex min-h-64 flex-col items-center justify-center rounded-[34px] border border-dashed border-[var(--soft-accent)]/25 bg-white/30 px-6 py-12 text-center"><span className="grid size-14 place-items-center rounded-full bg-[var(--soft-tint-b)] text-[var(--soft-icon-clay)]"><Flag className="size-6" /></span><p className="mt-6 text-[10px] font-black uppercase tracking-[.2em] text-[var(--soft-accent)]">{currentQuests.length ? "Nothing in this view" : "Your orbit is open"}</p><h3 className="mt-3 text-3xl font-semibold tracking-[-.04em]">{currentQuests.length ? `No ${filter === "all" ? "" : statusLabels[filter].toLowerCase()} quests.` : "Add one meaningful finish."}</h3><p className="mt-3 max-w-md text-sm leading-6 text-[var(--soft-muted)]">{currentQuests.length ? "Choose another status above to see the rest of your monthly board." : "A side quest is optional. When something feels worth finishing this month, give it a clear name and start from there."}</p>{!currentQuests.length && <button className="mt-6 rounded-full bg-[var(--soft-ink)] px-6 py-3 text-sm font-bold text-white" onClick={() => setIsCreating(true)} type="button">Create my first quest</button>}</div>}
            </div>}
          </section>
      {mounted && needsRolloverDecision.length > 0 && !dismissedRollover && createPortal(
        <div aria-modal="true" className="creation-overlay" role="dialog">
          <div className="w-full max-w-lg rounded-[28px] bg-[var(--theme-paper)] p-7 shadow-[0_40px_90px_-30px_rgba(24,43,35,.5)]">
            <p className="soft-kicker text-[var(--soft-ink)]">New month, {monthContext.monthName}</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-.03em]">A few quests are still open from last time.</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--soft-muted)]">Carry each one into {monthContext.monthName}, or leave it where it is — either way it stays in your Archive.</p>
            <div className="mt-5 flex flex-col gap-2">
              {needsRolloverDecision.map((quest) => <div className="flex flex-wrap items-center gap-3 rounded-[18px] border border-black/[0.06] bg-white/60 px-4 py-3" key={quest.id}>
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/80"><ActivityIcon activity={`${quest.title} ${quest.category}`} className="size-4" /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{quest.title}</p><p className="text-[11px] text-[var(--soft-ink)]">{quest.category} · {statusLabels[quest.status]}</p></div>
                <div className="flex shrink-0 gap-2">
                  <button className="rounded-full bg-white/70 px-3 py-2 text-[11px] font-bold text-[var(--soft-ink)] disabled:opacity-50" disabled={rolloverBusyId === quest.id} onClick={() => void resolveRollover(quest.id, false)} type="button">Let it go</button>
                  <button className="rounded-full bg-[var(--soft-ink)] px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50" disabled={rolloverBusyId === quest.id} onClick={() => void resolveRollover(quest.id, true)} type="button">Carry forward</button>
                </div>
              </div>)}
            </div>
            <button className="mt-5 text-xs font-bold text-[var(--soft-ink)] underline underline-offset-2" onClick={() => setDismissedRollover(true)} type="button">Decide later</button>
          </div>
        </div>,
        document.body,
      )}
      {isCreating && createPortal(
        <div aria-modal="true" className="creation-overlay" role="dialog">
          <form className="creation-sheet" onSubmit={createQuest}>
            <button aria-label="Close create quest" className="creation-close" onClick={() => setIsCreating(false)} type="button">×</button>
            <aside className="creation-aside creation-aside-quest">
              <p className="soft-kicker">{monthContext.monthName} quest</p>
              <div className="creation-preview"><ActivityIcon activity={title || "goal target"} className="size-9" /></div>
              <div><h2>Choose one<br />clear finish.</h2><p>A quest is an outcome you can point to—not another routine to maintain.</p></div>
              <span className="creation-step">01 · Define the outcome</span>
            </aside>
            <div className="creation-form">
              <div><p className="soft-kicker text-[var(--soft-accent)]">Create a quest</p><h3>What would feel meaningful?</h3><p>Name the result, not the effort it takes to get there.</p></div>
              <label className="creation-field-label" htmlFor="quest-title">Quest title</label>
              <input autoFocus className="creation-field" id="quest-title" onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Publish my portfolio" value={title} />
              {title.trim() && <div className="flex items-center justify-between rounded-[16px] bg-[var(--soft-tint-a)] px-4 py-3 text-xs"><span className="font-semibold text-[var(--soft-muted)]">Category detected automatically</span><span className="rounded-full bg-white/70 px-3 py-1.5 font-black text-[var(--soft-icon-green)]">{inferQuestCategory(title)}</span></div>}
              <div><p className="creation-field-label">A little inspiration</p><div className="creation-presets creation-presets-quest">{["Finish a course", "Publish my portfolio", "Read one book"].map((preset) => <button aria-pressed={title === preset} key={preset} onClick={() => setTitle(preset)} type="button"><ActivityIcon activity={preset} className="size-4" />{preset}</button>)}</div></div>
              <div className="creation-guidance"><span aria-hidden>◇</span><p><strong>One finish line.</strong> When the outcome exists, the quest is complete.</p></div>
              <div className="creation-actions"><button onClick={() => setIsCreating(false)} type="button">Cancel</button><button disabled={!title.trim()} type="submit"><span>Create quest</span><span aria-hidden>→</span></button></div>
            </div>
          </form>
        </div>,
        document.body,
      )}
      {editingQuest && createPortal(
        <div aria-modal="true" className="creation-overlay" role="dialog">
          <form className="creation-sheet" onSubmit={saveQuest}>
            <button aria-label="Close edit quest" className="creation-close" onClick={closeQuestEditor} type="button">×</button>
            <aside className="creation-aside creation-aside-quest">
              <p className="soft-kicker">Edit quest</p>
              <div className="creation-preview"><ActivityIcon activity={`${title} ${inferQuestCategory(title)}`} className="size-9" /></div>
              <div><h2>Keep the finish<br />line clear.</h2><p>Rename the outcome without losing its status or history.</p></div>
              <span className="creation-step">Quest details</span>
            </aside>
            <div className="creation-form">
              <div><p className="soft-kicker text-[var(--soft-accent)]">Edit quest</p><h3>Refine the outcome.</h3><p>The category will adjust automatically when the title changes.</p></div>
              <label className="creation-field-label" htmlFor="edit-quest-title">Quest title</label>
              <input autoFocus className="creation-field" id="edit-quest-title" maxLength={160} onChange={(event) => setTitle(event.target.value)} value={title} />
              <div className="flex items-center justify-between rounded-[16px] bg-[var(--soft-tint-a)] px-4 py-3 text-xs"><span className="font-semibold text-[var(--soft-muted)]">Category detected automatically</span><span className="rounded-full bg-white/70 px-3 py-1.5 font-black text-[var(--soft-icon-green)]">{inferQuestCategory(title)}</span></div>
              <div className="creation-actions"><button className="!text-[var(--soft-icon-clay)]" onClick={() => void deleteQuest()} type="button"><Trash2 className="size-4" />Delete quest</button><button disabled={!title.trim()} type="submit"><span>Save changes</span><span aria-hidden>→</span></button></div>
            </div>
          </form>
        </div>,
        document.body,
      )}
    </AppShell>
  );
}
