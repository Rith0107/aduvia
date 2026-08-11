// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { sampleHabits, sampleSideQuest } from "./sample-data";
import { TodayDashboard } from "./today-dashboard";

afterEach(cleanup);

describe("TodayDashboard", () => {
  it("updates completion and efficiency when a habit is checked in", () => {
    render(
      <TodayDashboard
        dateLabel="Tuesday, August 4"
        initialHabits={sampleHabits}
        sideQuest={sampleSideQuest}
      />,
    );

    expect(screen.getByText("62.5%")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Complete Read" }));
    expect(screen.getByText("87.5%")).toBeInTheDocument();
    expect(screen.getByText("3 of 4 complete")).toBeInTheDocument();
  });

  it("enables reflection saving only after text is entered", () => {
    render(
      <TodayDashboard
        dateLabel="Tuesday, August 4"
        initialHabits={sampleHabits}
        sideQuest={sampleSideQuest}
      />,
    );

    const save = screen.getByRole("button", { name: "Save note" });
    expect(save).toBeDisabled();
    fireEvent.change(screen.getByLabelText("One-line reflection"), {
      target: { value: "Deep work went well." },
    });
    expect(save).toBeEnabled();
  });

  it("treats an unscheduled day as rest instead of a completed routine", () => {
    render(<TodayDashboard dateLabel="Sunday, August 9" initialHabits={[]} sideQuest={sampleSideQuest} />);
    expect(screen.getByText("No habits are scheduled today.")).toBeInTheDocument();
    expect(screen.getByText("Rest is part of the rhythm.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Close the day" })).not.toBeInTheDocument();
  });
});
