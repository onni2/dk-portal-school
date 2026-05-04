import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PosServiceCard } from "../PosServiceCard";
import type { PosService } from "../../types/pos.types";

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
    render(<PosServiceCard service={running} serviceType="dkpos" isSelected={false} onSelect={vi.fn()} />);
    expect(screen.getByText("pos-1")).toBeInTheDocument();
  });

  it("shows running state", () => {
    render(<PosServiceCard service={running} serviceType="dkpos" isSelected={false} onSelect={vi.fn()} />);
    expect(screen.getByText(/Í gangi/)).toBeInTheDocument();
  });

  it("shows stopped state", () => {
    render(<PosServiceCard service={stopped} serviceType="dkpos" isSelected={false} onSelect={vi.fn()} />);
    expect(screen.getByText(/Stoppað/)).toBeInTheDocument();
  });

  it("shows restart button", () => {
    render(<PosServiceCard service={running} serviceType="dkpos" isSelected={false} onSelect={vi.fn()} />);
    expect(screen.getByText("Restart")).toBeInTheDocument();
  });
});
