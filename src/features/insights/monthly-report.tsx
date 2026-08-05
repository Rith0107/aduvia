"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

const navItems = [
  { label: "Today", href: "/" },
  { label: "Habits", href: "/habits" },
  { label: "Quests", href: "/quests" },
  { label: "Insights", href: "/insights" },
];

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
  { day: "M", score: 88 },
  { day: "T", score: 74 },
  { day: "W", score: 91 },
  { day: "T", score: 68 },
  { day: "F", score: 83 },
  { day: "S", score: 57 },
  { day: "S", score: 62 },
];

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
  context.fillText("QUESTLOG · AUGUST 2026", margin, format === "story" ? 190 : 130);
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
    link.download = `questlog-august-${format}.png`;
    link.click();
    URL.revokeObjectURL(url);
    setShareMessage("Image downloaded. Share it anywhere you like.");
  }

  async function shareCard() {
    const blob = await renderShareCard(format, overallConsistency);
    const file = new File([blob], `questlog-august-${format}.png`, { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "My QuestLog monthly report" });
      setShareMessage("Share sheet opened.");
      return;
    }
    await downloadCard();
  }

  return (
    <main className="quest-canvas min-h-screen p-3 text-[#17201c] sm:p-5">
      <div className="quest-shell mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1800px] overflow-hidden rounded-[28px] border border-[#174f3a]/15 lg:grid-cols-[240px_1fr]">
        <aside className="quest-sidebar hidden border-r border-white/10 px-5 py-7 lg:flex lg:flex-col">
          <Link className="flex items-center gap-3 px-2" href="/"><span className="grid size-9 place-items-center rounded-xl bg-[#d89a42] text-sm font-semibold text-[#143d31]">Q</span><span className="text-lg font-semibold tracking-[-0.03em]">QuestLog</span></Link>
          <nav aria-label="Primary" className="mt-14 space-y-1">{navItems.map((item) => <Link className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${item.label === "Insights" ? "bg-[#e5ece5] text-[#174f3a]" : "text-stone-500"}`} href={item.href} key={item.label}><span className={`size-1.5 rounded-full ${item.label === "Insights" ? "bg-[#174f3a]" : "bg-white/25"}`} />{item.label}</Link>)}</nav>
          <div className="mt-auto rounded-2xl border border-white/10 bg-white/10 p-4 text-[#dfe8ed]"><p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-60">Month score</p><p className="mt-2 text-3xl font-semibold">{overallConsistency}%</p><p className="mt-1 text-xs opacity-70">Overall consistency</p></div>
        </aside>

        <div className="min-w-0 px-4 py-6 sm:px-8 sm:py-8 xl:px-10">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><Link className="flex items-center gap-2 lg:hidden" href="/"><span className="grid size-7 place-items-center rounded-lg bg-[#174f3a] text-xs font-semibold text-white">Q</span><span className="text-sm font-semibold">QuestLog</span></Link><p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 lg:mt-0">Monthly review</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-[40px]">Your month, in motion<span className="text-[#d89a42]">.</span></h1></div><div className="flex items-center gap-2 rounded-xl bg-[#e5ece5] p-1 text-xs font-semibold text-[#174f3a]"><button className="rounded-lg px-3 py-2" type="button">←</button><span className="px-2">August 2026</span><button className="rounded-lg px-3 py-2 opacity-30" disabled type="button">→</button></div></header>

          <nav aria-label="Mobile navigation" className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">{navItems.map((item) => <Link className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${item.label === "Insights" ? "bg-[#174f3a] text-white" : "bg-white/70 text-stone-500"}`} href={item.href} key={item.label}>{item.label}</Link>)}</nav>

          <section className="mt-7 grid gap-4 xl:grid-cols-[1.35fr_0.75fr]">
            <article className="relative overflow-hidden rounded-[28px] bg-[#143d31] p-6 text-white shadow-[0_22px_55px_rgba(20,61,49,0.2)] sm:p-8">
              <div className="absolute -right-20 -top-20 size-64 rounded-full border-[46px] border-[#d89a42]/10" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div><p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#d5b77c]">Consistency signal</p><p className="mt-4 text-6xl font-semibold tracking-[-0.065em]">{overallConsistency}%</p><p className="mt-1 text-sm text-white/50">Up 8 points from July</p><p className="mt-5 inline-flex rounded-full bg-white/[0.08] px-3 py-2 text-xs font-medium text-[#c7dbd2]">You showed up on 24 days this month</p></div>
                <div className="grid grid-cols-7 gap-1.5 rounded-2xl bg-white/[0.06] p-4" aria-label="August activity heatmap">{Array.from({ length: 35 }, (_, index) => <span className={`size-3 rounded-[4px] ${index > 30 ? "bg-transparent" : index % 7 === 5 ? "bg-[#d89a42]" : index % 5 === 0 ? "bg-[#9c4b38]/70" : "bg-[#8eb5a6]"}`} key={index} />)}</div>
              </div>
              <div className="relative mt-8 h-52 w-full">
                <ResponsiveContainer height="100%" width="100%">
                  <AreaChart data={consistencyTrend} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                    <defs><linearGradient id="consistencyFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#d89a42" stopOpacity={0.5} /><stop offset="100%" stopColor="#d89a42" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 6" vertical={false} />
                    <XAxis axisLine={false} dataKey="label" tick={{ fill: "rgba(255,255,255,0.42)", fontSize: 10 }} tickLine={false} />
                    <Area dataKey="score" fill="url(#consistencyFill)" stroke="#d89a42" strokeWidth={3} type="monotone" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="rounded-[28px] border border-[#174f3a]/10 bg-[#fffaf0] p-6 sm:p-7">
              <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Life balance</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Where your effort went</h2></div>
              <div className="relative mx-auto mt-3 h-56 max-w-[280px]">
                <ResponsiveContainer height="100%" width="100%"><PieChart><Pie cx="50%" cy="50%" data={categoryBalance} dataKey="value" innerRadius={62} outerRadius={91} paddingAngle={4} stroke="none">{categoryBalance.map((entry) => <Cell fill={entry.color} key={entry.name} />)}</Pie></PieChart></ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-3xl font-semibold">4</p><p className="text-[10px] uppercase tracking-[0.12em] text-stone-400">focus areas</p></div></div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">{categoryBalance.map((item) => <div className="flex items-center gap-2 text-xs" key={item.name}><span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} /><span className="text-stone-500">{item.name}</span><span className="ml-auto font-semibold">{item.value}%</span></div>)}</div>
            </article>
          </section>

          <section className="mt-4 grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
            <article className="rounded-[24px] bg-[#dfe8ed] p-6 text-[#284f61]"><p className="text-xs font-semibold uppercase tracking-[0.15em] opacity-55">Best day</p><div className="mt-3 flex items-end justify-between"><div><p className="text-3xl font-semibold tracking-[-0.04em]">Wednesday</p><p className="mt-1 text-sm opacity-60">Your midweek momentum peak.</p></div><span className="text-4xl">↗</span></div></article>
            <article className="rounded-[24px] bg-[#f3e7ca] p-5 text-[#6e5b3c] sm:p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] opacity-55">Weekly rhythm</p><p className="mt-2 text-lg font-semibold">Completion by weekday</p></div><p className="text-xs opacity-60">Last 30 days</p></div><div className="mt-4 h-28"><ResponsiveContainer height="100%" width="100%"><BarChart data={weekdayRhythm}><XAxis axisLine={false} dataKey="day" tick={{ fill: "#876f47", fontSize: 10 }} tickLine={false} /><Bar dataKey="score" fill="#876f47" radius={[7, 7, 2, 2]} /></BarChart></ResponsiveContainer></div></article>
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

          <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_390px]">
            <div className="rounded-[24px] bg-[#143d31] p-6 text-white sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d5b77c]">Share your month</p><h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">Proof worth sharing.</h2><p className="mt-2 max-w-lg text-sm leading-6 text-white/55">Your card includes only overall consistency and completed side quests—no private notes or missed-day details.</p><div className="mt-7 flex flex-wrap gap-2">{(["square", "story"] as const).map((option) => <button className={`rounded-full px-4 py-2 text-xs font-semibold capitalize ${format === option ? "bg-[#d89a42] text-[#143d31]" : "bg-white/10 text-white/60"}`} key={option} onClick={() => setFormat(option)} type="button">{option === "square" ? "Square post" : "Story · 9:16"}</button>)}</div><div className="mt-7 flex flex-wrap gap-3"><button className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#143d31]" onClick={shareCard} type="button">Share image</button><button className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white" onClick={downloadCard} type="button">Download PNG</button></div>{shareMessage && <p className="mt-4 text-xs text-[#b9d4c8]" role="status">{shareMessage}</p>}</div>

            <div className={`relative overflow-hidden rounded-[28px] bg-[#143d31] p-7 text-white shadow-[0_20px_55px_rgba(20,61,49,0.2)] ${format === "story" ? "mx-auto aspect-[9/16] w-full max-w-[290px]" : "aspect-square"}`}><div className="absolute -right-16 -top-16 size-48 rounded-full bg-[#d89a42]/15" /><p className="relative text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d5b77c]">QuestLog · August</p><p className="relative mt-8 text-6xl font-semibold tracking-[-0.06em]">{overallConsistency}%</p><p className="relative mt-1 text-sm text-white/55">monthly consistency</p><div className="relative mt-9 rounded-2xl bg-[#f3e7ca] p-5 text-[#17201c]"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#876f47]">Side quests completed</p>{completedQuests.map((quest) => <p className="mt-3 text-sm font-semibold" key={quest}>✓ {quest}</p>)}</div><p className="absolute bottom-6 left-7 text-[10px] text-white/40">Small steps. A month of proof.</p></div>
          </section>
        </div>
      </div>
    </main>
  );
}
