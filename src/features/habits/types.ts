export type HabitFrequency = "Daily" | "Weekdays" | "3× weekly" | "Custom";
export type HabitState = "active" | "paused";

export type HabitSummary = {
  id: string;
  name: string;
  category: string;
  frequency: HabitFrequency;
  consistency: number;
  streak: number;
  state: HabitState;
  color: "green" | "amber" | "rose" | "blue";
};
