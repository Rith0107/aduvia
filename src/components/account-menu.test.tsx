import { describe, expect, it } from "vitest";

import { accountInitials } from "./account-menu";

describe("accountInitials", () => {
  it("uses the first and last name initials", () => {
    expect(accountInitials({ name: "Rithwik Lagishetty", email: "rithwik@example.com" })).toBe("RL");
  });

  it("falls back to one initial for a single name or missing viewer", () => {
    expect(accountInitials({ name: "Rithwik", email: "rithwik@example.com" })).toBe("R");
    expect(accountInitials(null)).toBe("A");
  });
});
