// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { QuestsDashboard } from "./quests-dashboard";
import { sampleQuests } from "./sample-data";

afterEach(cleanup);

describe("QuestsDashboard", () => {
  it("filters blocked quests", () => {
    render(<QuestsDashboard initialQuests={sampleQuests} />);
    fireEvent.click(screen.getByRole("button", { name: "Blocked" }));
    expect(screen.getByText("Read The Creative Act")).toBeInTheDocument();
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

  it("updates a quest to paused", () => {
    render(<QuestsDashboard initialQuests={sampleQuests} />);
    fireEvent.click(screen.getByRole("button", { name: "Change status for Build portfolio homepage" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Paused" }));
    expect(screen.getByText("Build portfolio homepage").closest("article")).toHaveTextContent("Paused");
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
    expect(quest).toHaveTextContent("In progress");
  });

  it("deletes a quest after confirmation", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<QuestsDashboard initialQuests={sampleQuests} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Hike a new trail" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete quest" }));
    expect(screen.queryByText("Hike a new trail")).not.toBeInTheDocument();
    confirm.mockRestore();
  });
});
