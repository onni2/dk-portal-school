import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TimeclockSettingsCard } from "../components/TimeclockSettingsCard";

vi.mock("../api/timeclock.queries", () => ({
  useTimeclockSettings: () => ({
    data: {
      Enabled: true,
      RoundFactor: 1,
      RoundUpDaytimeAlso: false,
      Text: 1,
      Project: 0,
      Phase: 2,
      Task: 1,
      Dim1: 0,
      Dim2: 0,
      Dim3: 0,
      SendToProjectTransaction: false,
    },
  }),
}));

describe("TimeclockSettingsCard", () => {
  it("renders the title", () => {
    render(<TimeclockSettingsCard />);
    expect(screen.getByText("Stillingar")).toBeInTheDocument();
  });

  it("shows Virkt badge when timeclock is enabled", () => {
    render(<TimeclockSettingsCard />);
    expect(screen.getByText("Virkt")).toBeInTheDocument();
  });

  it("shows correct round factor label", () => {
    render(<TimeclockSettingsCard />);
    expect(screen.getByText("Ekkert sléttun")).toBeInTheDocument();
  });

  it("shows Nei when RoundUpDaytimeAlso is false", () => {
    render(<TimeclockSettingsCard />);
    expect(screen.getByText("Nei")).toBeInTheDocument();
  });

  it("shows Óvirkt for Project field when value is 0", () => {
    render(<TimeclockSettingsCard />);
    expect(screen.getByText("Óvirkt")).toBeInTheDocument();
  });

  it("shows Skyldulegt for Phase field when value is 2", () => {
    render(<TimeclockSettingsCard />);
    expect(screen.getByText("Skyldulegt")).toBeInTheDocument();
  });

  it("shows the read-only notice", () => {
    render(<TimeclockSettingsCard />);
    expect(
      screen.getByText("Stillingar eru lesnar úr DK og er ekki hægt að breyta þeim hér."),
    ).toBeInTheDocument();
  });

  it("shows the info tooltip trigger", () => {
    render(<TimeclockSettingsCard />);
    expect(screen.getByText("i")).toBeInTheDocument();
  });

  it("renders no input fields (settings are read-only)", () => {
    render(<TimeclockSettingsCard />);
    expect(document.querySelectorAll("input").length).toBe(0);
  });

  it("renders no save or edit buttons", () => {
    render(<TimeclockSettingsCard />);
    expect(screen.queryByRole("button", { name: /vista|breyta|edit|save/i })).not.toBeInTheDocument();
  });
});
