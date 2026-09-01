"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ChartNoAxesCombined, CircleCheck, Gem, ListChecks, MoonStar } from "lucide-react";
import { AccountMenu } from "@/components/account-menu";
import { BrandLogo } from "@/components/brand-logo";
import { useAppData } from "@/lib/app-data";

const navItems = [
  { label: "Today", href: "/today", icon: CircleCheck },
  { label: "Habits", href: "/habits", icon: ListChecks },
  { label: "Quests", href: "/quests", icon: Gem },
  { label: "Insights", href: "/insights", icon: ChartNoAxesCombined },
];

type AppShellProps = {
  active: "Today" | "Habits" | "Quests" | "Insights";
  children: ReactNode;
  eyebrow: string;
  title: ReactNode;
  action?: ReactNode;
  screenClassName?: string;
};

export function AppShell({ active, children, eyebrow, title, action, screenClassName = "" }: AppShellProps) {
  const appData = useAppData();
  const syncError = appData?.syncError;
  const pendingSyncCount = appData?.pendingSyncCount ?? 0;
  const isLoading = appData?.isLoading === true;
  return (
    <main className={`soft-canvas min-h-screen text-[var(--soft-ink)] ${screenClassName}`}>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <div className="soft-shell min-h-screen overflow-hidden">
        <header className="premium-toolbar sticky top-0 z-40 flex w-full items-center justify-between px-5 py-5 sm:px-9 lg:px-14">
          <BrandLogo href="/today" />
          <nav aria-label="Primary" className="hidden rounded-full bg-white/45 p-1 shadow-[inset_0_0_0_1px_rgba(31,45,38,0.05)] backdrop-blur-xl md:flex">
            {navItems.map((item) => (
              <Link className={`rounded-full px-5 py-2.5 text-xs font-bold transition ${active === item.label ? "bg-[var(--soft-ink)] text-white shadow-sm" : "text-[var(--soft-muted)] hover:text-[var(--soft-ink)]"}`} href={item.href} key={item.label}>{item.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link aria-label="Evening mode" className="flex min-h-10 items-center gap-2 rounded-full bg-white/45 px-3 text-xs font-bold text-[var(--soft-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,.55)] backdrop-blur-xl sm:px-4" href="/check-in"><MoonStar aria-hidden className="size-4 text-[var(--soft-accent)]" strokeWidth={1.8} /><span className="hidden sm:inline">Evening mode</span></Link>
            <AccountMenu />
          </div>
        </header>

        <div className="mx-auto max-w-[1800px] px-5 pb-24 pt-9 sm:px-9 lg:px-14 lg:pb-14" id="main-content">
          {syncError && <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[var(--soft-icon-clay)]/25 bg-white/55 px-4 py-3 text-sm text-[var(--soft-ink)] sm:flex-row sm:items-center sm:justify-between" role="status"><span><strong>{pendingSyncCount ? `${pendingSyncCount} ${pendingSyncCount === 1 ? "change is" : "changes are"} waiting.` : "Changes are not syncing."}</strong> {syncError}</span>{pendingSyncCount > 0 && <button className="shrink-0 rounded-full bg-[var(--soft-ink)] px-4 py-2 text-xs font-bold text-white disabled:cursor-wait disabled:opacity-50" disabled={appData?.isSyncing} onClick={() => void appData?.retrySync()} type="button">{appData?.isSyncing ? "Retrying…" : "Retry sync"}</button>}</div>}
          <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--soft-accent)]">{eyebrow}</p>
              <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-6xl lg:text-7xl">{title}</h1>
            </div>
            {!isLoading && action}
          </header>
          {isLoading ? <AppLoadingState /> : children}
        </div>

        <nav aria-label="Mobile navigation" className="fixed bottom-3 left-3 right-3 z-40 grid grid-cols-4 rounded-[22px] bg-[var(--soft-ink)] p-2 text-white shadow-2xl md:hidden">
          {navItems.map((item) => <Link className={`flex min-h-12 flex-col items-center justify-center rounded-2xl text-[10px] font-bold ${active === item.label ? "bg-white/15" : "text-white/45"}`} href={item.href} key={item.label}><item.icon aria-hidden className="mb-1 size-4" strokeWidth={1.6} />{item.label}</Link>)}
        </nav>
      </div>
    </main>
  );
}

function AppLoadingState() {
  return <section aria-busy="true" aria-live="polite" className="mt-12 overflow-hidden rounded-[34px] border border-white/65 bg-white/30 p-7 shadow-[0_24px_70px_-48px_rgba(28,43,35,.55)] sm:p-10"><div className="flex items-center gap-4"><span className="relative grid size-12 place-items-center rounded-2xl bg-[var(--soft-ink)]"><span className="size-3 animate-pulse rounded-full bg-[var(--chart-primary)]" /></span><div><p className="text-sm font-bold">Opening your Aduvia space…</p><p className="mt-1 text-xs text-[var(--soft-muted)]">Syncing your habits, quests, and recent check-ins.</p></div></div><div aria-hidden="true" className="mt-9 grid gap-3 sm:grid-cols-2"><span className="h-36 animate-pulse rounded-[26px] bg-[var(--soft-tint-a)]/70" /><span className="h-36 animate-pulse rounded-[26px] bg-[var(--soft-tint-b)]/70" /><span className="h-20 animate-pulse rounded-[22px] bg-white/45 sm:col-span-2" /></div></section>;
}
