import { monthKey } from "@/lib/calendar";
import type { QuestSummary } from "./types";

const now = new Date();
const thisMonth = monthKey(now);

// A first-time visitor has no history yet, so the default set is entirely
// current-month quests — nothing here should ever trigger the past-month
// rollover prompt on a fresh session.
export const sampleQuests: QuestSummary[] = [
  { id: "portfolio", title: "Build portfolio homepage", category: "Career", status: "not-started", dueLabel: "Aug 18", effortHours: 12, color: "amber", targetMonth: thisMonth, completedAt: null, carriedFromId: null, rolloverReviewedAt: null },
  { id: "react-course", title: "Finish advanced React course", category: "Learning", status: "not-started", dueLabel: "Aug 24", effortHours: 18, color: "blue", targetMonth: thisMonth, completedAt: null, carriedFromId: null, rolloverReviewedAt: null },
  { id: "trail", title: "Hike a new trail", category: "Personal", status: "not-started", dueLabel: "Aug 29", effortHours: 5, color: "green", targetMonth: thisMonth, completedAt: null, carriedFromId: null, rolloverReviewedAt: null },
  { id: "reading", title: "Read The Creative Act", category: "Creative", status: "not-started", dueLabel: "Aug 31", effortHours: 8, color: "rose", targetMonth: thisMonth, completedAt: null, carriedFromId: null, rolloverReviewedAt: null },
  { id: "budget", title: "Create a monthly budget", category: "Finance", status: "completed", dueLabel: "Completed", effortHours: 3, color: "green", targetMonth: thisMonth, completedAt: now.toISOString(), carriedFromId: null, rolloverReviewedAt: null },
];
