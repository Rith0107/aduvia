// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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

  it("doesn't let a brand-new habit's unearned 0% drag down the overall consistency stat", () => {
    const established = { id: "old", name: "Old habit", category: "Fitness", frequency: "Daily" as const, consistency: 90, checkInCount: 20, streak: 5, state: "active" as const, color: "green" as const };
    const fresh = { id: "new", name: "New habit", category: "Learning", frequency: "Daily" as const, consistency: 0, checkInCount: 0, streak: 0, state: "active" as const, color: "blue" as const };
    render(<HabitsDashboard initialHabits={[established, fresh]} />);
    expect(screen.getByText("Monthly consistency", { selector: "p.metric-label" }).nextElementSibling).toHaveTextContent("90%");
  });

  it("allows a new habit to become the anchor", () => {
    render(<HabitsDashboard initialHabits={sampleHabitSummaries} />);
    fireEvent.click(screen.getByRole("button", { name: "+ New habit" }));
    fireEvent.change(screen.getByLabelText("Habit name"), { target: { value: "Drink water" } });
    fireEvent.click(screen.getByRole("button", { name: /Make this my anchor/ }));
    fireEvent.click(screen.getByRole("button", { name: "Create habit" }));
    expect(screen.getAllByText("Anchor")).toHaveLength(1);
  });

  it("requires and saves selected days for a custom schedule", () => {
    render(<HabitsDashboard initialHabits={sampleHabitSummaries} />);
    fireEvent.click(screen.getByRole("button", { name: "+ New habit" }));
    fireEvent.change(screen.getByLabelText("Habit name"), { target: { value: "Practice guitar" } });
    fireEvent.click(screen.getByRole("button", { name: "Custom" }));
    expect(screen.getByRole("button", { name: "Create habit" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Monday: not selected" }));
    fireEvent.click(screen.getByRole("button", { name: "Wednesday: not selected" }));
    fireEvent.click(screen.getByRole("button", { name: "Create habit" }));
    expect(screen.getByText("Practice guitar")).toBeInTheDocument();
    expect(screen.getByText(/Mon · Wed/)).toBeInTheDocument();
    const createdHabit = screen.getByText("Practice guitar").closest("article");
    expect(createdHabit).not.toBeNull();
    expect(within(createdHabit!).getByLabelText("Monday: scheduled")).toBeInTheDocument();
    expect(within(createdHabit!).getByLabelText("Tuesday: rest day")).toBeInTheDocument();
    expect(within(createdHabit!).getByLabelText("Wednesday: scheduled")).toBeInTheDocument();
  });

  it("requires exactly three selected days for a three-times-weekly habit", () => {
    render(<HabitsDashboard initialHabits={sampleHabitSummaries} />);
    fireEvent.click(screen.getByRole("button", { name: "+ New habit" }));
    fireEvent.change(screen.getByLabelText("Habit name"), { target: { value: "Practice guitar" } });
    fireEvent.click(screen.getByRole("button", { name: "3× weekly" }));
    const create = screen.getByRole("button", { name: "Create habit" });
    fireEvent.click(screen.getByRole("button", { name: "Monday: not selected" }));
    fireEvent.click(screen.getByRole("button", { name: "Wednesday: not selected" }));
    expect(create).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Friday: not selected" }));
    expect(create).toBeEnabled();
    expect(screen.getByRole("button", { name: "Sunday: not selected" })).toBeDisabled();
    fireEvent.click(create);
    expect(screen.getByText(/3× · Mon · Wed · Fri/)).toBeInTheDocument();
  });

  it("edits a habit name, inferred category, schedule, and anchor", () => {
    render(<HabitsDashboard initialHabits={sampleHabitSummaries} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Morning walk" }));
    fireEvent.change(screen.getByLabelText("Habit name"), { target: { value: "Study Spanish" } });
    fireEvent.click(screen.getByRole("button", { name: "Custom" }));
    fireEvent.click(screen.getByRole("button", { name: "Monday: not selected" }));
    fireEvent.click(screen.getByRole("button", { name: "Friday: not selected" }));
    fireEvent.click(screen.getByRole("button", { name: /Make this my anchor/ }));
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(screen.getByText("Study Spanish")).toBeInTheDocument();
    expect(screen.getByText(/Learning · Mon · Fri/)).toBeInTheDocument();
    expect(screen.getAllByText("Anchor")).toHaveLength(1);
  });

  it("marks a habit complete from the edit form and stops offering to complete it again", () => {
    render(<HabitsDashboard initialHabits={sampleHabitSummaries} />);
    fireEvent.click(screen.getByRole("button", { name: "active" }));
    expect(screen.getByText("Morning walk")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Edit Morning walk" }));
    fireEvent.click(screen.getByRole("button", { name: "Mark complete" }));
    expect(screen.queryByText("Morning walk")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "completed" }));
    expect(screen.getByText("Morning walk")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Edit Morning walk" }));
    expect(screen.queryByRole("button", { name: "Mark complete" })).not.toBeInTheDocument();
  });

  it("requires explicit confirmation before deleting a habit", () => {
    render(<HabitsDashboard initialHabits={sampleHabitSummaries} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Morning walk" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete habit" }));
    expect(screen.getByText("Delete this habit and its check-in history?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete permanently" }));
    expect(screen.queryByText("Morning walk")).not.toBeInTheDocument();
  });
});
