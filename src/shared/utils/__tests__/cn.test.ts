import { describe, it, expect } from "vitest";
import { cn } from "../cn";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("text-sm", "font-bold")).toBe("text-sm font-bold");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    expect(cn("px-2", isActive && "bg-blue-500")).toBe("px-2 bg-blue-500");
  });

  it("removes false/undefined values", () => {
    const isActive = false;
    expect(cn("px-2", isActive && "bg-blue-500")).toBe("px-2");
  });

  it("resolves tailwind conflicts (last one wins)", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});
