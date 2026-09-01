export type MonthPhase = "opening" | "building" | "middle" | "closing";

export type MonthPhaseGuidance = {
  phase: MonthPhase;
  label: string;
  todayNote: string;
  questHeadline: string;
  questPrompt: string;
};

export function monthPhaseGuidance(date = new Date()): MonthPhaseGuidance {
  const day = date.getDate();
  const finalDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const daysRemainingIncludingToday = finalDay - day + 1;

  if (day <= 4) return {
    phase: "opening",
    label: "Opening days",
    todayNote: "Choose a pace you can still trust at month’s end.",
    questHeadline: "Choose what deserves a finish.",
    questPrompt: "Keep the month spacious. One or two meaningful outcomes are enough to begin.",
  };
  if (daysRemainingIncludingToday <= 7) return {
    phase: "closing",
    label: "Closing stretch",
    todayNote: "Protect the promises that still matter; release the rest.",
    questHeadline: "Bring the right things home.",
    questPrompt: "Finish what remains meaningful. An honest incomplete is better than a rushed finish.",
  };
  if (day <= Math.floor(finalDay * 0.45)) return {
    phase: "building",
    label: "Rhythm building",
    todayNote: "Let repetition make the month feel easier, not heavier.",
    questHeadline: "Give the month some momentum.",
    questPrompt: "The finish lines are set. A small move now keeps them within reach.",
  };
  return {
    phase: "middle",
    label: "Mid-month signal",
    todayNote: "Notice what is working before asking more of yourself.",
    questHeadline: "Keep the finish lines honest.",
    questPrompt: "Refine what matters, continue what fits, and leave unnecessary pressure behind.",
  };
}
