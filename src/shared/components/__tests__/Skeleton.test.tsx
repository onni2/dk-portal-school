import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Skeleton } from "../Skeleton";

describe("Skeleton", () => {
  it("renders an animated placeholder", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass("animate-pulse");
  });

  it("accepts extra classes", () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);
    expect(container.firstChild).toHaveClass("h-4", "w-32");
  });
});
