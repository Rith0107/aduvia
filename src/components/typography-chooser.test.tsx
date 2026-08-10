// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TypographyChooser } from "./typography-chooser";

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset.typography;
});

describe("TypographyChooser", () => {
  it("applies the selected display and reading pair", () => {
    render(<TypographyChooser />);
    fireEvent.click(screen.getByRole("button", { name: "Choose typography" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Literary Air/ }));
    expect(document.documentElement).toHaveAttribute("data-typography", "cormorant-inter");
  });

  it("offers six complete typography pairs", () => {
    render(<TypographyChooser />);
    fireEvent.click(screen.getByRole("button", { name: "Choose typography" }));
    expect(screen.getAllByRole("menuitem")).toHaveLength(6);
    expect(screen.getByRole("menuitem", { name: /Modern Classic/ })).toHaveTextContent("Archivo + STIX Two");
  });
});
