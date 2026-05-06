import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PosServiceCard } from "../PosServiceCard";
import type { PosService } from "../../types/pos.types";

function wrap(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

vi.mock("../../api/pos.queries", () => ({
  useRestartPosService: () => ({ mutate: vi.fn(), isPending: false }),
  useRestartPosRestService: () => ({ mutate: vi.fn(), isPending: false }),
}));

const running: PosService = {
  id: "pos-1", name: "POS 1", display: "POS 1", server: "srv1",
  state: "running", mode: "normal", path: "/pos",
};

const stopped: PosService = { ...running, id: "pos-2", state: "stopped" };

describe("PosServiceCard", () => {
  it("shows service id", () => {
    wrap(<PosServiceCard service={running} serviceType="dkpos" isSelected={false} onSelect={vi.fn()} />);
    expect(screen.getByText("pos-1")).toBeInTheDocument();
  });

  it("shows running state", () => {
    wrap(<PosServiceCard service={running} serviceType="dkpos" isSelected={false} onSelect={vi.fn()} />);
    expect(screen.getByText(/Í gangi/)).toBeInTheDocument();
  });

  it("shows stopped state", () => {
    wrap(<PosServiceCard service={stopped} serviceType="dkpos" isSelected={false} onSelect={vi.fn()} />);
    expect(screen.getByText(/Stoppað/)).toBeInTheDocument();
  });

  it("shows restart button", () => {
    wrap(<PosServiceCard service={running} serviceType="dkpos" isSelected={false} onSelect={vi.fn()} />);
    expect(screen.getByText("Restart")).toBeInTheDocument();
  });
});
