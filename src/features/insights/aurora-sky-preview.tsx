import { useEffect, useRef, useState } from "react";
import { toBlob } from "html-to-image";
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
  year: number;
};

function paintAuroraGalaxy(isStory: boolean, consistency: number, habits: AuroraHabit[]) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 720;
  const context = canvas.getContext("2d");
  if (!context) return "";

  const styles = getComputedStyle(document.documentElement);
  const colors = {
    blue: styles.getPropertyValue("--chart-blue").trim(),
    green: styles.getPropertyValue("--chart-green").trim(),
    primary: styles.getPropertyValue("--chart-primary").trim(),
    rust: styles.getPropertyValue("--chart-rust").trim(),
  };
  const height = canvas.height;

  function drawRibbon({ bend, colors: ribbonStops, lineWidth, opacity, y }: { bend: number; colors: string[]; lineWidth: number; opacity: number; y: number }) {
    const gradient = context!.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "transparent");
    gradient.addColorStop(.18, ribbonStops[0]);
    gradient.addColorStop(.5, ribbonStops[1]);
    gradient.addColorStop(.82, ribbonStops[2]);
    gradient.addColorStop(1, "transparent");

    context!.save();
    context!.globalAlpha = opacity;
    context!.globalCompositeOperation = "screen";
    context!.strokeStyle = gradient;
    context!.lineCap = "round";
    context!.lineWidth = lineWidth;
    context!.shadowBlur = lineWidth * .72;
    context!.shadowColor = ribbonStops[1];
    context!.beginPath();
    context!.moveTo(-180, y);
    context!.bezierCurveTo(210, y - bend, 720, y + bend, 1260, y - bend * .35);
    context!.stroke();
    context!.restore();
  }

  const centerX = canvas.width / 2;
  const centerY = height / 2;
  drawRibbon({ bend: height * .22, colors: [colors.green, colors.primary, colors.blue], lineWidth: isStory ? 210 : 170, opacity: .42, y: centerY - 28 });
  drawRibbon({ bend: -height * .17, colors: [colors.blue, colors.rust, colors.primary], lineWidth: isStory ? 130 : 104, opacity: .34, y: centerY + 32 });
  drawRibbon({ bend: height * .14, colors: [colors.green, colors.blue, colors.primary], lineWidth: isStory ? 72 : 62, opacity: .5, y: centerY + 4 });

  const orbitColors = [colors.primary, colors.blue, colors.green, colors.rust];
  habits.slice(0, 4).forEach((habit, index) => {
    const radiusX = 250 + index * 54;
    const radiusY = 92 + index * 12;
    const angle = (index * 23 - 34) * Math.PI / 180;
    context.save();
    context.translate(centerX, centerY);
    context.rotate(angle);
    context.globalAlpha = .8;
    context.strokeStyle = orbitColors[index];
    context.lineWidth = 4;
    context.shadowBlur = 13 + index * 3;
    context.shadowColor = orbitColors[index];
    context.beginPath();
    context.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
    context.stroke();

    const markerCount = Math.min(8, Math.max(3, habit.completedDays));
    for (let markerIndex = 0; markerIndex < markerCount; markerIndex += 1) {
      const markerAngle = ((markerIndex + 1) / (markerCount + 1)) * Math.PI * 2;
      const x = Math.cos(markerAngle) * radiusX;
      const y = Math.sin(markerAngle) * radiusY;
      context.globalAlpha = .54 + markerIndex / markerCount * .42;
      context.fillStyle = "#ffffff";
      context.shadowBlur = 14;
      context.shadowColor = colors.primary;
      context.beginPath();
      context.arc(x, y, 7, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  });

  context.save();
  context.translate(centerX, centerY);
  context.lineWidth = 15;
  context.strokeStyle = "rgba(255,255,255,.14)";
  context.beginPath();
  context.arc(0, 0, 116, 0, Math.PI * 2);
  context.stroke();
  context.strokeStyle = colors.primary;
  context.shadowBlur = 26;
  context.shadowColor = colors.primary;
  context.beginPath();
  context.arc(0, 0, 116, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, Math.min(100, consistency)) / 100);
  context.stroke();
  const core = context.createRadialGradient(0, 0, 0, 0, 0, 104);
  core.addColorStop(0, "rgba(255,255,255,.18)");
  core.addColorStop(1, "rgba(3,12,22,.88)");
  context.fillStyle = core;
  context.shadowBlur = 0;
  context.beginPath();
  context.arc(0, 0, 104, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#ffffff";
  context.shadowBlur = 34;
  context.shadowColor = "#ffffff";
  context.beginPath();
  context.arc(0, 0, 13, 0, Math.PI * 2);
  context.fill();
  context.restore();

  return canvas.toDataURL("image/png");
}

export function AuroraSkyPreview({ completedQuests, consistency, daysShownUp, format, habits, monthName, year }: AuroraSkyPreviewProps) {
  const artworkRef = useRef<HTMLElement>(null);
  const [rasterUrl, setRasterUrl] = useState("");
  const [galaxyImage, setGalaxyImage] = useState("");
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
    const frame = requestAnimationFrame(() => setGalaxyImage(paintAuroraGalaxy(isStory, consistency, habits)));
    return () => cancelAnimationFrame(frame);
  }, [consistency, habits, isStory, paletteRevision]);

  useEffect(() => {
    if (process.env.NODE_ENV === "test") return;
    let active = true;
    let nextUrl = "";
    const artwork = artworkRef.current;
    if (!artwork || !galaxyImage) return;

    async function createMatchingRaster() {
      await document.fonts?.ready;
      const sourceWidth = isStory ? 310 : 560;
      const sourceHeight = isStory ? sourceWidth * 16 / 9 : sourceWidth;
      const blob = await toBlob(artwork!, {
        cacheBust: true,
        canvasHeight: isStory ? 1920 : 1080,
        canvasWidth: 1080,
        height: sourceHeight,
        pixelRatio: 1,
        width: sourceWidth,
      });
      if (!blob || !active) return;
      nextUrl = URL.createObjectURL(blob);
      setRasterUrl((currentUrl) => {
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        return nextUrl;
      });
    }

    setRasterUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return "";
    });
    void createMatchingRaster().catch(() => undefined);

    return () => {
      active = false;
      if (nextUrl) URL.revokeObjectURL(nextUrl);
    };
  }, [completedQuests, consistency, daysShownUp, galaxyImage, habits, isStory, monthName, paletteRevision, year]);

  return <div className={`${shell} relative`}>
  <article aria-label={rasterUrl ? undefined : "Aurora Sky share preview"} className="absolute inset-0 overflow-hidden rounded-[26px] border border-white/25 bg-[linear-gradient(155deg,color-mix(in_srgb,var(--chart-deep)_78%,#07131d)_0%,color-mix(in_srgb,var(--chart-deep)_72%,#081827)_54%,color-mix(in_srgb,var(--chart-deep)_46%,#09111f)_100%)] text-white shadow-[0_28px_70px_rgba(3,10,18,.42),inset_0_0_0_1px_rgba(255,255,255,.06)]" ref={artworkRef}>
    <div className="absolute inset-0 opacity-65" style={{ backgroundImage: "radial-gradient(circle at 7% 5%, color-mix(in srgb,var(--chart-green) 42%,transparent),transparent 27%), radial-gradient(circle at 92% 72%, color-mix(in srgb,var(--chart-blue) 44%,transparent),transparent 41%), radial-gradient(circle at 48% 48%, color-mix(in srgb,var(--chart-primary) 10%,transparent),transparent 37%)" }} />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,8,15,.04),rgba(2,8,15,.22))]" />
    <div className={`absolute inset-0 ${isStory ? "opacity-55" : "opacity-28"}`} style={{ backgroundImage: starField, backgroundSize: isStory ? "100% 100%" : "29px 29px" }} />
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

        <div aria-label={`${habits.length} habit auroras`} className={`relative ${isStory ? "mt-1 h-48 overflow-visible" : "h-48 overflow-hidden rounded-[24px] border border-white/10 bg-black/10"}`}>
          {/* The whole glow is already flattened. Safari never has to composite transformed filtered layers inside SVG foreignObject. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {galaxyImage && <img alt="" aria-hidden="true" className="absolute inset-0 size-full object-fill" data-aurora-galaxy="bitmap" src={galaxyImage} />}
        </div>
      </section>

      <section className={`${isStory ? "mt-2 py-1.5" : "mt-4 py-3"} grid grid-cols-3 border-y border-white/18 text-center`}>
        <div><p className="text-2xl font-semibold tracking-[-.06em]">{daysShownUp}</p><p className="mt-1 text-[7px] font-semibold uppercase tracking-[.11em] text-white/72">illuminated days</p></div>
        <div className="border-x border-white/20"><p className="text-2xl font-semibold tracking-[-.06em]">{habits.length}</p><p className="mt-1 text-[7px] font-semibold uppercase tracking-[.11em] text-white/72">aurora ribbons</p></div>
        <div><p className="text-2xl font-semibold tracking-[-.06em]">{completedQuests.length}</p><p className="mt-1 text-[7px] font-semibold uppercase tracking-[.11em] text-white/72">discoveries</p></div>
      </section>

      {isStory && completedQuests.length > 0 && <section aria-label="Completed quest symbols" className="mt-2 flex h-8 items-center justify-center gap-6 text-[color-mix(in_srgb,var(--chart-primary)_70%,white)]">
        {completedQuests.slice(0, 4).map((quest) => <ActivityIcon activity={quest} className="size-5" key={quest} />)}
        {completedQuests.length > 4 && <span className="text-[8px] font-black tracking-[.1em] text-white/72">+{completedQuests.length - 4}</span>}
      </section>}

      {!isStory && <section className="mt-5">
        <div className="flex items-end justify-between"><p className="text-[8px] font-black uppercase tracking-[.18em] text-[color-mix(in_srgb,var(--chart-primary)_72%,white)]">Constellations discovered</p><p className="text-[7px] font-semibold uppercase tracking-[.11em] text-white/65">{completedQuests.length} mapped</p></div>
        <div className={`${isStory ? "mt-2 space-y-1.5" : "mt-3 grid grid-cols-2 gap-x-5 gap-y-2"}`}>{visibleQuests.length ? visibleQuests.map((quest) => <div className="grid grid-cols-[29px_1fr] items-center gap-2" key={quest}><span className={`${isStory ? "size-6" : "size-7"} grid place-items-center rounded-full border border-white/40 bg-[var(--chart-primary)]/20 text-white shadow-[0_0_8px_var(--chart-primary),0_0_22px_color-mix(in_srgb,var(--chart-primary)_55%,transparent)]`}><ActivityIcon activity={quest} className="size-4" /></span><p className="line-clamp-2 border-b border-white/25 pb-1.5 text-[8px] font-bold uppercase leading-tight text-white/95">{toAchievementTitle(quest)}</p></div>) : <p className="text-sm font-semibold text-white/82">The next constellation is still forming.</p>}{remainingQuests > 0 && <p className="col-span-full pt-1 text-[8px] font-bold uppercase tracking-[.11em] text-[color-mix(in_srgb,var(--chart-primary)_72%,white)]">+{remainingQuests} more discover{remainingQuests === 1 ? "y" : "ies"}</p>}</div>
      </section>}

      <footer className={`absolute ${isStory ? "inset-x-5 bottom-3" : "inset-x-7 bottom-4"} flex items-end justify-between border-t border-white/16 bg-[linear-gradient(180deg,transparent_0%,rgba(7,19,29,.72)_35%)] pt-2 text-[7px] font-semibold uppercase tracking-[.14em] text-white/72`}><span>A month written in light.</span><span className="text-xl font-black tracking-[-.08em] text-white/95">A.</span></footer>
    </div>
  </article>
  {/* The generated PNG is deliberately shown unchanged so the preview and shared file are identical. */}
  {/* eslint-disable-next-line @next/next/no-img-element */}
  {rasterUrl && <img alt="Aurora Sky share preview" aria-label="Aurora Sky share preview" className="absolute inset-0 z-10 size-full rounded-[26px] object-fill" data-share-raster="true" src={rasterUrl} />}
  </div>;
}
