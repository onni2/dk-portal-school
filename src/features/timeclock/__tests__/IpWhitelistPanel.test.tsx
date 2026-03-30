import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { IpWhitelistPanel } from "../components/IpWhitelistPanel";
import { useTimeclockStore } from "../store/timeclock.store";

vi.mock("../api/timeclock.queries", () => ({
  useIpWhitelist: () => ({
    data: [
      { id: "1", ip: "192.168.1.10", label: "Aðalskrifstofa" },
      { id: "2", ip: "10.0.0.5", label: "Útibú" },
    ],
  }),
}));

beforeEach(() => {
  useTimeclockStore.setState({ addIpOpen: false, addPhoneOpen: false });
});

describe("IpWhitelistPanel", () => {
  it("renders the panel title", () => {
    render(<IpWhitelistPanel />);
    expect(screen.getByText("IP-tölur í hvítlista")).toBeInTheDocument();
  });

  it("renders the Mock badge", () => {
    render(<IpWhitelistPanel />);
    expect(screen.getByText("Mock")).toBeInTheDocument();
  });

  it("renders all IP entries", () => {
    render(<IpWhitelistPanel />);
    expect(screen.getByText("192.168.1.10")).toBeInTheDocument();
    expect(screen.getByText("10.0.0.5")).toBeInTheDocument();
  });

  it("renders labels for each entry", () => {
    render(<IpWhitelistPanel />);
    expect(screen.getByText("Aðalskrifstofa")).toBeInTheDocument();
    expect(screen.getByText("Útibú")).toBeInTheDocument();
  });

  it("opens the add form when + Bæta við is clicked", async () => {
    render(<IpWhitelistPanel />);
    await userEvent.click(screen.getByText("+ Bæta við"));
    expect(screen.getByPlaceholderText("IP-tala, t.d. 192.168.1.10")).toBeInTheDocument();
  });

  it("closes the form when Hætta við is clicked", async () => {
    render(<IpWhitelistPanel />);
    await userEvent.click(screen.getByText("+ Bæta við"));
    await userEvent.click(screen.getByText("Hætta við"));
    expect(screen.queryByPlaceholderText("IP-tala, t.d. 192.168.1.10")).not.toBeInTheDocument();
  });

  it("adds a new IP entry when the form is submitted", async () => {
    render(<IpWhitelistPanel />);
    await userEvent.click(screen.getByText("+ Bæta við"));
    await userEvent.type(screen.getByPlaceholderText("IP-tala, t.d. 192.168.1.10"), "172.16.0.1");
    await userEvent.click(screen.getByText("Vista"));
    expect(screen.getByText("172.16.0.1")).toBeInTheDocument();
  });

  it("does not add an entry when IP field is empty", async () => {
    render(<IpWhitelistPanel />);
    await userEvent.click(screen.getByText("+ Bæta við"));
    await userEvent.click(screen.getByText("Vista"));
    // form should still be open, nothing added
    expect(screen.getByPlaceholderText("IP-tala, t.d. 192.168.1.10")).toBeInTheDocument();
  });

  it("removes an entry when Fjarlægja is clicked", async () => {
    render(<IpWhitelistPanel />);
    const removeButtons = screen.getAllByText("Fjarlægja");
    await userEvent.click(removeButtons[0]);
    expect(screen.queryByText("192.168.1.10")).not.toBeInTheDocument();
  });

  it("shows empty state when all entries are removed", async () => {
    render(<IpWhitelistPanel />);
    const removeButtons = screen.getAllByText("Fjarlægja");
    for (const btn of removeButtons) {
      await userEvent.click(btn);
    }
    expect(screen.getByText("Engar IP-tölur skráðar.")).toBeInTheDocument();
  });

  it("does not add an entry when IP is only whitespace", async () => {
    render(<IpWhitelistPanel />);
    await userEvent.click(screen.getByText("+ Bæta við"));
    await userEvent.type(screen.getByPlaceholderText("IP-tala, t.d. 192.168.1.10"), "   ");
    await userEvent.click(screen.getByText("Vista"));
    // form stays open, no new entry added
    expect(screen.getByPlaceholderText("IP-tala, t.d. 192.168.1.10")).toBeInTheDocument();
  });

  it("does not add an entry when only the label is filled in", async () => {
    render(<IpWhitelistPanel />);
    await userEvent.click(screen.getByText("+ Bæta við"));
    await userEvent.type(screen.getByPlaceholderText("Lýsing (valkvætt)"), "Skrifstofa");
    await userEvent.click(screen.getByText("Vista"));
    // form stays open since IP is missing
    expect(screen.getByPlaceholderText("IP-tala, t.d. 192.168.1.10")).toBeInTheDocument();
  });

  it("removing one entry does not remove the other", async () => {
    render(<IpWhitelistPanel />);
    const removeButtons = screen.getAllByText("Fjarlægja");
    await userEvent.click(removeButtons[0]);
    expect(screen.queryByText("192.168.1.10")).not.toBeInTheDocument();
    expect(screen.getByText("10.0.0.5")).toBeInTheDocument();
  });
});
