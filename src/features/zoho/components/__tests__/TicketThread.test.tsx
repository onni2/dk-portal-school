import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TicketThread } from "../TicketThread";
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

describe("TicketThread — header", () => {
  it("renders the ticket title", () => {
    render(<TicketThread ticket={makeTicket()} currentUserName="Jón Jónsson" />);
    expect(screen.getByText("Vandamál með reikning")).toBeInTheDocument();
  });

  it("renders the ticket number", () => {
    render(<TicketThread ticket={makeTicket()} currentUserName="Jón Jónsson" />);
    expect(screen.getByText(/Beiðni #101/)).toBeInTheDocument();
  });

  it("shows LOKAÐ badge when status is lokað", () => {
    render(<TicketThread ticket={makeTicket({ status: "lokað" })} currentUserName="Jón Jónsson" />);
    expect(screen.getByText("LOKAÐ")).toBeInTheDocument();
  });

  it("does not show LOKAÐ badge when status is opið", () => {
    render(<TicketThread ticket={makeTicket({ status: "opið" })} currentUserName="Jón Jónsson" />);
    expect(screen.queryByText("LOKAÐ")).not.toBeInTheDocument();
  });
});

describe("TicketThread — messages", () => {
  it("renders message body text", () => {
    const ticket = makeTicket({
      messages: [
        { id: "m-1", from: "customer", senderName: "Jón Jónsson", body: "Hvenær kemur reikningurinn?", sentAt: "2026-01-01T10:00:00Z" },
      ],
    });
    render(<TicketThread ticket={ticket} currentUserName="Jón Jónsson" />);
    expect(screen.getByText("Hvenær kemur reikningurinn?")).toBeInTheDocument();
  });

  it("renders sender name", () => {
    const ticket = makeTicket({
      messages: [
        { id: "m-1", from: "support", senderName: "DK þjónusta", body: "Við skoðum þetta.", sentAt: "2026-01-01T10:00:00Z" },
      ],
    });
    render(<TicketThread ticket={ticket} currentUserName="Jón Jónsson" />);
    expect(screen.getByText("DK þjónusta")).toBeInTheDocument();
  });

  it("renders multiple messages", () => {
    const ticket = makeTicket({
      messages: [
        { id: "m-1", from: "customer", senderName: "Jón Jónsson", body: "Fyrsta skilaboð", sentAt: "2026-01-01T10:00:00Z" },
        { id: "m-2", from: "support", senderName: "DK þjónusta", body: "Svar frá þjónustu", sentAt: "2026-01-01T11:00:00Z" },
      ],
    });
    render(<TicketThread ticket={ticket} currentUserName="Jón Jónsson" />);
    expect(screen.getByText("Fyrsta skilaboð")).toBeInTheDocument();
    expect(screen.getByText("Svar frá þjónustu")).toBeInTheDocument();
  });

  it("renders nothing in the message area when messages list is empty", () => {
    render(<TicketThread ticket={makeTicket({ messages: [] })} currentUserName="Jón Jónsson" />);
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("identifies current user messages by senderName match", () => {
    const ticket = makeTicket({
      messages: [
        { id: "m-1", from: "customer", senderName: "Jón Jónsson", body: "Mín skilaboð", sentAt: "2026-01-01T10:00:00Z" },
        { id: "m-2", from: "support", senderName: "DK þjónusta", body: "Annars skilaboð", sentAt: "2026-01-01T11:00:00Z" },
      ],
    });
    render(<TicketThread ticket={ticket} currentUserName="Jón Jónsson" />);
    expect(screen.getByText("Mín skilaboð")).toBeInTheDocument();
    expect(screen.getByText("Annars skilaboð")).toBeInTheDocument();
  });
});
