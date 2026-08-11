// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ResetPasswordScreen } from "./reset-password-screen";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));

afterEach(cleanup);

describe("ResetPasswordScreen", () => {
  it("requires a secure password", () => {
    render(<ResetPasswordScreen />);
    const fields = screen.getAllByLabelText(/password/i);
    fireEvent.change(fields[0], { target: { value: "too-short" } });
    fireEvent.change(fields[1], { target: { value: "too-short" } });
    fireEvent.click(screen.getByRole("button", { name: "Save new password" }));
    expect(screen.getByRole("status")).toHaveTextContent("at least 12 characters");
  });

  it("requires matching passwords", () => {
    render(<ResetPasswordScreen />);
    const fields = screen.getAllByLabelText(/password/i);
    fireEvent.change(fields[0], { target: { value: "a calm secure phrase" } });
    fireEvent.change(fields[1], { target: { value: "another calm phrase" } });
    fireEvent.click(screen.getByRole("button", { name: "Save new password" }));
    expect(screen.getByRole("status")).toHaveTextContent("do not match");
  });
});
