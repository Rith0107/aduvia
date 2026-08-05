import { describe, expect, it } from "vitest";

import { calculateRoutineEfficiency } from "./metrics";

describe("calculateRoutineEfficiency", () => {
  it("weights completion by priority", () => {
    expect(
      calculateRoutineEfficiency([
        { completion: 1, priority: 3 },
        { completion: 0.5, priority: 2 },
        { completion: 1, priority: 1 },
      ]),
    ).toBe(83.3);
  });

  it("returns zero when nothing is scheduled", () => {
    expect(calculateRoutineEfficiency([])).toBe(0);
  });

  it("caps completion credit between zero and one", () => {
    expect(
      calculateRoutineEfficiency([
        { completion: 2, priority: 1 },
        { completion: -1, priority: 1 },
      ]),
    ).toBe(50);
  });
});
