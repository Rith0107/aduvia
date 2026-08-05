import type { QuestSummary } from "./types";

export const sampleQuests: QuestSummary[] = [
  { id: "portfolio", title: "Build portfolio homepage", category: "Career", status: "in-progress", completedMilestones: 3, totalMilestones: 5, dueLabel: "Aug 18", effortHours: 12, color: "amber" },
  { id: "react-course", title: "Finish advanced React course", category: "Learning", status: "in-progress", completedMilestones: 6, totalMilestones: 10, dueLabel: "Aug 24", effortHours: 18, color: "blue" },
  { id: "trail", title: "Hike a new trail", category: "Personal", status: "not-started", completedMilestones: 0, totalMilestones: 3, dueLabel: "Aug 29", effortHours: 5, color: "green" },
  { id: "reading", title: "Read The Creative Act", category: "Creative", status: "blocked", completedMilestones: 2, totalMilestones: 6, dueLabel: "Aug 31", effortHours: 8, color: "rose" },
  { id: "budget", title: "Create a monthly budget", category: "Finance", status: "completed", completedMilestones: 4, totalMilestones: 4, dueLabel: "Completed", effortHours: 3, color: "green" },
];
