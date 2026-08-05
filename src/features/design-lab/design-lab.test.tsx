// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DesignLab } from "./design-lab";

afterEach(cleanup);

describe("DesignLab", () => {
  it("switches between genuinely different concepts", () => {
    render(<DesignLab />);
    expect(screen.getByText("Move gently.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: /Solar Editorial/ }));
    expect(screen.getByText(/Today is/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: /Soft Digital/ }));
    expect(screen.getByText(/A softer way/)).toBeInTheDocument();
  });
});
