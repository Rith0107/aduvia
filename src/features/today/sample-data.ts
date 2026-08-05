import type { SideQuestSummary, TodayHabit } from "./types";

export const sampleHabits: TodayHabit[] = [
  {
    id: "morning-walk",
    name: "Morning walk",
    category: "Fitness",
    target: "30 minutes",
    priority: 2,
    completion: 1,
    status: "complete",
  },
  {
    id: "deep-work",
    name: "Deep work",
    category: "Career",
    target: "90 minutes",
    priority: 3,
    completion: 1,
    status: "complete",
  },
  {
    id: "read",
    name: "Read",
    category: "Learning",
    target: "20 pages",
    priority: 2,
    completion: 0,
    status: "pending",
  },
  {
    id: "meditate",
    name: "Meditate",
    category: "Mindfulness",
    target: "10 minutes",
    priority: 1,
    completion: 0,
    status: "pending",
  },
];

export const sampleSideQuest: SideQuestSummary = {
  title: "Build portfolio homepage",
  completedMilestones: 3,
  totalMilestones: 5,
};
