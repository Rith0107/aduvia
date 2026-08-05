// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MonthlyReport } from "./monthly-report";

afterEach(cleanup);

describe("MonthlyReport", () => {
  it("allows correction of a scheduled day", () => {
    render(<MonthlyReport />);
    const cell = screen.getByRole("button", { name: "Morning walk, August 1: done" });
    fireEvent.click(cell);
    expect(screen.getByRole("button", { name: "Morning walk, August 1: missed" })).toBeInTheDocument();
  });

  it("switches social card formats", () => {
    render(<MonthlyReport />);
    fireEvent.click(screen.getByRole("button", { name: "Story · 9:16" }));
    expect(screen.getByRole("button", { name: "Story · 9:16" })).toHaveClass("bg-[#d89a42]");
  });
});
