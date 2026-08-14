import { describe, expect, it } from "vitest";

import { toAchievementTitle } from "./achievement-title";

describe("toAchievementTitle", () => {
  it.each([
    ["Build portfolio homepage", "Built portfolio homepage"],
    ["Finish advanced React course", "Finished advanced React course"],
    ["Hike Stone Mountain", "Hiked Stone Mountain"],
    ["Read The Creative Act", "Read The Creative Act"],
    ["Create a monthly budget", "Created a monthly budget"],
    ["Publish my portfolio", "Published my portfolio"],
  ])("turns %s into an achievement", (title, expected) => {
    expect(toAchievementTitle(title)).toBe(expected);
  });

  it("uses an honest achievement label when the first word is not a known action", () => {
    expect(toAchievementTitle("Stone Mountain sunrise")).toBe("Completed — Stone Mountain sunrise");
  });
});
