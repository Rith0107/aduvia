// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MonthlyReport } from "./monthly-report";

afterEach(cleanup);

describe("MonthlyReport", () => {
  it("renders daily data as a read-only month-to-date report", () => {
    render(<MonthlyReport />);
    expect(screen.getByLabelText("Daily consistency across August")).toBeInTheDocument();
    expect(screen.getByText(/Month\s*average/)).toBeInTheDocument();
    expect(screen.getByText("Read-only history from your daily check-ins.")).toBeInTheDocument();
    expect(screen.getByLabelText("Morning walk, August 1: done")).not.toHaveAttribute("role", "button");
    expect(screen.queryByLabelText("Morning walk, August 10: done")).not.toBeInTheDocument();
  });

  it("switches social card formats", () => {
    render(<MonthlyReport />);
    const storyFormat = screen.getByRole("button", { name: /Story/ });
    fireEvent.click(storyFormat);
    expect(storyFormat).toHaveAttribute("aria-pressed", "true");
  });

  it("offers distinct visual trims for the share artifact", () => {
    render(<MonthlyReport />);
    const aurora = screen.getByRole("button", { name: "Aurora Glow" });
    fireEvent.click(aurora);
    expect(aurora).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Archive File" })).toBeInTheDocument();
  });

  it("uses the calendar day count when changing months", () => {
    render(<MonthlyReport />);
    const previous = screen.getByRole("button", { name: "Previous month" });
    for (let index = 0; index < 6; index += 1) fireEvent.click(previous);
    expect(screen.getAllByText("February 2026").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Morning walk, February 28: done")).toBeInTheDocument();
    expect(screen.queryByLabelText(/Morning walk, February 29/)).not.toBeInTheDocument();
  });

  it("includes February 29 in a leap year", () => {
    render(<MonthlyReport />);
    const previous = screen.getByRole("button", { name: "Previous month" });
    for (let index = 0; index < 30; index += 1) fireEvent.click(previous);
    expect(screen.getAllByText("February 2024").length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Morning walk, February 29/)).toBeInTheDocument();
  });

  it("does not navigate into future months", () => {
    render(<MonthlyReport />);
    expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
  });
});
