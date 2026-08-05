import { QuestsDashboard } from "@/features/quests/quests-dashboard";
import { sampleQuests } from "@/features/quests/sample-data";

export default function QuestsPage() {
  return <QuestsDashboard initialQuests={sampleQuests} />;
}
