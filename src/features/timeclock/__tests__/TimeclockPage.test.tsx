import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TimeclockPage } from "../components/TimeclockPage";

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
  useIpWhitelist: () => ({
    data: [{ id: "1", ip: "192.168.1.1", label: "Skrifstofa" }],
  }),
  useEmployeePhones: () => ({
    data: [{ id: "1", employeeNumber: "1", employeeName: "Jón Jónsson", phone: "5551234" }],
  }),
}));

describe("TimeclockPage", () => {
  it("renders the settings card", () => {
    render(<TimeclockPage />);
    expect(screen.getByText("Stillingar")).toBeInTheDocument();
  });

  it("renders the IP whitelist panel", () => {
    render(<TimeclockPage />);
    expect(screen.getByText("IP-tölur í hvítlista")).toBeInTheDocument();
  });

  it("renders the employee phones panel", () => {
    render(<TimeclockPage />);
    expect(screen.getByText("Símanúmer starfsmanna")).toBeInTheDocument();
  });

  it("renders all three sections together", () => {
    render(<TimeclockPage />);
    expect(screen.getByText("Stillingar")).toBeInTheDocument();
    expect(screen.getByText("IP-tölur í hvítlista")).toBeInTheDocument();
    expect(screen.getByText("Símanúmer starfsmanna")).toBeInTheDocument();
  });
});
