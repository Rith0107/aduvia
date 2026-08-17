"use client";

import { Check, Palette } from "lucide-react";
import { useEffect, useState } from "react";

import { useAppData } from "@/lib/app-data";

const palettes = [
  { id: "forest", label: "Forest Dawn", colors: ["#e7e8e3", "#29322c", "#a86f5b", "#d7e3dc"] },
  { id: "coastal", label: "Coastal Quiet", colors: ["#e5edef", "#18324a", "#d88467", "#badfd8"] },
  { id: "clay", label: "Clay & Moss", colors: ["#ede6d8", "#34382d", "#a85c45", "#c8d2a7"] },
  { id: "lavender", label: "Lavender Hush", colors: ["#e9e6f0", "#343047", "#9b718f", "#d8d4e8"] },
  { id: "blue-hour", label: "Blue Hour", colors: ["#dfe8ec", "#243847", "#a06f69", "#cadde1"] },
] as const;

type PaletteId = (typeof palettes)[number]["id"];

export function PaletteChooser({ embedded = false }: { embedded?: boolean } = {}) {
  const appData = useAppData();
  const [selected, setSelected] = useState<PaletteId>(() => {
    if (typeof window === "undefined") return "forest";
    try {
      const saved = window.localStorage.getItem("aduvia-palette") as PaletteId | null;
      return palettes.some((item) => item.id === saved) ? saved! : "forest";
    } catch { return "forest"; }
  });
  const [open, setOpen] = useState(false);

  // The account's saved palette may differ from this device's local cache
  // (e.g. it was last changed on another device). Adjusted during render
  // (React's sanctioned pattern for syncing state to a changed prop) rather
  // than in an effect, so it takes effect in the same pass instead of a
  // flash of the old palette followed by a second render.
  const [syncedPalette, setSyncedPalette] = useState(appData?.palette);
  if (appData?.palette !== syncedPalette) {
    setSyncedPalette(appData?.palette);
    if (appData?.palette && palettes.some((item) => item.id === appData.palette)) setSelected(appData.palette as PaletteId);
  }

  useEffect(() => {
    document.documentElement.dataset.palette = selected;
    try { window.localStorage.setItem("aduvia-palette", selected); } catch { /* The visual preference still applies for this session. */ }
  }, [selected]);

  useEffect(() => {
    const closeOtherMenus = (event: Event) => {
      const ownMenu = embedded ? "account-palette" : "palette";
      if ((event as CustomEvent<string>).detail !== ownMenu) setOpen(false);
    };
    window.addEventListener("aduvia:toolbar-menu", closeOtherMenus);
    return () => window.removeEventListener("aduvia:toolbar-menu", closeOtherMenus);
  }, [embedded]);

  function choose(palette: PaletteId) {
    setSelected(palette);
    appData?.setPalette(palette);
    setOpen(false);
  }

  function toggleMenu() {
    if (open) setOpen(false);
    else {
      window.dispatchEvent(new CustomEvent("aduvia:toolbar-menu", { detail: embedded ? "account-palette" : "palette" }));
      setOpen(true);
    }
  }

  return (
    <div className="relative">
      <button aria-expanded={open} aria-haspopup="menu" aria-label="Choose colour palette" className="grid size-10 place-items-center rounded-full bg-white/45 text-[var(--soft-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,.6)] backdrop-blur-xl transition hover:bg-white/65" onClick={toggleMenu} type="button"><Palette className="size-4" strokeWidth={1.8} /></button>
      {open && <div aria-label="Colour palettes" className="absolute right-0 top-12 z-50 w-64 rounded-[24px] border border-white/70 bg-[color-mix(in_srgb,var(--soft-surface)_92%,transparent)] p-2 shadow-[0_24px_65px_-24px_rgba(28,43,35,.48)] backdrop-blur-2xl" role="menu">{palettes.map((palette) => <button className={`flex w-full items-center gap-3 rounded-[17px] px-3 py-3 text-left transition hover:bg-white/55 ${selected === palette.id ? "bg-white/65" : ""}`} key={palette.id} onClick={() => choose(palette.id)} role="menuitem" type="button"><span className="flex -space-x-1">{palette.colors.map((color) => <i className="size-4 rounded-full border-2 border-white" key={color} style={{ backgroundColor: color }} />)}</span><span className="flex-1 text-xs font-bold text-[var(--soft-ink)]">{palette.label}</span>{selected === palette.id && <Check className="size-4 text-[var(--soft-accent)]" strokeWidth={2.5} />}</button>)}</div>}
    </div>
  );
}
