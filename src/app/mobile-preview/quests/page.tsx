import { QuestsDashboard } from "@/features/quests/quests-dashboard";
import { sampleQuests } from "@/features/quests/sample-data";

export default function MobileQuestsPreviewPage() {
  return <QuestsDashboard initialQuests={sampleQuests} previewMode />;
}
