// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { sampleHabits } from "@/features/today/sample-data";
import { EveningCheckIn } from "./evening-check-in";

afterEach(cleanup);

describe("EveningCheckIn", () => {
  it("requires one answer per scheduled habit", () => {
    render(<EveningCheckIn initialHabits={sampleHabits} />);
    const finish = screen.getByRole("button", { name: "Finish my day" });
    expect(finish).toBeDisabled();
    screen.getAllByRole("button", { name: "✓ Done" }).forEach((button) => fireEvent.click(button));
    expect(finish).toBeEnabled();
    fireEvent.click(finish);
    expect(screen.getByText("You’re done for today.")).toBeInTheDocument();
  });
});
