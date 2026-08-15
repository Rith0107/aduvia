import { ActivityIcon } from "@/components/activity-icon";

import { toAchievementTitle } from "./achievement-title";

type MonthCoverPreviewProps = {
  completedQuests: string[];
  consistency: number;
  daysShownUp: number;
  format: "square" | "story";
  habitCount: number;
  monthName: string;
  year: number;
};

export function MonthCoverPreview({ completedQuests, consistency, daysShownUp, format, habitCount, monthName, year }: MonthCoverPreviewProps) {
  const isStory = format === "story";
  const isCompactQuestIndex = completedQuests.length > 3;
  // Story stacks quest rows in a single column (Square uses two), so each
  // extra row costs roughly twice the vertical space inside a card whose
  // height is fixed by its own aspect ratio. A generous cap here is exactly
  // what pushes the footer below the card's visible, clipped bounds.
  const visibleQuestLimit = isStory ? 3 : (completedQuests.length > 6 ? 5 : 6);
  const visibleQuests = completedQuests.slice(0, visibleQuestLimit);
  const remainingQuests = Math.max(0, completedQuests.length - visibleQuests.length);
  const shell = isStory ? "aspect-[9/16] w-full max-w-[310px]" : "aspect-square w-full max-w-[560px]";

  return <article aria-label="Month Cover share preview" className={`${shell} relative overflow-hidden rounded-[20px] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--chart-surface)_88%,var(--chart-blue)),var(--chart-surface))] p-5 text-[var(--chart-deep)] shadow-[11px_11px_0_var(--chart-deep)] transition-all duration-500 sm:p-7`}>
    <div className="absolute -right-[16%] -top-[15%] size-[58%] rounded-full border border-[var(--chart-rust)]/25" /><div className="absolute -right-[5%] -top-[4%] size-[36%] rounded-full border border-[var(--chart-rust)]/30" /><div className="absolute right-[5%] top-[6%] size-[17%] rounded-full border border-[var(--chart-rust)]/35" />
    <div className="absolute bottom-0 right-0 h-[34%] w-[42%] bg-[radial-gradient(circle_at_100%_100%,color-mix(in_srgb,var(--chart-blue)_20%,transparent),transparent_70%)]" />
    <div className="relative flex h-full flex-col"><header className="flex justify-between border-b border-[var(--chart-deep)]/40 pb-3"><div><p className="text-[8px] font-black uppercase tracking-[.22em]">Aduvia / issue {String(new Date().getMonth() + 1).padStart(2, "0")}</p><p className="mt-1 text-[6px] uppercase tracking-[.14em] text-[var(--chart-ink)]">The month in motion</p></div><p className="text-right text-[7px] font-bold uppercase">{monthName}<br />{year}</p></header>
      <div className={`${isStory ? (isCompactQuestIndex ? "mt-6" : "mt-12") : (isCompactQuestIndex ? "mt-4" : "mt-6")} grid grid-cols-[1fr_auto] items-end gap-6`}><div className="w-fit text-center"><p className={`${isStory ? "text-[5.5rem]" : "text-9xl"} font-black leading-[.82] tracking-[-.09em]`}>{consistency}</p><p className="mt-4 text-[6px] font-black uppercase tracking-[.2em] text-[var(--chart-rust)]">percent rhythm</p></div><div className="grid min-w-[92px] gap-4 border-l border-[var(--chart-deep)]/20 pl-4 text-center"><div><p className="text-3xl font-black leading-none tracking-[-.07em]">{daysShownUp}</p><p className="mt-2 text-[6px] font-black uppercase tracking-[.16em] text-[var(--chart-ink)]">days in orbit</p></div><div><p className="text-3xl font-black leading-none tracking-[-.07em]">{habitCount}</p><p className="mt-2 text-[6px] font-black uppercase tracking-[.16em] text-[var(--chart-ink)]">daily rituals</p></div></div></div>
      <div className={`${isStory ? (isCompactQuestIndex ? "mt-4" : "mt-8") : "mt-4"} flex items-end justify-between border-y border-[var(--chart-deep)]/35 ${isCompactQuestIndex ? "py-2.5" : "py-3"}`}><div><p className="text-[7px] font-black uppercase tracking-[.18em] text-[var(--chart-rust)]">Return note</p><p className={`${isCompactQuestIndex ? "mt-1.5 text-xl" : "mt-2 text-2xl"} font-semibold leading-[.92]`}>I showed up<br />{daysShownUp} times.</p></div><div className={`${isCompactQuestIndex ? "h-11" : "h-14"} flex items-end gap-1.5`}>{[48, 74, 58, 92, 68].map((value, index) => <i className="w-2 rounded-full bg-[var(--chart-blue)]" key={index} style={{ height: `${value}%`, opacity: .48 + index * .1 }} />)}</div></div>
      <section className={`${isStory ? (isCompactQuestIndex ? "mt-4" : "mt-10") : (isCompactQuestIndex ? "mt-4" : "mt-6")}`}><div className="flex items-end justify-between"><p className="text-[7px] font-black uppercase tracking-[.19em]">Quest index</p><p className="text-[7px] font-bold uppercase tracking-[.12em] text-[var(--chart-rust)]">{completedQuests.length} completed</p></div><div className={`${isCompactQuestIndex ? `mt-2.5 gap-x-4 gap-y-2 ${isStory ? "grid grid-cols-1" : "grid grid-cols-2"}` : "mt-3 space-y-2"}`}>{visibleQuests.length ? visibleQuests.map((quest) => { const achievementTitle = toAchievementTitle(quest); return <div className={`grid items-center gap-2 ${isCompactQuestIndex ? "grid-cols-[27px_1fr]" : "grid-cols-[34px_1fr]"}`} key={quest}><span className={`grid place-items-center rounded-full border border-[var(--chart-rust)]/35 bg-[var(--chart-rust)]/10 text-[var(--chart-rust)] ${isCompactQuestIndex ? "size-6" : "size-7"}`}><ActivityIcon activity={quest} className={isCompactQuestIndex ? "size-[14px]" : "size-[17px]"} /></span><p className={`border-b border-[var(--chart-deep)]/20 font-bold uppercase leading-tight ${isCompactQuestIndex ? "line-clamp-2 pb-1.5 text-[7px]" : "truncate pb-2 text-[8px]"}`}>{achievementTitle}</p></div>; }) : <p className="text-lg font-semibold">The story is still being written.</p>}{remainingQuests > 0 && <p className="col-span-full pt-1 text-[7px] font-bold uppercase tracking-[.12em] text-[var(--chart-rust)]">+{remainingQuests} more achievement{remainingQuests === 1 ? "" : "s"} in this issue</p>}</div></section>
      <footer className="mt-auto flex items-center justify-between text-[6px] uppercase tracking-[.15em] text-[var(--chart-ink)]"><span>Small steps became visible proof.</span><span className="text-2xl font-black tracking-[-.08em] text-[var(--chart-deep)]">A.</span></footer></div>
  </article>;
}
