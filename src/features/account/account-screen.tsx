"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpenText, Database, Download, LogIn, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { PaletteChooser } from "@/components/palette-chooser";
import { TypographyChooser } from "@/components/typography-chooser";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useAppData } from "@/lib/app-data";

type Viewer = { name: string; email: string } | null;

export function AccountScreen() {
  const router = useRouter();
  const appData = useAppData();
  const [viewer, setViewer] = useState<Viewer>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => createBrowserSupabaseClient().auth.getUser()).then(({ data }) => {
        if (!active) return;
        const user = data.user;
        setViewer(user ? { name: String(user.user_metadata?.display_name || user.email?.split("@")[0] || "Aduvia member"), email: user.email || "" } : null);
        setChecking(false);
      }).catch(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  async function signOut() {
    try {
      await createBrowserSupabaseClient().auth.signOut();
    } finally {
      setViewer(null);
      router.push("/");
    }
  }

  function exportData() {
    if (!appData) return;
    const payload = {
      exportedAt: new Date().toISOString(),
      version: 1,
      habits: appData.habits,
      quests: appData.quests,
      checkIns: appData.completions,
      reflections: appData.reflections,
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `aduvia-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return <main className="soft-canvas min-h-screen text-[var(--soft-ink)]"><div className="soft-shell min-h-screen"><header className="premium-toolbar mx-auto flex max-w-[1500px] items-center justify-between px-5 py-5 sm:px-9 lg:px-14"><BrandLogo href="/today" /><div className="flex items-center gap-2"><PaletteChooser /><TypographyChooser /><Link className="flex min-h-10 items-center gap-2 rounded-full bg-white/45 px-4 text-xs font-bold backdrop-blur-xl" href="/today"><ArrowLeft className="size-4" />Back home</Link></div></header>
  <div className="mx-auto max-w-[1260px] px-5 pb-20 pt-12 sm:px-9 lg:px-14"><section className="overflow-hidden rounded-[38px] border border-white/70 bg-[linear-gradient(135deg,var(--soft-tint-a),var(--soft-surface)_48%,var(--soft-tint-b))] p-7 shadow-[0_28px_75px_-45px_rgba(28,43,35,.5)] sm:p-10"><div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-5"><span className="grid size-20 place-items-center rounded-[26px] bg-[var(--soft-ink)] text-white shadow-xl"><UserRound className="size-8" strokeWidth={1.6} /></span><div><p className="text-[10px] font-black uppercase tracking-[.22em] text-[var(--soft-accent)]">Your Aduvia space</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">{checking ? "Opening your space…" : viewer?.name || "Preview account"}</h1><p className="mt-2 text-sm text-[var(--soft-muted)]">{viewer?.email || "Your local progress is available in this browser."}</p></div></div>{viewer ? <button className="inline-flex items-center justify-center gap-2 rounded-full bg-white/65 px-5 py-3 text-sm font-bold" onClick={signOut} type="button"><LogOut className="size-4" />Sign out</button> : <div className="flex flex-wrap gap-2"><Link className="inline-flex items-center gap-2 rounded-full bg-[var(--soft-ink)] px-5 py-3 text-sm font-bold text-white" href="/login"><LogIn className="size-4" />Log in</Link><Link className="rounded-full bg-white/65 px-5 py-3 text-sm font-bold" href="/signup">Create account</Link></div>}</div></section>
  <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_.85fr]"><section className="rounded-[32px] border border-white/65 bg-white/35 p-7 backdrop-blur-xl"><p className="text-[10px] font-black uppercase tracking-[.2em] text-[var(--soft-accent)]">Make it yours</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Your calm, your way.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[var(--soft-muted)]">Palette and typography choices follow you through Home, Habits, Quests, Insights, and Evening mode.</p><div className="mt-7 grid gap-3 sm:grid-cols-2"><Preference icon={BookOpenText} label="Typography pair" detail="Choose a display and reading pair" control={<TypographyChooser />} /><Preference icon={Database} label="Colour palette" detail="Coordinate cards, charts, and brand" control={<PaletteChooser />} /></div></section>
  <section className="rounded-[32px] bg-[var(--soft-ink)] p-7 text-white"><ShieldCheck className="size-7 text-[var(--chart-primary)]" strokeWidth={1.7} /><p className="mt-8 text-[10px] font-black uppercase tracking-[.2em] text-white/45">Privacy</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Your quiet notes stay yours.</h2><p className="mt-3 text-sm leading-6 text-white/55">Shared monthly cards include consistency and completed quests only. Reflections and missed-day details remain private.</p></section></div>
  <section className="mt-6 flex flex-col gap-5 rounded-[32px] border border-white/65 bg-[var(--soft-tint-c)]/60 p-7 sm:flex-row sm:items-center sm:justify-between" id="privacy"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[var(--soft-accent)]">Data & account</p><h2 className="mt-2 text-2xl font-semibold">Your progress belongs to you.</h2><p className="mt-1 max-w-2xl text-sm text-[var(--soft-muted)]">{viewer ? "Your habits, quests, check-ins, and private reflections sync securely to your account." : "This preview is stored only in this browser until you create an account."} Download a portable copy whenever you want.</p></div><div className="flex flex-wrap gap-2"><button className="inline-flex items-center gap-2 rounded-full bg-white/70 px-5 py-3 text-center text-sm font-bold" onClick={exportData} type="button"><Download className="size-4" />Export my data</button><Link className="rounded-full bg-[var(--soft-ink)] px-5 py-3 text-center text-sm font-bold text-white" href="/insights">View insights</Link></div></section></div></div></main>;
}

function Preference({ icon: Icon, label, detail, control }: { icon: typeof BookOpenText; label: string; detail: string; control: React.ReactNode }) {
  return <div className="flex items-center gap-4 rounded-[23px] bg-white/55 p-4"><span className="grid size-11 place-items-center rounded-2xl bg-[var(--soft-tint-a)]"><Icon className="size-5" strokeWidth={1.7} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-bold">{label}</span><span className="block text-[11px] text-[var(--soft-muted)]">{detail}</span></span>{control}</div>;
}
