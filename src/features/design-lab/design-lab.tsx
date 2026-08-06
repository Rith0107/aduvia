"use client";

import Link from "next/link";
import { useState } from "react";
import { ActivityIcon } from "@/components/activity-icon";

type Direction = "orbit" | "tidal" | "studio" | "aurora" | "editorial" | "soft";
type SoftPalette = "forest" | "coastal" | "clay";

const directions: Array<{ id: Direction; label: string; note: string }> = [
  { id: "orbit", label: "Orbital Calm", note: "Flowing editorial system" },
  { id: "tidal", label: "Tidal Focus", note: "Fluid guided pathway" },
  { id: "studio", label: "Rhythm Studio", note: "Expressive type system" },
  { id: "aurora", label: "Midnight Aurora", note: "Atmospheric timeline" },
  { id: "editorial", label: "Solar Editorial", note: "Bold structured print" },
  { id: "soft", label: "Soft Digital", note: "Gentle spatial canvas" },
];

const softPalettes = {
  forest: { label: "Forest Dawn", base: "#e8eee7", ink: "#20372e", accent: "#d5a75b", glowA: "#bedbc9", glowB: "#efd5c1", cards: ["#cfe2d4", "#f0dfb9", "#f7f3e9", "#ead7cf"] },
  coastal: { label: "Coastal Quiet", base: "#e5edef", ink: "#18324a", accent: "#d88467", glowA: "#badfd8", glowB: "#c8d6ef", cards: ["#cce3de", "#f3d8c8", "#dbe6f3", "#edf1ec"] },
  clay: { label: "Clay & Moss", base: "#ede6d8", ink: "#34382d", accent: "#a85c45", glowA: "#c8d2a7", glowB: "#e1ad91", cards: ["#dce2c7", "#eac7b5", "#f4eddf", "#d4d7bc"] },
} satisfies Record<SoftPalette, { label: string; base: string; ink: string; accent: string; glowA: string; glowB: string; cards: string[] }>;

const habits = [
  { time: "07:00", name: "Morning walk", detail: "30 minutes", done: true },
  { time: "09:30", name: "Deep work", detail: "90 minutes", done: true },
  { time: "18:00", name: "Read", detail: "20 pages", done: false },
  { time: "21:30", name: "Meditate", detail: "10 minutes", done: false },
];

