// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AuroraSkyPreview } from "./aurora-sky-preview";

afterEach(cleanup);

const props = {
  completedQuests: ["Hike Stone Mountain", "Publish my portfolio", "Complete two certifications"],
  consistency: 87,
  daysShownUp: 18,
  habits: [
    { completedDays: 14, name: "Morning walk" },
    { completedDays: 11, name: "Read" },
    { completedDays: 9, name: "Meditate" },
  ],
  monthName: "August",
  year: 2026,
};

describe("AuroraSkyPreview", () => {
  it("renders the square composition with achievement copy", () => {
    render(<AuroraSkyPreview {...props} format="square" />);

    expect(screen.getByLabelText("Aurora Sky share preview")).toBeInTheDocument();
    expect(screen.getByText("87")).toBeInTheDocument();
    expect(screen.getByText("Hiked Stone Mountain")).toBeInTheDocument();
    expect(screen.getByText("Published my portfolio")).toBeInTheDocument();
    expect(screen.getByText("A month written in light.")).toBeInTheDocument();
  });

  it("keeps the story focused on the galaxy and omits the discovery list", () => {
    const { container } = render(<AuroraSkyPreview {...props} format="story" />);

    expect(screen.getByLabelText("Aurora Sky share preview")).toBeInTheDocument();
    expect(screen.getByLabelText("3 habit auroras")).toBeInTheDocument();
    expect(screen.getByLabelText("Completed quest symbols")).toBeInTheDocument();
    expect(screen.queryByText("Constellations discovered")).not.toBeInTheDocument();
    expect(screen.queryByText("Hiked Stone Mountain")).not.toBeInTheDocument();
    expect(screen.getByText("A month written in light.")).toBeInTheDocument();
    expect(container.querySelector('[class*="blur-"]')).not.toBeInTheDocument();
  });
});
