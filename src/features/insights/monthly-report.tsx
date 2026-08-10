"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { scheduledDaysFor, useAppData } from "@/lib/app-data";
import { Download, Share2, Smartphone, Square } from "lucide-react";
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
  category: string;
  color: string;
  days: CellState[];
};

const fallbackCompletedQuests = ["Created a monthly budget", "Shipped my portfolio homepage"];

function TrendActiveDot({ cx = 0, cy = 0, payload }: { cx?: number; cy?: number; payload?: { label: string; score: number } }) {
  if (!payload) return null;

  return (
    <g aria-label={`Week of ${payload.label}: ${payload.score}% consistency`}>
      <rect fill="var(--theme-paper)" height="34" rx="17" stroke="rgba(255,255,255,.75)" width="118" x={cx - 59} y={cy - 48} />
      <text fill="var(--chart-deep)" fontSize="12" fontWeight="700" textAnchor="middle" x={cx} y={cy - 27}>{payload.label} · {payload.score}%</text>
      <circle cx={cx} cy={cy} fill="var(--chart-primary)" r="6" stroke="#fffaf0" strokeWidth="3" />
    </g>
  );
}

function RhythmActiveBar({ height = 0, payload, width = 0, x = 0, y = 0 }: { height?: number; payload?: { day: string; name: string; score: number }; width?: number; x?: number; y?: number }) {
  if (!payload) return null;

  const labelWidth = 104;
  const labelX = x + width / 2 - labelWidth / 2;

  return (
    <g aria-label={`${payload.name}: ${payload.score}% completion`}>
      <rect fill="var(--chart-ink)" height={height} rx="7" width={width} x={x} y={y} />
      <rect fill="var(--theme-paper)" height="30" rx="15" stroke="rgba(135,111,71,.16)" width={labelWidth} x={labelX} y={y - 38} />
      <text fill="var(--chart-ink)" fontSize="11" fontWeight="700" textAnchor="middle" x={x + width / 2} y={y - 19}>{payload.name} · {payload.score}%</text>
    </g>
  );
}

function DailyConsistencyTooltip({ active, monthName, payload }: { active?: boolean; monthName: string; payload?: Array<{ payload: { day: number; score: number } }> }) {
  if (!active || !payload?.[0]) return null;
  const point = payload[0].payload;
  return <div className="rounded-full border border-white/80 bg-[color:color-mix(in_srgb,var(--theme-paper)_95%,transparent)] px-4 py-2 text-xs font-bold text-[var(--chart-deep)] shadow-[0_12px_32px_-12px_rgba(23,63,50,.4)] backdrop-blur-xl">{monthName.slice(0, 3)} {point.day} · {point.score}%</div>;
}

function buildDays(seed: number, weekdaysOnly = false, year = 2026, month = 7): CellState[] {
  const dayCount = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: dayCount }, (_, index) => {
    const day = index + 1;
    const weekday = new Date(year, month, day).getDay();
    if (weekdaysOnly && (weekday === 0 || weekday === 6)) return "off";
    return (day + seed) % 5 === 0 || (day + seed) % 11 === 0 ? "missed" : "done";
  });
}

function createReportHabits(year: number, month: number): ReportHabit[] {
  return [
    { id: "walk", name: "Morning walk", category: "Fitness", color: "var(--chart-green)", days: buildDays(1, false, year, month) },
    { id: "deep-work", name: "Deep work", category: "Career", color: "var(--chart-blue)", days: buildDays(2, true, year, month) },
    { id: "read", name: "Read 20 pages", category: "Learning", color: "var(--chart-ink)", days: buildDays(3, false, year, month) },
    { id: "meditate", name: "Meditate", category: "Mindfulness", color: "var(--chart-rust)", days: buildDays(4, false, year, month) },
  ];
}

function dateStorageKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function habitConsistency(habit: ReportHabit) {
  const scheduled = habit.days.filter((day) => day !== "off");
  return scheduled.length ? Math.round((scheduled.filter((day) => day === "done").length / scheduled.length) * 100) : 0;
}

