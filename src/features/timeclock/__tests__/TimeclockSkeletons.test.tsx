import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PanelSkeleton } from "../components/TimeclockSkeletons";

describe("PanelSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<PanelSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders three skeleton list rows", () => {
    const { container } = render(<PanelSkeleton />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(9);
  });
});