function AuroraDirection() {
  return (
    <section className="min-h-[760px] overflow-hidden rounded-[32px] bg-[#090d25] text-[#f2f1ff] shadow-2xl">
      <div className="grid min-h-[760px] lg:grid-cols-[88px_minmax(0,1fr)_330px]">
        <aside className="flex flex-row items-center justify-between border-b border-white/10 bg-[#0d1230] p-5 lg:flex-col lg:border-b-0 lg:border-r">
          <span className="grid size-11 place-items-center rounded-full bg-[#b9ff66] font-black text-[#090d25]">Q</span>
          <nav className="flex gap-3 lg:flex-col" aria-label="Aurora concept navigation">{["⌂", "✓", "◇", "↗"].map((icon, index) => <button aria-label={`Concept navigation ${index + 1}`} className={`grid size-10 place-items-center rounded-full text-lg ${index === 0 ? "bg-white text-[#090d25]" : "text-white/35 hover:bg-white/10"}`} key={icon} type="button">{icon}</button>)}</nav>
          <span className="hidden size-9 rounded-full bg-gradient-to-br from-[#ff6b9d] to-[#8f7cff] lg:block" />
        </aside>

        <div className="relative px-6 py-9 sm:px-10 lg:px-14 lg:py-12">
          <div className="pointer-events-none absolute right-0 top-0 size-[420px] rounded-full bg-[#6d4aff]/20 blur-[110px]" />
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8f9aff]">Tuesday · August 5</p>
          <h1 className="relative mt-5 max-w-xl text-5xl font-medium leading-[0.96] tracking-[-0.055em] sm:text-7xl">Move gently.<br /><span className="text-[#b9ff66]">Finish clearly.</span></h1>
          <div className="relative mt-14 max-w-2xl">
            <span className="absolute bottom-6 left-[51px] top-6 w-px bg-gradient-to-b from-[#b9ff66] via-[#8f7cff] to-white/10" />
            {habits.map((habit) => (
              <article className="group relative grid grid-cols-[42px_1fr_auto] items-center gap-5 py-5" key={habit.name}>
                <button aria-label={`${habit.done ? "Undo" : "Complete"} ${habit.name}`} className={`relative z-10 grid size-[42px] place-items-center rounded-full border ${habit.done ? "border-[#b9ff66] bg-[#b9ff66] text-[#090d25]" : "border-white/20 bg-[#090d25] text-transparent group-hover:border-[#8f7cff]"}`} type="button">✓</button>
                <div><p className={`text-lg font-medium ${habit.done ? "text-white/38 line-through" : ""}`}>{habit.name}</p><p className="mt-1 text-sm text-white/32">{habit.detail}</p></div>
                <span className="font-mono text-xs text-white/28">{habit.time}</span>
              </article>
            ))}
          </div>
        </div>

        <aside className="relative border-t border-white/10 bg-[#0d1230]/70 p-7 backdrop-blur-xl lg:border-l lg:border-t-0 lg:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">Tonight’s signal</p>
          <div className="relative mx-auto mt-10 grid aspect-square max-w-[230px] place-items-center rounded-full border border-white/10 bg-[conic-gradient(#b9ff66_0_63%,#222847_63%)]">
            <div className="grid size-[78%] place-items-center rounded-full bg-[#0d1230] text-center"><div><p className="text-5xl font-light">63</p><p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/30">momentum</p></div></div>
          </div>
          <div className="mt-10 border-t border-white/10 pt-7"><p className="text-xs uppercase tracking-[0.18em] text-[#ff8db4]">Side quest</p><p className="mt-3 text-xl leading-7">Ship the portfolio homepage</p><div className="mt-6 flex items-center gap-3"><div className="h-1 flex-1 rounded-full bg-white/10"><div className="h-full w-3/5 bg-[#ff8db4]" /></div><span className="text-xs text-white/40">60%</span></div></div>
          <button className="absolute bottom-8 left-8 right-8 rounded-full bg-[#b9ff66] py-4 text-sm font-bold text-[#090d25]" type="button">Close the day</button>
        </aside>
      </div>
    </section>
  );
}

function EditorialDirection() {
  return (
    <section className="min-h-[760px] overflow-hidden rounded-none border-[3px] border-[#172458] bg-[#fff9df] text-[#172458] shadow-[14px_14px_0_#ff5d48] sm:rounded-[4px]">
      <header className="grid border-b-[3px] border-[#172458] md:grid-cols-[1fr_auto]">
        <div className="bg-[#2450d8] px-6 py-7 text-[#fff9df] sm:px-10"><div className="flex items-center justify-between"><p className="text-sm font-black uppercase tracking-[0.22em]">Aduvia / 05</p><p className="text-xs font-bold">AUGUST 2026</p></div><h1 className="mt-10 max-w-4xl text-5xl font-black uppercase leading-[0.87] tracking-[-0.06em] sm:text-8xl">Today is<br />a field note.</h1></div>
        <div className="grid min-w-64 grid-cols-2 md:grid-cols-1"><div className="grid place-items-center border-r-[3px] border-[#172458] bg-[#ffe441] p-8 md:border-b-[3px] md:border-r-0"><p className="text-center text-6xl font-black">50<span className="text-2xl">%</span></p></div><div className="grid place-items-center bg-[#ff5d48] p-8 text-[#fff9df]"><p className="text-center text-xs font-black uppercase tracking-[0.18em]">2 of 4<br />complete</p></div></div>
      </header>
      <div className="grid lg:grid-cols-[1fr_310px]">
        <div>
          <div className="grid grid-cols-[70px_1fr_110px] border-b-[3px] border-[#172458] bg-[#ffe441] px-5 py-3 text-xs font-black uppercase tracking-[0.15em]"><span>No.</span><span>Daily action</span><span>Status</span></div>
          {habits.map((habit, index) => <article className="grid grid-cols-[70px_1fr_110px] items-center border-b-[3px] border-[#172458] px-5 py-5" key={habit.name}><span className="text-3xl font-black text-[#2450d8]">0{index + 1}</span><div><h2 className="text-xl font-black uppercase tracking-[-0.03em]">{habit.name}</h2><p className="mt-1 text-xs font-bold opacity-50">{habit.detail} / {habit.time}</p></div><button className={`h-11 border-2 border-[#172458] text-xs font-black uppercase ${habit.done ? "bg-[#2450d8] text-white" : "bg-transparent"}`} type="button">{habit.done ? "Done" : "Log"}</button></article>)}
        </div>
        <aside className="border-l-0 border-[#172458] lg:border-l-[3px]"><div className="bg-[#ff5d48] p-7 text-[#fff9df]"><p className="text-xs font-black uppercase tracking-[0.18em]">Monthly quest</p><p className="mt-4 text-3xl font-black uppercase leading-8">Build the portfolio.</p></div><div className="p-7"><p className="text-xs font-black uppercase tracking-[0.18em]">Daily note</p><p className="mt-8 border-b-2 border-[#172458] pb-3 text-sm opacity-50">Write one honest line...</p><button className="mt-10 w-full bg-[#172458] py-4 text-xs font-black uppercase tracking-[0.15em] text-[#fff9df]" type="button">Save and finish →</button></div></aside>
      </div>
    </section>
  );
}

