"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import type { NewMonthSummary } from "@/lib/month-transition";

const sessionDismissals = new Set<string>();

export function NewMonthWelcome({ summary }: { summary: NewMonthSummary | null }) {
  const storageEvent = summary ? `aduvia-month-welcome:${summary.currentMonthKey}` : "aduvia-month-welcome:none";
  const isDismissed = useSyncExternalStore(
    (onChange) => {
      window.addEventListener(storageEvent, onChange);
      window.addEventListener("storage", onChange);
      return () => {
        window.removeEventListener(storageEvent, onChange);
        window.removeEventListener("storage", onChange);
      };
    },
    () => {
      if (!summary) return true;
      if (sessionDismissals.has(summary.dismissalKey)) return true;
      try { return window.localStorage.getItem(summary.dismissalKey) === "1"; }
      catch { return false; }
    },
    () => true,
  );

  if (!summary || isDismissed) return null;

  function dismiss() {
    if (!summary) return;
    sessionDismissals.add(summary.dismissalKey);
    try { window.localStorage.setItem(summary.dismissalKey, "1"); }
    catch { /* The welcome can still be dismissed for this page view. */ }
    window.dispatchEvent(new Event(storageEvent));
  }

  const previousMonth = summary.previousMonthLabel.replace(/ \d{4}$/, "");
  const currentMonth = summary.currentMonthLabel.replace(/ \d{4}$/, "");

  return (
    <section aria-label={`${currentMonth} welcome`} className="new-month-welcome relative mt-8 overflow-hidden rounded-[30px] bg-[var(--soft-ink)] px-6 py-6 text-white shadow-[0_26px_70px_-44px_rgba(20,43,35,.9)] sm:px-8 sm:py-7">
      <span aria-hidden="true" className="absolute -right-12 -top-20 size-52 rounded-full border-[34px] border-[var(--soft-accent)]/20" />
      <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-[var(--soft-accent)]">A new monthly chapter</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-.045em] sm:text-4xl">{previousMonth} is safely archived.<br />{currentMonth} starts with a clear page.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
            {summary.activeHabitCount
              ? `${summary.activeHabitCount} active ${summary.activeHabitCount === 1 ? "habit continues" : "habits continue"} automatically. Your side quests begin fresh each month.`
              : "Your side quests begin fresh this month. Add only the finishes that matter now."}
          </p>
          <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3 text-xs font-bold uppercase tracking-[.12em] text-white/75">
            {summary.consistency !== null && <span><strong className="mr-2 text-xl text-white">{summary.consistency}%</strong>{previousMonth} consistency</span>}
            {summary.previousQuestCount > 0 && <span><strong className="mr-2 text-xl text-white">{summary.completedQuestCount}/{summary.previousQuestCount}</strong>quests completed</span>}
          </div>
        </div>
        <div className="relative flex flex-wrap items-center gap-3 lg:justify-end">
          <Link className="rounded-full bg-[var(--soft-accent)] px-5 py-3 text-xs font-black text-[var(--soft-ink)]" href="/quests">Add {currentMonth} quests</Link>
          <Link className="rounded-full border border-white/20 px-5 py-3 text-xs font-bold text-white" href="/insights">View {previousMonth} report</Link>
          <button className="px-2 py-3 text-xs font-bold text-white/55 hover:text-white" onClick={dismiss} type="button">Not now</button>
        </div>
      </div>
    </section>
  );
}
