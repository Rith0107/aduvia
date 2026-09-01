import { describe, expect, it } from "vitest";

import { eveningGuidance, todayGuidance } from "./guidance";

describe("contextual guidance", () => {
  it("personalizes the greeting and progress without pressure", () => {
    const message = todayGuidance({ completed: 2, total: 4, firstName: "Rithwik", date: new Date(2026, 8, 1, 9) });
    expect(message.greeting).toBe("Good morning, Rithwik.");
    expect(message.supporting).toContain("2 of 4 complete");
  });

  it("treats an open schedule as rest", () => {
    expect(todayGuidance({ completed: 0, total: 0, date: new Date(2026, 8, 1, 13) }).signal).toBe("Rest is part of the rhythm.");
  });

  it("adjusts evening copy as answers are recorded", () => {
    expect(eveningGuidance({ answered: 3, total: 4, firstName: "Rithwik" }).prompt).toContain("1 choice remains");
  });
});
