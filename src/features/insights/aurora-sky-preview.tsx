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
  const visibleQuests = completedQuests.slice(0, isStory ? 3 : 4);
  const remainingQuests = Math.max(0, completedQuests.length - visibleQuests.length);
  const shell = isStory ? "aspect-[9/16] w-full max-w-[310px]" : "aspect-square w-full max-w-[560px]";

  return <article aria-label="Aurora Sky share preview" className={`${shell} relative overflow-hidden rounded-[26px] border border-white/25 bg-[linear-gradient(155deg,#07131d_0%,color-mix(in_srgb,var(--chart-deep)_72%,#081827)_54%,#09111f_100%)] text-white shadow-[0_28px_70px_rgba(3,10,18,.42),inset_0_0_0_1px_rgba(255,255,255,.06)]`}>
    <div className="absolute inset-0 opacity-65" style={{ backgroundImage: "radial-gradient(circle at 7% 5%, color-mix(in srgb,var(--chart-green) 42%,transparent),transparent 27%), radial-gradient(circle at 92% 72%, color-mix(in srgb,var(--chart-blue) 44%,transparent),transparent 41%), radial-gradient(circle at 48% 48%, color-mix(in srgb,var(--chart-primary) 10%,transparent),transparent 37%)" }} />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,8,15,.04),rgba(2,8,15,.22))]" />
    <div className="absolute inset-0 opacity-28" style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,.88) 0 1px,transparent 1.5px)", backgroundSize: "29px 29px" }} />
    <div className="absolute -left-[18%] top-[31%] h-[18%] w-[140%] -rotate-[8deg] rounded-[50%] opacity-75 blur-[15px]" style={{ background: "linear-gradient(90deg,transparent,color-mix(in srgb,var(--chart-green) 72%,transparent),color-mix(in srgb,var(--chart-primary) 78%,transparent),color-mix(in srgb,var(--chart-blue) 62%,transparent),transparent)", boxShadow: "0 0 42px color-mix(in srgb,var(--chart-primary) 52%,transparent)" }} />
    <div className="absolute -left-[22%] top-[38%] h-[10%] w-[145%] rotate-[5deg] rounded-[50%] opacity-55 blur-[10px]" style={{ background: "linear-gradient(90deg,transparent,color-mix(in srgb,var(--chart-blue) 75%,transparent),color-mix(in srgb,var(--chart-rust) 70%,transparent),transparent)" }} />

    <div className={`relative flex h-full flex-col ${isStory ? "px-5 pb-10 pt-5" : "px-7 pb-14 pt-7"}`}>
      <header className="flex items-start justify-between border-b border-white/25 pb-3">
        <div><p className="text-[9px] font-black uppercase tracking-[.21em] text-[color-mix(in_srgb,var(--chart-primary)_72%,white)]">Aduvia · {monthName} sky</p><p className="mt-1 text-[7px] font-medium uppercase tracking-[.15em] text-white/70">Monthly light record</p></div>
        <p className="text-right text-[8px] font-bold uppercase tracking-[.12em] text-white/88">{monthName}<br />{year}</p>
      </header>

      <section className={`${isStory ? "mt-3" : "mt-5 grid grid-cols-[.72fr_1.28fr] items-center gap-5"}`}>
        <div className={isStory ? "text-center" : ""}>
          <p className={`${isStory ? "text-[4rem]" : "text-[5.5rem]"} font-semibold leading-[.82] tracking-[-.09em]`}>{consistency}<span className="ml-1 text-2xl text-[var(--chart-primary)]">%</span></p>
          <p className={`${isStory ? "mt-2" : "mt-3"} text-[8px] font-black uppercase tracking-[.2em] text-white/78`}>rhythm glow</p>
          {!isStory && <p className="mt-4 max-w-[155px] text-[10px] font-medium leading-4 text-white/82">Your month left a calm signal in the sky.</p>}
        </div>

        <div aria-label={`${habits.length} habit auroras`} className={`relative overflow-hidden rounded-[24px] border border-white/10 bg-black/10 shadow-[inset_0_0_30px_rgba(0,0,0,.18)] ${isStory ? "mt-3 h-32" : "h-48"}`}>
          <div className="absolute inset-x-[-12%] top-[20%] h-[28%] -rotate-[7deg] rounded-[50%] opacity-85 blur-[9px]" style={{ background: "linear-gradient(90deg,transparent,color-mix(in srgb,var(--chart-green) 72%,transparent),color-mix(in srgb,var(--chart-primary) 84%,transparent),color-mix(in srgb,var(--chart-blue) 66%,transparent),transparent)", boxShadow: "0 0 30px color-mix(in srgb,var(--chart-primary) 42%,transparent)" }} />
          <div className="absolute inset-x-[-15%] top-[50%] h-[18%] rotate-[6deg] rounded-[50%] opacity-65 blur-[7px]" style={{ background: "linear-gradient(90deg,transparent,color-mix(in srgb,var(--chart-blue) 78%,transparent),color-mix(in srgb,var(--chart-rust) 72%,transparent),transparent)" }} />
          <div className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full p-[3px] shadow-[0_0_18px_var(--chart-primary),0_0_48px_color-mix(in_srgb,var(--chart-primary)_55%,transparent)]" style={{ background: `conic-gradient(var(--chart-primary) ${consistency * 3.6}deg,rgba(255,255,255,.13) 0deg)` }}><div className="grid size-full place-items-center rounded-full border border-white/12 bg-[color-mix(in_srgb,var(--chart-deep)_86%,transparent)] backdrop-blur-sm"><span className="size-2.5 rounded-full bg-white shadow-[0_0_8px_white,0_0_24px_var(--chart-primary)]" /></div></div>
          {habits.slice(0, 4).map((habit, index) => {
            const markerCount = Math.min(8, Math.max(3, habit.completedDays));
            return <div className="absolute left-1/2 top-1/2 h-[32%] rounded-[50%] border opacity-75" key={habit.name} style={{ borderColor: ribbonColors[index], boxShadow: `0 0 ${7 + index * 3}px ${ribbonColors[index]}`, transform: `translate(-50%,-50%) rotate(${index * 23 - 34}deg)`, width: `${56 + index * 12}%` }}>{Array.from({ length: markerCount }, (_, markerIndex) => { const position = (markerIndex + 1) / (markerCount + 1) * 100; return <i className="absolute size-1.5 rounded-full bg-white shadow-[0_0_7px_white,0_0_15px_var(--chart-primary)]" key={markerIndex} style={{ left: `${position}%`, opacity: .5 + markerIndex / markerCount * .5, top: markerIndex % 2 ? "4%" : "92%" }} />; })}</div>;
          })}
        </div>
      </section>

      <section className={`${isStory ? "mt-2 py-1.5" : "mt-4 py-3"} grid grid-cols-3 border-y border-white/18 text-center`}>
        <div><p className="text-2xl font-semibold tracking-[-.06em]">{daysShownUp}</p><p className="mt-1 text-[7px] font-semibold uppercase tracking-[.11em] text-white/72">illuminated days</p></div>
        <div className="border-x border-white/20"><p className="text-2xl font-semibold tracking-[-.06em]">{habits.length}</p><p className="mt-1 text-[7px] font-semibold uppercase tracking-[.11em] text-white/72">aurora ribbons</p></div>
        <div><p className="text-2xl font-semibold tracking-[-.06em]">{completedQuests.length}</p><p className="mt-1 text-[7px] font-semibold uppercase tracking-[.11em] text-white/72">discoveries</p></div>
      </section>

      <section className={`${isStory ? "mt-3" : "mt-5"}`}>
        <div className="flex items-end justify-between"><p className="text-[8px] font-black uppercase tracking-[.18em] text-[color-mix(in_srgb,var(--chart-primary)_72%,white)]">Constellations discovered</p><p className="text-[7px] font-semibold uppercase tracking-[.11em] text-white/65">{completedQuests.length} mapped</p></div>
        <div className={`${isStory ? "mt-2 space-y-1.5" : "mt-3 grid grid-cols-2 gap-x-5 gap-y-2"}`}>{visibleQuests.length ? visibleQuests.map((quest) => <div className="grid grid-cols-[29px_1fr] items-center gap-2" key={quest}><span className={`${isStory ? "size-6" : "size-7"} grid place-items-center rounded-full border border-white/40 bg-[var(--chart-primary)]/20 text-white shadow-[0_0_8px_var(--chart-primary),0_0_22px_color-mix(in_srgb,var(--chart-primary)_55%,transparent)]`}><ActivityIcon activity={quest} className="size-4" /></span><p className="line-clamp-2 border-b border-white/25 pb-1.5 text-[8px] font-bold uppercase leading-tight text-white/95">{toAchievementTitle(quest)}</p></div>) : <p className="text-sm font-semibold text-white/82">The next constellation is still forming.</p>}{remainingQuests > 0 && <p className="col-span-full pt-1 text-[8px] font-bold uppercase tracking-[.11em] text-[color-mix(in_srgb,var(--chart-primary)_72%,white)]">+{remainingQuests} more discover{remainingQuests === 1 ? "y" : "ies"}</p>}</div>
      </section>

      <footer className={`absolute ${isStory ? "inset-x-5 bottom-3" : "inset-x-7 bottom-4"} flex items-end justify-between border-t border-white/16 bg-[linear-gradient(180deg,transparent_0%,rgba(7,19,29,.72)_35%)] pt-2 text-[7px] font-semibold uppercase tracking-[.14em] text-white/72`}><span>A month written in light.</span><span className="text-xl font-black tracking-[-.08em] text-white/95">A.</span></footer>
    </div>
  </article>;
}
