export type WeightedCompletion = {
  completion: number;
  priority: 1 | 2 | 3;
};

export function calculateRoutineEfficiency(items: WeightedCompletion[]) {
  const scheduledWeight = items.reduce((total, item) => total + item.priority, 0);

  if (scheduledWeight === 0) return 0;

  const completedWeight = items.reduce(
    (total, item) => total + Math.min(1, Math.max(0, item.completion)) * item.priority,
    0,
  );

  return Math.round((completedWeight / scheduledWeight) * 1000) / 10;
}
