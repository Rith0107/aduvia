import { HabitsDashboard } from "@/features/habits/habits-dashboard";
import { sampleHabitSummaries } from "@/features/habits/sample-data";

export default function HabitsPage() {
  return <HabitsDashboard initialHabits={sampleHabitSummaries} />;
}
