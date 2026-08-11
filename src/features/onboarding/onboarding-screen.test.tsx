// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OnboardingScreen } from "./onboarding-screen";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }));

afterEach(cleanup);

describe("OnboardingScreen", () => {
  it("lets a new user add and anchor a custom habit", () => {
    render(<OnboardingScreen />);
    fireEvent.change(screen.getByLabelText("Custom habit name"), { target: { value: "Call my parents" } });
    fireEvent.click(screen.getByRole("button", { name: "Add my habit" }));
    expect(screen.getByText("Call my parents")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Make Call my parents my anchor" }));
    expect(screen.getByRole("button", { name: "Make Call my parents my anchor" })).toHaveAttribute("aria-pressed", "true");
  });

  it("requires a user-created task before offering an optional side quest", () => {
    render(<OnboardingScreen />);
    const next = screen.getByRole("button", { name: /Next: add a side quest/i });
    expect(next).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Custom habit name"), { target: { value: "Prepare tomorrow's clothes" } });
    fireEvent.click(screen.getByRole("button", { name: "Add my habit" }));
    expect(next).toBeEnabled();
    fireEvent.click(next);
    expect(screen.getByRole("heading", { name: "Add a side quest." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "I’ll add one later" })).toBeInTheDocument();
  });
});
