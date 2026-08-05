import type { HabitSummary } from "./types";

export const sampleHabitSummaries: HabitSummary[] = [
  { id: "walk", name: "Morning walk", category: "Fitness", frequency: "Daily", consistency: 88, streak: 6, state: "active", color: "green" },
  { id: "deep-work", name: "Deep work", category: "Career", frequency: "Weekdays", consistency: 92, streak: 9, state: "active", color: "blue" },
  { id: "read", name: "Read 20 pages", category: "Learning", frequency: "Daily", consistency: 71, streak: 3, state: "active", color: "amber" },
  { id: "meditate", name: "Meditate", category: "Mindfulness", frequency: "3× weekly", consistency: 64, streak: 2, state: "active", color: "rose" },
  { id: "journal", name: "Evening journal", category: "Mindfulness", frequency: "Daily", consistency: 79, streak: 0, state: "paused", color: "rose" },
];
