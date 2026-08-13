// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ForgotPasswordScreen } from "./forgot-password-screen";

const resetPasswordForEmail = vi.fn();
vi.mock("@/lib/supabase/client", () => ({ createBrowserSupabaseClient: () => ({ auth: { resetPasswordForEmail } }) }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("ForgotPasswordScreen", () => {
  it("sends a recovery link through the auth callback", async () => {
    resetPasswordForEmail.mockResolvedValueOnce({ error: null });
    render(<ForgotPasswordScreen />);
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "member@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Check your inbox");
    expect(resetPasswordForEmail).toHaveBeenCalledWith("member@example.com", { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` });
  });
});
