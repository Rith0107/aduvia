import { monthKey } from "@/lib/calendar";
import type { QuestSummary } from "./types";

const now = new Date();
const thisMonth = monthKey(now);
const lastMonth = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));

export const sampleQuests: QuestSummary[] = [
  { id: "portfolio", title: "Build portfolio homepage", category: "Career", status: "in-progress", dueLabel: "Aug 18", effortHours: 12, color: "amber", targetMonth: thisMonth, completedAt: null, carriedFromId: null, rolloverReviewedAt: null },
  { id: "react-course", title: "Finish advanced React course", category: "Learning", status: "in-progress", dueLabel: "Aug 24", effortHours: 18, color: "blue", targetMonth: thisMonth, completedAt: null, carriedFromId: null, rolloverReviewedAt: null },
  { id: "trail", title: "Hike a new trail", category: "Personal", status: "not-started", dueLabel: "Aug 29", effortHours: 5, color: "green", targetMonth: thisMonth, completedAt: null, carriedFromId: null, rolloverReviewedAt: null },
  { id: "reading", title: "Read The Creative Act", category: "Creative", status: "blocked", dueLabel: "Aug 31", effortHours: 8, color: "rose", targetMonth: thisMonth, completedAt: null, carriedFromId: null, rolloverReviewedAt: null },
  { id: "budget", title: "Create a monthly budget", category: "Finance", status: "completed", dueLabel: "Completed", effortHours: 3, color: "green", targetMonth: thisMonth, completedAt: now.toISOString(), carriedFromId: null, rolloverReviewedAt: null },
  { id: "last-month-unfinished", title: "Read two books", category: "Learning", status: "in-progress", dueLabel: "Last month", effortHours: 6, color: "blue", targetMonth: lastMonth, completedAt: null, carriedFromId: null, rolloverReviewedAt: null },
  { id: "last-month-done", title: "Plan the family trip", category: "Personal", status: "completed", dueLabel: "Completed", effortHours: 4, color: "green", targetMonth: lastMonth, completedAt: new Date(now.getFullYear(), now.getMonth() - 1, 20).toISOString(), carriedFromId: null, rolloverReviewedAt: null },
];
