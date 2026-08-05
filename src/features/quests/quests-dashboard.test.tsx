// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

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

  it("creates a quest", () => {
    render(<QuestsDashboard initialQuests={sampleQuests} />);
    fireEvent.click(screen.getByRole("button", { name: "+ New quest" }));
    fireEvent.change(screen.getByLabelText("Quest title"), { target: { value: "Publish a short story" } });
    fireEvent.click(screen.getByRole("button", { name: /^Create quest$/ }));
    expect(screen.getByText("Publish a short story")).toBeInTheDocument();
  });
});
