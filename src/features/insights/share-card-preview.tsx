export type ShareFormat = "square" | "story";
export type ShareDesign = "orbit" | "passport" | "cover";

type ShareCardPreviewProps = {
  completedQuests: string[];
  consistency: number;
  daysShownUp: number;
  design: ShareDesign;
  format: ShareFormat;
  habitCount: number;
  monthName: string;
  year: number;
};

function serial(monthName: string, year: number, days: number) {
  return `${monthName.slice(0, 3).toUpperCase()}${String(year).slice(-2)}-${String(days).padStart(2, "0")}-ADV`;
}

export function ShareCardPreview({ completedQuests, consistency, daysShownUp, design, format, habitCount, monthName, year }: ShareCardPreviewProps) {
  const isStory = format === "story";
  const visibleQuests = completedQuests.slice(0, isStory ? 5 : 3);
  const shell = `${isStory ? "aspect-[9/16] w-full max-w-[310px]" : "aspect-square w-full max-w-[560px]"} relative overflow-hidden transition-all duration-500`;

  if (design === "passport") return <article aria-label="Rhythm Passport share preview" className={`${shell} rounded-[32px] border-[7px] border-[var(--chart-primary)] bg-[var(--chart-surface)] p-5 text-[var(--chart-deep)] shadow-[0_30px_70px_rgba(41,39,28,.28)] sm:p-7`}>
    <div className="absolute inset-2 rounded-[22px] border border-[var(--chart-deep)]/20" />
    <div className="absolute inset-x-0 top-0 h-[42%] bg-[var(--chart-deep)]" />
    <div className="absolute inset-x-0 top-[42%] border-t-2 border-dashed border-[var(--chart-deep)]/20" />
    <div className="absolute -right-16 -top-16 size-52 rounded-full border-[36px] border-white/10" />
    <div className="relative flex h-full flex-col">
      <header className="flex items-start justify-between text-white"><div><p className="text-[8px] font-black uppercase tracking-[.24em] text-[var(--chart-primary)]">Aduvia rhythm passport</p><p className="mt-1 text-[6px] uppercase tracking-[.16em] text-white/45">Proof of presence · not perfection</p></div><span className="rounded-full border border-white/20 px-2 py-1 text-[6px] font-black tracking-[.15em]">{serial(monthName, year, daysShownUp)}</span></header>
      <div className={`${isStory ? "mt-12" : "mt-6"} grid grid-cols-[.72fr_1.28fr] items-center gap-4 text-white`}><div className="relative grid aspect-square place-items-center rounded-full border border-white/15"><div className="absolute inset-2 rounded-full border-[6px] border-[var(--chart-primary)]" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${Math.max(12, consistency)}%, 0 ${Math.max(12, consistency)}%)` }} /><div className="text-center"><p className="text-4xl font-semibold tracking-[-.08em]">{consistency}%</p><p className="text-[6px] uppercase tracking-[.18em] text-white/45">consistent</p></div></div><div><p className="text-[7px] uppercase tracking-[.18em] text-white/40">Month of issue</p><p className="mt-1 text-2xl font-semibold">{monthName} {year}</p><div className="mt-4 grid grid-cols-2 gap-3"><div><p className="text-xl font-semibold text-[var(--chart-primary)]">{daysShownUp}</p><p className="text-[6px] text-white/45">days present</p></div><div><p className="text-xl font-semibold text-[var(--chart-primary)]">{habitCount}</p><p className="text-[6px] text-white/45">active rhythms</p></div></div></div></div>
      <section className={`${isStory ? "mt-16" : "mt-10"} relative flex-1`}><div className="flex items-end justify-between"><div><p className="text-[7px] font-black uppercase tracking-[.2em] text-[var(--chart-ink)]">Monthly visas</p><p className="mt-1 text-xl font-semibold">{completedQuests.length} quests landed</p></div><div className="grid size-12 place-items-center rounded-full border-2 border-[var(--chart-deep)]/25 text-center text-[6px] font-black uppercase leading-3 rotate-[-9deg]">Aduvia<br />verified</div></div><div className="mt-5 space-y-2">{visibleQuests.map((quest, index) => <div className="flex items-center gap-3 border-b border-[var(--chart-deep)]/12 pb-2" key={quest}><span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--chart-primary)] text-[10px] font-black">{String(index + 1).padStart(2, "0")}</span><p className="truncate text-[9px] font-bold">{quest}</p></div>)}</div></section>
      <footer className="relative mt-auto flex items-center justify-between border-t border-[var(--chart-deep)]/15 pt-3 text-[6px] uppercase tracking-[.16em] text-[var(--chart-ink)]"><span>Valid for one lived month</span><span>aduvia.app</span></footer>
    </div>
  </article>;

  if (design === "cover") return <article aria-label="Month Cover share preview" className={`${shell} rounded-[10px] bg-[var(--chart-primary)] p-5 text-[var(--chart-deep)] shadow-[14px_14px_0_var(--chart-deep)] sm:p-7`}>
    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(90deg,transparent 49.5%,currentColor 50%,transparent 50.5%),linear-gradient(transparent 49.5%,currentColor 50%,transparent 50.5%)", backgroundSize: "44px 44px" }} />
    <div className="relative flex h-full flex-col"><header className="flex items-start justify-between border-b-2 border-[var(--chart-deep)] pb-3"><div><p className="text-[8px] font-black uppercase tracking-[.28em]">Aduvia / issue {String(new Date().getMonth() + 1).padStart(2, "0")}</p><p className="mt-1 text-[6px] uppercase tracking-[.14em]">The month in motion</p></div><p className="text-right text-[8px] font-bold uppercase">{monthName}<br />{year}</p></header>
      <div className={`${isStory ? "mt-14" : "mt-6"}`}><p className={`${isStory ? "text-[112px]" : "text-[90px]"} font-black leading-[.72] tracking-[-.11em]`}>{consistency}</p><p className="mt-3 text-[10px] font-black uppercase tracking-[.42em]">percent rhythm</p></div>
      <div className={`${isStory ? "mt-16" : "mt-9"} grid grid-cols-[1fr_auto] gap-5 border-y-2 border-[var(--chart-deep)] py-4`}><p className="text-2xl font-semibold leading-[.9] tracking-[-.05em]">I showed up<br />{daysShownUp} times.</p><div className="flex gap-1">{Array.from({ length: 5 }, (_, index) => <span className={`w-2 rounded-full ${index < Math.ceil(consistency / 20) ? "bg-[var(--chart-deep)]" : "bg-[var(--chart-deep)]/15"}`} key={index} />)}</div></div>
      <section className={`${isStory ? "mt-12" : "mt-6"}`}><p className="text-[7px] font-black uppercase tracking-[.22em]">Quest headlines</p><div className="mt-3 space-y-2">{visibleQuests.length ? visibleQuests.map((quest, index) => <div className="grid grid-cols-[24px_1fr] gap-2" key={quest}><span className="text-[8px] font-black">0{index + 1}</span><p className="truncate border-b border-[var(--chart-deep)]/35 pb-2 text-[9px] font-bold uppercase">{quest}</p></div>) : <p className="text-lg font-semibold">The story is still being written.</p>}</div></section>
      <footer className="mt-auto flex items-end justify-between"><p className="max-w-[160px] text-[7px] font-bold uppercase leading-3 tracking-[.12em]">Small steps became visible proof.</p><p className="text-3xl font-black tracking-[-.08em]">A.</p></footer></div>
  </article>;

  return <article aria-label="Orbit Signal share preview" className={`${shell} rounded-[38px] bg-[linear-gradient(145deg,var(--chart-deep),color-mix(in_srgb,var(--chart-deep)_78%,var(--chart-green)))] p-6 text-white shadow-[0_30px_70px_rgba(20,61,49,.28)] sm:p-8`}>
    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-radial-gradient(ellipse at 25% 10%, transparent 0 15px, rgba(255,255,255,.055) 16px 17px)" }} />
    <div className="relative flex h-full flex-col"><header className="flex justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.21em] text-[var(--chart-primary)]">Aduvia</p><p className="text-[7px] uppercase tracking-[.14em] text-white/40">Monthly constellation</p></div><p className="text-right text-[8px] uppercase tracking-[.14em]">{monthName}<br /><span className="text-white/35">{year}</span></p></header>
      <div className={`${isStory ? "mt-14" : "mt-6"} relative grid flex-1 place-items-center`}><div className="absolute h-[36%] w-[78%] rotate-6 rounded-[50%] border border-white/15" /><div className="absolute h-[50%] w-[92%] -rotate-6 rounded-[50%] border border-white/12" /><div className="absolute h-[24%] w-[58%] -rotate-12 rounded-[50%] border border-white/18" />{Array.from({ length: 11 }, (_, index) => <i className="absolute size-1.5 rounded-full bg-[var(--chart-primary)] shadow-[0_0_10px_var(--chart-primary)]" key={index} style={{ left: `${12 + (index * 31) % 78}%`, top: `${18 + (index * 47) % 64}%` }} />)}<div className="relative grid size-28 place-items-center rounded-full bg-[var(--chart-deep)] p-[7px]" style={{ background: `conic-gradient(var(--chart-primary) ${consistency * 3.6}deg, rgba(255,255,255,.12) 0deg)` }}><div className="grid size-full place-items-center rounded-full bg-[var(--chart-deep)] text-center"><div><p className="text-3xl font-semibold tracking-[-.07em]">{consistency}%</p><p className="text-[6px] uppercase tracking-[.16em] text-white/45">rhythm signal</p></div></div></div></div>
      <section className="relative rounded-[22px] bg-[var(--chart-surface)] p-4 text-[var(--soft-ink)]"><div className="grid grid-cols-3 gap-2"><div><p className="text-2xl font-semibold">{daysShownUp}</p><p className="text-[7px] text-[var(--chart-ink)]">days in orbit</p></div><div><p className="text-2xl font-semibold">{habitCount}</p><p className="text-[7px] text-[var(--chart-ink)]">daily rituals</p></div><div><p className="text-2xl font-semibold">{completedQuests.length}</p><p className="text-[7px] text-[var(--chart-ink)]">quests landed</p></div></div></section>
      <footer className="relative mt-3 flex justify-between text-[6px] uppercase tracking-[.14em] text-white/35"><span>Issued {monthName} {year}</span><span>Visible proof</span></footer></div>
  </article>;
}
