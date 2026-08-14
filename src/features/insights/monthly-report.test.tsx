// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { consistencyFromHabits, dailyConsistencyFromHabits, heatmapState, MonthlyReport, reportCellState, reportDayCount } from "./monthly-report";

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

  it("offers distinct share artifacts rather than recolored trims", () => {
    render(<MonthlyReport />);
    const passport = screen.getByRole("button", { name: "Rhythm Passport" });
    fireEvent.click(passport);
    expect(passport).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("article", { name: "Rhythm Passport share preview" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Month Cover" })).toBeInTheDocument();
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

  it("handles every calendar month length and limits the current month to today", () => {
    const futureToday = new Date(2030, 0, 1);
    expect(reportDayCount(2026, 1, futureToday)).toBe(28);
    expect(reportDayCount(2024, 1, futureToday)).toBe(29);
    expect(reportDayCount(2026, 3, futureToday)).toBe(30);
    expect(reportDayCount(2026, 7, futureToday)).toBe(31);
    expect(reportDayCount(2026, 7, new Date(2026, 7, 12))).toBe(12);
    expect(reportDayCount(2026, 8, new Date(2026, 7, 12))).toBe(0);
  });

  it("does not navigate into future months", () => {
    render(<MonthlyReport />);
    expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
  });

  it("centers status cells beneath their date and marks the real current date", () => {
    render(<MonthlyReport />);
    const currentDate = new Date().getDate();
    expect(screen.getByRole("columnheader", { name: String(currentDate) })).toHaveAttribute("aria-current", "date");
    expect(screen.getByLabelText(`Morning walk, August 1: done`)).toHaveClass("mx-auto");
  });

  it("weights monthly consistency by scheduled check-ins and ignores pending days", () => {
    expect(consistencyFromHabits([
      { id: "daily", name: "Daily", category: "Wellness", color: "green", days: ["done", "done", "done", "missed", "pending"] },
      { id: "weekly", name: "Weekly", category: "Fitness", color: "blue", days: ["off", "off", "missed", "off", "pending"] },
    ])).toBe(60);
  });

  it("excludes pending and unscheduled cells from daily consistency", () => {
    expect(dailyConsistencyFromHabits([
      { id: "one", name: "One", category: "Wellness", color: "green", days: ["done", "pending"] },
      { id: "two", name: "Two", category: "Fitness", color: "blue", days: ["missed", "pending"] },
      { id: "three", name: "Three", category: "Learning", color: "amber", days: ["off", "off"] },
    ], 2, "August")).toEqual([
      { day: 1, label: "Aug 1", score: 50, completed: 1, scheduled: 2 },
      { day: 2, label: "Aug 2", score: 0, completed: 0, scheduled: 0 },
    ]);
  });

  it("shows a stored historical answer even when it predates the habit row", () => {
    const habit = { id: "backfilled", createdAt: "2026-08-11T12:00:00.000Z", frequency: "Daily" as const, state: "active" as const };
    expect(reportCellState(habit, new Date(2026, 7, 4), "complete")).toBe("done");
    expect(reportCellState(habit, new Date(2026, 7, 5), "skipped")).toBe("missed");
    expect(reportCellState(habit, new Date(2026, 7, 6))).toBe("off");
  });

  it("colors calendar days by whole-day completion", () => {
    expect(heatmapState({ completed: 3, scheduled: 3 })).toBe("complete");
    expect(heatmapState({ completed: 1, scheduled: 3 })).toBe("partial");
    expect(heatmapState({ completed: 0, scheduled: 3 })).toBe("none");
    expect(heatmapState({ completed: 0, scheduled: 0 })).toBe("empty");
  });
});
