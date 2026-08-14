// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MonthCoverPreview } from "./month-cover-preview";

afterEach(cleanup);

const baseProps = {
  consistency: 84,
  daysShownUp: 19,
  format: "square" as const,
  habitCount: 4,
  monthName: "August",
  year: 2026,
};

describe("MonthCoverPreview", () => {
  it("shows as many as six completed quests using achievement wording", () => {
    render(<MonthCoverPreview {...baseProps} completedQuests={[
      "Build portfolio homepage",
      "Finish advanced React course",
      "Hike Stone Mountain",
      "Read The Creative Act",
      "Create a monthly budget",
      "Publish my portfolio",
    ]} />);

    expect(screen.getByText("Built portfolio homepage")).toBeInTheDocument();
    expect(screen.getByText("Finished advanced React course")).toBeInTheDocument();
    expect(screen.getByText("Hiked Stone Mountain")).toBeInTheDocument();
    expect(screen.getByText("Created a monthly budget")).toBeInTheDocument();
    expect(screen.getByText("Published my portfolio")).toBeInTheDocument();
    expect(screen.queryByText(/more achievements/)).not.toBeInTheDocument();
  });

  it("summarizes overflow without clipping the footer for seven or more quests", () => {
    render(<MonthCoverPreview {...baseProps} completedQuests={[
      "Build a portfolio",
      "Finish a course",
      "Hike a trail",
      "Read a book",
      "Create a budget",
      "Publish an essay",
      "Run a marathon",
      "Visit a museum",
    ]} />);

    expect(screen.getByText("+3 more achievements in this issue")).toBeInTheDocument();
    expect(screen.getByText("Small steps became visible proof.")).toBeInTheDocument();
  });
});
