// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { HabitsDashboard } from "./habits-dashboard";
import { sampleHabitSummaries } from "./sample-data";

afterEach(cleanup);

describe("HabitsDashboard", () => {
  it("filters paused habits", () => {
    render(<HabitsDashboard initialHabits={sampleHabitSummaries} />);
    fireEvent.click(screen.getByRole("button", { name: "paused" }));
    expect(screen.getByText("Evening journal")).toBeInTheDocument();
    expect(screen.queryByText("Morning walk")).not.toBeInTheDocument();
  });

  it("creates a habit", () => {
    render(<HabitsDashboard initialHabits={sampleHabitSummaries} />);
    fireEvent.click(screen.getByRole("button", { name: "+ New habit" }));
    fireEvent.change(screen.getByLabelText("Habit name"), { target: { value: "Drink water" } });
    fireEvent.click(screen.getByRole("button", { name: "Create habit" }));
    expect(screen.getByText("Drink water")).toBeInTheDocument();
  });
});
