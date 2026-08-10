"use client";

import { Check, Type } from "lucide-react";
import { useEffect, useState } from "react";

const typographyPairs = [
  { id: "modern", label: "Soft Modern", sample: "Aa", note: "Clean · balanced" },
  { id: "editorial", label: "Quiet Editorial", sample: "Aa", note: "Warm · reflective" },
  { id: "humanist", label: "Humanist Calm", sample: "Aa", note: "Friendly · readable" },
] as const;

type TypographyId = (typeof typographyPairs)[number]["id"];

export function TypographyChooser() {
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

  return <div className="relative"><button aria-expanded={open} aria-haspopup="menu" aria-label="Choose typography" className="grid size-10 place-items-center rounded-full bg-white/45 text-[var(--soft-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,.6)] backdrop-blur-xl transition hover:bg-white/65" onClick={() => setOpen((current) => !current)} type="button"><Type className="size-4" strokeWidth={1.8} /></button>{open && <div aria-label="Typography styles" className="absolute right-0 top-12 z-50 w-64 rounded-[24px] border border-white/70 bg-[color:color-mix(in_srgb,var(--soft-surface)_92%,transparent)] p-2 shadow-[0_24px_65px_-24px_rgba(28,43,35,.48)] backdrop-blur-2xl" role="menu">{typographyPairs.map((pair) => <button className={`flex w-full items-center gap-3 rounded-[17px] px-3 py-3 text-left transition hover:bg-white/55 ${selected === pair.id ? "bg-white/65" : ""}`} key={pair.id} onClick={() => { setSelected(pair.id); setOpen(false); }} role="menuitem" type="button"><span className="grid size-10 place-items-center rounded-xl bg-[var(--soft-tint-a)] font-[var(--font-display)] text-lg font-semibold text-[var(--soft-ink)]">{pair.sample}</span><span className="flex-1"><span className="block text-xs font-bold text-[var(--soft-ink)]">{pair.label}</span><span className="mt-0.5 block text-[10px] text-[var(--soft-muted)]">{pair.note}</span></span>{selected === pair.id && <Check className="size-4 text-[var(--soft-accent)]" strokeWidth={2.5} />}</button>)}</div>}</div>;
}
