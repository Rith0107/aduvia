import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { label: "Today", href: "/", mark: "○" },
  { label: "Habits", href: "/habits", mark: "✓" },
  { label: "Quests", href: "/quests", mark: "◇" },
  { label: "Insights", href: "/insights", mark: "↗" },
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
    <main className="soft-canvas min-h-screen p-3 text-[var(--soft-ink)] sm:p-5">
      <div className="soft-shell mx-auto min-h-[calc(100vh-1.5rem)] max-w-[1800px] overflow-hidden sm:min-h-[calc(100vh-2.5rem)]">
        <header className="flex items-center justify-between px-5 py-5 sm:px-9 lg:px-12">
          <Link className="text-xl font-black tracking-[-0.055em]" href="/">
            quest<span className="text-[var(--soft-accent)]">/</span>log
          </Link>
          <nav aria-label="Primary" className="hidden rounded-full bg-white/45 p-1 shadow-[inset_0_0_0_1px_rgba(31,45,38,0.05)] backdrop-blur-xl md:flex">
            {navItems.map((item) => (
              <Link className={`rounded-full px-5 py-2.5 text-xs font-bold transition ${active === item.label ? "bg-[var(--soft-ink)] text-white shadow-sm" : "text-[var(--soft-muted)] hover:text-[var(--soft-ink)]"}`} href={item.href} key={item.label}>{item.label}</Link>
            ))}
          </nav>
          <Link className="grid size-10 place-items-center rounded-full border-4 border-white/55 bg-[var(--soft-accent)] text-[10px] font-black text-white shadow-sm" href="/check-in" aria-label="Open evening check-in">QL</Link>
        </header>

        <div className="px-5 pb-24 pt-8 sm:px-9 lg:px-12 lg:pb-12">
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
          {navItems.map((item) => <Link className={`flex min-h-12 flex-col items-center justify-center rounded-2xl text-[10px] font-bold ${active === item.label ? "bg-white/15" : "text-white/45"}`} href={item.href} key={item.label}><span className="mb-0.5 text-sm">{item.mark}</span>{item.label}</Link>)}
        </nav>
      </div>
    </main>
  );
}
