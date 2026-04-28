import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TimeclockPage } from "../components/TimeclockPage";

vi.mock("../api/timeclock.queries", () => ({
  useTimeclockConfig: () => ({
    data: { companyName: "HR", timeclockUrl: "https://stimpill.hr.is" },
  }),
  useIpWhitelist: () => ({
    data: [{ id: "1", ip: "192.168.1.1", label: "Skrifstofa" }],
  }),
  useEmployeePhones: () => ({
    data: [{ id: "1", kennitala: "1234567890", employeeName: "Jón Jónsson", phone: "5551234" }],
  }),
  useInvalidateIpWhitelist: () => () => Promise.resolve(),
  useInvalidateEmployeePhones: () => () => Promise.resolve(),
}));

describe("TimeclockPage", () => {
  it("renders the company card", () => {
    render(<TimeclockPage />);
    expect(screen.getByText("HR")).toBeInTheDocument();
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
    expect(screen.getByText("HR")).toBeInTheDocument();
    expect(screen.getByText("IP-tölur í hvítlista")).toBeInTheDocument();
    expect(screen.getByText("Símanúmer starfsmanna")).toBeInTheDocument();
  });
});
