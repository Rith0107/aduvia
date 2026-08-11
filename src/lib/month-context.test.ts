import { describe, expect, it } from "vitest";

import { getMonthContext } from "./month-context";

describe("getMonthContext", () => {
  it("counts only the dates after today", () => {
    expect(getMonthContext(new Date(2026, 7, 11))).toMatchObject({ monthName: "August", daysLeft: 20, countdownLabel: "20 days left", monthEndLabel: "Aug 31" });
  });

  it("handles the final day of a month", () => {
    expect(getMonthContext(new Date(2026, 7, 31)).countdownLabel).toBe("Last day");
  });

  it("handles February and leap years", () => {
    expect(getMonthContext(new Date(2026, 1, 10)).daysLeft).toBe(18);
    expect(getMonthContext(new Date(2028, 1, 10)).daysLeft).toBe(19);
  });

  it("uses singular wording when one day remains", () => {
    expect(getMonthContext(new Date(2026, 3, 29)).countdownLabel).toBe("1 day left");
  });
});
