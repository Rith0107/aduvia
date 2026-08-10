"use client";

import { ArrowRight, Check, Flag, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ActivityIcon } from "@/components/activity-icon";
import { BrandLogo } from "@/components/brand-logo";
import type { HabitSummary } from "@/features/habits/types";
import { useAppData } from "@/lib/app-data";

const starters: Array<Omit<HabitSummary, "id" | "consistency" | "streak" | "state" | "isAnchor"> & { description: string }> = [
  { name: "Morning walk", category: "Fitness", frequency: "Daily", color: "green", description: "A gentle start, every day" },
  { name: "Deep work", category: "Career", frequency: "Weekdays", color: "blue", description: "Protect one focused block" },
  { name: "Read 20 pages", category: "Learning", frequency: "Daily", color: "amber", description: "Keep learning visible" },
  { name: "Meditate 10 minutes", category: "Mindfulness", frequency: "3× weekly", scheduledDays: ["Sun", "Tue", "Thu"], color: "rose", description: "Create a quieter pause" },
];

export function OnboardingScreen() {
  const router = useRouter();
  const appData = useAppData();
  const [selected, setSelected] = useState<string[]>([starters[0].name, starters[1].name]);
  const [anchor, setAnchor] = useState(starters[0].name);
  const canContinue = selected.length > 0;
  const selectedAnchor = selected.includes(anchor) ? anchor : selected[0];
  const selectedCountLabel = useMemo(() => `${selected.length} ${selected.length === 1 ? "rhythm" : "rhythms"} selected`, [selected.length]);

  function toggle(name: string) {
    setSelected((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  }

  function finish() {
    if (!canContinue) return;
    appData?.setHabits(starters.filter((starter) => selected.includes(starter.name)).map((starter) => ({
      id: crypto.randomUUID(),
      isAnchor: starter.name === selectedAnchor,
      name: starter.name,
      category: starter.category,
      frequency: starter.frequency,
      scheduledDays: starter.scheduledDays,
      color: starter.color,
      consistency: 0,
      streak: 0,
      state: "active",
    })));
    router.replace("/today");
  }

  return <main className="soft-canvas min-h-screen px-4 py-5 text-[var(--soft-ink)] sm:px-7 sm:py-7">
    <a className="skip-link" href="#starter-habits">Skip to starter habits</a>
    <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-[1280px] flex-col overflow-hidden rounded-[36px] border border-white/70 bg-[color:color-mix(in_srgb,var(--soft-surface)_84%,transparent)] shadow-[0_34px_90px_-48px_rgba(26,48,38,.5)] backdrop-blur-xl">
      <header className="flex items-center justify-between border-b border-black/[0.07] px-6 py-5 sm:px-10"><BrandLogo /><button className="text-xs font-bold text-[var(--soft-muted)] hover:text-[var(--soft-ink)]" onClick={() => router.replace("/today")} type="button">Set up later</button></header>
      <div className="grid flex-1 lg:grid-cols-[.78fr_1.22fr]">
        <aside className="relative overflow-hidden bg-[var(--soft-ink)] p-7 text-white sm:p-10 lg:p-12"><div className="absolute -right-28 -top-28 size-80 rounded-full border-[58px] border-[var(--chart-primary)]/10" /><div className="relative flex h-full flex-col"><span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-[var(--chart-primary)]"><Sparkles className="size-5" /></span><div className="my-auto py-12"><p className="text-[10px] font-black uppercase tracking-[.22em] text-[var(--chart-primary)]">Your first rhythm</p><h1 className="mt-5 text-5xl font-semibold leading-[.94] tracking-[-.065em] sm:text-6xl">Start with less.<br />Return more often.</h1><p className="mt-6 max-w-md text-sm leading-7 text-white/55">Choose only what feels realistic. You can change the days, pause a habit, or add something new whenever you need.</p></div><p className="text-xs text-white/35">Nothing here is permanent. This is simply a kind place to begin.</p></div></aside>
        <section className="flex flex-col p-6 sm:p-10 lg:p-12" id="starter-habits"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[var(--soft-accent)]">Step 1 of 1</p><h2 className="mt-3 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">What would support your days?</h2><p className="mt-3 text-sm leading-6 text-[var(--soft-muted)]">Pick one to four starters. Select the flag beside the habit that matters most—it becomes your daily anchor.</p></div>
          <div aria-label="Starter habits" className="mt-8 grid gap-3 sm:grid-cols-2" role="group">{starters.map((starter) => { const active = selected.includes(starter.name); const isAnchor = active && selectedAnchor === starter.name; return <article className={`relative rounded-[26px] border p-5 transition ${active ? "border-[var(--soft-accent)]/30 bg-[var(--soft-tint-a)] shadow-[0_16px_35px_-30px_var(--soft-ink)]" : "border-black/[0.06] bg-white/35"}`} key={starter.name}><button aria-label={`${active ? "Remove" : "Add"} ${starter.name}`} aria-pressed={active} className="flex w-full items-start gap-4 text-left" onClick={() => toggle(starter.name)} type="button"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/55"><ActivityIcon activity={`${starter.name} ${starter.category}`} className="size-6" /></span><span className="min-w-0 flex-1"><span className="block text-base font-bold">{starter.name}</span><span className="mt-1 block text-xs text-[var(--soft-muted)]">{starter.description}</span><span className="mt-3 block text-[9px] font-black uppercase tracking-[.14em] text-[var(--soft-accent)]">{starter.frequency}</span></span><span className={`grid size-7 shrink-0 place-items-center rounded-full border text-xs ${active ? "border-[var(--soft-ink)] bg-[var(--soft-ink)] text-white" : "border-black/15 text-transparent"}`}><Check className="size-3.5" /></span></button><button aria-label={`Make ${starter.name} my anchor`} aria-pressed={isAnchor} className={`mt-4 flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] transition ${isAnchor ? "bg-[var(--soft-tint-b)] text-[var(--soft-icon-clay)]" : "text-[var(--soft-muted)] hover:bg-white/50 disabled:opacity-35"}`} disabled={!active} onClick={() => setAnchor(starter.name)} type="button"><Flag className="size-3" fill={isAnchor ? "currentColor" : "none"} />{isAnchor ? "Your anchor" : "Make anchor"}</button></article>; })}</div>
          <div className="mt-auto flex flex-col gap-4 pt-8 sm:flex-row sm:items-center sm:justify-between"><p aria-live="polite" className="text-xs font-semibold text-[var(--soft-muted)]">{selectedCountLabel}</p><button className="group flex min-h-13 items-center justify-between gap-8 rounded-full bg-[var(--soft-ink)] py-2 pl-6 pr-2 text-sm font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-35" disabled={!canContinue} onClick={finish} type="button"><span>Begin with these</span><span className="grid size-10 place-items-center rounded-full bg-[var(--chart-primary)] text-[var(--soft-ink)] transition group-hover:translate-x-0.5"><ArrowRight className="size-4" /></span></button></div>
        </section>
      </div>
    </div>
  </main>;
}
