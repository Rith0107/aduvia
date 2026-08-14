import { ActivityIcon } from "@/components/activity-icon";

type ArtifactDraft = "field-notes" | "almanac" | "atlas";

type ArtifactDraftPreviewProps = {
  completedQuests: string[];
  consistency: number;
  daysShownUp: number;
  format: "square" | "story";
  habitCount: number;
  monthName: string;
  variant: ArtifactDraft;
  year: number;
};

function QuestRows({ quests }: { quests: string[] }) {
  return <div className="space-y-2">{quests.slice(0, 4).map((quest) => <div className="grid grid-cols-[30px_1fr] items-center gap-2" key={quest}><span className="grid size-7 place-items-center rounded-full border border-current/20"><ActivityIcon activity={quest} className="size-4" /></span><p className="truncate border-b border-current/15 pb-2 text-[8px] font-bold uppercase tracking-[.04em]">{quest}</p></div>)}</div>;
}

export function ArtifactDraftPreview({ completedQuests, consistency, daysShownUp, format, habitCount, monthName, variant, year }: ArtifactDraftPreviewProps) {
  const story = format === "story";
  const shell = story ? "aspect-[9/16] w-full max-w-[310px]" : "aspect-square w-full max-w-[560px]";
  const quests = completedQuests.length ? completedQuests : ["Your next side quest"];

  if (variant === "field-notes") return <article aria-label="Aduvia Field Notes share preview" data-share-preview className={`${shell} relative overflow-hidden rounded-[13px] bg-[var(--chart-surface)] p-6 text-[var(--chart-deep)] shadow-[10px_10px_0_color-mix(in_srgb,var(--chart-ink)_40%,transparent)]`}>
    <div className="absolute inset-y-0 left-10 border-l border-[var(--chart-rust)]/25" /><div className="absolute inset-0 opacity-25" style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent 0 31px,var(--chart-blue) 32px 33px)" }} />
    <div className="relative ml-5 flex h-full flex-col"><header className="flex items-start justify-between"><div><p className="text-[7px] font-black uppercase tracking-[.24em] text-[var(--chart-rust)]">Aduvia field notes</p><p className="mt-2 text-2xl font-semibold">Observations on<br />showing up.</p></div><p className="text-right text-[7px] font-bold uppercase tracking-[.12em]">No. {String(new Date().getMonth() + 1).padStart(2, "0")}<br />{monthName} {year}</p></header>
      <div className={`${story ? "mt-16" : "mt-8"} grid grid-cols-3 border-y border-[var(--chart-deep)]/30 py-5 text-center`}><div><strong className="text-4xl">{consistency}</strong><p className="text-[6px] uppercase tracking-[.15em]">rhythm</p></div><div className="border-x border-[var(--chart-deep)]/20"><strong className="text-4xl">{daysShownUp}</strong><p className="text-[6px] uppercase tracking-[.15em]">days noted</p></div><div><strong className="text-4xl">{habitCount}</strong><p className="text-[6px] uppercase tracking-[.15em]">rituals</p></div></div>
      <div className={`${story ? "mt-12" : "mt-7"}`}><p className="text-[7px] font-black uppercase tracking-[.2em] text-[var(--chart-rust)]">Margin note</p><p className="mt-3 text-3xl font-semibold leading-none">Small repetitions<br />became evidence.</p></div>
      <section className={`${story ? "mt-14" : "mt-8"}`}><div className="mb-3 flex justify-between text-[7px] font-black uppercase tracking-[.16em]"><span>Quest observations</span><span>{completedQuests.length} found</span></div><QuestRows quests={quests} /></section>
      <footer className="mt-auto flex justify-between text-[6px] uppercase tracking-[.16em]"><span>Private record · visible growth</span><b>A.</b></footer></div>
  </article>;

  if (variant === "almanac") return <article aria-label="Rhythm Almanac share preview" data-share-preview className={`${shell} relative overflow-hidden rounded-[160px_160px_22px_22px] bg-[var(--chart-deep)] p-6 text-[var(--chart-surface)] shadow-[10px_10px_0_var(--chart-primary)]`}>
    <div className="absolute left-1/2 top-0 size-[92%] -translate-x-1/2 -translate-y-[45%] rounded-full border-[18px] border-[var(--chart-primary)]/20" />
    <div className="relative flex h-full flex-col text-center"><header><p className="text-[7px] font-black uppercase tracking-[.28em] text-[var(--chart-primary)]">The rhythm almanac</p><p className="mt-2 text-[8px] uppercase tracking-[.18em] text-white/55">Monthly edition · {monthName} {year}</p></header>
      <div className={`${story ? "mt-14" : "mt-8"}`}><p className="text-[7rem] font-black leading-[.8] tracking-[-.1em]">{consistency}</p><p className="mt-4 text-[7px] font-black uppercase tracking-[.25em] text-[var(--chart-primary)]">steadiness index</p></div>
      <div className={`${story ? "mt-12" : "mt-7"} grid grid-cols-3 border-y border-white/20 py-5`}><div><strong className="text-3xl">{daysShownUp}</strong><p className="text-[6px] uppercase tracking-[.14em] text-white/50">days in season</p></div><div className="border-x border-white/15"><strong className="text-3xl">{habitCount}</strong><p className="text-[6px] uppercase tracking-[.14em] text-white/50">daily rhythms</p></div><div><strong className="text-3xl">{completedQuests.length}</strong><p className="text-[6px] uppercase tracking-[.14em] text-white/50">quests reaped</p></div></div>
      <section className={`${story ? "mt-12" : "mt-7"} text-left`}><p className="mb-4 text-center text-[7px] font-black uppercase tracking-[.22em] text-[var(--chart-primary)]">Notable findings</p><QuestRows quests={quests} /></section>
      <footer className="mt-auto border-t border-white/15 pt-3 text-[6px] uppercase tracking-[.2em] text-white/45">A calm record of the month that was</footer></div>
  </article>;

  return <article aria-label="Aduvia Atlas share preview" data-share-preview className={`${shell} relative overflow-hidden rounded-[28px] bg-[linear-gradient(145deg,var(--chart-blue),var(--chart-deep))] p-6 text-white shadow-[10px_10px_0_var(--chart-rust)]`}>
    <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle,currentColor 1px,transparent 1px)", backgroundSize: "22px 22px" }} /><div className="absolute -right-[28%] top-[16%] size-[78%] rounded-full border border-white/20" /><div className="absolute -right-[12%] top-[28%] size-[48%] rounded-full border border-[var(--chart-primary)]/45" />
    <div className="relative flex h-full flex-col"><header className="flex justify-between border-b border-white/25 pb-3"><div><p className="text-[7px] font-black uppercase tracking-[.26em] text-[var(--chart-primary)]">Aduvia atlas</p><p className="mt-1 text-[6px] uppercase tracking-[.16em] text-white/50">Routes through a month</p></div><p className="text-right text-[7px] font-bold uppercase">{monthName}<br />{year}</p></header>
      <div className={`${story ? "mt-14" : "mt-8"} grid grid-cols-[1.2fr_.8fr] items-end`}><div><p className="text-7xl font-black leading-none">{consistency}</p><p className="mt-2 text-[7px] font-black uppercase tracking-[.2em] text-[var(--chart-primary)]">route completion</p></div><div className="space-y-4 border-l border-white/20 pl-4"><p><b className="text-3xl">{daysShownUp}</b><span className="block text-[6px] uppercase tracking-[.15em] text-white/55">days travelled</span></p><p><b className="text-3xl">{habitCount}</b><span className="block text-[6px] uppercase tracking-[.15em] text-white/55">active routes</span></p></div></div>
      <div className={`${story ? "my-14 h-28" : "my-7 h-20"} relative`}><svg className="size-full" viewBox="0 0 260 80" aria-hidden="true"><path d="M8 64 C45 9 82 70 120 34 S196 13 252 48" fill="none" stroke="var(--chart-primary)" strokeDasharray="3 5" strokeWidth="2" />{[8,70,120,184,252].map((x, index) => <circle cx={x} cy={[64,36,34,23,48][index]} fill="var(--chart-surface)" key={x} r={index === 4 ? 6 : 4} />)}</svg></div>
      <section><div className="mb-4 flex justify-between text-[7px] font-black uppercase tracking-[.18em]"><span>Destinations reached</span><span>{completedQuests.length}</span></div><QuestRows quests={quests} /></section>
      <footer className="mt-auto flex justify-between text-[6px] uppercase tracking-[.18em] text-white/45"><span>Every return redraws the map</span><b className="text-white">A.</b></footer></div>
  </article>;
}
