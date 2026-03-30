import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Button } from "../Button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Vista</Button>);
    expect(screen.getByText("Vista")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Smella</Button>);
    await userEvent.click(screen.getByText("Smella"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick when disabled", async () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Smella</Button>);
    await userEvent.click(screen.getByText("Smella"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("applies the danger variant", () => {
    render(<Button variant="danger">Eyða</Button>);
    expect(screen.getByText("Eyða")).toHaveClass("bg-(--color-error)");
  });
});
