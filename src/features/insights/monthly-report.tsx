"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AuroraSkyPreview } from "./aurora-sky-preview";
import { MonthCoverPreview } from "./month-cover-preview";
import { isHabitAvailableOn, isHabitScheduledOn, scheduledDaysFor, useAppData } from "@/lib/app-data";
import type { HabitSummary } from "@/features/habits/types";
import { Download, Share2, Smartphone, Square } from "lucide-react";
import { toBlob } from "html-to-image";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

type CellState = "done" | "missed" | "off" | "pending";
type ShareFormat = "square" | "story";
type ShareTrim = "orbit" | "archive" | "aurora" | "cover";

type ReportHabit = {
  id: string;
  name: string;
  category: string;
  color: string;
  days: CellState[];
};

type HistoricalHabit = Pick<HabitSummary, "id" | "createdAt" | "frequency" | "scheduledDays" | "state">;

const fallbackCompletedQuests = ["Created a monthly budget", "Shipped my portfolio homepage"];

function TrendActiveDot({ cx = 0, cy = 0, payload }: { cx?: number; cy?: number; payload?: { label: string; score: number } }) {
  if (!payload) return null;

  return (
    <g aria-label={`${payload.label}: ${payload.score}% consistency`}>
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

export function reportCellState(habit: HistoricalHabit, date: Date, answer?: "complete" | "skipped", todayPending = false): CellState {
  // Imported or backfilled answers are authoritative even when they predate
  // the habit row. This preserves real history created during onboarding or migration.
  if (answer) return answer === "complete" ? "done" : "missed";
  if (!isHabitAvailableOn(habit as HabitSummary, date)) return "off";
  const weekday = (["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const)[date.getDay()];
  if (!scheduledDaysFor(habit as HabitSummary).includes(weekday)) return "off";
  return todayPending ? "pending" : "missed";
}

function habitConsistency(habit: ReportHabit) {
  const scheduled = habit.days.filter((day) => day !== "off" && day !== "pending");
  return scheduled.length ? Math.round((scheduled.filter((day) => day === "done").length / scheduled.length) * 100) : 0;
}

export function consistencyFromHabits(habits: ReportHabit[]) {
  const states = habits.flatMap((habit) => habit.days).filter((day) => day !== "off" && day !== "pending");
  return states.length ? Math.round(states.filter((day) => day === "done").length / states.length * 100) : 0;
}

export function dailyConsistencyFromHabits(habits: ReportHabit[], dayCount: number, monthName: string) {
  return Array.from({ length: dayCount }, (_, dayIndex) => {
    const answered = habits.filter((habit) => habit.days[dayIndex] === "done" || habit.days[dayIndex] === "missed");
    const completed = answered.filter((habit) => habit.days[dayIndex] === "done").length;
    return {
      day: dayIndex + 1,
      label: `${monthName.slice(0, 3)} ${dayIndex + 1}`,
      score: answered.length ? Math.round((completed / answered.length) * 100) : 0,
      completed,
      scheduled: answered.length,
    };
  });
}

export function heatmapState(point?: { completed: number; scheduled: number }) {
  if (!point || point.scheduled === 0) return "empty";
  if (point.completed === point.scheduled) return "complete";
  if (point.completed > 0) return "partial";
  return "none";
}

export function reportDayCount(reportYear: number, reportMonth: number, today = new Date()) {
  const calendarDays = new Date(reportYear, reportMonth + 1, 0).getDate();
  const reportStart = new Date(reportYear, reportMonth, 1);
  const currentStart = new Date(today.getFullYear(), today.getMonth(), 1);
  if (reportStart.getTime() === currentStart.getTime()) return today.getDate();
  return reportStart < currentStart ? calendarDays : 0;
}

function cardDimensions(format: ShareFormat) {
  return format === "story" ? { width: 1080, height: 1920 } : { width: 1080, height: 1080 };
}

async function renderPreviewElement(element: HTMLElement, format: ShareFormat) {
  // Measure the real rendered box rather than assuming a fixed size — an
  // assumed size wider than the actual element leaves the captured content
  // short of the requested canvas, and that unfilled margin renders as a
  // transparent gap/border once stretched into the output PNG.
  const rect = element.getBoundingClientRect();
  const sourceWidth = rect.width;
  const sourceHeight = rect.height;
  const { width, height } = cardDimensions(format);
  const blob = await toBlob(element, {
    cacheBust: true,
    canvasHeight: height,
    canvasWidth: width,
    height: sourceHeight,
    pixelRatio: 1,
    width: sourceWidth,
  });
  if (!blob) throw new Error("Could not create share image.");
  return blob;
}

async function renderShareCard(format: ShareFormat, trim: ShareTrim, consistency: number, monthLabel: string, completedQuestTitles: string[], habits: ReportHabit[], daysShownUp: number) {
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
  const blue = themeColor("--chart-blue", "#3d6678");
  const green = themeColor("--chart-green", "#174f3a");

  if (trim === "cover") {
    const rust = themeColor("--chart-rust", "#aa634e");
    const coverGradient = context.createLinearGradient(0, 0, width, height);
    coverGradient.addColorStop(0, surface);
    coverGradient.addColorStop(1, themeColor("--soft-tint-a", "#e7eeea"));
    context.fillStyle = coverGradient;
    context.fillRect(0, 0, width, height);
    context.strokeStyle = `${rust}55`;
    context.lineWidth = 3;
    [420, 300, 180].forEach((radius) => { context.beginPath(); context.arc(width + 30, 80, radius, 0, Math.PI * 2); context.stroke(); });

    const margin = 76;
    context.fillStyle = deep;
    context.font = "800 22px system-ui";
    context.fillText("ADUVIA / MONTH COVER", margin, 72);
    context.textAlign = "right";
    context.font = "700 20px system-ui";
    context.fillText(monthLabel.toUpperCase(), width - margin, 72);
    context.textAlign = "left";
    context.strokeStyle = `${deep}66`;
    context.beginPath(); context.moveTo(margin, 100); context.lineTo(width - margin, 100); context.stroke();

    const metricTop = format === "story" ? 210 : 170;
    context.fillStyle = deep;
    context.font = `900 ${format === "story" ? 230 : 190}px system-ui`;
    context.textAlign = "center";
    context.fillText(String(consistency), 290, metricTop + 185);
    context.fillStyle = rust;
    context.font = "800 18px system-ui";
    context.fillText("PERCENT RHYTHM", 290, metricTop + 235);

    context.strokeStyle = `${deep}33`;
    context.beginPath(); context.moveTo(590, metricTop); context.lineTo(590, metricTop + 265); context.stroke();
    context.fillStyle = deep;
    context.font = "900 74px system-ui";
    context.fillText(String(daysShownUp), 780, metricTop + 70);
    context.font = "800 16px system-ui";
    context.fillStyle = surfaceInk;
    context.fillText("DAYS IN ORBIT", 780, metricTop + 106);
    context.fillStyle = deep;
    context.font = "900 74px system-ui";
    context.fillText(String(habits.length), 780, metricTop + 205);
    context.font = "800 16px system-ui";
    context.fillStyle = surfaceInk;
    context.fillText("DAILY RITUALS", 780, metricTop + 241);

    const noteTop = format === "story" ? 650 : 510;
    context.strokeStyle = `${deep}55`;
    context.beginPath(); context.moveTo(margin, noteTop); context.lineTo(width - margin, noteTop); context.stroke();
    context.fillStyle = rust;
    context.textAlign = "left";
    context.font = "800 16px system-ui";
    context.fillText("RETURN NOTE", margin, noteTop + 46);
    context.fillStyle = deep;
    context.font = "700 54px system-ui";
    context.fillText(`I showed up ${daysShownUp} times.`, margin, noteTop + 115);
    context.strokeStyle = `${deep}55`;
    context.beginPath(); context.moveTo(margin, noteTop + 158); context.lineTo(width - margin, noteTop + 158); context.stroke();

    const questsTop = noteTop + 230;
    context.fillStyle = deep;
    context.font = "800 17px system-ui";
    context.fillText("QUEST HEADLINES", margin, questsTop);
    context.textAlign = "right";
    context.fillStyle = rust;
    context.fillText(`${completedQuestTitles.length} COMPLETED`, width - margin, questsTop);
    context.textAlign = "left";
    const coverQuests = completedQuestTitles.slice(0, format === "story" ? 5 : 3);
    coverQuests.forEach((quest, index) => {
      const y = questsTop + 76 + index * 84;
      const value = quest.toLowerCase();
      const glyph = value.includes("hike") || value.includes("trail") ? "▲" : value.includes("portfolio") || value.includes("website") ? "▦" : value.includes("course") || value.includes("certif") ? "◆" : value.includes("read") || value.includes("book") ? "▤" : value.includes("budget") || value.includes("money") ? "$" : "•";
      context.fillStyle = `${rust}22`;
      context.beginPath(); context.arc(margin + 24, y - 9, 28, 0, Math.PI * 2); context.fill();
      context.fillStyle = rust;
      context.textAlign = "center";
      context.font = "800 25px system-ui";
      context.fillText(glyph, margin + 24, y);
      context.textAlign = "left";
      context.fillStyle = deep;
      context.font = "700 23px system-ui";
      context.fillText(quest.length > 50 ? `${quest.slice(0, 49)}…` : quest, margin + 72, y);
      context.strokeStyle = `${deep}33`;
      context.beginPath(); context.moveTo(margin + 72, y + 22); context.lineTo(width - margin, y + 22); context.stroke();
    });
    context.fillStyle = surfaceInk;
    context.font = "600 16px system-ui";
    context.fillText("SMALL STEPS BECAME VISIBLE PROOF.", margin, height - 60);
    context.textAlign = "right";
    context.fillStyle = deep;
    context.font = "900 44px system-ui";
    context.fillText("A.", width - margin, height - 52);
    return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create image."))), "image/png"));
  }

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, deep);
  gradient.addColorStop(1, green);
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  if (trim === "archive") {
    context.strokeStyle = primary;
    context.lineWidth = 5;
    context.strokeRect(28, 28, width - 56, height - 56);
    context.strokeStyle = "rgba(255,255,255,.28)";
    context.lineWidth = 2;
    context.strokeRect(44, 44, width - 88, height - 88);
    context.fillStyle = primary;
    [[28, 28], [width - 28, 28], [28, height - 28], [width - 28, height - 28]].forEach(([x, y]) => { context.beginPath(); context.arc(x, y, 11, 0, Math.PI * 2); context.fill(); });
  }
  if (trim === "aurora") {
    const glow = context.createRadialGradient(width * .15, height * .12, 0, width * .15, height * .12, width * .65);
    glow.addColorStop(0, "rgba(124,227,210,.38)");
    glow.addColorStop(.55, "rgba(189,142,174,.18)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);
    const edge = context.createLinearGradient(0, 0, width, height);
    edge.addColorStop(0, "#8fe1d0");
    edge.addColorStop(.5, primary);
    edge.addColorStop(1, "#c99fc8");
    context.strokeStyle = edge;
    context.lineWidth = 14;
    context.strokeRect(12, 12, width - 24, height - 24);
  }

  context.strokeStyle = "rgba(255,255,255,.035)";
  context.lineWidth = 2;
  for (let y = 0; y < height; y += 26) {
    context.beginPath();
    for (let x = 0; x <= width; x += 18) {
      const waveY = y + Math.sin((x + y) / 58) * 7;
      if (x === 0) context.moveTo(x, waveY);
      else context.lineTo(x, waveY);
    }
    context.stroke();
  }

  const margin = 90;
  const headerY = format === "story" ? 150 : 92;
  if (trim === "aurora") {
    context.fillStyle = "rgba(10,30,38,.62)";
    context.beginPath();
    context.roundRect(margin - 28, headerY - 48, width - margin * 2 + 56, 76, 22);
    context.fill();
  }
  context.fillStyle = trim === "aurora" ? "#fffaf0" : primary;
  context.font = "700 25px system-ui";
  context.fillText("ADUVIA · MONTHLY CONSTELLATION", margin, headerY);
  context.fillStyle = trim === "aurora" ? "rgba(255,250,240,.82)" : "rgba(255,250,240,.48)";
  context.font = "500 22px system-ui";
  context.textAlign = "right";
  context.fillText(monthLabel.toUpperCase(), width - margin, headerY);
  context.textAlign = "left";

  const orbitCenterX = width / 2;
  const orbitCenterY = format === "story" ? 610 : 365;
  const orbitScale = format === "story" ? 1.25 : 1;
  const orbitColors = [primary, "#9bc9c1", blue, surfaceInk];
  habits.slice(0, 4).forEach((habit, index) => {
    const radiusX = (160 + index * 72) * orbitScale;
    const radiusY = (82 + index * 38) * orbitScale;
    context.save();
    context.translate(orbitCenterX, orbitCenterY);
    context.rotate((index - 1.5) * 0.12);
    context.strokeStyle = `rgba(255,255,255,${0.17 - index * 0.018})`;
    context.lineWidth = 2;
    context.beginPath();
    context.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
    context.stroke();
    const done = habit.days.filter((day) => day === "done").length;
    const markerCount = Math.min(format === "story" ? 16 : 12, Math.max(2, done));
    for (let marker = 0; marker < markerCount; marker += 1) {
      const angle = (marker / markerCount) * Math.PI * 2 + index * 0.7;
      context.fillStyle = orbitColors[index];
      context.globalAlpha = marker < Math.round(markerCount * habitConsistency(habit) / 100) ? 1 : 0.18;
      context.beginPath();
      context.arc(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY, marker % 4 === 0 ? 7 : 4, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  });
  context.globalAlpha = 1;

  context.fillStyle = deep;
  context.beginPath();
  context.arc(orbitCenterX, orbitCenterY, 104, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = primary;
  context.lineWidth = 9;
  context.beginPath();
  context.arc(orbitCenterX, orbitCenterY, 104, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * consistency / 100);
  context.stroke();
  context.fillStyle = "#fffaf0";
  context.textAlign = "center";
  context.font = "700 58px system-ui";
  context.fillText(`${consistency}%`, orbitCenterX, orbitCenterY + 12);
  context.font = "600 15px system-ui";
  context.fillStyle = "rgba(255,250,240,.5)";
  context.fillText("RHYTHM SIGNAL", orbitCenterX, orbitCenterY + 44);

  const ledgerTop = format === "story" ? 1120 : 680;
  context.fillStyle = surface;
  context.globalAlpha = 0.96;
  context.roundRect(margin, ledgerTop, width - margin * 2, format === "story" ? 560 : 280, 38);
  context.fill();
  context.globalAlpha = 1;
  context.textAlign = "left";
  context.fillStyle = surfaceInk;
  context.font = "700 19px system-ui";
  context.fillText("CONSTELLATION RECORD", margin + 42, ledgerTop + 48);
  context.fillStyle = ink;
  context.font = "700 44px system-ui";
  context.fillText(`${daysShownUp}`, margin + 42, ledgerTop + 108);
  context.font = "500 18px system-ui";
  context.fillStyle = surfaceInk;
  context.fillText("days in orbit", margin + 42, ledgerTop + 137);
  context.fillStyle = ink;
  context.font = "700 44px system-ui";
  context.fillText(`${habits.length}`, margin + 250, ledgerTop + 108);
  context.font = "500 18px system-ui";
  context.fillStyle = surfaceInk;
  context.fillText("daily rituals", margin + 250, ledgerTop + 137);
  context.fillStyle = ink;
  context.font = "700 44px system-ui";
  context.fillText(`${completedQuestTitles.length}`, margin + 450, ledgerTop + 108);
  context.font = "500 18px system-ui";
  context.fillStyle = surfaceInk;
  context.fillText("quests landed", margin + 450, ledgerTop + 137);

  const visibleQuests = completedQuestTitles.slice(0, format === "story" ? 5 : 3);
  const questStart = ledgerTop + 198;
  visibleQuests.forEach((quest, index) => {
    const x = margin + 42 + (format === "square" ? index * 278 : 0);
    const y = questStart + (format === "story" ? index * 66 : 0);
    context.fillStyle = primary;
    context.beginPath();
    context.arc(x + 11, y - 6, 10, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = ink;
    context.font = `600 ${format === "story" ? 25 : 19}px system-ui`;
    const maxLength = format === "story" ? 42 : 21;
    context.fillText(quest.length > maxLength ? `${quest.slice(0, maxLength - 1)}…` : quest, x + 30, y);
  });
  if (trim === "aurora") {
    context.fillStyle = "rgba(10,30,38,.62)";
    context.beginPath();
    context.roundRect(margin - 28, height - 92, width - margin * 2 + 56, 62, 20);
    context.fill();
  }
  context.fillStyle = trim === "aurora" ? "rgba(255,250,240,.86)" : "rgba(255,250,240,0.5)";
  context.font = "500 20px system-ui";
  context.fillText(`ISSUED ${monthLabel.toUpperCase()} · SMALL STEPS, VISIBLE PROOF`, margin, height - 55);

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create image."))), "image/png"),
  );
}

export function MonthlyReport() {
  const appData = useAppData();
  const now = new Date();
  const currentDay = now.getDate();
  const [reportMonth, setReportMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [fallbackHabits, setFallbackHabits] = useState(() => createReportHabits(now.getFullYear(), now.getMonth()));
  const [format, setFormat] = useState<ShareFormat>("square");
  const [auroraReady, setAuroraReady] = useState(false);
  const [shareTrim, setShareTrim] = useState<ShareTrim>("orbit");
  const [shareMessage, setShareMessage] = useState("");
  const reportMonthStart = new Date(reportMonth.year, reportMonth.month, 1);
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = reportDayCount(reportMonth.year, reportMonth.month, now);
  const currentDateKey = dateStorageKey(now.getFullYear(), now.getMonth(), currentDay);
  const todayScheduledHabits = appData?.habits.filter((habit) => isHabitScheduledOn(habit, now)) ?? [];
  const todayAnswers = appData?.completions[currentDateKey] ?? {};
  const todayIsClosed = todayScheduledHabits.length > 0 && todayScheduledHabits.every((habit) => Boolean(todayAnswers[habit.id]));
  const isCurrentMonth = reportMonthStart.getTime() === currentMonthStart.getTime();
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
        const answer = appData.completions[dateStorageKey(reportMonth.year, reportMonth.month, index + 1)]?.[habit.id];
        return reportCellState(habit, date, answer, isCurrentMonth && index + 1 === currentDay && !todayIsClosed);
      }),
    }));
  }, [appData, currentDay, daysInMonth, fallbackHabits, isCurrentMonth, reportMonth.month, reportMonth.year, todayIsClosed]);

  const overallConsistency = useMemo(
    () => consistencyFromHabits(habits),
    [habits],
  );
  const auroraHabits = useMemo(
    () => habits.map((habit) => ({ completedDays: habit.days.filter((day) => day === "done").length, name: habit.name })),
    [habits],
  );
  const dailyConsistency = useMemo(
    () => dailyConsistencyFromHabits(habits, daysInMonth, monthName),
    [daysInMonth, habits, monthName],
  );

  const weekdayReport = useMemo(() => {
    const labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return labels.map((name, weekday) => {
      const points = dailyConsistency.filter((point) => point.scheduled > 0 && new Date(reportMonth.year, reportMonth.month, point.day).getDay() === weekday);
      const scheduled = points.reduce((sum, point) => sum + point.scheduled, 0);
      const completed = points.reduce((sum, point) => sum + point.completed, 0);
      return { day: name.slice(0, 1), name, score: scheduled ? Math.round(completed / scheduled * 100) : 0, sampleSize: points.length };
    });
  }, [dailyConsistency, reportMonth.month, reportMonth.year]);
  const observedWeekdays = weekdayReport.filter((day) => day.sampleSize > 0);
  const bestDay = observedWeekdays.reduce((best, day) => day.score > best.score ? day : best, observedWeekdays[0] ?? { day: "–", name: "No data yet", score: 0, sampleSize: 0 });
  const daysShownUp = dailyConsistency.filter((point) => point.completed > 0).length;
  const completedQuestTitles = useMemo(
    () => appData ? appData.quests.filter((quest) => quest.status === "completed").map((quest) => quest.title) : fallbackCompletedQuests,
    [appData],
  );
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
        if (!isHabitAvailableOn(habit, date)) continue;
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

  async function createShareBlob() {
    if (shareTrim === "cover" || shareTrim === "aurora") {
      const previewLabel = shareTrim === "cover" ? "Month Cover share preview" : "Aurora Sky share preview";
      const preview = document.querySelector<HTMLElement>(`[aria-label="${previewLabel}"]`);
      if (!preview) throw new Error(`${shareTrim === "cover" ? "Month Cover" : "Aurora Sky"} preview is unavailable.`);
      if (preview instanceof HTMLImageElement && preview.dataset.shareRaster === "true") {
        const response = await fetch(preview.src);
        if (!response.ok) throw new Error("Aurora Sky image is unavailable.");
        return response.blob();
      }
      if (shareTrim === "aurora") {
        throw new Error("Aurora Sky is still preparing. Please try sharing again in a moment.");
      }
      return renderPreviewElement(preview, format);
    }
    return renderShareCard(format, shareTrim, overallConsistency, monthLabel, completedQuestTitles, habits, daysShownUp);
  }

  async function downloadCard() {
    const blob = await createShareBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aduvia-${monthName.toLowerCase()}-${reportMonth.year}-${format}.png`;
    link.click();
    URL.revokeObjectURL(url);
    setShareMessage("Image downloaded. Share it anywhere you like.");
  }

  async function shareCard() {
    const blob = await createShareBlob();
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
                <div className="grid grid-cols-7 gap-1.5 rounded-2xl bg-white/[0.08] p-4" aria-label={`${monthName} activity heatmap`} role="img">{Array.from({ length: Math.ceil(daysInMonth / 7) * 7 }, (_, index) => { const point = dailyConsistency[index]; const state = heatmapState(point); return <span aria-hidden="true" className={`size-3 rounded-[4px] ${state === "complete" ? "bg-[var(--heatmap-high)]" : state === "partial" ? "bg-[var(--heatmap-mid)]" : state === "none" ? "bg-[var(--heatmap-low)]" : "bg-transparent"}`} key={index} title={point ? `${monthName} ${point.day} · ${point.completed} of ${point.scheduled} completed` : undefined} />; })}</div>
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
            <article className="relative mx-auto flex aspect-square w-full max-w-[310px] flex-col items-center justify-center overflow-hidden rounded-full bg-[var(--soft-tint-c)] p-10 text-center text-[var(--soft-icon-blue)] shadow-[0_26px_60px_-34px_rgba(40,79,97,.5)] lg:mx-0"><div className="absolute -right-10 -top-10 size-36 rounded-full border-[26px] border-white/25" /><p className="absolute left-1/2 top-12 -translate-x-1/2 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.15em] opacity-55">Best weekday so far</p><div className="relative -translate-y-1"><p className="text-4xl font-semibold tracking-[-0.05em]">{bestDay.name}</p><p className="mx-auto mt-2 max-w-[230px] text-sm leading-5 opacity-60">{bestDay.sampleSize ? `${bestDay.score}% across ${bestDay.sampleSize} ${bestDay.sampleSize === 1 ? "day" : "days"}.` : "Complete a check-in to begin."}</p></div><span className="absolute bottom-9 left-1/2 grid size-11 -translate-x-1/2 place-items-center rounded-full bg-[var(--soft-icon-blue)] text-xl text-white">↗</span></article>
            <article className="overflow-hidden rounded-[52px] bg-[var(--chart-surface)] p-6 text-[var(--chart-ink)] shadow-[0_28px_65px_-42px_rgba(110,91,60,.55)] sm:p-8"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] opacity-55">Weekly rhythm</p><p className="mt-2 text-xl font-semibold">Completion by weekday</p></div><div className="mt-4 h-36"><ResponsiveContainer height="100%" width="100%"><BarChart data={weekdayReport} margin={{ top: 42 }}><XAxis axisLine={false} dataKey="day" tick={{ fill: "var(--chart-ink)", fontSize: 10 }} tickLine={false} /><Tooltip content={() => null} cursor={false} /><Bar activeBar={<RhythmActiveBar />} dataKey="score" fill="var(--chart-ink)" radius={[18, 18, 18, 18]} /></BarChart></ResponsiveContainer></div></article>
          </section>

          <section className="mt-7 rounded-[44px] border border-white/70 bg-[color:color-mix(in_srgb,var(--soft-surface)_80%,transparent)] p-4 shadow-[0_26px_70px_-48px_rgba(34,61,49,.42)] sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-semibold">Daily consistency map</h2><p className="mt-1 text-sm text-[var(--soft-muted)]">Read-only history from your daily check-ins.</p></div><div className="flex flex-wrap gap-3 text-xs text-[var(--soft-muted)]"><span className="flex items-center gap-1.5"><i className="size-3 rounded bg-[var(--chart-green)]" />Done</span><span className="flex items-center gap-1.5"><i className="size-3 rounded bg-[var(--theme-missed)]" />Missed</span><span className="flex items-center gap-1.5"><i className="size-3 rounded border border-[var(--soft-muted)]/25 bg-transparent" />Today pending</span><span className="flex items-center gap-1.5"><i className="size-3 rounded bg-[var(--theme-muted-cell)]" />Not scheduled</span></div></div>
            <div aria-label="Daily consistency table. Scroll horizontally to view every day." className="mt-6 overflow-x-auto rounded-2xl border border-black/[0.06] bg-[var(--theme-paper)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]" role="region" tabIndex={0}>
              <table className="table-fixed border-separate border-spacing-0 text-xs" style={{ minWidth: `${256 + daysInMonth * 40}px`, width: `max(100%, ${256 + daysInMonth * 40}px)` }}>
                <colgroup><col style={{ width: 176 }} />{Array.from({ length: daysInMonth }, (_, index) => <col key={index} style={{ width: 40 }} />)}<col style={{ width: 80 }} /></colgroup>
                <thead><tr><th className="sticky left-0 z-10 w-44 border-b border-r border-black/[0.07] bg-[var(--theme-paper-warm)] px-4 py-3 text-left font-semibold">Habit</th>{Array.from({ length: daysInMonth }, (_, index) => { const isToday = viewingCurrentMonth && index + 1 === now.getDate(); return <th aria-current={isToday ? "date" : undefined} className={`w-10 border-b border-black/[0.06] py-3 text-center font-medium ${isToday ? "bg-[var(--theme-highlight)] text-[var(--chart-ink)]" : "text-[var(--soft-muted)]"}`} key={index}>{index + 1}</th>; })}<th className="sticky right-0 z-10 w-20 border-b border-l border-black/[0.07] bg-[var(--theme-paper-warm)] px-2 font-semibold">Score</th></tr></thead>
                <tbody>{habits.map((habit) => <tr key={habit.id}><th className="sticky left-0 z-10 border-b border-r border-black/[0.06] bg-[var(--theme-paper)] px-4 py-3 text-left font-medium"><span className="mr-2 inline-block size-2 rounded-full" style={{ backgroundColor: habit.color }} />{habit.name}</th>{habit.days.map((state, dayIndex) => { const isToday = viewingCurrentMonth && dayIndex + 1 === now.getDate(); return <td className={`border-b border-black/[0.04] p-1 text-center ${isToday ? "bg-[color:color-mix(in_srgb,var(--theme-highlight)_55%,transparent)]" : ""}`} key={dayIndex}><span aria-label={`${habit.name}, ${monthName} ${dayIndex + 1}: ${state}`} className={`mx-auto grid size-8 place-items-center rounded-lg text-[11px] font-bold ${state === "done" ? "bg-[var(--chart-green)] text-white" : state === "missed" ? "bg-[var(--theme-missed)] text-[var(--chart-rust)]" : "bg-[var(--theme-muted-cell)] text-[var(--soft-muted)] opacity-55"}`}>{state === "done" ? "✓" : state === "missed" ? "·" : state === "pending" ? "○" : "–"}</span></td>; })}<td className="sticky right-0 z-10 border-b border-l border-black/[0.06] bg-[var(--theme-paper)] text-center font-semibold text-[var(--chart-green)]">{habitConsistency(habit)}%</td></tr>)}</tbody>
              </table>
              <div aria-label={`Daily consistency across ${monthName}`} className="grid border-t border-white/10 bg-[var(--chart-deep)] text-white" style={{ gridTemplateColumns: `176px minmax(${daysInMonth * 40}px, 1fr) 80px`, minWidth: `${256 + daysInMonth * 40}px`, width: `max(100%, ${256 + daysInMonth * 40}px)` }}>
                <div className="flex flex-col justify-center border-r border-white/10 px-5"><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--chart-primary)]">{daysInMonth}-day pulse</p><p className="mt-2 text-sm font-semibold leading-5">Daily<br />consistency</p></div>
                <div className="flex h-52 items-center px-2"><ResponsiveContainer height={44} width="100%"><LineChart data={dailyConsistency}><Line dataKey="score" dot={false} isAnimationActive={false} stroke="var(--chart-primary)" strokeWidth={1.75} type="monotone" /></LineChart></ResponsiveContainer></div>
                <div className="flex flex-col items-center justify-center border-l border-white/10 text-center"><p className="text-2xl font-semibold tracking-[-0.04em] text-[var(--chart-primary)]">{overallConsistency}%</p><p className="mt-1 text-[8px] font-semibold uppercase leading-3 tracking-[0.12em] text-white/55">Month<br />average</p></div>
              </div>
            </div>
          </section>

          <section className="mt-7 overflow-hidden rounded-[52px] border border-white/70 bg-[var(--soft-tint-a)] p-3 shadow-[0_30px_80px_-42px_rgba(28,54,43,.32)] sm:p-5">
            <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
              <div className="flex flex-col p-4 sm:p-6">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--chart-deep)] text-[var(--chart-primary)] shadow-[0_10px_24px_rgba(20,61,49,.18)]"><Share2 size={21} strokeWidth={1.8} /></div>
                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.17em] text-[var(--soft-accent)]">Share studio</p>
                <h2 className="mt-3 max-w-sm text-4xl font-semibold tracking-[-0.055em] text-[var(--soft-ink)]">Map your month into a constellation.</h2>
                <p className="mt-4 max-w-md text-sm leading-6 text-stone-500">Each orbit is a habit, every bright marker is proof you showed up, and completed quests become landed discoveries. Private notes and missed-day details stay private.</p>

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

                <fieldset className="mt-6">
                  <legend className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400">Choose a trim</legend>
                  <div className="mt-3 grid max-w-md grid-cols-2 gap-2 sm:grid-cols-4">{(["orbit", "archive", "aurora", "cover"] as const).map((trim) => <button aria-label={trim === "cover" ? "Month Cover" : undefined} aria-pressed={shareTrim === trim} className={`group rounded-[18px] border p-2 text-left transition ${shareTrim === trim ? "border-[var(--chart-deep)] bg-white/70 shadow-md" : "border-transparent bg-white/35 hover:bg-white/60"}`} key={trim} onClick={() => setShareTrim(trim)} type="button"><span className={`relative block h-14 overflow-hidden ${trim === "archive" ? "rounded-[3px] border-[3px] border-[var(--chart-primary)] bg-[var(--chart-ink)] outline outline-1 outline-offset-[-7px] outline-white/35" : trim === "aurora" ? "rounded-[13px] border-[3px] border-[#9edfd5] bg-[radial-gradient(circle_at_15%_10%,#9edfd588,transparent_52%),linear-gradient(135deg,var(--chart-deep),#50466f)] shadow-[0_0_14px_#9edfd566]" : trim === "cover" ? "rounded-[5px] bg-[var(--chart-surface)] shadow-[4px_4px_0_var(--chart-deep)]" : "rounded-[13px] bg-[var(--chart-deep)]"}`}>{trim === "cover" ? <><strong className="absolute bottom-1 left-2 text-3xl font-black leading-none text-[var(--chart-deep)]">71</strong><i className="absolute -right-3 -top-3 size-9 rounded-full border border-[var(--chart-rust)]/40" /></> : <><i className="absolute left-1/2 top-1/2 h-5 w-10 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-white/30" /><i className="absolute left-1/2 top-1/2 h-3 w-7 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[var(--chart-primary)]/55" /></>}</span><span className="mt-2 block text-[10px] font-bold text-[var(--soft-ink)]">{trim === "orbit" ? "Soft Orbit" : trim === "archive" ? "Archive File" : trim === "aurora" ? "Aurora Glow" : "Month Cover"}</span></button>)}</div>
                </fieldset>

                <div className="mt-auto flex flex-wrap gap-3 pt-9"><button className="inline-flex items-center gap-2 rounded-full bg-[var(--chart-primary)] px-5 py-3 text-sm font-semibold text-[var(--chart-deep)] shadow-[0_10px_24px_rgba(216,154,66,.22)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-55 disabled:hover:translate-y-0" disabled={shareTrim === "aurora" && !auroraReady} onClick={shareCard} type="button"><Share2 size={16} />{shareTrim === "aurora" && !auroraReady ? "Preparing Aurora…" : "Share image"}</button><button className="inline-flex items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--chart-deep)_15%,transparent)] bg-white/65 px-5 py-3 text-sm font-semibold text-[var(--chart-deep)] transition hover:bg-white disabled:cursor-wait disabled:opacity-55" disabled={shareTrim === "aurora" && !auroraReady} onClick={downloadCard} type="button"><Download size={16} />Download</button></div>
                {shareMessage && <p className="mt-4 text-xs text-[var(--soft-icon-green)]" role="status">{shareMessage}</p>}
              </div>

              <div className="grid min-h-[620px] place-items-center overflow-hidden rounded-[26px] bg-[linear-gradient(145deg,var(--soft-tint-a),var(--soft-surface))] p-5 sm:p-8">
                {shareTrim === "cover" ? <MonthCoverPreview completedQuests={completedQuestTitles} consistency={overallConsistency} daysShownUp={daysShownUp} format={format} habitCount={habits.length} monthName={monthName} year={reportMonth.year} /> : shareTrim === "aurora" ? <AuroraSkyPreview completedQuests={completedQuestTitles} consistency={overallConsistency} daysShownUp={daysShownUp} format={format} habits={auroraHabits} monthName={monthName} onRasterReadyChange={setAuroraReady} year={reportMonth.year} /> : <div className={`relative overflow-hidden text-white transition-all duration-500 ${shareTrim === "archive" ? "rounded-[4px] border-[10px] border-[var(--chart-surface)] outline outline-2 outline-offset-[-19px] outline-[var(--chart-primary)] shadow-[0_28px_65px_rgba(52,42,31,.3)]" : "rounded-[38px] shadow-[0_30px_70px_rgba(20,61,49,.28)]"} ${format === "story" ? "aspect-[9/16] w-full max-w-[310px] p-6" : "aspect-square w-full max-w-[560px] p-8 sm:p-9"}`} style={{ backgroundImage: shareTrim === "archive" ? "linear-gradient(145deg, color-mix(in srgb, var(--chart-ink) 72%, #171a18), var(--chart-deep))" : "linear-gradient(145deg,var(--chart-deep),color-mix(in srgb,var(--chart-deep) 78%,var(--chart-green)))" }}>
                  <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-radial-gradient(ellipse at 25% 10%, transparent 0 15px, rgba(255,255,255,.055) 16px 17px)" }} />
                  {shareTrim === "archive" && <><i className="absolute left-3 top-3 size-2 rounded-full bg-[var(--chart-primary)]" /><i className="absolute right-3 top-3 size-2 rounded-full bg-[var(--chart-primary)]" /><i className="absolute bottom-3 left-3 size-2 rounded-full bg-[var(--chart-primary)]" /><i className="absolute bottom-3 right-3 size-2 rounded-full bg-[var(--chart-primary)]" /><span className="absolute bottom-1/2 right-2 translate-y-1/2 rotate-90 text-[6px] font-black uppercase tracking-[.22em] text-white/25">Rhythm archive · verified record</span></>}
                  <div className="relative flex items-start justify-between"><div><p className="text-[9px] font-black uppercase tracking-[0.21em] text-[var(--chart-primary)]">Aduvia</p><p className="mt-1 text-[8px] uppercase tracking-[.14em] text-white/40">Monthly constellation</p></div><div className="text-right"><p className="text-[9px] font-semibold uppercase tracking-[.14em]">{monthName}</p><p className="mt-1 text-[8px] text-white/35">{reportMonth.year} · #{String(reportMonth.month + 1).padStart(2, "0")}</p></div></div>

                  <div className={`relative mx-auto ${format === "story" ? "mt-8 h-[43%] w-full" : "mt-3 h-[48%] w-[92%]"}`} aria-label={`${monthLabel} habit constellation`}>
                    {habits.slice(0, 4).map((habit, orbitIndex) => {
                      const sizes = format === "story" ? [42, 58, 74, 90] : [40, 57, 74, 91];
                      const markerCount = Math.min(10, Math.max(2, habit.days.filter((day) => day === "done").length));
                      return <div className="absolute left-1/2 top-1/2 rounded-[50%] border border-white/15" key={habit.id} style={{ height: `${sizes[orbitIndex] * .48}%`, transform: `translate(-50%, -50%) rotate(${(orbitIndex - 1.5) * 7}deg)`, width: `${sizes[orbitIndex]}%` }}>{Array.from({ length: markerCount }, (_, markerIndex) => { const angle = markerIndex / markerCount * Math.PI * 2 + orbitIndex * .7; return <i className="absolute block rounded-full bg-[var(--chart-primary)] shadow-[0_0_10px_color-mix(in_srgb,var(--chart-primary)_65%,transparent)]" key={markerIndex} style={{ height: markerIndex % 4 === 0 ? 7 : 4, left: `${50 + Math.cos(angle) * 50}%`, opacity: markerIndex < Math.round(markerCount * habitConsistency(habit) / 100) ? 1 : .2, top: `${50 + Math.sin(angle) * 50}%`, transform: "translate(-50%, -50%)", width: markerIndex % 4 === 0 ? 7 : 4 }} />; })}</div>;
                    })}
                    <div className="absolute left-1/2 top-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[var(--chart-deep)] p-[6px] shadow-[0_15px_35px_rgba(0,0,0,.25)]" style={{ background: `conic-gradient(var(--chart-primary) ${overallConsistency * 3.6}deg, rgba(255,255,255,.12) 0deg)` }}><div className="grid size-full place-items-center rounded-full bg-[var(--chart-deep)] text-center"><div><p className="text-2xl font-semibold tracking-[-.06em]">{overallConsistency}%</p><p className="text-[6px] uppercase tracking-[.16em] text-white/45">rhythm signal</p></div></div></div>
                  </div>

                  <div className={`relative rounded-[22px] bg-[var(--chart-surface)] text-[var(--soft-ink)] ${format === "story" ? "p-4" : "p-5"}`}><p className="text-[7px] font-black uppercase tracking-[.18em] text-[var(--chart-ink)]">Constellation record</p><div className="mt-3 grid grid-cols-3 gap-2"><div><p className="text-2xl font-semibold">{daysShownUp}</p><p className="text-[7px] text-[var(--chart-ink)]">days in orbit</p></div><div><p className="text-2xl font-semibold">{habits.length}</p><p className="text-[7px] text-[var(--chart-ink)]">daily rituals</p></div><div><p className="text-2xl font-semibold">{completedQuestTitles.length}</p><p className="text-[7px] text-[var(--chart-ink)]">quests landed</p></div></div><div className={`mt-4 border-t border-[var(--chart-ink)]/15 pt-3 ${format === "story" ? "space-y-2" : "grid grid-cols-3 gap-2"}`}>{visibleShareQuests.map((quest, index) => <div className="flex min-w-0 items-center gap-2" key={quest}><span className="size-2 shrink-0 rounded-full bg-[var(--chart-primary)]" /><p className="truncate text-[8px] font-semibold">{String(index + 1).padStart(2, "0")} · {quest}</p></div>)}{remainingShareQuests > 0 && <p className="text-[8px] font-semibold text-[var(--chart-ink)]">+{remainingShareQuests} more in orbit</p>}</div></div>
                  <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-[6px] uppercase tracking-[.14em] text-white/35"><span>Issued {monthLabel}</span><span>Small steps · visible proof</span></div>
                </div>}
              </div>
            </div>
          </section>
      </div>
    </AppShell>
  );
}
