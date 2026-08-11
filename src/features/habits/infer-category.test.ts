import { describe, expect, it } from "vitest";

import { inferHabitCategory } from "./infer-category";

describe("inferHabitCategory", () => {
  it.each([
    ["Hit gym", "Fitness"],
    ["No sugar intake", "Wellness"],
    ["Drink 3L of water", "Wellness"],
    ["Complete trainings provided at work", "Learning"],
  ])("classifies %s as %s", (name, category) => {
    expect(inferHabitCategory(name).category).toBe(category);
  });

  it("keeps unmatched habits in Personal", () => {
    expect(inferHabitCategory("Call my parents").category).toBe("Personal");
  });
});
