import { sampleHabits, sampleSideQuest } from "@/features/today/sample-data";
import { TodayDashboard } from "@/features/today/today-dashboard";

// Avoid freezing the visible date at the deployment build date.
export const dynamic = "force-dynamic";

export default function TodayPage() {
  const dateLabel = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  return <TodayDashboard dateLabel={dateLabel} initialHabits={sampleHabits} sideQuest={sampleSideQuest} />;
}
