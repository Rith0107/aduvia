import { describe, expect, it } from "vitest";

import { latestPriorReflection } from "./reflection-continuity";

const today = new Date(2026, 8, 10, 12);

describe("latestPriorReflection", () => {
  it("returns the latest note before today", () => {
    expect(latestPriorReflection({ "2026-09-08": "An older note", "2026-09-09": "  A calm finish.  " }, today)).toEqual({ dateKey: "2026-09-09", label: "yesterday", note: "A calm finish." });
  });

  it("ignores today, future dates, blanks, and malformed calendar keys", () => {
    expect(latestPriorReflection({ "2026-09-10": "Today", "2026-09-11": "Future", "2026-09-09": "  ", "2026-02-30": "Impossible", nope: "Malformed" }, today)).toBeNull();
  });

  it("uses a compact date when the latest note was not yesterday", () => {
    expect(latestPriorReflection({ "2026-08-30": "Keep going gently." }, today)).toMatchObject({ label: "Aug 30" });
  });
});
