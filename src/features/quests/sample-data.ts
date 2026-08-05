import type { QuestSummary } from "./types";

export const sampleQuests: QuestSummary[] = [
  { id: "portfolio", title: "Build portfolio homepage", category: "Career", status: "in-progress", dueLabel: "Aug 18", effortHours: 12, color: "amber" },
  { id: "react-course", title: "Finish advanced React course", category: "Learning", status: "in-progress", dueLabel: "Aug 24", effortHours: 18, color: "blue" },
  { id: "trail", title: "Hike a new trail", category: "Personal", status: "not-started", dueLabel: "Aug 29", effortHours: 5, color: "green" },
  { id: "reading", title: "Read The Creative Act", category: "Creative", status: "blocked", dueLabel: "Aug 31", effortHours: 8, color: "rose" },
  { id: "budget", title: "Create a monthly budget", category: "Finance", status: "completed", dueLabel: "Completed", effortHours: 3, color: "green" },
];
