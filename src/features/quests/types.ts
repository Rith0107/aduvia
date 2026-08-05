export type QuestStatus = "not-started" | "in-progress" | "blocked" | "completed";

export type QuestSummary = {
  id: string;
  title: string;
  category: string;
  status: QuestStatus;
  dueLabel: string;
  effortHours: number;
  color: "green" | "amber" | "rose" | "blue";
};
