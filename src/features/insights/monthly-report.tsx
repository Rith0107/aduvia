"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Check, Download, Share2, Smartphone, Square } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

type CellState = "done" | "missed" | "off";
type ShareFormat = "square" | "story";

type ReportHabit = {
  id: string;
  name: string;
  color: string;
  days: CellState[];
};

const completedQuests = ["Created a monthly budget", "Shipped my portfolio homepage"];

const consistencyTrend = [
  { label: "Jul 6", score: 58 },
  { label: "Jul 13", score: 66 },
  { label: "Jul 20", score: 63 },
  { label: "Jul 27", score: 74 },
  { label: "Aug 3", score: 82 },
];

const categoryBalance = [
  { name: "Growth", value: 34, color: "#174f3a" },
  { name: "Wellbeing", value: 28, color: "#d89a42" },
  { name: "Career", value: 23, color: "#3d6678" },
  { name: "Creative", value: 15, color: "#9c4b38" },
];

const weekdayRhythm = [
  { day: "M", name: "Monday", score: 88 },
  { day: "T", name: "Tuesday", score: 74 },
  { day: "W", name: "Wednesday", score: 91 },
  { day: "T", name: "Thursday", score: 68 },
  { day: "F", name: "Friday", score: 83 },
  { day: "S", name: "Saturday", score: 57 },
  { day: "S", name: "Sunday", score: 62 },
];

function TrendActiveDot({ cx = 0, cy = 0, payload }: { cx?: number; cy?: number; payload?: (typeof consistencyTrend)[number] }) {
  if (!payload) return null;

  return (
    <g aria-label={`Week of ${payload.label}: ${payload.score}% consistency`}>
      <rect fill="#f8f2e7" height="34" rx="17" stroke="rgba(255,255,255,.75)" width="118" x={cx - 59} y={cy - 48} />
      <text fill="#173d31" fontSize="12" fontWeight="700" textAnchor="middle" x={cx} y={cy - 27}>{payload.label} · {payload.score}%</text>
      <circle cx={cx} cy={cy} fill="#d89a42" r="6" stroke="#fffaf0" strokeWidth="3" />
    </g>
  );
}

function RhythmActiveBar({ height = 0, payload, width = 0, x = 0, y = 0 }: { height?: number; payload?: (typeof weekdayRhythm)[number]; width?: number; x?: number; y?: number }) {
  if (!payload) return null;

  const labelWidth = 104;
  const labelX = x + width / 2 - labelWidth / 2;

  return (
    <g aria-label={`${payload.name}: ${payload.score}% completion`}>
      <rect fill="#876f47" height={height} rx="7" width={width} x={x} y={y} />
      <rect fill="#fffaf0" height="30" rx="15" stroke="rgba(135,111,71,.16)" width={labelWidth} x={labelX} y={y - 38} />
      <text fill="#6e5b3c" fontSize="11" fontWeight="700" textAnchor="middle" x={x + width / 2} y={y - 19}>{payload.name} · {payload.score}%</text>
    </g>
  );
}

function buildDays(seed: number, weekdaysOnly = false): CellState[] {
  return Array.from({ length: 31 }, (_, index) => {
    const day = index + 1;
    const weekday = new Date(2026, 7, day).getDay();
    if (weekdaysOnly && (weekday === 0 || weekday === 6)) return "off";
    return (day + seed) % 5 === 0 || (day + seed) % 11 === 0 ? "missed" : "done";
  });
}

const initialHabits: ReportHabit[] = [
  { id: "walk", name: "Morning walk", color: "#174f3a", days: buildDays(1) },
  { id: "deep-work", name: "Deep work", color: "#3d6678", days: buildDays(2, true) },
  { id: "read", name: "Read 20 pages", color: "#876f47", days: buildDays(3) },
  { id: "meditate", name: "Meditate", color: "#9c4b38", days: buildDays(4) },
];

function habitConsistency(habit: ReportHabit) {
  const scheduled = habit.days.filter((day) => day !== "off");
  return Math.round((scheduled.filter((day) => day === "done").length / scheduled.length) * 100);
}

function cardDimensions(format: ShareFormat) {
  return format === "story" ? { width: 1080, height: 1920 } : { width: 1080, height: 1080 };
}

