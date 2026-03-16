import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "../Badge";

describe("Badge", () => {
  it("renders its text", () => {
    render(<Badge>Virkt</Badge>);
    expect(screen.getByText("Virkt")).toBeInTheDocument();
  });

  it("applies success variant styles", () => {
    render(<Badge variant="success">Virkt</Badge>);
    expect(screen.getByText("Virkt")).toHaveClass("text-[var(--color-success)]");
  });

  it("applies error variant styles", () => {
    render(<Badge variant="error">Villa</Badge>);
    expect(screen.getByText("Villa")).toHaveClass("text-[var(--color-error)]");
  });

  it("defaults to the default variant", () => {
    render(<Badge>Staða</Badge>);
    expect(screen.getByText("Staða")).toHaveClass("text-[var(--color-text-secondary)]");
  });
});
