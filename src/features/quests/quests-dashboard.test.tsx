// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { QuestsDashboard } from "./quests-dashboard";
import { sampleQuests } from "./sample-data";

afterEach(cleanup);

describe("QuestsDashboard", () => {
  it("filters completed quests", () => {
    render(<QuestsDashboard initialQuests={sampleQuests} />);
    fireEvent.click(screen.getByRole("button", { name: "Completed" }));
    expect(screen.getByText("Create a monthly budget")).toBeInTheDocument();
    expect(screen.queryByText("Build portfolio homepage")).not.toBeInTheDocument();
  });

  it("marks a quest complete", () => {
    render(<QuestsDashboard initialQuests={sampleQuests} />);
    const portfolio = screen.getByText("Build portfolio homepage").closest("article");
    expect(portfolio).not.toBeNull();
    fireEvent.click(screen.getAllByRole("button", { name: "Mark complete" })[0]);
    expect(portfolio).toHaveTextContent("Completed");
    expect(portfolio).toHaveTextContent("Mark incomplete");
  });

  it("updates a quest status via the dropdown", () => {
    render(<QuestsDashboard initialQuests={sampleQuests} />);
    fireEvent.click(screen.getByRole("button", { name: "Change status for Build portfolio homepage" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Completed" }));
    expect(screen.getByText("Build portfolio homepage").closest("article")).toHaveTextContent("Completed");
  });

  it("creates a quest", () => {
    render(<QuestsDashboard initialQuests={sampleQuests} />);
    fireEvent.click(screen.getByRole("button", { name: "+ New quest" }));
    fireEvent.change(screen.getByLabelText("Quest title"), { target: { value: "Publish a short story" } });
    expect(screen.getByText("Category detected automatically")).toBeInTheDocument();
    expect(screen.getAllByText("Creative").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /^Create quest$/ }));
    expect(screen.getByText("Publish a short story")).toBeInTheDocument();
    expect(screen.getByText("Publish a short story").closest("article")).toHaveTextContent("Creative");
  });

  it("renames a quest and updates its inferred category", () => {
    render(<QuestsDashboard initialQuests={sampleQuests} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Build portfolio homepage" }));
    fireEvent.change(screen.getByLabelText("Quest title"), { target: { value: "Read a design book" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    const quest = screen.getByText("Read a design book").closest("article");
    expect(quest).toHaveTextContent("Learning");
    expect(quest).toHaveTextContent("Not started");
  });

  it("deletes a quest after confirmation", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<QuestsDashboard initialQuests={sampleQuests} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Hike a new trail" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete quest" }));
    expect(screen.queryByText("Hike a new trail")).not.toBeInTheDocument();
    confirm.mockRestore();
  });

  it("guides an empty account to its first quest", () => {
    render(<QuestsDashboard initialQuests={[]} />);
    expect(screen.getByText("Add one meaningful finish.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Create my first quest" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Quest title")).toHaveFocus();
  });

  it("calculates overall completion from closed months and completed current quests", () => {
    const current = sampleQuests[0].targetMonth;
    const previous = new Date(`${current}T00:00:00`);
    previous.setMonth(previous.getMonth() - 1);
    const previousKey = `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, "0")}-01`;
    const quests = [
      { ...sampleQuests[0], id: "past-done", targetMonth: previousKey, status: "completed" as const, completedAt: previous.toISOString() },
      { ...sampleQuests[0], id: "past-incomplete", targetMonth: previousKey, status: "not-started" as const, completedAt: null },
      { ...sampleQuests[0], id: "current-open", targetMonth: current, status: "not-started" as const, completedAt: null },
    ];
    render(<QuestsDashboard initialQuests={quests} />);
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("1 completed · 1 incomplete")).toBeInTheDocument();
  });

  it("explains an empty filtered view without offering duplicate creation controls", () => {
    const quests = sampleQuests.filter((quest) => quest.status !== "not-started");
    render(<QuestsDashboard initialQuests={quests} />);
    fireEvent.click(screen.getByRole("button", { name: "Not started" }));
    expect(screen.getByText("No not started quests.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Create my first quest" })).not.toBeInTheDocument();
  });
});
