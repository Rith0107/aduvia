export type HabitFrequency = "Daily" | "Weekdays" | "3× weekly" | "Custom";
export type HabitDay = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
export type HabitState = "active" | "paused" | "completed";
export type HabitStatusEvent = { status: HabitState; effectiveAt: string };

export type HabitSummary = {
  id: string;
  createdAt?: string;
  statusHistory?: HabitStatusEvent[];
  name: string;
  category: string;
  frequency: HabitFrequency;
  scheduledDays?: HabitDay[];
  isAnchor?: boolean;
  consistency: number;
  /** How many check-in records `consistency` is based on. Lets an average
   * across habits weight a long-tracked habit more than a brand-new one
   * with no history yet, instead of a fresh habit's unearned 0% dragging
   * the average down starting the moment it's created. Undefined means
   * "weight normally" (1), for demo data and habits where this isn't tracked. */
  checkInCount?: number;
  streak: number;
  state: HabitState;
  color: "green" | "amber" | "rose" | "blue";
};
