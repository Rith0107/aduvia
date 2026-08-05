export type HabitPriority = 1 | 2 | 3;

export type HabitStatus = "pending" | "complete" | "partial" | "skipped";

export type TodayHabit = {
  id: string;
  name: string;
  category: string;
  target: string;
  priority: HabitPriority;
  completion: number;
  status: HabitStatus;
};

export type SideQuestSummary = {
  title: string;
  completedMilestones: number;
  totalMilestones: number;
};
