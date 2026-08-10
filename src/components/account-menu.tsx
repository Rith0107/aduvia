"use client";

import Link from "next/link";
import { LogOut, Settings2, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type Viewer = { name: string; email: string } | null;

export function AccountMenu() {
  const [open, setOpen] = useState(false);
  const [viewer, setViewer] = useState<Viewer>(null);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => createBrowserSupabaseClient().auth.getUser()).then(({ data }) => {
      if (!active || !data.user) return;
      setViewer({ name: String(data.user.user_metadata?.display_name || data.user.email?.split("@")[0] || "Aduvia member"), email: data.user.email || "" });
    }).catch(() => undefined);
    const closeOtherMenus = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== "account") setOpen(false);
    };
    window.addEventListener("aduvia:toolbar-menu", closeOtherMenus);
    return () => { active = false; window.removeEventListener("aduvia:toolbar-menu", closeOtherMenus); };
  }, []);

  async function signOut() {
    try { await createBrowserSupabaseClient().auth.signOut(); } catch { /* Preview mode has no remote session. */ }
    setOpen(false);
  }

  function toggleMenu() {
    if (open) setOpen(false);
    else {
      window.dispatchEvent(new CustomEvent("aduvia:toolbar-menu", { detail: "account" }));
      setOpen(true);
    }
  }

  return <div className="relative"><button aria-expanded={open} aria-haspopup="menu" aria-label="Open account menu" className="grid size-10 place-items-center rounded-full border-4 border-white/55 bg-[var(--soft-accent)] text-white shadow-sm transition hover:-translate-y-0.5" onClick={toggleMenu} type="button"><UserRound aria-hidden className="size-4" strokeWidth={2} /></button>
  {open && <div aria-label="Account menu" className="absolute right-0 top-12 z-50 w-72 rounded-[26px] border border-white/70 bg-[color:color-mix(in_srgb,var(--soft-surface)_95%,transparent)] p-2 shadow-[0_26px_70px_-26px_rgba(28,43,35,.55)] backdrop-blur-2xl" role="menu"><div className="rounded-[20px] bg-[linear-gradient(135deg,var(--soft-tint-a),var(--soft-tint-b))] p-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[var(--soft-ink)] text-white"><UserRound className="size-4" /></span><div className="min-w-0"><p className="truncate text-sm font-bold">{viewer?.name || "Your account"}</p><p className="truncate text-[10px] text-[var(--soft-muted)]">{viewer?.email || "Signed in on this device"}</p></div></div></div><div className="p-1 pt-2"><MenuLink href="/account" icon={Settings2} label="Account settings" /><MenuLink href="/account#privacy" icon={ShieldCheck} label="Privacy & data" /><button className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-xs font-bold text-[var(--soft-ink)] transition hover:bg-white/55" onClick={signOut} role="menuitem" type="button"><LogOut className="size-4 text-[var(--soft-accent)]" />Log out</button></div></div>}</div>;
}

function MenuLink({ href, icon: Icon, label }: { href: string; icon: typeof Settings2; label: string }) {
  return <Link className="flex items-center gap-3 rounded-2xl px-3 py-3 text-xs font-bold text-[var(--soft-ink)] transition hover:bg-white/55" href={href} role="menuitem"><Icon className="size-4 text-[var(--soft-accent)]" />{label}</Link>;
}