function cardDimensions(format: ShareFormat) {
  return format === "story" ? { width: 1080, height: 1920 } : { width: 1080, height: 1080 };
}

async function renderShareCard(format: ShareFormat, consistency: number, monthLabel: string, completedQuestTitles: string[]) {
  const { width, height } = cardDimensions(format);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable.");

  const styles = getComputedStyle(document.documentElement);
  const themeColor = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
  const deep = themeColor("--chart-deep", "#143d31");
  const primary = themeColor("--chart-primary", "#d89a42");
  const surface = themeColor("--chart-surface", "#f3e7ca");
  const surfaceInk = themeColor("--chart-ink", "#6e5b3c");
  const ink = themeColor("--soft-ink", "#17201c");

  context.fillStyle = deep;
  context.fillRect(0, 0, width, height);
  context.fillStyle = primary;
  context.globalAlpha = 0.18;
  context.beginPath();
  context.arc(width * 0.92, height * 0.08, width * 0.38, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;
  const margin = 90;
  context.fillStyle = primary;
  context.font = "600 28px system-ui";
  context.fillText(`ADUVIA · ${monthLabel.toUpperCase()}`, margin, format === "story" ? 190 : 130);
  context.fillStyle = "#fffaf0";
  context.font = `700 ${format === "story" ? 118 : 104}px system-ui`;
  context.fillText(`${consistency}%`, margin, format === "story" ? 440 : 330);
  context.font = "500 38px system-ui";
  context.fillStyle = "rgba(255,250,240,0.68)";
  context.fillText("monthly consistency", margin, format === "story" ? 500 : 385);

  const questTop = format === "story" ? 760 : 560;
  context.fillStyle = surface;
  context.roundRect(margin, questTop, width - margin * 2, format === "story" ? 520 : 340, 36);
  context.fill();
  context.fillStyle = surfaceInk;
  context.font = "600 26px system-ui";
  context.fillText("SIDE QUESTS COMPLETED", margin + 48, questTop + 70);
  context.fillStyle = ink;
  context.font = "600 38px system-ui";
  const questLimit = format === "square" ? 3 : 5;
  const visibleQuests = completedQuestTitles.slice(0, questLimit);
  visibleQuests.forEach((quest, index) => {
    context.fillText(`✓  ${quest}`, margin + 48, questTop + 150 + index * 78);
  });
  const remaining = completedQuestTitles.length - visibleQuests.length;
  if (remaining > 0) {
    context.fillStyle = primary;
    context.font = "600 28px system-ui";
    context.fillText(`+ ${remaining} more ${remaining === 1 ? "win" : "wins"}`, margin + 48, questTop + 150 + visibleQuests.length * 78);
  }
  context.fillStyle = "rgba(255,250,240,0.5)";
  context.font = "500 26px system-ui";
  context.fillText("Small steps. A month of proof.", margin, height - 90);

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create image."))), "image/png"),
  );
}

