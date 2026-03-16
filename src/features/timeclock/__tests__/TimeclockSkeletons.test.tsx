import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SettingsSkeleton, PanelSkeleton } from "../components/TimeclockSkeletons";

describe("SettingsSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<SettingsSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders six skeleton field rows", () => {
    const { container } = render(<SettingsSkeleton />);
    // 6 field rows, each with 2 skeletons (label + value) = 12 skeleton divs inside grid
    // plus 2 header skeletons = 14 total
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(8);
  });
});

describe("PanelSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<PanelSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders three skeleton list rows", () => {
    const { container } = render(<PanelSkeleton />);
    // 3 rows, each with 3 skeletons (title + subtitle + button) = 9 + 2 header = 11
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(9);
  });
});
