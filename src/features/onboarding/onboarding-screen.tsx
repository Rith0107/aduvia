"use client";

import { ArrowRight, Check, Flag, Plus, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ActivityIcon } from "@/components/activity-icon";
import { BrandLogo } from "@/components/brand-logo";
import type { HabitDay, HabitSummary } from "@/features/habits/types";
import { inferHabitCategory } from "@/features/habits/infer-category";
import type { QuestSummary } from "@/features/quests/types";
import { useAppData } from "@/lib/app-data";
import { monthKey } from "@/lib/calendar";

const starters: Array<Omit<HabitSummary, "id" | "consistency" | "streak" | "state" | "isAnchor"> & { description: string }> = [
  { name: "Morning walk", category: "Fitness", frequency: "Daily", color: "green", description: "A gentle start, every day" },
  { name: "Deep work", category: "Career", frequency: "Weekdays", color: "blue", description: "Protect one focused block" },
  { name: "Read 20 pages", category: "Learning", frequency: "Daily", color: "amber", description: "Keep learning visible" },
  { name: "Meditate 10 minutes", category: "Mindfulness", frequency: "3× weekly", scheduledDays: ["Sun", "Tue", "Thu"], color: "rose", description: "Create a quieter pause" },
];
const weekDays: HabitDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dayLabels: Record<HabitDay, string> = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };

