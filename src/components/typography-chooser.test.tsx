// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TypographyChooser } from "./typography-chooser";
import { PaletteChooser } from "./palette-chooser";

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset.typography;
});

describe("TypographyChooser", () => {
  it("applies the selected display and reading pair", () => {
    render(<TypographyChooser />);
    fireEvent.click(screen.getByRole("button", { name: "Choose typography" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Soft Journal/ }));
    expect(document.documentElement).toHaveAttribute("data-typography", "soft-journal");
  });

  it("offers four calm typography pairs", () => {
    render(<TypographyChooser />);
    fireEvent.click(screen.getByRole("button", { name: "Choose typography" }));
    expect(screen.getAllByRole("menuitem")).toHaveLength(4);
    expect(screen.getByRole("menuitem", { name: /Grounded Classic/ })).toHaveTextContent("STIX Two + Archivo");
  });

  it("closes the palette menu when typography opens", () => {
    render(<><PaletteChooser /><TypographyChooser /></>);
    fireEvent.click(screen.getByRole("button", { name: "Choose colour palette" }));
    expect(screen.getByRole("menu", { name: "Colour palettes" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Choose typography" }));
    expect(screen.queryByRole("menu", { name: "Colour palettes" })).not.toBeInTheDocument();
    expect(screen.getByRole("menu", { name: "Typography pairs" })).toBeInTheDocument();
  });
});
