"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, BookOpenText, Database, Download, LogIn, LogOut, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { PaletteChooser } from "@/components/palette-chooser";
import { TypographyChooser } from "@/components/typography-chooser";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useAppData } from "@/lib/app-data";

type Viewer = { name: string; email: string } | null;
type ExportSource = NonNullable<ReturnType<typeof useAppData>>;

export function buildDataExport(source: Pick<ExportSource, "habits" | "quests" | "completions" | "reflections">, viewer: Viewer, preferences: { palette: string; typography: string }, exportedAt = new Date().toISOString()) {
  return {
    format: "aduvia-data-export",
    version: 1,
    exportedAt,
    account: viewer ? { displayName: viewer.name, email: viewer.email } : null,
    preferences,
    habits: source.habits,
    quests: source.quests,
    checkIns: source.completions,
    reflections: source.reflections,
  };
}

export function AccountScreen() {
  const router = useRouter();
  const appData = useAppData();
  const [viewer, setViewer] = useState<Viewer>(null);
  const [checking, setChecking] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [accountMessage, setAccountMessage] = useState("");
  const [exportMessage, setExportMessage] = useState("");

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
    if (!appData || appData.isLoading) return;
    const payload = buildDataExport(appData, viewer, {
      palette: window.localStorage.getItem("aduvia-palette") || "forest",
      typography: window.localStorage.getItem("aduvia-typography") || "modern",
    });
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `aduvia-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setExportMessage("Your Aduvia data was downloaded as a JSON file.");
  }

  async function deleteAccount() {
    if (deleteConfirmation !== "DELETE" || deleting) return;
    setDeleting(true);
    setAccountMessage("");
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.rpc("delete_own_account");
      if (error) throw error;
      await supabase.auth.signOut();
      router.replace("/");
      router.refresh();
    } catch (error) {
      setAccountMessage(error instanceof Error ? error.message : "We could not delete the account. Nothing was removed.");
      setDeleting(false);
    }
  }

  return <main className="soft-canvas min-h-screen text-[var(--soft-ink)]"><div className="soft-shell min-h-screen"><header className="premium-toolbar mx-auto flex max-w-[1500px] items-center justify-between px-5 py-5 sm:px-9 lg:px-14"><BrandLogo href="/today" /><div className="flex items-center gap-2"><PaletteChooser /><TypographyChooser /><Link className="flex min-h-10 items-center gap-2 rounded-full bg-white/45 px-4 text-xs font-bold backdrop-blur-xl" href="/today"><ArrowLeft className="size-4" />Back home</Link></div></header>
  <div className="mx-auto max-w-[1260px] px-5 pb-20 pt-12 sm:px-9 lg:px-14"><section className="overflow-hidden rounded-[38px] border border-white/70 bg-[linear-gradient(135deg,var(--soft-tint-a),var(--soft-surface)_48%,var(--soft-tint-b))] p-7 shadow-[0_28px_75px_-45px_rgba(28,43,35,.5)] sm:p-10"><div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-5"><span className="grid size-20 place-items-center rounded-[26px] bg-[var(--soft-ink)] text-white shadow-xl"><UserRound className="size-8" strokeWidth={1.6} /></span><div><p className="text-[10px] font-black uppercase tracking-[.22em] text-[var(--soft-accent)]">Your Aduvia space</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">{checking ? "Opening your space…" : viewer?.name || "Preview account"}</h1><p className="mt-2 text-sm text-[var(--soft-muted)]">{viewer?.email || "Your local progress is available in this browser."}</p></div></div>{viewer ? <button className="inline-flex items-center justify-center gap-2 rounded-full bg-white/65 px-5 py-3 text-sm font-bold" onClick={signOut} type="button"><LogOut className="size-4" />Sign out</button> : <div className="flex flex-wrap gap-2"><Link className="inline-flex items-center gap-2 rounded-full bg-[var(--soft-ink)] px-5 py-3 text-sm font-bold text-white" href="/login"><LogIn className="size-4" />Log in</Link><Link className="rounded-full bg-white/65 px-5 py-3 text-sm font-bold" href="/signup">Create account</Link></div>}</div></section>
  <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_.85fr]"><section className="rounded-[32px] border border-white/65 bg-white/35 p-7 backdrop-blur-xl"><p className="text-[10px] font-black uppercase tracking-[.2em] text-[var(--soft-accent)]">Make it yours</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Your calm, your way.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[var(--soft-muted)]">Palette and typography choices follow you through Home, Habits, Quests, Insights, and Evening mode.</p><div className="mt-7 grid gap-3 sm:grid-cols-2"><Preference icon={BookOpenText} label="Typography pair" detail="Choose a display and reading pair" control={<TypographyChooser />} /><Preference icon={Database} label="Colour palette" detail="Coordinate cards, charts, and brand" control={<PaletteChooser />} /></div></section>
  <section className="rounded-[32px] bg-[var(--soft-ink)] p-7 text-white"><ShieldCheck className="size-7 text-[var(--chart-primary)]" strokeWidth={1.7} /><p className="mt-8 text-[10px] font-black uppercase tracking-[.2em] text-white/45">Privacy</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Your quiet notes stay yours.</h2><p className="mt-3 text-sm leading-6 text-white/55">Shared monthly cards include consistency and completed quests only. Reflections and missed-day details remain private.</p></section></div>
  <section className="mt-6 flex flex-col gap-5 rounded-[32px] border border-white/65 bg-[var(--soft-tint-c)]/60 p-7 sm:flex-row sm:items-center sm:justify-between" id="privacy"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[var(--soft-accent)]">Data & account</p><h2 className="mt-2 text-2xl font-semibold">Your progress belongs to you.</h2><p className="mt-1 max-w-2xl text-sm text-[var(--soft-muted)]">{viewer ? "Your habits, quests, check-ins, and private reflections sync securely to your account." : "This preview is stored only in this browser until you create an account."} Download a portable copy whenever you want.</p>{exportMessage && <p className="mt-3 text-xs font-bold text-[var(--soft-icon-green)]" role="status">{exportMessage}</p>}</div><div className="flex flex-wrap gap-2"><button className="inline-flex items-center gap-2 rounded-full bg-white/70 px-5 py-3 text-center text-sm font-bold disabled:cursor-wait disabled:opacity-45" disabled={!appData || appData.isLoading} onClick={exportData} type="button"><Download className="size-4" />{appData?.isLoading ? "Preparing data…" : "Export my data"}</button><Link className="rounded-full bg-[var(--soft-ink)] px-5 py-3 text-center text-sm font-bold text-white" href="/insights">View insights</Link></div></section>
  {viewer && <section className="mt-6 rounded-[32px] border border-[var(--soft-icon-clay)]/20 bg-white/30 p-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-[var(--soft-icon-clay)]"><AlertTriangle className="size-4" />Permanent action</p><h2 className="mt-2 text-2xl font-semibold">Delete my Aduvia account</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--soft-muted)]">This permanently removes your account, habits, quests, check-ins, and private reflections. Export your data first if you want to keep a copy.</p></div>{!showDelete && <button className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--soft-icon-clay)]/25 bg-white/60 px-5 py-3 text-sm font-bold text-[var(--soft-icon-clay)]" onClick={() => setShowDelete(true)} type="button"><Trash2 className="size-4" />Delete account</button>}</div>{showDelete && <div className="mt-6 rounded-[24px] bg-[var(--soft-tint-b)] p-5"><label className="block text-sm font-bold" htmlFor="delete-confirmation">Type <span className="font-black">DELETE</span> to confirm</label><div className="mt-3 flex flex-col gap-3 sm:flex-row"><input autoComplete="off" className="min-h-12 flex-1 rounded-2xl border border-black/10 bg-white/70 px-4 outline-none focus:border-[var(--soft-icon-clay)]" id="delete-confirmation" onChange={(event) => setDeleteConfirmation(event.target.value)} value={deleteConfirmation} /><button className="min-h-12 rounded-full bg-[var(--soft-icon-clay)] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-35" disabled={deleteConfirmation !== "DELETE" || deleting} onClick={deleteAccount} type="button">{deleting ? "Deleting…" : "Permanently delete"}</button><button className="min-h-12 rounded-full bg-white/65 px-5 text-sm font-bold" onClick={() => { setShowDelete(false); setDeleteConfirmation(""); setAccountMessage(""); }} type="button">Cancel</button></div>{accountMessage && <p className="mt-3 text-sm text-[var(--soft-icon-clay)]" role="alert">{accountMessage}</p>}</div>}</section>}
  </div></div></main>;
}

function Preference({ icon: Icon, label, detail, control }: { icon: typeof BookOpenText; label: string; detail: string; control: React.ReactNode }) {
  return <div className="flex items-center gap-4 rounded-[23px] bg-white/55 p-4"><span className="grid size-11 place-items-center rounded-2xl bg-[var(--soft-tint-a)]"><Icon className="size-5" strokeWidth={1.7} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-bold">{label}</span><span className="block text-[11px] text-[var(--soft-muted)]">{detail}</span></span>{control}</div>;
}
