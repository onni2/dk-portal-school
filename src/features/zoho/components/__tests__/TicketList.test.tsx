import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { TicketList } from "../TicketList";
import type { Ticket } from "../../types/ticket.types";

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: "t-1",
    number: "101",
    title: "Vandamál með reikning",
    preview: "Reikningur vantar...",
    status: "opið",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-02T00:00:00Z",
    messages: [],
    ...overrides,
  };
}

describe("TicketList — loading state", () => {
  it("shows loading text when isLoading is true", () => {
    render(<TicketList tickets={[]} isLoading={true} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText("Hleður...")).toBeInTheDocument();
  });

  it("does not render tickets when loading", () => {
    const ticket = makeTicket();
    render(<TicketList tickets={[ticket]} isLoading={true} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.queryByText("Vandamál með reikning")).not.toBeInTheDocument();
  });
});

describe("TicketList — empty state", () => {
  it("shows empty message when tickets array is empty", () => {
    render(<TicketList tickets={[]} isLoading={false} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText("Engar beiðnir fundust")).toBeInTheDocument();
  });
});

describe("TicketList — rendering", () => {
  it("renders ticket title", () => {
    render(<TicketList tickets={[makeTicket()]} isLoading={false} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText("Vandamál með reikning")).toBeInTheDocument();
  });

  it("renders ticket number with # prefix", () => {
    render(<TicketList tickets={[makeTicket()]} isLoading={false} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText("#101")).toBeInTheDocument();
  });

  it("renders ticket preview text", () => {
    render(<TicketList tickets={[makeTicket()]} isLoading={false} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText("Reikningur vantar...")).toBeInTheDocument();
  });

  it("shows OPIÐ badge for open tickets", () => {
    render(<TicketList tickets={[makeTicket({ status: "opið" })]} isLoading={false} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText("OPIÐ")).toBeInTheDocument();
  });

  it("shows LOKAÐ badge for closed tickets", () => {
    render(<TicketList tickets={[makeTicket({ status: "lokað" })]} isLoading={false} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText("LOKAÐ")).toBeInTheDocument();
  });

  it("renders multiple tickets", () => {
    const tickets = [
      makeTicket({ id: "t-1", title: "Fyrsta mál" }),
      makeTicket({ id: "t-2", title: "Annað mál" }),
    ];
    render(<TicketList tickets={tickets} isLoading={false} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText("Fyrsta mál")).toBeInTheDocument();
    expect(screen.getByText("Annað mál")).toBeInTheDocument();
  });
});

describe("TicketList — interaction", () => {
  it("calls onSelect with the ticket id when clicked", async () => {
    const onSelect = vi.fn();
    render(<TicketList tickets={[makeTicket()]} isLoading={false} selectedId={null} onSelect={onSelect} />);
    await userEvent.click(screen.getByText("Vandamál með reikning"));
    expect(onSelect).toHaveBeenCalledWith("t-1");
  });

  it("calls onSelect with the correct id for each ticket", async () => {
    const onSelect = vi.fn();
    const tickets = [
      makeTicket({ id: "t-1", title: "Fyrsta mál" }),
      makeTicket({ id: "t-2", title: "Annað mál" }),
    ];
    render(<TicketList tickets={tickets} isLoading={false} selectedId={null} onSelect={onSelect} />);
    await userEvent.click(screen.getByText("Annað mál"));
    expect(onSelect).toHaveBeenCalledWith("t-2");
  });
});
