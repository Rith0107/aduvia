// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MonthlyReport } from "./monthly-report";

afterEach(cleanup);

describe("MonthlyReport", () => {
  it("allows correction of a scheduled day", () => {
    render(<MonthlyReport />);
    expect(screen.getByLabelText("Daily consistency across August")).toBeInTheDocument();
    expect(screen.getByText(/Month\s*average/)).toBeInTheDocument();
    const cell = screen.getByRole("button", { name: "Morning walk, August 1: done" });
    fireEvent.click(cell);
    expect(screen.getByRole("button", { name: "Morning walk, August 1: missed" })).toBeInTheDocument();
  });

  it("switches social card formats", () => {
    render(<MonthlyReport />);
    const storyFormat = screen.getByRole("button", { name: /Story/ });
    fireEvent.click(storyFormat);
    expect(storyFormat).toHaveAttribute("aria-pressed", "true");
  });

  it("uses the calendar day count when changing months", () => {
    render(<MonthlyReport />);
    const previous = screen.getByRole("button", { name: "Previous month" });
    for (let index = 0; index < 6; index += 1) fireEvent.click(previous);
    expect(screen.getAllByText("February 2026").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Morning walk, February 28: done" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Morning walk, February 29/ })).not.toBeInTheDocument();
  });

  it("includes February 29 in a leap year", () => {
    render(<MonthlyReport />);
    const next = screen.getByRole("button", { name: "Next month" });
    for (let index = 0; index < 18; index += 1) fireEvent.click(next);
    expect(screen.getAllByText("February 2028").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Morning walk, February 29/ })).toBeInTheDocument();
  });
});
