export type QuestStatus = "not-started" | "in-progress" | "paused" | "blocked" | "completed";

export type QuestSummary = {
  id: string;
  title: string;
  category: string;
  status: QuestStatus;
  dueLabel: string;
  effortHours: number;
  color: "green" | "amber" | "rose" | "blue";
  /** "YYYY-MM-01" — the month this quest belongs to. Set once at creation. */
  targetMonth: string;
  completedAt: string | null;
  /** Points at the quest this one was carried forward from, if any. */
  carriedFromId: string | null;
  /** Set once the user has resolved (carried or let go) an old, unfinished
   *  quest at a month rollover. Null means it's still awaiting a decision. */
  rolloverReviewedAt: string | null;
};
