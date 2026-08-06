// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LandingPage } from "./landing-page";

afterEach(cleanup);

describe("LandingPage", () => {
  it("introduces the product and exposes authentication actions", () => {
    render(<LandingPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Make your days visible." })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Log in" })[0]).toHaveAttribute("href", "/login");
    expect(screen.getAllByRole("link", { name: /Start your story|Begin for free|Create your QuestLog/ })[0]).toHaveAttribute("href", "/signup");
  });

  it("explains the product's three-part workflow", () => {
    render(<LandingPage />);
    expect(screen.getByText("Choose your rhythm")).toBeInTheDocument();
    expect(screen.getByText("Close the day")).toBeInTheDocument();
    expect(screen.getByText("See the pattern")).toBeInTheDocument();
  });
});