async function renderShareCard(format: ShareFormat, consistency: number) {
  const { width, height } = cardDimensions(format);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable.");

  context.fillStyle = "#143d31";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "rgba(216,154,66,0.16)";
  context.beginPath();
  context.arc(width * 0.92, height * 0.08, width * 0.38, 0, Math.PI * 2);
  context.fill();
  const margin = 90;
  context.fillStyle = "#d5b77c";
  context.font = "600 28px system-ui";
  context.fillText("ADUVIA · AUGUST 2026", margin, format === "story" ? 190 : 130);
  context.fillStyle = "#fffaf0";
  context.font = `700 ${format === "story" ? 118 : 104}px system-ui`;
  context.fillText(`${consistency}%`, margin, format === "story" ? 440 : 330);
  context.font = "500 38px system-ui";
  context.fillStyle = "rgba(255,250,240,0.68)";
  context.fillText("monthly consistency", margin, format === "story" ? 500 : 385);

  const questTop = format === "story" ? 760 : 560;
  context.fillStyle = "#f3e7ca";
  context.roundRect(margin, questTop, width - margin * 2, format === "story" ? 520 : 340, 36);
  context.fill();
  context.fillStyle = "#6e5b3c";
  context.font = "600 26px system-ui";
  context.fillText("SIDE QUESTS COMPLETED", margin + 48, questTop + 70);
  context.fillStyle = "#17201c";
  context.font = "600 38px system-ui";
  completedQuests.forEach((quest, index) => {
    context.fillText(`✓  ${quest}`, margin + 48, questTop + 150 + index * 78);
  });
  context.fillStyle = "rgba(255,250,240,0.5)";
  context.font = "500 26px system-ui";
  context.fillText("Small steps. A month of proof.", margin, height - 90);

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create image."))), "image/png"),
  );
}

