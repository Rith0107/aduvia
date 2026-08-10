"use client";

import { Check, Type } from "lucide-react";
import { useEffect, useState } from "react";

const typographyPairs = [
  { id: "modern", label: "Modern Calm", display: "Manrope", body: "Inter", note: "Clear · effortless" },
  { id: "soft-journal", label: "Soft Journal", display: "Lora", body: "Inter", note: "Warm · readable" },
  { id: "quiet-literary", label: "Quiet Literary", display: "Cormorant", body: "Manrope", note: "Gentle · reflective" },
  { id: "grounded-classic", label: "Grounded Classic", display: "STIX Two", body: "Archivo", note: "Steady · familiar" },
] as const;

type TypographyId = (typeof typographyPairs)[number]["id"];

export function TypographyChooser({ embedded = false }: { embedded?: boolean } = {}) {
  const [selected, setSelected] = useState<TypographyId>(() => {
    if (typeof window === "undefined" || !window.localStorage) return "modern";
    const saved = window.localStorage.getItem("aduvia-typography") as TypographyId | null;
    return typographyPairs.some((pair) => pair.id === saved) ? saved! : "modern";
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.typography = selected;
    window.localStorage?.setItem("aduvia-typography", selected);
  }, [selected]);

  useEffect(() => {
    const closeOtherMenus = (event: Event) => {
      const ownMenu = embedded ? "account-typography" : "typography";
      if ((event as CustomEvent<string>).detail !== ownMenu) setOpen(false);
    };
    window.addEventListener("aduvia:toolbar-menu", closeOtherMenus);
    return () => window.removeEventListener("aduvia:toolbar-menu", closeOtherMenus);
  }, [embedded]);

  function toggleMenu() {
    if (open) setOpen(false);
    else {
      window.dispatchEvent(new CustomEvent("aduvia:toolbar-menu", { detail: embedded ? "account-typography" : "typography" }));
      setOpen(true);
    }
  }

  return <div className="relative"><button aria-expanded={open} aria-haspopup="menu" aria-label="Choose typography" className="grid size-10 place-items-center rounded-full bg-white/45 text-[var(--soft-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,.6)] backdrop-blur-xl transition hover:bg-white/65" onClick={toggleMenu} type="button"><Type className="size-4" strokeWidth={1.8} /></button>{open && <div aria-label="Typography pairs" className="absolute right-0 top-12 z-50 max-h-[min(70vh,520px)] w-72 overflow-y-auto rounded-[24px] border border-white/70 bg-[color:color-mix(in_srgb,var(--soft-surface)_94%,transparent)] p-2 shadow-[0_24px_65px_-24px_rgba(28,43,35,.48)] backdrop-blur-2xl" role="menu"><div className="px-3 pb-2 pt-1"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--soft-accent)]">Display + reading</p><p className="mt-1 text-[10px] text-[var(--soft-muted)]">Four low-stress, highly readable pairs.</p></div>{typographyPairs.map((pair) => <button className={`flex w-full items-center gap-3 rounded-[17px] px-3 py-3 text-left transition hover:bg-white/55 ${selected === pair.id ? "bg-white/65" : ""}`} key={pair.id} onClick={() => { setSelected(pair.id); setOpen(false); }} role="menuitem" type="button"><span className="grid size-11 place-items-center rounded-xl bg-[var(--soft-tint-a)] font-[var(--font-display)] text-xl font-semibold text-[var(--soft-ink)]">Ag</span><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-[var(--soft-ink)]">{pair.label}</span><span className="mt-0.5 block truncate text-[10px] text-[var(--soft-muted)]">{pair.display} + {pair.body}</span><span className="block text-[9px] text-[var(--soft-muted)]/70">{pair.note}</span></span>{selected === pair.id && <Check className="size-4 shrink-0 text-[var(--soft-accent)]" strokeWidth={2.5} />}</button>)}</div>}</div>;
}
