// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PaletteChooser } from "./palette-chooser";

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset.palette;
});

describe("PaletteChooser", () => {
  it("applies a selected palette to the whole document", () => {
    render(<PaletteChooser />);
    fireEvent.click(screen.getByRole("button", { name: "Choose colour palette" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Coastal Quiet/ }));
    expect(document.documentElement).toHaveAttribute("data-palette", "coastal");
  });
});
