export type HabitFrequency = "Daily" | "Weekdays" | "3× weekly" | "Custom";
export type HabitDay = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
export type HabitState = "active" | "paused";

export type HabitSummary = {
  id: string;
  createdAt?: string;
  name: string;
  category: string;
  frequency: HabitFrequency;
  scheduledDays?: HabitDay[];
  isAnchor?: boolean;
  consistency: number;
  streak: number;
  state: HabitState;
  color: "green" | "amber" | "rose" | "blue";
};
