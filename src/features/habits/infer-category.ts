import type { HabitSummary } from "./types";

export type InferredHabitCategory = Pick<HabitSummary, "category" | "color">;

const categoryRules: Array<InferredHabitCategory & { pattern: RegExp }> = [
  { category: "Fitness", color: "green", pattern: /\b(gym|workout|exercise|walk|run|jog|lift|lifting|yoga|swim|cycling|bike|steps?|cardio|stretch)\b/i },
  { category: "Wellness", color: "rose", pattern: /\b(water|hydrate|hydration|sugar|diet|meal|food|sleep|vitamin|medicine|health|calories?|protein)\b/i },
  { category: "Mindfulness", color: "amber", pattern: /\b(meditat|mindful|breathe|breathing|journal|gratitude|reflect)\w*/i },
  { category: "Learning", color: "blue", pattern: /\b(train|training|course|study|learn|lesson|read|book|practice|class|exam|tutorial)\w*/i },
  { category: "Career", color: "blue", pattern: /\b(work|career|portfolio|project|code|coding|meeting|email|client|business|presentation)\w*/i },
  { category: "Finance", color: "green", pattern: /\b(budget|saving|savings|invest|expense|money|finance|financial)\w*/i },
];

export function inferHabitCategory(name: string): InferredHabitCategory {
  const match = categoryRules.find((rule) => rule.pattern.test(name));
  return match ? { category: match.category, color: match.color } : { category: "Personal", color: "amber" };
}