export function OnboardingScreen() {
  const router = useRouter();
  const appData = useAppData();
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [anchor, setAnchor] = useState("");
  const [customName, setCustomName] = useState("");
  const [customHabit, setCustomHabit] = useState("");
  const [customDays, setCustomDays] = useState<HabitDay[]>([]);
  const [questTitle, setQuestTitle] = useState("");
  const [finishing, setFinishing] = useState(false);
  const [message, setMessage] = useState("");
  const chosenNames = customHabit ? [...selected, customHabit] : selected;
  const canContinue = selected.length > 0 || (Boolean(customHabit) && customDays.length > 0);
  const selectedAnchor = chosenNames.includes(anchor) ? anchor : chosenNames[0];
  const selectedCountLabel = useMemo(() => `${chosenNames.length} ${chosenNames.length === 1 ? "rhythm" : "rhythms"} selected`, [chosenNames.length]);

  function toggle(name: string) {
    setSelected((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  }

  function addCustomHabit() {
    const name = customName.trim();
    if (!name) return;
    setCustomHabit(name);
    setCustomName("");
    if (!chosenNames.length) setAnchor(name);
  }

  function removeCustomHabit() {
    setCustomHabit("");
    setCustomDays([]);
    if (anchor === customHabit) setAnchor(selected[0] ?? "");
  }

  function toggleCustomDay(day: HabitDay) {
    setCustomDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day]);
  }

  async function finish(includeQuest = true) {
    if (!canContinue) return;
    setFinishing(true);
    setMessage("");
    const selectedHabits = starters.filter((starter) => selected.includes(starter.name)).map((starter) => ({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      isAnchor: starter.name === selectedAnchor,
      name: starter.name,
      category: starter.category,
      frequency: starter.frequency,
      scheduledDays: starter.scheduledDays,
      color: starter.color,
      consistency: 0,
      checkInCount: 0,
      streak: 0,
      state: "active",
    } satisfies HabitSummary));
    if (customHabit) {
      const inferred = inferHabitCategory(customHabit);
      selectedHabits.push({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), isAnchor: customHabit === selectedAnchor, name: customHabit, category: inferred.category, frequency: customDays.length === 7 ? "Daily" : "Custom", scheduledDays: customDays, color: inferred.color, consistency: 0, checkInCount: 0, streak: 0, state: "active" });
    }
    const cleanQuestTitle = includeQuest ? questTitle.trim() : "";
    const selectedQuests: QuestSummary[] = [];
    if (cleanQuestTitle) {
      const quest: QuestSummary = { id: crypto.randomUUID(), title: cleanQuestTitle, category: "Personal", status: "not-started", dueLabel: "This month", effortHours: 1, color: "amber", targetMonth: monthKey(), completedAt: null, carriedFromId: null, rolloverReviewedAt: null };
      selectedQuests.push(quest);
    }
    try {
      if (!appData) throw new Error("Your Aduvia space is still loading. Please try again in a moment.");
      const completed = await appData.completeOnboarding(selectedHabits, selectedQuests);
      if (!completed) throw new Error(appData.syncError ?? "We could not finish setup. Please try again.");
      router.replace("/today");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not finish setup. Please try again.");
      setFinishing(false);
    }
  }

  return <main className="public-canvas min-h-screen px-4 py-5 text-[var(--soft-ink)] sm:px-7 sm:py-7">
    <a className="skip-link" href="#starter-habits">Skip to starter habits</a>
    <div className="public-surface mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-[1280px] flex-col overflow-hidden rounded-[36px]">
      <header className="public-toolbar flex items-center justify-between border-b px-6 py-5 sm:px-10"><BrandLogo /><p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--soft-muted)]">Step {step} of 2</p></header>
      <div className="grid flex-1 lg:grid-cols-[.78fr_1.22fr]">
        <aside className="relative overflow-hidden bg-[var(--soft-ink)] p-7 text-white sm:p-10 lg:p-12"><div className="absolute -right-28 -top-28 size-80 rounded-full border-[58px] border-[var(--chart-primary)]/10" /><div className="relative flex h-full flex-col"><span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-[var(--chart-primary)]"><Sparkles className="size-5" /></span><div className="my-auto py-12"><p className="text-[10px] font-black uppercase tracking-[.22em] text-[var(--chart-primary)]">Your first rhythm</p><h1 className="mt-5 text-5xl font-semibold leading-[.94] tracking-[-.065em] sm:text-6xl">Start with less.<br />Return more often.</h1><p className="mt-6 max-w-md text-sm leading-7 text-white/55">Choose only what feels realistic. You can change the days, pause a habit, or add something new whenever you need.</p></div><p className="text-xs text-white/35">Nothing here is permanent. This is simply a kind place to begin.</p></div></aside>
        <section className="flex flex-col p-6 sm:p-10 lg:p-12" id="starter-habits">{step === 1 ? <><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[var(--soft-accent)]">Start with one small promise</p><h2 className="mt-3 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Add one task to begin.</h2><p className="mt-3 text-sm leading-6 text-[var(--soft-muted)]">Choose something that belongs to your real life—not an ideal one. You can make it your anchor: the one task you most want to return to.</p></div>
          <div aria-label="Starter habits" className="mt-8 grid gap-3 sm:grid-cols-2" role="group">{starters.map((starter) => { const active = selected.includes(starter.name); const isAnchor = active && selectedAnchor === starter.name; return <article className={`relative rounded-[26px] border p-5 transition ${active ? "border-[var(--soft-accent)]/30 bg-[var(--soft-tint-a)] shadow-[0_16px_35px_-30px_var(--soft-ink)]" : "border-black/[0.06] bg-white/35"}`} key={starter.name}><button aria-label={`${active ? "Remove" : "Add"} ${starter.name}`} aria-pressed={active} className="flex w-full items-start gap-4 text-left" onClick={() => toggle(starter.name)} type="button"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/55"><ActivityIcon activity={`${starter.name} ${starter.category}`} className="size-6" /></span><span className="min-w-0 flex-1"><span className="block text-base font-bold">{starter.name}</span><span className="mt-1 block text-xs text-[var(--soft-muted)]">{starter.description}</span><span className="mt-3 block text-[9px] font-black uppercase tracking-[.14em] text-[var(--soft-accent)]">{starter.frequency}</span></span><span className={`grid size-7 shrink-0 place-items-center rounded-full border text-xs ${active ? "border-[var(--soft-ink)] bg-[var(--soft-ink)] text-white" : "border-black/15 text-transparent"}`}><Check className="size-3.5" /></span></button><button aria-label={`Make ${starter.name} my anchor`} aria-pressed={isAnchor} className={`mt-4 flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] transition ${isAnchor ? "bg-[var(--soft-tint-b)] text-[var(--soft-icon-clay)]" : "text-[var(--soft-muted)] hover:bg-white/50 disabled:opacity-35"}`} disabled={!active} onClick={() => setAnchor(starter.name)} type="button"><Flag className="size-3" fill={isAnchor ? "currentColor" : "none"} />{isAnchor ? "Your anchor" : "Make anchor"}</button></article>; })}</div>
          <section className="mt-5 rounded-[26px] border border-dashed border-[var(--soft-accent)]/30 bg-white/30 p-5" aria-labelledby="custom-rhythm-title">
            <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--soft-tint-b)] text-[var(--soft-icon-clay)]"><Plus className="size-5" /></span><div><h3 className="font-bold" id="custom-rhythm-title">Your first task</h3><p className="mt-1 text-xs leading-5 text-[var(--soft-muted)]">Add at least one task in your own words. Keep it small and clear.</p></div></div>
            {!customHabit ? <div className="mt-4 flex flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="custom-habit-name">Custom habit name</label><input className="min-h-12 flex-1 rounded-2xl border border-black/10 bg-white/65 px-4 text-sm outline-none transition focus:border-[var(--soft-accent)]/45" id="custom-habit-name" maxLength={120} onChange={(event) => setCustomName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCustomHabit(); } }} placeholder="e.g. Call my parents" value={customName} /><button className="min-h-12 rounded-2xl bg-[var(--soft-ink)] px-5 text-sm font-bold text-white disabled:opacity-35" disabled={!customName.trim()} onClick={addCustomHabit} type="button">Add my habit</button></div> : <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-[var(--soft-tint-a)] p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{customHabit}</p><p className="mt-1 text-[10px] font-black uppercase tracking-[.14em] text-[var(--soft-accent)]">{inferHabitCategory(customHabit).category} · {customDays.length === 7 ? "Daily" : `${customDays.length} days weekly`}</p></div><div className="flex items-center gap-2"><button aria-label={`Make ${customHabit} my anchor`} aria-pressed={selectedAnchor === customHabit} className={`flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] ${selectedAnchor === customHabit ? "bg-[var(--soft-tint-b)] text-[var(--soft-icon-clay)]" : "bg-white/55 text-[var(--soft-muted)]"}`} onClick={() => setAnchor(customHabit)} type="button"><Flag className="size-3" fill={selectedAnchor === customHabit ? "currentColor" : "none"} />{selectedAnchor === customHabit ? "Your anchor" : "Make anchor"}</button><button aria-label={`Remove ${customHabit}`} className="grid size-9 place-items-center rounded-full bg-white/55 text-[var(--soft-muted)]" onClick={removeCustomHabit} type="button"><X className="size-4" /></button></div></div>}
            {customHabit && <fieldset className="mt-4"><legend className="text-[10px] font-black uppercase tracking-[.15em] text-[var(--soft-muted)]">Which days should it appear?</legend><div className="mt-3 grid grid-cols-7 gap-1.5">{weekDays.map((day) => { const active = customDays.includes(day); return <button aria-label={`${dayLabels[day]} ${active ? "selected" : "not selected"}`} aria-pressed={active} className={`min-h-10 rounded-xl text-xs font-bold transition ${active ? "bg-[var(--soft-icon-green)] text-white shadow-sm" : "border border-black/10 bg-white/55 text-[var(--soft-muted)]"}`} key={day} onClick={() => toggleCustomDay(day)} type="button">{day.slice(0, 2)}</button>; })}</div>{customDays.length === 0 && <p className="mt-2 text-xs font-semibold text-[var(--soft-icon-clay)]" role="alert">Choose at least one day.</p>}</fieldset>}
          </section>
          <div className="mt-auto flex flex-col gap-4 pt-8 sm:flex-row sm:items-center sm:justify-between"><p aria-live="polite" className="text-xs font-semibold text-[var(--soft-muted)]">{canContinue ? selectedCountLabel : "Choose a recommended task or add your own"}</p><button className="group flex min-h-13 items-center justify-between gap-8 rounded-full bg-[var(--soft-ink)] py-2 pl-6 pr-2 text-sm font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-35" disabled={!canContinue} onClick={() => setStep(2)} type="button"><span>Next: add a side quest</span><span className="grid size-10 place-items-center rounded-full bg-[var(--chart-primary)] text-[var(--soft-ink)] transition group-hover:translate-x-0.5"><ArrowRight className="size-4" /></span></button></div></> : <><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[var(--soft-accent)]">Something beyond the routine</p><h2 className="mt-3 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Add a side quest.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[var(--soft-muted)]">Choose one meaningful thing you would like to finish this month. Not ready yet? Leave it blank and add one later from Quests.</p></div><section className="mt-10 rounded-[28px] bg-[var(--soft-tint-b)] p-6"><span className="grid size-12 place-items-center rounded-2xl bg-white/60 text-[var(--soft-icon-clay)]"><Flag className="size-5" /></span><label className="mt-6 block text-xs font-black uppercase tracking-[.15em] text-[var(--soft-accent)]" htmlFor="first-quest">My first side quest</label><input className="mt-3 min-h-14 w-full border-b border-black/15 bg-transparent text-2xl font-semibold outline-none placeholder:text-[var(--soft-muted)]/45 focus:border-[var(--soft-accent)]" id="first-quest" maxLength={160} onChange={(event) => setQuestTitle(event.target.value)} placeholder="e.g. Finish my portfolio" value={questTitle} /><p className="mt-4 text-xs leading-5 text-[var(--soft-muted)]">You can change its status, pause it, or add more quests later.</p></section>{message && <p className="mt-5 rounded-2xl bg-[var(--soft-tint-b)] px-4 py-3 text-sm text-[var(--soft-icon-clay)]" role="status">{message}</p>}<div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row sm:items-center sm:justify-between"><button className="text-sm font-bold text-[var(--soft-muted)] hover:text-[var(--soft-ink)]" disabled={finishing} onClick={() => setStep(1)} type="button">← Back to my task</button><div className="flex flex-col gap-2 sm:flex-row"><button className="min-h-12 rounded-full bg-white/60 px-5 text-sm font-bold" disabled={finishing} onClick={() => { setQuestTitle(""); void finish(); }} type="button">I’ll add one later</button><button className="group flex min-h-13 items-center justify-between gap-7 rounded-full bg-[var(--soft-ink)] py-2 pl-6 pr-2 text-sm font-bold text-white shadow-lg disabled:opacity-35" disabled={!questTitle.trim() || finishing} onClick={() => void finish()} type="button"><span>{finishing ? "Saving…" : "Begin my journey"}</span><span className="grid size-10 place-items-center rounded-full bg-[var(--chart-primary)] text-[var(--soft-ink)]"><ArrowRight className="size-4" /></span></button></div></div></>}
        </section>
      </div>
    </div>
  </main>;
}
