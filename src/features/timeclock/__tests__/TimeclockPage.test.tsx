import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TimeclockPage } from "../components/TimeclockPage";

vi.mock("../api/timeclock.queries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/timeclock.queries")>();
  return {
    ...actual,
    useTimeclockConfig: () => ({
      data: { companyName: "HR", timeclockUrl: "https://stimpill.hr.is" },
    }),
    useIpWhitelist: () => ({
      data: [{ id: "1", ip: "192.168.1.1", label: "Skrifstofa" }],
    }),
    useEmployeePhones: () => ({
      data: [{ id: "1", kennitala: "1234567890", employeeName: "Jón Jónsson", phone: "5551234" }],
    }),
  };
});

vi.mock("../api/timeclock.api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/timeclock.api")>();
  return { ...actual };
});

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <TimeclockPage />
    </QueryClientProvider>,
  );
}

describe("TimeclockPage", () => {
  it("renders the company card", () => {
    renderPage();
    expect(screen.getByText("HR")).toBeInTheDocument();
  });

  it("renders the IP whitelist panel", () => {
    renderPage();
    expect(screen.getByText("IP-tölur í hvítlista")).toBeInTheDocument();
  });

  it("renders the employee phones panel", () => {
    renderPage();
    expect(screen.getByText("Símanúmer starfsmanna")).toBeInTheDocument();
  });

  it("renders all three sections together", () => {
    renderPage();
    expect(screen.getByText("HR")).toBeInTheDocument();
    expect(screen.getByText("IP-tölur í hvítlista")).toBeInTheDocument();
    expect(screen.getByText("Símanúmer starfsmanna")).toBeInTheDocument();
  });
});
