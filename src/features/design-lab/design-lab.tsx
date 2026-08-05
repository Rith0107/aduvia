"use client";

import Link from "next/link";
import { useState } from "react";

type Direction = "aurora" | "editorial" | "soft";

const directions: Array<{ id: Direction; label: string; note: string }> = [
  { id: "aurora", label: "Midnight Aurora", note: "Atmospheric timeline" },
  { id: "editorial", label: "Solar Editorial", note: "Bold structured print" },
  { id: "soft", label: "Soft Digital", note: "Gentle spatial canvas" },
];

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
        <div className="bg-[#2450d8] px-6 py-7 text-[#fff9df] sm:px-10"><div className="flex items-center justify-between"><p className="text-sm font-black uppercase tracking-[0.22em]">QuestLog / 05</p><p className="text-xs font-bold">AUGUST 2026</p></div><h1 className="mt-10 max-w-4xl text-5xl font-black uppercase leading-[0.87] tracking-[-0.06em] sm:text-8xl">Today is<br />a field note.</h1></div>
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

function SoftDirection() {
  return (
    <section className="relative min-h-[760px] overflow-hidden rounded-[42px] bg-[#e9e0ff] text-[#28243f] shadow-[0_35px_90px_rgba(76,58,125,0.2)]">
      <div className="absolute -left-32 top-24 size-96 rounded-full bg-[#baf5d3] blur-3xl" /><div className="absolute -right-40 top-0 size-[500px] rounded-full bg-[#ffbfd9] opacity-70 blur-3xl" />
      <header className="relative flex items-center justify-between px-7 py-7 sm:px-12"><p className="text-xl font-black tracking-[-0.04em]">quest<span className="text-[#6950bf]">/</span>log</p><nav className="hidden rounded-full bg-white/35 p-1 backdrop-blur-md sm:flex">{["Today", "Habits", "Quests", "Reflect"].map((item, index) => <button className={`rounded-full px-5 py-2 text-xs font-bold ${index === 0 ? "bg-[#28243f] text-white" : "text-[#28243f]/50"}`} key={item} type="button">{item}</button>)}</nav><span className="size-10 rounded-full border-4 border-white/50 bg-[#6950bf]" /></header>
      <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-8 sm:px-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#6950bf]">Your gentle plan</p><h1 className="mt-4 text-5xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-7xl">A softer way<br />to show up.</h1></div><div className="max-w-xs rounded-[28px] bg-white/38 p-5 backdrop-blur-xl"><p className="text-sm leading-6 text-[#28243f]/55">You’ve already done the two things that mattered most. The rest can be light.</p></div></div>
        <div className="mt-14 grid gap-3 md:grid-cols-2">
          {habits.map((habit, index) => <article className={`group flex min-h-32 items-center gap-5 rounded-[30px] border border-white/45 p-5 backdrop-blur-xl transition hover:-translate-y-1 ${index === 0 ? "bg-[#baf5d3]/65" : index === 1 ? "bg-[#fff2a9]/65" : index === 2 ? "bg-white/38" : "bg-[#ffbfd9]/45"}`} key={habit.name}><button className={`grid size-12 shrink-0 place-items-center rounded-full text-lg ${habit.done ? "bg-[#28243f] text-white" : "border-2 border-[#28243f]/15 text-transparent"}`} type="button">✓</button><div className="flex-1"><p className={`text-lg font-bold ${habit.done ? "opacity-35 line-through" : ""}`}>{habit.name}</p><p className="mt-1 text-sm text-[#28243f]/42">{habit.detail}</p></div><span className="text-xs font-bold text-[#28243f]/25">{habit.time}</span></article>)}
        </div>
        <div className="mt-5 flex flex-col gap-3 rounded-[30px] bg-[#28243f] p-6 text-white sm:flex-row sm:items-center"><div className="flex-1"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#baf5d3]">Tonight</p><p className="mt-2 text-xl font-semibold">Two taps left. Then rest.</p></div><button className="rounded-full bg-[#baf5d3] px-6 py-4 text-sm font-bold text-[#28243f]" type="button">Open evening check-in</button></div>
      </div>
    </section>
  );
}

export function DesignLab() {
  const [direction, setDirection] = useState<Direction>("aurora");
  return (
    <main className="min-h-screen bg-[#ebe9e3] p-3 text-[#17201c] sm:p-6">
      <header className="mx-auto mb-6 flex max-w-[1800px] flex-col gap-5 rounded-[24px] bg-white/70 p-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div><div className="flex items-center gap-3"><Link className="grid size-9 place-items-center rounded-xl bg-[#17201c] text-sm font-bold text-white" href="/">Q</Link><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">QuestLog design lab</p><h1 className="mt-1 text-xl font-semibold tracking-[-0.03em]">Choose a new visual direction</h1></div></div></div>
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Design directions">{directions.map((item) => <button aria-selected={direction === item.id} className={`shrink-0 rounded-2xl px-4 py-3 text-left transition ${direction === item.id ? "bg-[#17201c] text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`} key={item.id} onClick={() => setDirection(item.id)} role="tab" type="button"><span className="block text-xs font-bold">{item.label}</span><span className={`mt-1 block text-[10px] ${direction === item.id ? "text-white/45" : "text-stone-400"}`}>{item.note}</span></button>)}</div>
      </header>
      <div className="mx-auto max-w-[1800px]" role="tabpanel">{direction === "aurora" ? <AuroraDirection /> : direction === "editorial" ? <EditorialDirection /> : <SoftDirection />}</div>
      <p className="mx-auto mt-5 max-w-[1800px] text-center text-xs text-stone-400">Concept preview only · your current QuestLog design is unchanged</p>
    </main>
  );
}
