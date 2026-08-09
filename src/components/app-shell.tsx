import Link from "next/link";
import type { ReactNode } from "react";
import { ChartNoAxesCombined, CircleCheck, Gem, ListChecks, MoonStar, UserRound } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { PaletteChooser } from "@/components/palette-chooser";

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
};

export function AppShell({ active, children, eyebrow, title, action }: AppShellProps) {
  return (
    <main className="soft-canvas min-h-screen text-[var(--soft-ink)]">
      <div className="soft-shell min-h-screen overflow-hidden">
        <header className="premium-toolbar sticky top-0 z-40 mx-auto flex max-w-[1800px] items-center justify-between px-5 py-5 sm:px-9 lg:px-14">
          <BrandLogo />
          <nav aria-label="Primary" className="hidden rounded-full bg-white/45 p-1 shadow-[inset_0_0_0_1px_rgba(31,45,38,0.05)] backdrop-blur-xl md:flex">
            {navItems.map((item) => (
              <Link className={`rounded-full px-5 py-2.5 text-xs font-bold transition ${active === item.label ? "bg-[var(--soft-ink)] text-white shadow-sm" : "text-[var(--soft-muted)] hover:text-[var(--soft-ink)]"}`} href={item.href} key={item.label}>{item.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <PaletteChooser />
            <Link className="flex min-h-10 items-center gap-2 rounded-full bg-white/45 px-3 text-xs font-bold text-[var(--soft-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,.55)] backdrop-blur-xl sm:px-4" href="/check-in"><MoonStar aria-hidden className="size-4 text-[var(--soft-accent)]" strokeWidth={1.8} /><span className="hidden sm:inline">Evening mode</span></Link>
            <button aria-label="Open profile" className="grid size-10 place-items-center rounded-full border-4 border-white/55 bg-[var(--soft-accent)] text-white shadow-sm transition hover:-translate-y-0.5" type="button"><UserRound aria-hidden className="size-4" strokeWidth={2} /></button>
          </div>
        </header>

        <div className="mx-auto max-w-[1800px] px-5 pb-24 pt-9 sm:px-9 lg:px-14 lg:pb-14">
          <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--soft-accent)]">{eyebrow}</p>
              <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-6xl lg:text-7xl">{title}</h1>
            </div>
            {action}
          </header>
          {children}
        </div>

        <nav aria-label="Mobile navigation" className="fixed bottom-3 left-3 right-3 z-40 grid grid-cols-4 rounded-[22px] bg-[var(--soft-ink)] p-2 text-white shadow-2xl md:hidden">
          {navItems.map((item) => <Link className={`flex min-h-12 flex-col items-center justify-center rounded-2xl text-[10px] font-bold ${active === item.label ? "bg-white/15" : "text-white/45"}`} href={item.href} key={item.label}><item.icon aria-hidden className="mb-1 size-4" strokeWidth={1.6} />{item.label}</Link>)}
        </nav>
      </div>
    </main>
  );
}