export function MonthlyReport() {
  const appData = useAppData();
  const now = new Date();
  const [reportMonth, setReportMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [fallbackHabits, setFallbackHabits] = useState(() => createReportHabits(now.getFullYear(), now.getMonth()));
  const [format, setFormat] = useState<ShareFormat>("square");
  const [shareMessage, setShareMessage] = useState("");
  const calendarDaysInMonth = new Date(reportMonth.year, reportMonth.month + 1, 0).getDate();
  const reportMonthStart = new Date(reportMonth.year, reportMonth.month, 1);
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = reportMonthStart.getTime() === currentMonthStart.getTime() ? now.getDate() : reportMonthStart < currentMonthStart ? calendarDaysInMonth : 0;
  const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date(reportMonth.year, reportMonth.month, 1));
  const monthLabel = `${monthName} ${reportMonth.year}`;

  const habits = useMemo<ReportHabit[]>(() => {
    if (!appData) return fallbackHabits.map((habit) => ({ ...habit, days: habit.days.slice(0, daysInMonth) }));
    const colorByIndex = ["var(--chart-green)", "var(--chart-blue)", "var(--chart-ink)", "var(--chart-rust)"];
    return appData.habits.map((habit, habitIndex) => ({
      id: habit.id,
      name: habit.name,
      category: habit.category,
      color: colorByIndex[habitIndex % colorByIndex.length],
      days: Array.from({ length: daysInMonth }, (_, index): CellState => {
        const date = new Date(reportMonth.year, reportMonth.month, index + 1);
        const weekday = (["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const)[date.getDay()];
        if (!scheduledDaysFor(habit).includes(weekday)) return "off";
        return appData.completions[dateStorageKey(reportMonth.year, reportMonth.month, index + 1)]?.[habit.id] === "complete" ? "done" : "missed";
      }),
    }));
  }, [appData, daysInMonth, fallbackHabits, reportMonth.month, reportMonth.year]);

  const overallConsistency = useMemo(
    () => Math.round(habits.reduce((sum, habit) => sum + habitConsistency(habit), 0) / habits.length),
    [habits],
  );
  const dailyConsistency = useMemo(
    () => Array.from({ length: daysInMonth }, (_, dayIndex) => {
      const scheduled = habits.filter((habit) => habit.days[dayIndex] !== "off");
      const completed = scheduled.filter((habit) => habit.days[dayIndex] === "done").length;
      return { day: dayIndex + 1, label: `${monthName.slice(0, 3)} ${dayIndex + 1}`, score: scheduled.length ? Math.round((completed / scheduled.length) * 100) : 0 };
    }),
    [daysInMonth, habits, monthName],
  );

  const weekdayReport = useMemo(() => {
    const labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return labels.map((name, weekday) => {
      const points = dailyConsistency.filter((point) => new Date(reportMonth.year, reportMonth.month, point.day).getDay() === weekday);
      return { day: name.slice(0, 1), name, score: points.length ? Math.round(points.reduce((sum, point) => sum + point.score, 0) / points.length) : 0 };
    });
  }, [dailyConsistency, reportMonth.month, reportMonth.year]);
  const bestDay = weekdayReport.reduce((best, day) => day.score > best.score ? day : best, weekdayReport[0]);
  const daysShownUp = dailyConsistency.filter((point) => point.score > 0).length;
  const completedQuestTitles = appData ? appData.quests.filter((quest) => quest.status === "completed").map((quest) => quest.title) : fallbackCompletedQuests;
  const categoryBalance = useMemo(() => {
    const totals = habits.reduce<Record<string, number>>((result, habit) => {
      result[habit.category] = (result[habit.category] ?? 0) + habit.days.filter((day) => day === "done").length;
      return result;
    }, {});
    const total = Object.values(totals).reduce((sum, value) => sum + value, 0);
    const colors = ["var(--chart-green)", "var(--chart-primary)", "var(--chart-blue)", "var(--chart-rust)"];
    return Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([name, value], index) => ({ name, value: total ? Math.round((value / total) * 100) : 0, color: colors[index] }));
  }, [habits]);
  const previousMonthConsistency = useMemo(() => {
    if (!appData) return overallConsistency;
    const previous = new Date(reportMonth.year, reportMonth.month - 1, 1);
    const count = new Date(previous.getFullYear(), previous.getMonth() + 1, 0).getDate();
    let scheduled = 0;
    let completed = 0;
    appData.habits.forEach((habit) => {
      for (let day = 1; day <= count; day += 1) {
        const date = new Date(previous.getFullYear(), previous.getMonth(), day);
        const weekday = (["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const)[date.getDay()];
        if (!scheduledDaysFor(habit).includes(weekday)) continue;
        scheduled += 1;
        if (appData.completions[dateStorageKey(previous.getFullYear(), previous.getMonth(), day)]?.[habit.id] === "complete") completed += 1;
      }
    });
    return scheduled ? Math.round((completed / scheduled) * 100) : 0;
  }, [appData, overallConsistency, reportMonth.month, reportMonth.year]);
  const consistencyDelta = overallConsistency - previousMonthConsistency;

  function changeMonth(offset: number) {
    const next = new Date(reportMonth.year, reportMonth.month + offset, 1);
    const year = next.getFullYear();
    const month = next.getMonth();
    setReportMonth({ year, month });
    setFallbackHabits(createReportHabits(year, month));
  }

  async function downloadCard() {
    const blob = await renderShareCard(format, overallConsistency, monthLabel, completedQuestTitles);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aduvia-${monthName.toLowerCase()}-${reportMonth.year}-${format}.png`;
    link.click();
    URL.revokeObjectURL(url);
    setShareMessage("Image downloaded. Share it anywhere you like.");
  }

  async function shareCard() {
    const blob = await renderShareCard(format, overallConsistency, monthLabel, completedQuestTitles);
    const file = new File([blob], `aduvia-${monthName.toLowerCase()}-${reportMonth.year}-${format}.png`, { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "My Aduvia monthly report" });
      setShareMessage("Share sheet opened.");
      return;
    }
    await downloadCard();
  }

  const viewingCurrentMonth = reportMonth.year === now.getFullYear() && reportMonth.month === now.getMonth();
  const shareQuestLimit = format === "square" ? 3 : 5;
  const visibleShareQuests = completedQuestTitles.slice(0, shareQuestLimit);
  const remainingShareQuests = completedQuestTitles.length - visibleShareQuests.length;

  return (
    <AppShell active="Insights" eyebrow="Monthly review" title={<>Your month,<br />in motion.</>} action={<div className="flex items-center gap-2 rounded-full bg-white/45 p-1 text-xs font-bold"><button aria-label="Previous month" className="rounded-full px-3 py-2 transition hover:bg-white/60" onClick={() => changeMonth(-1)} type="button">←</button><span className="min-w-28 px-2 text-center">{monthLabel}</span><button aria-label="Next month" className="rounded-full px-3 py-2 transition hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-30" disabled={viewingCurrentMonth} onClick={() => changeMonth(1)} type="button">→</button></div>}>
      <div className="insights-flow">
          <section className="mt-12 grid gap-4 xl:grid-cols-[1.35fr_0.75fr]">
            <article className="relative overflow-hidden rounded-[44px_44px_96px_44px] bg-[var(--chart-deep)] p-6 text-white shadow-[0_28px_70px_-30px_rgba(20,61,49,0.55)] sm:p-8">
              <div className="absolute -right-20 -top-20 size-64 rounded-full border-[46px] border-[color-mix(in_srgb,var(--chart-primary)_12%,transparent)]" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div><p className="text-xs font-semibold uppercase tracking-[0.17em] text-[var(--chart-primary)]">Consistency signal</p><p className="mt-4 text-6xl font-semibold tracking-[-0.065em]">{overallConsistency}%</p><p className="mt-1 text-sm text-white/50">{consistencyDelta === 0 ? "Level with last month" : `${consistencyDelta > 0 ? "Up" : "Down"} ${Math.abs(consistencyDelta)} points from last month`}</p><p className="mt-5 inline-flex rounded-full bg-white/[0.08] px-3 py-2 text-xs font-medium text-white/70">You showed up on {daysShownUp} {daysShownUp === 1 ? "day" : "days"} this month</p></div>
                <div className="grid grid-cols-7 gap-1.5 rounded-2xl bg-white/[0.08] p-4" aria-label={`${monthName} activity heatmap`}>{Array.from({ length: Math.ceil(daysInMonth / 7) * 7 }, (_, index) => { const point = dailyConsistency[index]; const state = !point ? "" : point.score >= 75 ? "high activity" : point.score >= 50 ? "partial activity" : "low activity"; return <span aria-label={point ? `${monthName} ${point.day}: ${state}` : undefined} className={`size-3 rounded-[4px] ${!point ? "bg-transparent" : point.score >= 75 ? "bg-[var(--heatmap-high)]" : point.score >= 50 ? "bg-[var(--heatmap-mid)]" : "bg-[var(--heatmap-low)]"}`} key={index} title={point ? `${monthName} ${point.day} · ${point.score}%` : undefined} />; })}</div>
              </div>
              <div className="relative mt-7"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/45">Daily consistency trend · month to date</p></div>
              <div className="relative mt-8 h-52 w-full">
                <ResponsiveContainer height="100%" width="100%">
                  <AreaChart data={dailyConsistency} margin={{ left: 0, right: 8, top: 52, bottom: 0 }}>
                    <defs><linearGradient id="consistencyFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--chart-primary)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--chart-primary)" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 6" vertical={false} />
                    <XAxis axisLine={false} dataKey="label" tick={{ fill: "rgba(255,255,255,0.42)", fontSize: 10 }} tickLine={false} />
                    <Tooltip content={() => null} cursor={{ stroke: "rgba(216,154,66,.3)", strokeWidth: 2 }} />
                    <Area activeDot={<TrendActiveDot />} dataKey="score" fill="url(#consistencyFill)" stroke="var(--chart-primary)" strokeWidth={3} type="monotone" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-[64px_28px_64px_64px] border border-white/70 bg-[color:color-mix(in_srgb,var(--theme-paper)_90%,transparent)] p-6 shadow-[0_24px_60px_-38px_rgba(39,56,47,.4)] sm:p-7">
              <div className="absolute -right-14 -top-14 size-40 rounded-full bg-[color-mix(in_srgb,var(--chart-primary)_12%,transparent)]" />
              <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Life balance</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Where your effort went</h2><p className="mt-2 text-xs text-stone-400">Share of completed activity this month</p></div>
              <div className="relative mx-auto mt-3 h-56 max-w-[280px]">
                <ResponsiveContainer height="100%" width="100%"><PieChart><Pie cx="50%" cy="50%" data={categoryBalance} dataKey="value" innerRadius={62} nameKey="name" outerRadius={91} paddingAngle={4} stroke="none">{categoryBalance.map((entry) => <Cell fill={entry.color} key={entry.name} />)}</Pie></PieChart></ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-3xl font-semibold">{categoryBalance.length}</p><p className="text-[10px] uppercase tracking-[0.12em] text-stone-400">focus areas</p></div></div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">{categoryBalance.map((item) => <div className="flex items-center gap-2 text-xs" key={item.name}><span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} /><span className="text-stone-500">{item.name}</span><span className="ml-auto font-semibold">{item.value}%</span></div>)}</div>
            </article>
          </section>

          <section className="mt-6 grid items-center gap-7 lg:grid-cols-[0.5fr_1.5fr]">
            <article className="relative mx-auto flex aspect-square w-full max-w-[310px] flex-col items-center justify-center overflow-hidden rounded-full bg-[var(--soft-tint-c)] p-10 text-center text-[var(--soft-icon-blue)] shadow-[0_26px_60px_-34px_rgba(40,79,97,.5)] lg:mx-0"><div className="absolute -right-10 -top-10 size-36 rounded-full border-[26px] border-white/25" /><p className="absolute left-1/2 top-12 -translate-x-1/2 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.15em] opacity-55">Best day</p><div className="relative -translate-y-1"><p className="text-4xl font-semibold tracking-[-0.05em]">{bestDay.name}</p><p className="mx-auto mt-2 max-w-[230px] text-sm leading-5 opacity-60">Your strongest rhythm at {bestDay.score}% consistency.</p></div><span className="absolute bottom-9 left-1/2 grid size-11 -translate-x-1/2 place-items-center rounded-full bg-[var(--soft-icon-blue)] text-xl text-white">↗</span></article>
            <article className="overflow-hidden rounded-[52px] bg-[var(--chart-surface)] p-6 text-[var(--chart-ink)] shadow-[0_28px_65px_-42px_rgba(110,91,60,.55)] sm:p-8"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] opacity-55">Weekly rhythm</p><p className="mt-2 text-xl font-semibold">Completion by weekday</p></div><div className="mt-4 h-36"><ResponsiveContainer height="100%" width="100%"><BarChart data={weekdayReport} margin={{ top: 42 }}><XAxis axisLine={false} dataKey="day" tick={{ fill: "var(--chart-ink)", fontSize: 10 }} tickLine={false} /><Tooltip content={() => null} cursor={false} /><Bar activeBar={<RhythmActiveBar />} dataKey="score" fill="var(--chart-ink)" radius={[18, 18, 18, 18]} /></BarChart></ResponsiveContainer></div></article>
          </section>

          <section className="mt-7 rounded-[44px] border border-white/70 bg-[color:color-mix(in_srgb,var(--soft-surface)_80%,transparent)] p-4 shadow-[0_26px_70px_-48px_rgba(34,61,49,.42)] sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-semibold">Daily consistency map</h2><p className="mt-1 text-sm text-[var(--soft-muted)]">Read-only history from your daily check-ins.</p></div><div className="flex gap-3 text-xs text-[var(--soft-muted)]"><span className="flex items-center gap-1.5"><i className="size-3 rounded bg-[var(--chart-green)]" />Done</span><span className="flex items-center gap-1.5"><i className="size-3 rounded bg-[var(--theme-missed)]" />Missed</span><span className="flex items-center gap-1.5"><i className="size-3 rounded bg-[var(--theme-muted-cell)]" />Not scheduled</span></div></div>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-black/[0.06] bg-[var(--theme-paper)]">
              <table className="table-fixed border-separate border-spacing-0 text-xs" style={{ minWidth: `${256 + daysInMonth * 40}px`, width: `max(100%, ${256 + daysInMonth * 40}px)` }}>
                <thead><tr><th className="sticky left-0 z-10 w-44 border-b border-r border-black/[0.07] bg-[var(--theme-paper-warm)] px-4 py-3 text-left font-semibold">Habit</th>{Array.from({ length: daysInMonth }, (_, index) => <th className={`w-10 border-b border-black/[0.06] py-3 text-center font-medium ${index + 1 === 5 ? "bg-[var(--theme-highlight)] text-[var(--chart-ink)]" : "text-[var(--soft-muted)]"}`} key={index}>{index + 1}</th>)}<th className="sticky right-0 z-10 w-20 border-b border-l border-black/[0.07] bg-[var(--theme-paper-warm)] px-2 font-semibold">Score</th></tr></thead>
                <tbody>{habits.map((habit) => <tr key={habit.id}><th className="sticky left-0 z-10 border-b border-r border-black/[0.06] bg-[var(--theme-paper)] px-4 py-3 text-left font-medium"><span className="mr-2 inline-block size-2 rounded-full" style={{ backgroundColor: habit.color }} />{habit.name}</th>{habit.days.map((state, dayIndex) => <td className={`border-b border-black/[0.04] p-1 ${dayIndex + 1 === now.getDate() ? "bg-[color:color-mix(in_srgb,var(--theme-highlight)_55%,transparent)]" : ""}`} key={dayIndex}><span aria-label={`${habit.name}, ${monthName} ${dayIndex + 1}: ${state}`} className={`grid size-8 place-items-center rounded-lg text-[11px] font-bold ${state === "done" ? "bg-[var(--chart-green)] text-white" : state === "missed" ? "bg-[var(--theme-missed)] text-[var(--chart-rust)]" : "bg-[var(--theme-muted-cell)] text-[var(--soft-muted)] opacity-55"}`}>{state === "done" ? "✓" : state === "missed" ? "·" : "–"}</span></td>)}<td className="sticky right-0 z-10 border-b border-l border-black/[0.06] bg-[var(--theme-paper)] text-center font-semibold text-[var(--chart-green)]">{habitConsistency(habit)}%</td></tr>)}</tbody>
              </table>
              <div aria-label={`Daily consistency across ${monthName}`} className="grid border-t border-white/10 bg-[var(--chart-deep)] text-white" style={{ gridTemplateColumns: `176px minmax(${daysInMonth * 40}px, 1fr) 80px`, minWidth: `${256 + daysInMonth * 40}px`, width: `max(100%, ${256 + daysInMonth * 40}px)` }}>
                <div className="flex flex-col justify-center border-r border-white/10 px-5"><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--chart-primary)]">{daysInMonth}-day pulse</p><p className="mt-2 text-sm font-semibold leading-5">Daily<br />consistency</p></div>
                <div className="h-52"><ResponsiveContainer height="100%" width="100%"><AreaChart data={dailyConsistency} margin={{ bottom: 8, left: 0, right: 0, top: 28 }}><defs><linearGradient id="dailyConsistencyFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--chart-primary)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--chart-primary)" stopOpacity={0.03} /></linearGradient></defs><CartesianGrid stroke="rgba(255,255,255,.08)" strokeDasharray="3 7" vertical={false} /><XAxis axisLine={false} dataKey="day" domain={[0.5, daysInMonth + 0.5]} hide type="number" /><Tooltip content={<DailyConsistencyTooltip monthName={monthName} />} cursor={{ stroke: "var(--chart-primary)", strokeOpacity: .32, strokeWidth: 2 }} /><Area activeDot={{ fill: "var(--chart-primary)", r: 5, stroke: "#fffaf0", strokeWidth: 3 }} dataKey="score" fill="url(#dailyConsistencyFill)" isAnimationActive={false} stroke="var(--chart-primary)" strokeWidth={2.5} type="monotone" /></AreaChart></ResponsiveContainer></div>
                <div className="flex flex-col items-center justify-center border-l border-white/10 text-center"><p className="text-2xl font-semibold tracking-[-0.04em] text-[var(--chart-primary)]">{overallConsistency}%</p><p className="mt-1 text-[8px] font-semibold uppercase leading-3 tracking-[0.12em] text-white/55">Month<br />average</p></div>
              </div>
            </div>
          </section>

          <section className="mt-7 overflow-hidden rounded-[52px] border border-white/70 bg-[var(--soft-tint-a)] p-3 shadow-[0_30px_80px_-42px_rgba(28,54,43,.32)] sm:p-5">
            <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
              <div className="flex flex-col p-4 sm:p-6">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--chart-deep)] text-[var(--chart-primary)] shadow-[0_10px_24px_rgba(20,61,49,.18)]"><Share2 size={21} strokeWidth={1.8} /></div>
                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.17em] text-[var(--soft-accent)]">Share studio</p>
                <h2 className="mt-3 max-w-sm text-4xl font-semibold tracking-[-0.055em] text-[var(--soft-ink)]">Turn your month into a keepsake.</h2>
                <p className="mt-4 max-w-md text-sm leading-6 text-stone-500">Only consistency and completed quests are included. Notes and missed-day details stay private.</p>

                <fieldset className="mt-9">
                  <legend className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400">Choose a canvas</legend>
                  <div className="mt-3 grid max-w-md grid-cols-2 gap-3">
                    {(["square", "story"] as const).map((option) => {
                      const selected = format === option;
                      const FormatIcon = option === "square" ? Square : Smartphone;
                      return <button aria-pressed={selected} className={`group flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition ${selected ? "border-[var(--chart-deep)] bg-[var(--chart-deep)] text-white shadow-[0_10px_22px_rgba(23,79,58,.16)]" : "border-[color:color-mix(in_srgb,var(--chart-deep)_12%,transparent)] bg-white/55 text-[var(--soft-ink)] hover:bg-white"}`} key={option} onClick={() => setFormat(option)} type="button"><FormatIcon className={selected ? "text-[var(--chart-primary)]" : "text-[var(--soft-muted)]"} size={20} strokeWidth={1.8} /><span><span className="block text-sm font-semibold">{option === "square" ? "Square post" : "Story"}</span><span className={`mt-0.5 block text-[10px] ${selected ? "text-white/50" : "text-[var(--soft-muted)]"}`}>{option === "square" ? "1:1 feed" : "9:16 vertical"}</span></span></button>;
                    })}
                  </div>
                </fieldset>

                <div className="mt-auto flex flex-wrap gap-3 pt-9"><button className="inline-flex items-center gap-2 rounded-full bg-[var(--chart-primary)] px-5 py-3 text-sm font-semibold text-[var(--chart-deep)] shadow-[0_10px_24px_rgba(216,154,66,.22)] transition hover:-translate-y-0.5" onClick={shareCard} type="button"><Share2 size={16} />Share image</button><button className="inline-flex items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--chart-deep)_15%,transparent)] bg-white/65 px-5 py-3 text-sm font-semibold text-[var(--chart-deep)] transition hover:bg-white" onClick={downloadCard} type="button"><Download size={16} />Download</button></div>
                {shareMessage && <p className="mt-4 text-xs text-[var(--soft-icon-green)]" role="status">{shareMessage}</p>}
              </div>

              <div className="grid min-h-[620px] place-items-center overflow-hidden rounded-[26px] bg-[linear-gradient(145deg,var(--soft-tint-a),var(--soft-surface))] p-5 sm:p-8">
                <div className={`relative overflow-hidden bg-[var(--chart-deep)] pb-16 text-white shadow-[0_30px_70px_rgba(20,61,49,.28)] transition-all duration-500 ${format === "story" ? "aspect-[9/16] w-full max-w-[310px] rounded-[34px] p-7 pb-14" : "aspect-square w-full max-w-[560px] rounded-[38px] p-8 pb-16 sm:p-10 sm:pb-16"}`}>
                  <div className="absolute -right-24 -top-24 size-64 rounded-full border-[42px] border-[color:color-mix(in_srgb,var(--chart-primary)_18%,transparent)]" />
                  <div className="absolute -bottom-32 -left-28 size-72 rounded-full bg-[color:color-mix(in_srgb,var(--chart-blue)_14%,transparent)] blur-2xl" />
                  <div className="relative flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--chart-primary)]">Aduvia · {monthName}</p><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] uppercase tracking-[0.13em] text-white/55">Monthly proof</span></div>

                  <div className="relative mt-8 flex items-center gap-5">
                    <div className="grid size-32 shrink-0 place-items-center rounded-full p-[9px]" style={{ background: `conic-gradient(var(--chart-primary) ${overallConsistency * 3.6}deg, rgba(255,255,255,.1) 0deg)` }}><div className="grid size-full place-items-center rounded-full bg-[var(--chart-deep)] text-center"><div><p className="text-4xl font-semibold tracking-[-0.06em]">{overallConsistency}%</p><p className="mt-1 text-[8px] uppercase tracking-[0.16em] text-white/45">consistent</p></div></div></div>
                    <div><p className="text-xs uppercase tracking-[0.13em] text-white/40">You showed up</p><p className="mt-1 text-3xl font-semibold tracking-[-0.04em]">{daysShownUp} days</p><p className="mt-2 max-w-[180px] text-xs leading-5 text-white/45">A month built one quiet check-in at a time.</p></div>
                  </div>

                  <div className="relative mt-7 border-t border-white/10 pt-5"><div className="flex items-end justify-between"><div><p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-[var(--chart-primary)]">Side quests cleared</p><p className="mt-1 text-2xl font-semibold">{completedQuestTitles.length} wins</p></div><span className="text-xs text-white/35">{monthLabel}</span></div><div className="relative mt-4 space-y-2.5 before:absolute before:bottom-4 before:left-4 before:top-4 before:w-px before:bg-white/10">{visibleShareQuests.map((quest, index) => <div className="relative flex items-center gap-3" key={quest}><span className="z-10 grid size-8 shrink-0 place-items-center rounded-full bg-[var(--chart-primary)] text-[10px] font-black text-[var(--chart-deep)]">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1 rounded-2xl bg-white/[0.055] px-3 py-2.5"><p className="truncate text-sm font-semibold">{quest}</p></div></div>)}{remainingShareQuests > 0 && <div className="ml-11 inline-flex rounded-full border border-[var(--chart-primary)]/25 bg-[var(--chart-primary)]/10 px-3 py-1.5 text-[10px] font-semibold text-[var(--chart-primary)]">+{remainingShareQuests} more {remainingShareQuests === 1 ? "win" : "wins"}</div>}</div></div>
                  <div className="absolute bottom-7 left-8 right-8 flex items-center justify-between text-[9px] uppercase tracking-[0.14em] text-white/30"><span>Small steps, visible proof.</span><span>aduvia</span></div>
                </div>
              </div>
            </div>
          </section>
      </div>
    </AppShell>
  );
}
