import { sampleHabits, sampleSideQuest } from "@/features/today/sample-data";
import { TodayDashboard } from "@/features/today/today-dashboard";

export default function MobileTodayPreviewPage() {
  const dateLabel = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  return <TodayDashboard dateLabel={dateLabel} initialHabits={sampleHabits} sideQuest={sampleSideQuest} />;
}