export function MonthlyReport() {
  const [habits, setHabits] = useState(initialHabits);
  const [format, setFormat] = useState<ShareFormat>("square");
  const [shareMessage, setShareMessage] = useState("");

  const overallConsistency = useMemo(
    () => Math.round(habits.reduce((sum, habit) => sum + habitConsistency(habit), 0) / habits.length),
    [habits],
  );

  function toggleCell(habitId: string, dayIndex: number) {
    setHabits((current) =>
      current.map((habit) => {
        if (habit.id !== habitId || habit.days[dayIndex] === "off") return habit;
        const days = [...habit.days];
        days[dayIndex] = days[dayIndex] === "done" ? "missed" : "done";
        return { ...habit, days };
      }),
    );
  }

  async function downloadCard() {
    const blob = await renderShareCard(format, overallConsistency);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aduvia-august-${format}.png`;
    link.click();
    URL.revokeObjectURL(url);
    setShareMessage("Image downloaded. Share it anywhere you like.");
  }

  async function shareCard() {
    const blob = await renderShareCard(format, overallConsistency);
    const file = new File([blob], `aduvia-august-${format}.png`, { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "My Aduvia monthly report" });
      setShareMessage("Share sheet opened.");
      return;
    }
    await downloadCard();
  }

  return (
    <AppShell active="Insights" eyebrow="Monthly review" title={<>Your month,<br />in motion.</>} action={<div className="flex items-center gap-2 rounded-full bg-white/45 p-1 text-xs font-bold"><button className="rounded-full px-3 py-2" type="button">←</button><span className="px-2">August 2026</span><button className="rounded-full px-3 py-2 opacity-30" disabled type="button">→</button></div>}>
      <div className="insights-flow">
          <section className="mt-12 grid gap-4 xl:grid-cols-[1.35fr_0.75fr]">
            <article className="relative overflow-hidden rounded-[28px] bg-[#143d31] p-6 text-white shadow-[0_22px_55px_rgba(20,61,49,0.2)] sm:p-8">
              <div className="absolute -right-20 -top-20 size-64 rounded-full border-[46px] border-[#d89a42]/10" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div><p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#d5b77c]">Consistency signal</p><p className="mt-4 text-6xl font-semibold tracking-[-0.065em]">{overallConsistency}%</p><p className="mt-1 text-sm text-white/50">Up 8 points from July</p><p className="mt-5 inline-flex rounded-full bg-white/[0.08] px-3 py-2 text-xs font-medium text-[#c7dbd2]">You showed up on 24 days this month</p></div>
                <div className="grid grid-cols-7 gap-1.5 rounded-2xl bg-white/[0.06] p-4" aria-label="August activity heatmap">{Array.from({ length: 35 }, (_, index) => { const state = index % 7 === 5 ? "partial day" : index % 5 === 0 ? "low activity" : "completed day"; return <span aria-label={index > 30 ? undefined : `August ${index + 1}: ${state}`} className={`size-3 rounded-[4px] ${index > 30 ? "bg-transparent" : index % 7 === 5 ? "bg-[#d89a42]" : index % 5 === 0 ? "bg-[#9c4b38]/70" : "bg-[#8eb5a6]"}`} key={index} title={index > 30 ? undefined : `August ${index + 1} · ${state}`} />; })}</div>
              </div>
              <div className="relative mt-7 flex items-center justify-between gap-3"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/45">Weekly consistency trend</p><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">Hover the line</p></div>
              <div className="relative mt-8 h-52 w-full">
                <ResponsiveContainer height="100%" width="100%">
                  <AreaChart data={consistencyTrend} margin={{ left: 0, right: 8, top: 52, bottom: 0 }}>
                    <defs><linearGradient id="consistencyFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#d89a42" stopOpacity={0.5} /><stop offset="100%" stopColor="#d89a42" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 6" vertical={false} />
                    <XAxis axisLine={false} dataKey="label" tick={{ fill: "rgba(255,255,255,0.42)", fontSize: 10 }} tickLine={false} />
                    <Tooltip content={() => null} cursor={{ stroke: "rgba(216,154,66,.3)", strokeWidth: 2 }} />
                    <Area activeDot={<TrendActiveDot />} dataKey="score" fill="url(#consistencyFill)" stroke="#d89a42" strokeWidth={3} type="monotone" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="rounded-[28px] border border-[#174f3a]/10 bg-[#fffaf0] p-6 sm:p-7">
              <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Life balance</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Where your effort went</h2><p className="mt-2 text-xs text-stone-400">Share of completed activity this month</p></div>
              <div className="relative mx-auto mt-3 h-56 max-w-[280px]">
                <ResponsiveContainer height="100%" width="100%"><PieChart><Pie cx="50%" cy="50%" data={categoryBalance} dataKey="value" innerRadius={62} nameKey="name" outerRadius={91} paddingAngle={4} stroke="none">{categoryBalance.map((entry) => <Cell fill={entry.color} key={entry.name} />)}</Pie></PieChart></ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-3xl font-semibold">4</p><p className="text-[10px] uppercase tracking-[0.12em] text-stone-400">focus areas</p></div></div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">{categoryBalance.map((item) => <div className="flex items-center gap-2 text-xs" key={item.name}><span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} /><span className="text-stone-500">{item.name}</span><span className="ml-auto font-semibold">{item.value}%</span></div>)}</div>
            </article>
          </section>

          <section className="mt-4 grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
            <article className="rounded-[24px] bg-[#dfe8ed] p-6 text-[#284f61]"><p className="text-xs font-semibold uppercase tracking-[0.15em] opacity-55">Best day</p><div className="mt-3 flex items-end justify-between"><div><p className="text-3xl font-semibold tracking-[-0.04em]">Wednesday</p><p className="mt-1 text-sm opacity-60">Your midweek momentum peak.</p></div><span className="text-4xl">↗</span></div></article>
            <article className="rounded-[24px] bg-[#f3e7ca] p-5 text-[#6e5b3c] sm:p-6"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] opacity-55">Weekly rhythm</p><p className="mt-2 text-lg font-semibold">Completion by weekday</p></div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] opacity-45">Hover a bar</p></div><div className="mt-4 h-36"><ResponsiveContainer height="100%" width="100%"><BarChart data={weekdayRhythm} margin={{ top: 42 }}><XAxis axisLine={false} dataKey="day" tick={{ fill: "#876f47", fontSize: 10 }} tickLine={false} /><Tooltip content={() => null} cursor={false} /><Bar activeBar={<RhythmActiveBar />} dataKey="score" fill="#876f47" radius={[7, 7, 2, 2]} /></BarChart></ResponsiveContainer></div></article>
          </section>

          <section className="mt-7 rounded-[24px] border border-[#174f3a]/10 bg-[#f8fbf7] p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-semibold">Daily consistency map</h2><p className="mt-1 text-sm text-stone-500">Tap a scheduled day to correct its completion.</p></div><div className="flex gap-3 text-xs text-stone-500"><span className="flex items-center gap-1.5"><i className="size-3 rounded bg-[#174f3a]" />Done</span><span className="flex items-center gap-1.5"><i className="size-3 rounded bg-[#f4dfd9]" />Missed</span><span className="flex items-center gap-1.5"><i className="size-3 rounded bg-stone-200" />Not scheduled</span></div></div>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-black/[0.06] bg-[#fffdf8]">
              <table className="min-w-[1500px] border-separate border-spacing-0 text-xs">
                <thead><tr><th className="sticky left-0 z-10 w-44 border-b border-r border-black/[0.07] bg-[#eee9dc] px-4 py-3 text-left font-semibold">Habit</th>{Array.from({ length: 31 }, (_, index) => <th className={`w-10 border-b border-black/[0.06] py-3 text-center font-medium ${index + 1 === 5 ? "bg-[#f3e7ca] text-[#876f47]" : "text-stone-400"}`} key={index}>{index + 1}</th>)}<th className="sticky right-0 z-10 w-20 border-b border-l border-black/[0.07] bg-[#eee9dc] px-2 font-semibold">Score</th></tr></thead>
                <tbody>{habits.map((habit) => <tr key={habit.id}><th className="sticky left-0 z-10 border-b border-r border-black/[0.06] bg-[#fffdf8] px-4 py-3 text-left font-medium"><span className="mr-2 inline-block size-2 rounded-full" style={{ backgroundColor: habit.color }} />{habit.name}</th>{habit.days.map((state, dayIndex) => <td className={`border-b border-black/[0.04] p-1 ${dayIndex + 1 === 5 ? "bg-[#fbf5e8]" : ""}`} key={dayIndex}><button aria-label={`${habit.name}, August ${dayIndex + 1}: ${state}`} className={`grid size-8 place-items-center rounded-lg text-[11px] font-bold transition ${state === "done" ? "bg-[#174f3a] text-white hover:bg-[#9c4b38]" : state === "missed" ? "bg-[#f4dfd9] text-[#9c4b38] hover:bg-[#174f3a] hover:text-white" : "cursor-default bg-stone-100 text-stone-300"}`} disabled={state === "off"} onClick={() => toggleCell(habit.id, dayIndex)} type="button">{state === "done" ? "✓" : state === "missed" ? "·" : "–"}</button></td>)}<td className="sticky right-0 z-10 border-b border-l border-black/[0.06] bg-[#fffdf8] text-center font-semibold text-[#174f3a]">{habitConsistency(habit)}%</td></tr>)}</tbody>
              </table>
            </div>
          </section>

          <section className="mt-5 overflow-hidden rounded-[32px] border border-[#174f3a]/10 bg-[#e8eee9] p-3 shadow-[0_24px_70px_rgba(28,54,43,.12)] sm:p-5">
            <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
              <div className="flex flex-col p-4 sm:p-6">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#143d31] text-[#f3c878] shadow-[0_10px_24px_rgba(20,61,49,.18)]"><Share2 size={21} strokeWidth={1.8} /></div>
                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.17em] text-[#a66c58]">Share studio</p>
                <h2 className="mt-3 max-w-sm text-4xl font-semibold tracking-[-0.055em] text-[#17251f]">Turn your month into a keepsake.</h2>
                <p className="mt-4 max-w-md text-sm leading-6 text-stone-500">Only consistency and completed quests are included. Notes and missed-day details stay private.</p>

                <fieldset className="mt-9">
                  <legend className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400">Choose a canvas</legend>
                  <div className="mt-3 grid max-w-md grid-cols-2 gap-3">
                    {(["square", "story"] as const).map((option) => {
                      const selected = format === option;
                      const FormatIcon = option === "square" ? Square : Smartphone;
                      return <button aria-pressed={selected} className={`group flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition ${selected ? "border-[#174f3a] bg-[#174f3a] text-white shadow-[0_10px_22px_rgba(23,79,58,.16)]" : "border-[#174f3a]/10 bg-white/55 text-[#34463e] hover:bg-white"}`} key={option} onClick={() => setFormat(option)} type="button"><FormatIcon className={selected ? "text-[#f3c878]" : "text-[#7f948a]"} size={20} strokeWidth={1.8} /><span><span className="block text-sm font-semibold">{option === "square" ? "Square post" : "Story"}</span><span className={`mt-0.5 block text-[10px] ${selected ? "text-white/50" : "text-stone-400"}`}>{option === "square" ? "1:1 feed" : "9:16 vertical"}</span></span></button>;
                    })}
                  </div>
                </fieldset>

                <div className="mt-auto flex flex-wrap gap-3 pt-9"><button className="inline-flex items-center gap-2 rounded-full bg-[#d89a42] px-5 py-3 text-sm font-semibold text-[#143d31] shadow-[0_10px_24px_rgba(216,154,66,.22)] transition hover:-translate-y-0.5" onClick={shareCard} type="button"><Share2 size={16} />Share image</button><button className="inline-flex items-center gap-2 rounded-full border border-[#174f3a]/15 bg-white/65 px-5 py-3 text-sm font-semibold text-[#174f3a] transition hover:bg-white" onClick={downloadCard} type="button"><Download size={16} />Download</button></div>
                {shareMessage && <p className="mt-4 text-xs text-[#507365]" role="status">{shareMessage}</p>}
              </div>

              <div className="grid min-h-[620px] place-items-center overflow-hidden rounded-[26px] bg-[radial-gradient(circle_at_20%_10%,rgba(216,154,66,.18),transparent_34%),linear-gradient(145deg,#d9e4de,#f1e9dc)] p-5 sm:p-8">
                <div className={`relative overflow-hidden bg-[#123f32] text-white shadow-[0_30px_70px_rgba(20,61,49,.28)] transition-all duration-500 ${format === "story" ? "aspect-[9/16] w-full max-w-[310px] rounded-[34px] p-7" : "aspect-square w-full max-w-[560px] rounded-[38px] p-8 sm:p-10"}`}>
                  <div className="absolute -right-24 -top-24 size-64 rounded-full border-[42px] border-[#d89a42]/18" />
                  <div className="absolute -bottom-32 -left-28 size-72 rounded-full bg-[#7fa696]/10 blur-2xl" />
                  <div className="relative flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f0c77a]">Aduvia · August</p><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] uppercase tracking-[0.13em] text-white/55">Monthly proof</span></div>

                  <div className="relative mt-8 flex items-center gap-5">
                    <div className="grid size-32 shrink-0 place-items-center rounded-full p-[9px]" style={{ background: `conic-gradient(#d89a42 ${overallConsistency * 3.6}deg, rgba(255,255,255,.1) 0deg)` }}><div className="grid size-full place-items-center rounded-full bg-[#123f32] text-center"><div><p className="text-4xl font-semibold tracking-[-0.06em]">{overallConsistency}%</p><p className="mt-1 text-[8px] uppercase tracking-[0.16em] text-white/45">consistent</p></div></div></div>
                    <div><p className="text-xs uppercase tracking-[0.13em] text-white/40">You showed up</p><p className="mt-1 text-3xl font-semibold tracking-[-0.04em]">24 days</p><p className="mt-2 max-w-[180px] text-xs leading-5 text-white/45">A month built one quiet check-in at a time.</p></div>
                  </div>

                  <div className="relative mt-9 border-t border-white/10 pt-6"><div className="flex items-end justify-between"><div><p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-[#f0c77a]">Side quests cleared</p><p className="mt-1 text-2xl font-semibold">{completedQuests.length} wins</p></div><span className="text-xs text-white/35">August 2026</span></div><div className="mt-5 space-y-3">{completedQuests.map((quest, index) => <div className="flex items-center gap-3 border-b border-white/10 pb-3" key={quest}><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f0c77a] text-[#123f32]"><Check size={15} strokeWidth={2.4} /></span><div><p className="text-[9px] uppercase tracking-[0.13em] text-white/35">Quest 0{index + 1}</p><p className="mt-0.5 text-sm font-semibold">{quest}</p></div></div>)}</div></div>
                  <div className="absolute bottom-7 left-8 right-8 flex items-center justify-between text-[9px] uppercase tracking-[0.14em] text-white/30"><span>Small steps, visible proof.</span><span>aduvia</span></div>
                </div>
              </div>
            </div>
          </section>
      </div>
    </AppShell>
  );
}
