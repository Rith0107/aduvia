import { useEffect, useRef, useState } from "react";
import { toSvg } from "html-to-image";
import { ActivityIcon } from "@/components/activity-icon";

import { toAchievementTitle } from "./achievement-title";

type AuroraHabit = {
  completedDays: number;
  name: string;
};

type AuroraSkyPreviewProps = {
  completedQuests: string[];
  consistency: number;
  daysShownUp: number;
  format: "square" | "story";
  habits: AuroraHabit[];
  monthName: string;
  onRasterReadyChange?: (ready: boolean) => void;
  year: number;
};

const ribbonColors = ["var(--chart-primary)", "var(--chart-blue)", "var(--chart-green)", "var(--chart-rust)"];

export function AuroraSkyPreview({ completedQuests, consistency, daysShownUp, format, habits, monthName, onRasterReadyChange, year }: AuroraSkyPreviewProps) {
  const artworkRef = useRef<HTMLElement>(null);
  const [rasterError, setRasterError] = useState("");
  const [rasterUrl, setRasterUrl] = useState("");
  const [paletteRevision, setPaletteRevision] = useState(0);
  const isStory = format === "story";
  const visibleQuests = completedQuests.slice(0, 4);
  const remainingQuests = Math.max(0, completedQuests.length - visibleQuests.length);
  const shell = isStory ? "aspect-[9/16] w-full max-w-[310px]" : "aspect-square w-full max-w-[560px]";
  const starField = isStory
    ? "radial-gradient(circle at 9% 13%,rgba(255,255,255,.88) 0 1px,transparent 1.6px),radial-gradient(circle at 81% 8%,rgba(255,255,255,.62) 0 .8px,transparent 1.4px),radial-gradient(circle at 66% 24%,rgba(255,255,255,.82) 0 1.2px,transparent 1.8px),radial-gradient(circle at 24% 38%,rgba(255,255,255,.5) 0 .7px,transparent 1.3px),radial-gradient(circle at 92% 46%,rgba(255,255,255,.75) 0 1px,transparent 1.6px),radial-gradient(circle at 13% 59%,rgba(255,255,255,.68) 0 .9px,transparent 1.5px),radial-gradient(circle at 72% 69%,rgba(255,255,255,.55) 0 .7px,transparent 1.3px),radial-gradient(circle at 37% 81%,rgba(255,255,255,.78) 0 1px,transparent 1.6px),radial-gradient(circle at 88% 90%,rgba(255,255,255,.52) 0 .8px,transparent 1.4px)"
    : "radial-gradient(circle,rgba(255,255,255,.88) 0 1px,transparent 1.5px)";

  useEffect(() => {
    const observer = new MutationObserver(() => setPaletteRevision((revision) => revision + 1));
    observer.observe(document.documentElement, { attributeFilter: ["data-palette"], attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "test") return;
    let active = true;
    let nextUrl = "";
    const artwork = artworkRef.current;
    if (!artwork) return;

    async function createMatchingRaster() {
      await document.fonts?.ready;
      const rect = artwork!.getBoundingClientRect();
      const sourceWidth = rect.width;
      const sourceHeight = rect.height;
      const svg = await toSvg(artwork!, {
        cacheBust: true,
        height: sourceHeight,
        skipFonts: true,
        width: sourceWidth,
      });
      const response = await fetch("/api/share/aurora", {
        body: JSON.stringify({ height: isStory ? 1920 : 1080, svg, width: 1080 }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Aurora renderer returned ${response.status}: ${details}`);
      }
      const blob = await response.blob();
      if (!active) return;
      nextUrl = URL.createObjectURL(blob);
      setRasterUrl((currentUrl) => {
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        return nextUrl;
      });
      onRasterReadyChange?.(true);
    }

    setRasterUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return "";
    });
    onRasterReadyChange?.(false);
    setRasterError("");
    void createMatchingRaster().catch((error: unknown) => {
      onRasterReadyChange?.(false);
      setRasterError(error instanceof Error ? error.message : "Aurora renderer failed.");
    });

    return () => {
      active = false;
      if (nextUrl) URL.revokeObjectURL(nextUrl);
    };
  }, [completedQuests, consistency, daysShownUp, habits, isStory, monthName, onRasterReadyChange, paletteRevision, year]);

  return <div className={`${shell} relative`} data-share-error={rasterError || undefined}>
  <article aria-label={rasterUrl ? undefined : "Aurora Sky share preview"} className="absolute inset-0 overflow-hidden rounded-[26px] border border-white/25 bg-[linear-gradient(155deg,color-mix(in_srgb,var(--chart-deep)_78%,#07131d)_0%,color-mix(in_srgb,var(--chart-deep)_72%,#081827)_54%,color-mix(in_srgb,var(--chart-deep)_46%,#09111f)_100%)] text-white shadow-[0_28px_70px_rgba(3,10,18,.42),inset_0_0_0_1px_rgba(255,255,255,.06)]" ref={artworkRef} style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
    <div className="absolute inset-0 opacity-65" style={{ backgroundImage: "radial-gradient(circle at 7% 5%, color-mix(in srgb,var(--chart-green) 42%,transparent),transparent 27%), radial-gradient(circle at 92% 72%, color-mix(in srgb,var(--chart-blue) 44%,transparent),transparent 41%), radial-gradient(circle at 48% 48%, color-mix(in srgb,var(--chart-primary) 10%,transparent),transparent 37%)" }} />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,8,15,.04),rgba(2,8,15,.22))]" />
    <div className={`absolute inset-0 ${isStory ? "opacity-55" : "opacity-28"}`} style={{ backgroundImage: starField, backgroundSize: isStory ? "100% 100%" : "29px 29px" }} />
    <div className={`absolute opacity-80 ${isStory ? "-inset-x-[25%] top-1/2 h-[40%] -translate-y-1/2" : "-inset-x-[12%] top-[27%] h-[32%]"}`} style={{ backgroundImage: "radial-gradient(ellipse 128% 42% at 50% 52%,color-mix(in srgb,var(--chart-primary) 34%,transparent) 0%,color-mix(in srgb,var(--chart-primary) 15%,transparent) 48%,transparent 82%),radial-gradient(ellipse 92% 36% at 24% 44%,color-mix(in srgb,var(--chart-green) 40%,transparent) 0%,color-mix(in srgb,var(--chart-green) 16%,transparent) 48%,transparent 78%),radial-gradient(ellipse 86% 34% at 78% 60%,color-mix(in srgb,var(--chart-rust) 34%,transparent) 0%,color-mix(in srgb,var(--chart-rust) 12%,transparent) 50%,transparent 78%),radial-gradient(ellipse 72% 32% at 86% 30%,color-mix(in srgb,var(--chart-blue) 30%,transparent) 0%,transparent 76%)" }} />

    <div className={`relative flex h-full flex-col ${isStory ? "px-5 pb-10 pt-5" : "px-7 pb-14 pt-7"}`}>
      <header className="flex items-start justify-between border-b border-white/25 pb-3">
        <div><p className="text-[9px] font-black uppercase tracking-[.21em] text-[color-mix(in_srgb,var(--chart-primary)_72%,white)]">Aduvia · {monthName} sky</p><p className="mt-1 text-[7px] font-medium uppercase tracking-[.15em] text-white/70">Monthly light record</p></div>
        <p className="text-right text-[8px] font-bold uppercase tracking-[.12em] text-white/88">{monthName}<br />{year}</p>
      </header>

      <section className={`${isStory ? "mt-10" : "mt-5 grid grid-cols-[.72fr_1.28fr] items-center gap-5"}`}>
        <div className={isStory ? "text-center" : ""}>
          <p className="text-[5.5rem] font-semibold leading-[.82] tracking-[-.09em]">{consistency}<span className="ml-1 text-2xl text-[var(--chart-primary)]">%</span></p>
          <p className={`${isStory ? "mt-2" : "mt-3"} text-[8px] font-black uppercase tracking-[.2em] text-white/78`}>rhythm glow</p>
          {!isStory && <p className="mt-4 max-w-[155px] text-[10px] font-medium leading-4 text-white/82">Your month left a calm signal in the sky.</p>}
        </div>

        <div aria-label={`${habits.length} habit auroras`} className={`${isStory ? "absolute inset-x-5 top-1/2 h-48 -translate-y-1/2 overflow-visible" : "relative h-48 overflow-hidden rounded-[24px] border border-white/10 bg-black/10 shadow-[inset_0_0_30px_rgba(0,0,0,.18)]"}`}>
          <div className="absolute inset-0" data-aurora-artwork>
            <div className={`absolute opacity-95 ${isStory ? "-inset-x-[30%] -inset-y-[10%]" : "-inset-x-[18%] inset-y-0"}`} style={{ backgroundImage: "radial-gradient(ellipse 118% 30% at 50% 50%,color-mix(in srgb,var(--chart-primary) 42%,transparent) 0%,color-mix(in srgb,var(--chart-primary) 14%,transparent) 50%,transparent 84%),radial-gradient(ellipse 82% 26% at 30% 38%,color-mix(in srgb,var(--chart-green) 46%,transparent) 0%,color-mix(in srgb,var(--chart-green) 16%,transparent) 50%,transparent 78%),radial-gradient(ellipse 78% 26% at 72% 60%,color-mix(in srgb,var(--chart-rust) 44%,transparent) 0%,color-mix(in srgb,var(--chart-rust) 14%,transparent) 50%,transparent 78%),radial-gradient(ellipse 64% 28% at 80% 34%,color-mix(in srgb,var(--chart-blue) 40%,transparent) 0%,transparent 76%)" }} />
            <div className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full p-[3px] shadow-[0_0_18px_var(--chart-primary),0_0_48px_color-mix(in_srgb,var(--chart-primary)_55%,transparent)]" style={{ background: `conic-gradient(var(--chart-primary) ${consistency * 3.6}deg,rgba(255,255,255,.13) 0deg)` }}><div className="grid size-full place-items-center rounded-full border border-white/12 bg-[color-mix(in_srgb,var(--chart-deep)_86%,transparent)] backdrop-blur-sm"><span className="size-2.5 rounded-full bg-white shadow-[0_0_8px_white,0_0_24px_var(--chart-primary)]" /></div></div>
            {habits.slice(0, 4).map((habit, index) => {
              const angle = (index * 83 + 30) * Math.PI / 180;
              return <div className="absolute left-1/2 top-1/2 h-[32%] rounded-[50%] border opacity-75" data-aurora-orbit key={habit.name} style={{ borderColor: ribbonColors[index], boxShadow: `0 0 ${7 + index * 3}px ${ribbonColors[index]}`, transform: `translate(-50%,-50%) rotate(${index * 23 - 34}deg)`, width: `${56 + index * 12}%` }}><i data-orbit-marker className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_7px_white,0_0_15px_var(--chart-primary)]" style={{ left: `${50 + 50 * Math.cos(angle)}%`, top: `${50 + 50 * Math.sin(angle)}%` }} /></div>;
            })}
          </div>
        </div>
      </section>

      <section className={`${isStory ? "absolute inset-x-5 bottom-[84px] h-[60px] items-center py-1.5" : "mt-4 py-3"} grid grid-cols-3 border-y border-white/18 text-center`}>
        <div><p className="text-2xl font-semibold tracking-[-.06em]">{daysShownUp}</p><p className="mt-1 text-[7px] font-semibold uppercase tracking-[.11em] text-white/72">illuminated days</p></div>
        <div className="border-x border-white/20"><p className="text-2xl font-semibold tracking-[-.06em]">{habits.length}</p><p className="mt-1 text-[7px] font-semibold uppercase tracking-[.11em] text-white/72">aurora ribbons</p></div>
        <div><p className="text-2xl font-semibold tracking-[-.06em]">{completedQuests.length}</p><p className="mt-1 text-[7px] font-semibold uppercase tracking-[.11em] text-white/72">discoveries</p></div>
      </section>

      {isStory && completedQuests.length > 0 && <section aria-label="Completed quest symbols" className="absolute inset-x-5 bottom-[44px] flex h-10 items-center justify-center gap-6 text-[color-mix(in_srgb,var(--chart-primary)_70%,white)]">
        {completedQuests.slice(0, 4).map((quest) => <ActivityIcon activity={quest} className="size-5 drop-shadow-[0_0_7px_var(--chart-primary)]" key={quest} />)}
        {completedQuests.length > 4 && <span className="text-[8px] font-black tracking-[.1em] text-white/72">+{completedQuests.length - 4}</span>}
      </section>}

      {!isStory && <section className="mt-5">
        <div className="flex items-end justify-between"><p className="text-[8px] font-black uppercase tracking-[.18em] text-[color-mix(in_srgb,var(--chart-primary)_72%,white)]">Constellations discovered</p><p className="text-[7px] font-semibold uppercase tracking-[.11em] text-white/65">{completedQuests.length} mapped</p></div>
        <div className={`${isStory ? "mt-2 space-y-1.5" : "mt-3 grid grid-cols-2 gap-x-5 gap-y-2"}`}>{visibleQuests.length ? visibleQuests.map((quest) => <div className="grid grid-cols-[29px_1fr] items-center gap-2" key={quest}><span className={`${isStory ? "size-6" : "size-7"} grid place-items-center rounded-full border border-white/40 bg-[var(--chart-primary)]/20 text-white shadow-[0_0_8px_var(--chart-primary),0_0_22px_color-mix(in_srgb,var(--chart-primary)_55%,transparent)]`}><ActivityIcon activity={quest} className="size-4" /></span><p className="line-clamp-2 border-b border-white/25 pb-1.5 text-[8px] font-bold uppercase leading-tight text-white/95">{toAchievementTitle(quest)}</p></div>) : <p className="text-sm font-semibold text-white/82">The next constellation is still forming.</p>}{remainingQuests > 0 && <p className="col-span-full pt-1 text-[8px] font-bold uppercase tracking-[.11em] text-[color-mix(in_srgb,var(--chart-primary)_72%,white)]">+{remainingQuests} more discover{remainingQuests === 1 ? "y" : "ies"}</p>}</div>
      </section>}

      <footer className={`${isStory ? "absolute inset-x-5 bottom-3 h-8 items-center" : "absolute inset-x-7 bottom-4 items-end"} flex justify-between border-t border-white/16 pt-2 text-[7px] font-semibold uppercase tracking-[.14em] text-white/72`}>
        <span style={isStory ? { whiteSpace: "nowrap", flexShrink: 0, lineHeight: 1 } : undefined}>A month written in light.</span>
        <span className="text-xl font-black tracking-[-.08em] text-white/95" style={isStory ? { flexShrink: 0, lineHeight: 1 } : undefined}>A.</span>
      </footer>
    </div>
  </article>
  {/* The generated PNG is deliberately shown unchanged so the preview and shared file are identical. */}
  {/* eslint-disable-next-line @next/next/no-img-element */}
  {rasterUrl && <img alt="Aurora Sky share preview" aria-label="Aurora Sky share preview" className="absolute inset-0 z-10 size-full rounded-[26px] object-fill" data-share-raster="true" src={rasterUrl} />}
  </div>;
}
