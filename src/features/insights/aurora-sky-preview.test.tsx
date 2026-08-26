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
    expect(container.querySelector("feGaussianBlur")).not.toBeInTheDocument();
    const orbits = container.querySelectorAll("[data-aurora-orbit]");
    expect(orbits).toHaveLength(props.habits.length);
    for (const orbit of orbits) {
      expect(orbit.querySelectorAll("[data-orbit-marker]")).toHaveLength(1);
    }
    expect(screen.getByLabelText("3 habit auroras")).toHaveClass("absolute", "top-1/2", "-translate-y-1/2");
    expect(screen.getByLabelText("3 habit auroras")).not.toHaveClass("relative");
    expect(screen.getByLabelText("Completed quest symbols")).toHaveClass("items-center", "h-10", "bottom-[44px]");
    const footerText = screen.getByText("A month written in light.");
    expect(footerText.closest("footer")).toHaveClass("items-center", "h-8");
    expect(footerText).toHaveStyle({ whiteSpace: "nowrap", flexShrink: 0, lineHeight: 1 });
  });
});
