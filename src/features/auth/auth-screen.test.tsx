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
    expect(screen.queryByText(/demo data/i)).not.toBeInTheDocument();
  });

  it("accepts a safe protected destination after login", () => {
    render(<AuthScreen mode="login" nextPath="/insights" />);
    expect(screen.getByRole("button", { name: "Enter Aduvia" })).toBeInTheDocument();
  });

  it("asks for an email before password recovery", () => {
    render(<AuthScreen mode="login" />);
    fireEvent.click(screen.getByRole("button", { name: "Forgot password?" }));
    expect(screen.getByRole("status")).toHaveTextContent("Enter your email first");
  });

  it("reveals the password and links back to login", () => {
    render(<AuthScreen mode="signup" />);
    const password = screen.getByPlaceholderText("Try a memorable phrase");
    expect(password).toHaveAttribute("type", "password");
    expect(password).toHaveAttribute("minlength", "12");
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
  });

  it("shows password strength as the passphrase grows", () => {
    render(<AuthScreen mode="signup" />);
    fireEvent.change(screen.getByPlaceholderText("Try a memorable phrase"), { target: { value: "a quiet morning ritual 2026" } });
    expect(screen.getByLabelText("Password strength: Strong")).toBeInTheDocument();
  });

  it("requires the retyped password to match", () => {
    render(<AuthScreen mode="signup" />);
    fireEvent.change(screen.getByPlaceholderText("How should we greet you?"), { target: { value: "Rithwik" } });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "rithwik@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Try a memorable phrase"), { target: { value: "a quiet morning ritual" } });
    fireEvent.change(screen.getByPlaceholderText("Enter your password again"), { target: { value: "a different morning ritual" } });
    fireEvent.submit(screen.getByRole("button", { name: "Create my account" }).closest("form")!);
    expect(screen.getByRole("status")).toHaveTextContent("Those passwords do not match yet.");
  });

  it("gives sign-up its own motivating story", () => {
    render(<AuthScreen mode="signup" />);
    expect(screen.getByRole("heading", { level: 1, name: /Small steps.*A life you can see/i })).toBeInTheDocument();
    expect(screen.getByText("Your first month starts here")).toBeInTheDocument();
  });
});
