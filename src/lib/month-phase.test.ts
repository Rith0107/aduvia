import { describe, expect, it } from "vitest";

import { monthPhaseGuidance } from "./month-phase";

describe("monthPhaseGuidance", () => {
  it("uses opening language during the first four days", () => {
    expect(monthPhaseGuidance(new Date(2026, 8, 4)).phase).toBe("opening");
    expect(monthPhaseGuidance(new Date(2026, 8, 5)).phase).toBe("building");
  });

  it("uses the final seven calendar days for the closing stretch", () => {
    expect(monthPhaseGuidance(new Date(2026, 8, 23)).phase).toBe("middle");
    expect(monthPhaseGuidance(new Date(2026, 8, 24)).phase).toBe("closing");
  });

  it("handles February and leap years without hard-coded month lengths", () => {
    expect(monthPhaseGuidance(new Date(2026, 1, 21)).phase).toBe("middle");
    expect(monthPhaseGuidance(new Date(2026, 1, 22)).phase).toBe("closing");
    expect(monthPhaseGuidance(new Date(2028, 1, 22)).phase).toBe("middle");
    expect(monthPhaseGuidance(new Date(2028, 1, 23)).phase).toBe("closing");
  });
});