function SoftDirection({ palette }: { palette: SoftPalette }) {
  const colors = softPalettes[palette];
  return (
    <section className="relative min-h-[760px] overflow-hidden border-y border-black/[0.06]" style={{ backgroundColor: colors.base, color: colors.ink }}>
      <div className="absolute -left-32 top-24 size-96 rounded-full opacity-80 blur-3xl" style={{ backgroundColor: colors.glowA }} /><div className="absolute -right-40 top-0 size-[500px] rounded-full opacity-65 blur-3xl" style={{ backgroundColor: colors.glowB }} />
      <header className="relative flex items-center justify-between px-7 py-7 sm:px-12"><p className="text-xl font-black tracking-[-0.04em]">quest<span style={{ color: colors.accent }}>/</span>log</p><nav className="hidden rounded-full bg-white/35 p-1 backdrop-blur-md sm:flex">{["Today", "Habits", "Quests", "Reflect"].map((item, index) => <button className="rounded-full px-5 py-2 text-xs font-bold" key={item} style={index === 0 ? { backgroundColor: colors.ink, color: "white" } : { color: `${colors.ink}88` }} type="button">{item}</button>)}</nav><span className="size-10 rounded-full border-4 border-white/50" style={{ backgroundColor: colors.accent }} /></header>
      <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-8 sm:px-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: colors.accent }}>Your gentle plan</p><h1 className="mt-4 text-5xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-7xl">A softer way<br />to show up.</h1></div><div className="max-w-xs rounded-[28px] bg-white/38 p-5 backdrop-blur-xl"><p className="text-sm leading-6 opacity-55">You’ve already done the two things that mattered most. The rest can be light.</p></div></div>
        <div className="mt-14 grid gap-3 md:grid-cols-2">
          {habits.map((habit, index) => <article className="group flex min-h-32 items-center gap-5 rounded-[30px] border border-white/45 p-5 backdrop-blur-xl transition hover:-translate-y-1" key={habit.name} style={{ backgroundColor: `${colors.cards[index]}cc` }}><button className="grid size-12 shrink-0 place-items-center rounded-full text-lg" style={habit.done ? { backgroundColor: colors.ink, color: "white" } : { border: `2px solid ${colors.ink}22`, color: "transparent" }} type="button">✓</button><div className="flex-1"><p className={`text-lg font-bold ${habit.done ? "opacity-35 line-through" : ""}`}>{habit.name}</p><p className="mt-1 text-sm opacity-40">{habit.detail}</p></div><span className="text-xs font-bold opacity-25">{habit.time}</span></article>)}
        </div>
        <div className="mt-5 flex flex-col gap-3 rounded-[30px] p-6 text-white sm:flex-row sm:items-center" style={{ backgroundColor: colors.ink }}><div className="flex-1"><p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: colors.glowA }}>Tonight</p><p className="mt-2 text-xl font-semibold">Two taps left. Then rest.</p></div><button className="rounded-full px-6 py-4 text-sm font-bold" style={{ backgroundColor: colors.glowA, color: colors.ink }} type="button">Open evening check-in</button></div>
      </div>
    </section>
  );
}

