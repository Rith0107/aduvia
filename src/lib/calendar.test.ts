import { describe, expect, it } from "vitest";
import { calendarKey, calendarParts } from "./calendar";

describe("calendar timezone", () => {
  const instant = new Date("2026-08-12T01:30:00.000Z");

  it("uses the member's calendar day rather than the server day", () => {
    expect(calendarKey(instant, "America/Los_Angeles")).toBe("2026-08-11");
    expect(calendarKey(instant, "Asia/Kolkata")).toBe("2026-08-12");
  });

  it("returns the weekday in the selected timezone", () => {
    expect(calendarParts(instant, "America/Los_Angeles").weekday).toBe("Tue");
    expect(calendarParts(instant, "Asia/Kolkata").weekday).toBe("Wed");
  });
});
