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

const ribbonColors = ["var(--chart-primary)", "var(--chart-blue)", "var(--chart-green)", "var(--chart-rust)"];

export function AuroraSkyPreview({ completedQuests, consistency, daysShownUp, format, habits, monthName, year }: AuroraSkyPreviewProps) {
  const isStory = format === "story";
  const visibleQuests = completedQuests.slice(0, isStory ? 5 : 4);
  const remainingQuests = Math.max(0, completedQuests.length - visibleQuests.length);
  const shell = isStory ? "aspect-[9/16] w-full max-w-[310px]" : "aspect-square w-full max-w-[560px]";

  return <article aria-label="Aurora Sky share preview" className={`${shell} relative overflow-hidden rounded-[26px] border border-white/20 bg-[linear-gradient(155deg,color-mix(in_srgb,var(--chart-deep)_92%,#07131c),color-mix(in_srgb,var(--chart-blue)_62%,var(--chart-deep)))] text-white shadow-[0_28px_70px_color-mix(in_srgb,var(--chart-deep)_42%,transparent)]`}>
    <div className="absolute inset-0 opacity-55" style={{ backgroundImage: "radial-gradient(circle at 10% 8%, color-mix(in srgb,var(--chart-primary) 34%,transparent),transparent 29%), radial-gradient(circle at 94% 68%, color-mix(in srgb,var(--chart-blue) 46%,transparent),transparent 42%)" }} />
    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,.75) 0 1px,transparent 1.4px)", backgroundSize: "31px 31px" }} />

    <div className={`relative flex h-full flex-col ${isStory ? "px-5 pb-6 pt-7" : "p-7"}`}>
      <header className="flex items-start justify-between border-b border-white/18 pb-3">
        <div><p className="text-[8px] font-black uppercase tracking-[.24em] text-[var(--chart-primary)]">Aduvia · {monthName} sky</p><p className="mt-1 text-[6px] uppercase tracking-[.17em] text-white/48">Monthly light record</p></div>
        <p className="text-right text-[7px] font-bold uppercase tracking-[.13em] text-white/72">{monthName}<br />{year}</p>
      </header>

      <section className={`${isStory ? "mt-7" : "mt-5 grid grid-cols-[.72fr_1.28fr] items-center gap-5"}`}>
        <div className={isStory ? "text-center" : ""}>
          <p className={`${isStory ? "text-[5.75rem]" : "text-[5.5rem]"} font-semibold leading-[.82] tracking-[-.09em]`}>{consistency}<span className="ml-1 text-2xl text-[var(--chart-primary)]">%</span></p>
          <p className="mt-3 text-[7px] font-black uppercase tracking-[.23em] text-white/52">rhythm glow</p>
          <p className={`${isStory ? "mx-auto mt-4 max-w-[190px]" : "mt-4 max-w-[145px]"} text-[9px] leading-4 text-white/68`}>Your month left a calm signal in the sky.</p>
        </div>

        <div aria-label={`${habits.length} habit auroras`} className={`relative overflow-hidden ${isStory ? "mt-7 h-52" : "h-48"}`}>
          <div className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--chart-deep)] p-[5px] shadow-[0_0_35px_color-mix(in_srgb,var(--chart-primary)_30%,transparent)]" style={{ background: `conic-gradient(var(--chart-primary) ${consistency * 3.6}deg,rgba(255,255,255,.13) 0deg)` }}><div className="grid size-full place-items-center rounded-full bg-[var(--chart-deep)]"><span className="size-2 rounded-full bg-[var(--chart-primary)] shadow-[0_0_20px_var(--chart-primary)]" /></div></div>
          {habits.slice(0, 4).map((habit, index) => {
            const markerCount = Math.min(8, Math.max(3, habit.completedDays));
            return <div className="absolute left-1/2 top-1/2 h-[32%] rounded-[50%] border opacity-70" key={habit.name} style={{ borderColor: ribbonColors[index], boxShadow: `0 0 ${12 + index * 5}px ${ribbonColors[index]}`, transform: `translate(-50%,-50%) rotate(${index * 23 - 34}deg)`, width: `${56 + index * 12}%` }}>{Array.from({ length: markerCount }, (_, markerIndex) => { const position = (markerIndex + 1) / (markerCount + 1) * 100; return <i className="absolute size-1.5 rounded-full bg-white shadow-[0_0_8px_white]" key={markerIndex} style={{ left: `${position}%`, opacity: .42 + markerIndex / markerCount * .5, top: markerIndex % 2 ? "4%" : "92%" }} />; })}</div>;
          })}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/12 bg-white/[.06] px-3 py-1.5 text-[6px] font-bold uppercase tracking-[.16em] text-white/55">Each ribbon is a daily ritual</div>
        </div>
      </section>

      <section className={`${isStory ? "mt-5" : "mt-4"} grid grid-cols-3 border-y border-white/18 py-3 text-center`}>
        <div><p className="text-2xl font-semibold tracking-[-.06em]">{daysShownUp}</p><p className="mt-1 text-[6px] uppercase tracking-[.14em] text-white/46">illuminated days</p></div>
        <div className="border-x border-white/14"><p className="text-2xl font-semibold tracking-[-.06em]">{habits.length}</p><p className="mt-1 text-[6px] uppercase tracking-[.14em] text-white/46">aurora ribbons</p></div>
        <div><p className="text-2xl font-semibold tracking-[-.06em]">{completedQuests.length}</p><p className="mt-1 text-[6px] uppercase tracking-[.14em] text-white/46">discoveries</p></div>
      </section>

      <section className={`${isStory ? "mt-7" : "mt-5"}`}>
        <div className="flex items-end justify-between"><p className="text-[7px] font-black uppercase tracking-[.21em] text-[var(--chart-primary)]">Constellations discovered</p><p className="text-[6px] uppercase tracking-[.13em] text-white/40">{completedQuests.length} mapped</p></div>
        <div className={`${isStory ? "mt-3 space-y-2" : "mt-3 grid grid-cols-2 gap-x-5 gap-y-2"}`}>{visibleQuests.length ? visibleQuests.map((quest) => <div className="grid grid-cols-[29px_1fr] items-center gap-2" key={quest}><span className="grid size-7 place-items-center rounded-full border border-[var(--chart-primary)]/40 bg-[var(--chart-primary)]/12 text-[var(--chart-primary)] shadow-[0_0_14px_color-mix(in_srgb,var(--chart-primary)_18%,transparent)]"><ActivityIcon activity={quest} className="size-4" /></span><p className="line-clamp-2 border-b border-white/14 pb-1.5 text-[7px] font-bold uppercase leading-tight text-white/82">{toAchievementTitle(quest)}</p></div>) : <p className="text-sm font-semibold text-white/72">The next constellation is still forming.</p>}{remainingQuests > 0 && <p className="col-span-full pt-1 text-[7px] font-bold uppercase tracking-[.12em] text-[var(--chart-primary)]">+{remainingQuests} more discover{remainingQuests === 1 ? "y" : "ies"}</p>}</div>
      </section>

      <footer className="mt-auto flex items-end justify-between text-[6px] uppercase tracking-[.16em] text-white/38"><span>A month written in light.</span><span className="text-xl font-black tracking-[-.08em] text-white/78">A.</span></footer>
    </div>
  </article>;
}
