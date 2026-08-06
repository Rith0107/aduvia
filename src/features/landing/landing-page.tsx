import Link from "next/link";
import { ArrowRight, CalendarCheck2, ChartNoAxesCombined, Check, MoonStar, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export function LandingPage() {
  return (
    <main className="landing-canvas min-h-screen overflow-hidden text-[#203029]">
      <header className="sticky top-0 z-50 border-b border-[#173f32]/8 bg-[#f3f3ec]/78 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 sm:px-9 lg:px-14">
          <BrandLogo />
          <nav aria-label="Landing page" className="hidden items-center gap-8 text-xs font-semibold text-[#5d6b64] md:flex"><a href="#why">Why Aduvia</a><a href="#how">How it works</a><a href="#month">Your month</a></nav>
          <div className="flex items-center gap-2"><Link className="hidden rounded-full px-4 py-2.5 text-xs font-bold text-[#32463d] transition hover:bg-white/55 sm:block" href="/login">Log in</Link><Link className="rounded-full bg-[#173f32] px-5 py-3 text-xs font-bold text-white shadow-[0_10px_24px_rgba(23,63,50,.18)] transition hover:-translate-y-0.5" href="/signup">Start your story</Link></div>
        </div>
      </header>

      <section className="relative mx-auto grid min-h-[760px] max-w-[1500px] items-center gap-14 px-5 py-20 sm:px-9 lg:grid-cols-[.9fr_1.1fr] lg:px-14 lg:py-28">
        <div className="pointer-events-none absolute -left-40 top-8 size-[500px] rounded-full bg-[#b8d7c7]/35 blur-3xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#efddd4] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a5d49]"><Sparkles size={13} />Progress without pressure</p>
          <h1 className="mt-8 max-w-2xl text-6xl font-semibold leading-[.9] tracking-[-0.075em] sm:text-7xl xl:text-[96px]">Make your days visible.</h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-[#6b7771]">Aduvia brings daily habits and meaningful monthly side quests into one calm place—so you can build consistency without turning life into a scoreboard.</p>
          <div className="mt-10 flex flex-wrap items-center gap-4"><Link className="group inline-flex items-center gap-5 rounded-full bg-[#173f32] py-2 pl-6 pr-2 text-sm font-bold text-white shadow-[0_18px_38px_rgba(23,63,50,.22)]" href="/signup">Begin for free<span className="grid size-11 place-items-center rounded-full bg-[#dfa145] text-[#173f32] transition group-hover:translate-x-0.5"><ArrowRight size={18} /></span></Link><Link className="text-sm font-semibold text-[#52635a] underline decoration-[#c47b60]/50 underline-offset-8" href="/login">I already have an account</Link></div>
          <div className="mt-10 flex items-center gap-5 text-xs text-[#78837d]"><div className="flex -space-x-2">{["#2f6f5e", "#a35f49", "#456c85"].map((color) => <span className="size-8 rounded-full border-2 border-[#eceee8]" key={color} style={{ backgroundColor: color }} />)}</div><span>No streak anxiety.<br />Just honest progress.</span></div>
        </div>

        <div className="relative mx-auto w-full max-w-[720px] lg:rotate-[1deg]">
          <div className="absolute -right-8 -top-8 size-40 rounded-full bg-[#d99b43]/22 blur-2xl" />
          <div className="relative overflow-hidden rounded-[38px] border border-white/75 bg-[#f8f6ef]/88 p-5 shadow-[0_40px_100px_rgba(28,55,44,.2)] backdrop-blur-xl sm:p-8">
            <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a86f5b]">Tuesday · August 6</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">A gentle day in motion.</h2></div><span className="grid size-11 place-items-center rounded-full bg-[#e4eee8] text-[#2f6f5e]"><MoonStar size={19} /></span></div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">{[["Morning walk", "30 min", "#dcebe4", true], ["Deep work", "90 min", "#f0ddd4", true], ["Read", "20 pages", "#dfe8ee", false], ["Meditate", "10 min", "#eee6d5", false]].map(([name, target, color, done]) => <div className="flex items-center gap-4 rounded-[22px] border border-white/70 p-4" key={String(name)} style={{ background: String(color) }}><span className={`grid size-10 place-items-center rounded-full ${done ? "bg-[#173f32] text-white" : "border border-[#173f32]/15 text-transparent"}`}><Check size={17} /></span><div><p className={`font-semibold ${done ? "text-[#68736d] line-through" : ""}`}>{name}</p><p className="mt-1 text-xs text-[#7b8680]">{target}</p></div></div>)}</div>
            <div className="mt-5 grid gap-4 rounded-[26px] bg-[#173f32] p-6 text-white sm:grid-cols-[auto_1fr] sm:items-center"><div className="grid size-28 place-items-center rounded-full p-[7px]" style={{ background: "conic-gradient(#d99b43 255deg,rgba(255,255,255,.1) 0deg)" }}><div className="grid size-full place-items-center rounded-full bg-[#173f32] text-center"><span className="text-3xl font-semibold">71%</span></div></div><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#e6ba70]">Today’s signal</p><p className="mt-3 text-2xl font-semibold">Showing up counts.</p><p className="mt-2 text-sm text-white/45">Two rituals complete. Two gentle choices remain.</p></div></div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#173f32]/8 bg-[#173f32] text-white" id="why">
        <div className="mx-auto grid max-w-[1500px] gap-14 px-5 py-24 sm:px-9 lg:grid-cols-[.8fr_1.2fr] lg:px-14 lg:py-32">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e2b96c]">Why Aduvia</p><h2 className="mt-5 text-5xl font-semibold leading-[.96] tracking-[-0.06em] sm:text-6xl">Most trackers count streaks.<br />We help you understand your life.</h2></div>
          <div className="divide-y divide-white/10 border-y border-white/10">{[[CalendarCheck2, "Daily rhythm", "Log what happened in seconds, even when you are tired."], [Sparkles, "Monthly side quests", "Keep meaningful one-off goals beside the routines that support them."], [ChartNoAxesCombined, "Insight, not judgement", "See patterns, balance, and momentum without treating one missed day as failure."]].map(([Icon, title, copy], index) => { const FeatureIcon = Icon as typeof CalendarCheck2; return <div className="grid gap-4 py-7 sm:grid-cols-[60px_1fr_auto] sm:items-center" key={String(title)}><span className="grid size-11 place-items-center rounded-full bg-white/8 text-[#e2b96c]"><FeatureIcon size={20} strokeWidth={1.7} /></span><div><h3 className="text-xl font-semibold">{title as string}</h3><p className="mt-2 text-sm leading-6 text-white/45">{copy as string}</p></div><span className="text-xs text-white/25">0{index + 1}</span></div>; })}</div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-24 sm:px-9 lg:px-14 lg:py-32" id="how">
        <div className="grid gap-14 lg:grid-cols-[.7fr_1.3fr]"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a86f5b]">How it works</p><h2 className="mt-5 text-5xl font-semibold tracking-[-0.06em]">Three moments.<br />One honest month.</h2></div><ol className="grid gap-8 sm:grid-cols-3">{[["01", "Choose your rhythm", "Create the few habits that genuinely shape your days."], ["02", "Close the day", "Tap done or incomplete in a check-in designed for tired evenings."], ["03", "See the pattern", "Review consistency, balance, and every side quest you completed."]].map(([number, title, copy]) => <li className="border-t border-[#173f32]/16 pt-5" key={number}><span className="text-xs font-bold text-[#d18c72]">{number}</span><h3 className="mt-10 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-[#748079]">{copy}</p></li>)}</ol></div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 pb-24 sm:px-9 lg:px-14 lg:pb-32" id="month">
        <div className="relative overflow-hidden rounded-[40px] bg-[#e7d9cd] px-7 py-14 sm:px-12 lg:grid lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-20 lg:py-20">
          <div className="absolute -right-28 -top-28 size-80 rounded-full border-[58px] border-[#a86f5b]/10" />
          <div className="relative"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9a5d49]">A report worth keeping</p><h2 className="mt-5 text-5xl font-semibold leading-[.96] tracking-[-0.06em]">Your month becomes a story you can see—and share.</h2><p className="mt-6 max-w-xl text-base leading-7 text-[#74665e]">Celebrate consistency and completed quests with a polished monthly recap. Private notes and missed-day details stay private.</p></div>
          <div className="relative mt-12 grid grid-cols-[1fr_auto] items-end gap-5 lg:mt-0 lg:pl-16"><div className="rounded-[30px] bg-[#173f32] p-7 text-white shadow-[0_24px_55px_rgba(23,63,50,.2)]"><p className="text-[9px] uppercase tracking-[.18em] text-[#e2b96c]">August proof</p><p className="mt-7 text-6xl font-semibold tracking-[-.07em]">71%</p><p className="text-xs text-white/40">monthly consistency</p><div className="mt-8 border-t border-white/10 pt-5"><p className="text-xs text-[#e2b96c]">2 side quests cleared</p><p className="mt-3 text-sm">✓ Built my portfolio</p><p className="mt-2 text-sm">✓ Created a monthly budget</p></div></div><div className="hidden h-48 w-20 rounded-full border border-[#173f32]/15 sm:block" /></div>
        </div>
      </section>

      <section className="bg-[#dfeae4] px-5 py-24 text-center"><BrandLogo className="justify-center" href="/" /><h2 className="mx-auto mt-8 max-w-3xl text-5xl font-semibold tracking-[-0.06em] sm:text-6xl">Your next month will happen anyway.<br />Make it visible.</h2><Link className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#173f32] px-7 py-4 text-sm font-bold text-white" href="/signup">Create your Aduvia <ArrowRight size={17} /></Link></section>

      <footer className="bg-[#173f32] text-white"><div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-5 py-8 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between sm:px-9 lg:px-14"><BrandLogo inverse /><p>Build gently. Finish meaningfully.</p><div className="flex gap-5"><Link href="/login">Log in</Link><Link href="/signup">Sign up</Link></div></div></footer>
    </main>
  );
}
