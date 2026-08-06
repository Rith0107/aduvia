// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthScreen } from "./auth-screen";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

afterEach(cleanup);

describe("AuthScreen", () => {
  it("links the login screen to account creation", () => {
    render(<AuthScreen mode="login" />);
    expect(screen.getByRole("link", { name: "Create an account" })).toHaveAttribute("href", "/signup");
  });

  it("reveals the password and links back to login", () => {
    render(<AuthScreen mode="signup" />);
    const password = screen.getByPlaceholderText("At least 8 characters");
    expect(password).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
  });
});