function OrbitalDirection() {
  return (
    <section className="relative min-h-[790px] overflow-hidden rounded-[38px] bg-[#f2f0e9] text-[#171b19] shadow-[0_35px_100px_rgba(31,38,34,0.16)]">
      <div className="absolute -right-36 -top-48 size-[620px] rounded-full border-[100px] border-[#d6e5db] opacity-90" />
      <div className="absolute right-20 top-14 size-56 rounded-full bg-[#ff754f] opacity-90 mix-blend-multiply" />
      <header className="relative z-10 flex items-center justify-between border-b border-black/10 px-7 py-5 sm:px-10">
        <p className="text-xl font-black tracking-[-0.06em]">quest<span className="text-[#ff754f]">/</span>log</p>
        <p className="hidden text-[10px] font-black uppercase tracking-[0.22em] text-black/35 sm:block">Wednesday · August 05</p>
        <button className="flex items-center gap-2 text-xs font-bold" type="button"><span className="size-2 rounded-full bg-[#ff754f]" />Evening mode</button>
      </header>
      <div className="relative z-10 grid lg:grid-cols-[92px_minmax(0,1fr)_330px]">
        <nav className="hidden border-r border-black/10 py-8 lg:flex lg:flex-col lg:items-center lg:gap-5" aria-label="Orbital concept navigation">
          {["⌂", "✓", "◇", "↗"].map((icon, index) => <button aria-label={`Concept navigation ${index + 1}`} className={`grid size-11 place-items-center rounded-full text-base ${index === 0 ? "bg-[#171b19] text-white" : "text-black/30 hover:bg-black/5 hover:text-black"}`} key={icon} type="button">{icon}</button>)}
          <span className="mt-auto [writing-mode:vertical-rl] text-[9px] font-black uppercase tracking-[0.28em] text-black/25">Consistency over intensity</span>
        </nav>
        <div className="px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ff754f]">Your rhythm today</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-[0.88] tracking-[-0.07em] sm:text-7xl xl:text-[92px]">Small moves.<br /><span className="font-serif italic text-black/35">Real momentum.</span></h1>
          <div className="relative mt-12 max-w-4xl border-y border-black/10">
            <div className="absolute bottom-10 left-[25px] top-10 w-px bg-black/10" />
            {habits.map((habit, index) => <article className="group relative grid grid-cols-[52px_1fr_auto] items-center gap-4 border-b border-black/10 py-5 last:border-b-0" key={habit.name}><span className={`relative z-10 grid size-[52px] place-items-center rounded-full border ${habit.done ? "border-[#171b19] bg-[#171b19] text-white" : "border-black/15 bg-[#f2f0e9]"}`}><ActivityIcon activity={habit.name} /></span><div><p className={`text-lg font-bold tracking-[-0.02em] ${habit.done ? "text-black/30 line-through" : ""}`}>{habit.name}</p><p className="mt-1 text-xs text-black/35">{habit.detail}</p></div><div className="text-right"><p className="font-mono text-xs text-black/30">{habit.time}</p><p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#ff754f]">0{index + 1}</p></div></article>)}
          </div>
        </div>
        <aside className="relative border-t border-black/10 bg-[#d6e5db]/65 p-7 backdrop-blur-xl lg:border-l lg:border-t-0 lg:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/35">Today’s orbit</p>
          <div className="relative mx-auto mt-8 aspect-square max-w-[230px]"><svg className="size-full -rotate-90" viewBox="0 0 120 120"><circle cx="60" cy="60" fill="none" r="50" stroke="rgba(23,27,25,.09)" strokeWidth="3" /><circle cx="60" cy="60" fill="none" pathLength="100" r="50" stroke="#ff754f" strokeDasharray="63 100" strokeLinecap="round" strokeWidth="5" /></svg><div className="absolute inset-0 grid place-items-center text-center"><div><p className="text-6xl font-semibold tracking-[-0.07em]">63</p><p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/35">momentum</p></div></div></div>
          <div className="mt-8 border-t border-black/10 pt-6"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ff754f]">Side quest</p><p className="mt-3 text-xl font-bold leading-6">Ship the portfolio homepage</p><p className="mt-3 text-xs text-black/40">One clear finish line · August</p></div>
          <button className="mt-9 flex w-full items-center justify-between border-t border-black/15 pt-5 text-sm font-black" type="button"><span>Close the day</span><span className="grid size-10 place-items-center rounded-full bg-[#171b19] text-white">→</span></button>
        </aside>
      </div>
    </section>
  );
}

function TidalDirection() {
  return (
    <section className="relative min-h-[790px] overflow-hidden rounded-[38px] bg-[#e8f0ed] text-[#14332e] shadow-[0_35px_100px_rgba(22,55,48,0.16)]">
      <div className="absolute -left-[12%] top-40 h-[420px] w-[124%] rotate-[-7deg] rounded-[50%] bg-[#b7dcd6]" />
      <div className="absolute -left-[8%] top-[390px] h-[340px] w-[120%] rotate-[5deg] rounded-[50%] bg-[#347c72]" />
      <header className="relative z-10 flex items-center justify-between px-7 py-7 sm:px-11"><p className="text-xl font-black tracking-[-0.06em]">quest<span className="text-[#f27657]">~</span>log</p><nav className="hidden gap-7 text-[10px] font-black uppercase tracking-[0.16em] text-[#14332e]/40 sm:flex"><button className="text-[#14332e]" type="button">Today</button><button type="button">Habits</button><button type="button">Quests</button><button type="button">Reflect</button></nav><span className="grid size-10 place-items-center rounded-full border border-[#14332e]/15 text-xs font-black">QL</span></header>
      <div className="relative z-10 px-7 pb-12 pt-8 sm:px-11 lg:px-16">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#f27657]">Wednesday · 05</p><h1 className="mt-4 text-5xl font-semibold leading-[0.9] tracking-[-0.065em] sm:text-7xl">Flow through<br />your day.</h1></div><p className="max-w-xs border-l border-[#14332e]/15 pl-5 text-sm leading-6 text-[#14332e]/55">Four gentle signals. Follow the current and finish without friction.</p></div>
        <div className="mt-14 grid gap-0 overflow-hidden rounded-[100px] border border-white/40 bg-white/25 p-3 backdrop-blur-xl md:grid-cols-4">
          {habits.map((habit, index) => <article className={`relative flex min-h-40 items-center gap-4 px-5 py-5 md:flex-col md:items-start md:justify-between ${index ? "border-t border-[#14332e]/10 md:border-l md:border-t-0" : ""}`} key={habit.name}><div className={`grid size-12 place-items-center rounded-full ${habit.done ? "bg-[#14332e] text-white" : "bg-white/45"}`}><ActivityIcon activity={habit.name} /></div><div><p className={`font-bold ${habit.done ? "opacity-40 line-through" : ""}`}>{habit.name}</p><p className="mt-1 text-xs opacity-45">{habit.time} · {habit.detail}</p></div><span className="ml-auto text-2xl font-light opacity-20 md:absolute md:right-5 md:top-5">0{index + 1}</span></article>)}
        </div>
        <div className="mt-12 flex flex-col gap-6 text-white sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/55">Today’s tide</p><p className="mt-2 text-6xl font-semibold tracking-[-0.07em]">63<span className="text-xl">%</span></p></div><div className="max-w-sm sm:text-right"><p className="text-xs uppercase tracking-[0.15em] text-[#c9efe7]">Side quest</p><p className="mt-2 text-xl font-bold">Ship the portfolio homepage</p></div><button className="rounded-full bg-[#f7df8c] px-6 py-4 text-sm font-black text-[#14332e]" type="button">Close the day →</button></div>
      </div>
    </section>
  );
}

function StudioDirection() {
  return (
    <section className="min-h-[790px] overflow-hidden rounded-[38px] bg-[#f4f0e8] text-[#161616] shadow-[0_35px_100px_rgba(35,30,23,0.15)]">
      <header className="grid border-b-2 border-black sm:grid-cols-[1fr_auto]"><div className="flex items-center justify-between px-6 py-5 sm:px-10"><p className="text-xl font-black tracking-[-0.06em]">ADUVIA</p><p className="text-[10px] font-black uppercase tracking-[0.2em]">Issue 05 · Wednesday</p></div><div className="border-t-2 border-black bg-[#c8ff55] px-8 py-5 text-xs font-black sm:border-l-2 sm:border-t-0">63% MOMENTUM</div></header>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="px-6 py-9 sm:px-10 lg:px-12"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e64d36]">Daily practice / August 05</p><h1 className="mt-5 max-w-4xl text-6xl font-black uppercase leading-[0.82] tracking-[-0.075em] sm:text-8xl">Do less.<br /><span className="font-serif font-normal italic normal-case text-[#e64d36]">Notice more.</span></h1>
          <div className="mt-12 border-t-2 border-black">{habits.map((habit, index) => <article className="grid grid-cols-[42px_52px_1fr_auto] items-center gap-3 border-b-2 border-black py-4" key={habit.name}><span className="font-mono text-xs">0{index + 1}</span><span className={`grid size-11 place-items-center rounded-full ${habit.done ? "bg-black text-white" : "border-2 border-black"}`}><ActivityIcon activity={habit.name} /></span><div><p className={`text-lg font-black uppercase tracking-[-0.03em] ${habit.done ? "opacity-30 line-through" : ""}`}>{habit.name}</p><p className="text-xs opacity-45">{habit.detail}</p></div><span className="font-mono text-xs opacity-40">{habit.time}</span></article>)}</div>
        </div>
        <aside className="border-t-2 border-black bg-[#6858e8] p-7 text-white lg:border-l-2 lg:border-t-0 lg:p-9"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/55">One thing beyond routine</p><p className="mt-6 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em]">Ship the portfolio homepage.</p><div className="mt-12 flex items-center gap-3"><span className="text-5xl font-black">60</span><div className="flex-1"><div className="h-2 bg-white/15"><div className="h-full w-3/5 bg-[#c8ff55]" /></div><p className="mt-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/45">Quest progress</p></div></div><p className="mt-14 border-t border-white/25 pt-6 text-sm leading-6 text-white/65">Your day does not need to be perfect to count.</p><button className="mt-8 w-full border-2 border-white bg-white py-4 text-sm font-black uppercase text-[#161616]" type="button">Finish today →</button></aside>
      </div>
    </section>
  );
}

export function DesignLab() {
  const [direction, setDirection] = useState<Direction>("orbit");
  const [softPalette, setSoftPalette] = useState<SoftPalette>("forest");
  return (
    <main className="min-h-screen bg-[#ebe9e3] p-3 text-[#17201c] sm:p-6">
      <header className="mx-auto mb-6 flex max-w-[1800px] flex-col gap-5 rounded-[24px] bg-white/70 p-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div><div className="flex items-center gap-3"><Link className="grid size-9 place-items-center rounded-xl bg-[#17201c] text-sm font-bold text-white" href="/">A</Link><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Aduvia design lab</p><h1 className="mt-1 text-xl font-semibold tracking-[-0.03em]">Choose a new visual direction</h1></div></div></div>
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Design directions">{directions.map((item) => <button aria-selected={direction === item.id} className={`shrink-0 rounded-2xl px-4 py-3 text-left transition ${direction === item.id ? "bg-[#17201c] text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`} key={item.id} onClick={() => setDirection(item.id)} role="tab" type="button"><span className="block text-xs font-bold">{item.label}</span><span className={`mt-1 block text-[10px] ${direction === item.id ? "text-white/45" : "text-stone-400"}`}>{item.note}</span></button>)}</div>
      </header>
      {direction === "soft" && <div className="mx-auto mb-5 flex max-w-[1800px] flex-wrap items-center justify-center gap-2" aria-label="Soft Digital palettes">{(Object.entries(softPalettes) as Array<[SoftPalette, (typeof softPalettes)[SoftPalette]]>).map(([id, palette]) => <button aria-pressed={softPalette === id} className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold transition ${softPalette === id ? "border-[#17201c] bg-white shadow-sm" : "border-transparent bg-white/45 text-stone-500"}`} key={id} onClick={() => setSoftPalette(id)} type="button"><span className="flex -space-x-1"><i className="size-3 rounded-full ring-2 ring-white" style={{ backgroundColor: palette.ink }} /><i className="size-3 rounded-full ring-2 ring-white" style={{ backgroundColor: palette.accent }} /><i className="size-3 rounded-full ring-2 ring-white" style={{ backgroundColor: palette.glowA }} /></span>{palette.label}</button>)}</div>}
      <div className="mx-auto max-w-[1800px]" role="tabpanel">{direction === "orbit" ? <OrbitalDirection /> : direction === "tidal" ? <TidalDirection /> : direction === "studio" ? <StudioDirection /> : direction === "aurora" ? <AuroraDirection /> : direction === "editorial" ? <EditorialDirection /> : <SoftDirection palette={softPalette} />}</div>
      <p className="mx-auto mt-5 max-w-[1800px] text-center text-xs text-stone-400">Concept preview only · Soft Digital now uses a full-bleed canvas with no outer base card</p>
    </main>
  );
}
