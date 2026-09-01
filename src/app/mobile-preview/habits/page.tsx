import { HabitsDashboard } from "@/features/habits/habits-dashboard";
import { sampleHabitSummaries } from "@/features/habits/sample-data";

export default function MobileHabitsPreviewPage() {
  return <HabitsDashboard initialHabits={sampleHabitSummaries} previewMode />;
}
