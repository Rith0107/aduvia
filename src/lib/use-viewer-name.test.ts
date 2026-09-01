import { describe, expect, it } from "vitest";

import { firstNameFromDisplayName } from "./use-viewer-name";

describe("firstNameFromDisplayName", () => {
  it("prefers the display name and falls back to email", () => {
    expect(firstNameFromDisplayName("Rithwik Lagishetty", "fallback@example.com")).toBe("Rithwik");
    expect(firstNameFromDisplayName("", "rithwik@example.com")).toBe("rithwik");
  });
});
