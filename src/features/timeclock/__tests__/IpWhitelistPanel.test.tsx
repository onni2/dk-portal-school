import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IpWhitelistPanel } from "../components/IpWhitelistPanel";
import { useTimeclockStore } from "../store/timeclock.store";

const { addIpEntry, removeIpEntry } = vi.hoisted(() => ({
  addIpEntry: vi.fn((ip: string, label: string) =>
    Promise.resolve({ id: String(Date.now()), ip, label }),
  ),
  removeIpEntry: vi.fn(() => Promise.resolve()),
}));

vi.mock("../api/timeclock.queries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/timeclock.queries")>();
  return {
    ...actual,
    useIpWhitelist: () => ({
      data: [
        { id: "1", ip: "192.168.1.10", label: "Aðalskrifstofa" },
        { id: "2", ip: "10.0.0.5", label: "Útibú" },
      ],
    }),
  };
});

vi.mock("../api/timeclock.api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/timeclock.api")>();
  return { ...actual, addIpEntry, removeIpEntry };
});

function renderPanel() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <IpWhitelistPanel />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  useTimeclockStore.setState({ addIpOpen: false, addPhoneOpen: false });
  vi.clearAllMocks();
});

describe("IpWhitelistPanel", () => {
  it("renders the panel title", () => {
    renderPanel();
    expect(screen.getByText("IP-tölur í hvítlista")).toBeInTheDocument();
  });

  it("renders all IP entries", () => {
    renderPanel();
    expect(screen.getByText("192.168.1.10")).toBeInTheDocument();
    expect(screen.getByText("10.0.0.5")).toBeInTheDocument();
  });

  it("renders labels for each entry", () => {
    renderPanel();
    expect(screen.getByText("Aðalskrifstofa")).toBeInTheDocument();
    expect(screen.getByText("Útibú")).toBeInTheDocument();
  });

  it("opens the add form when + Bæta við is clicked", async () => {
    renderPanel();
    await userEvent.click(screen.getByText("+ Bæta við"));
    expect(screen.getByPlaceholderText("IP-tala, t.d. 192.168.1.10")).toBeInTheDocument();
  });

  it("closes the form when Hætta við is clicked", async () => {
    renderPanel();
    await userEvent.click(screen.getByText("+ Bæta við"));
    await userEvent.click(screen.getByText("Hætta við"));
    expect(screen.queryByPlaceholderText("IP-tala, t.d. 192.168.1.10")).not.toBeInTheDocument();
  });

  it("calls addIpEntry with the entered values", async () => {
    renderPanel();
    await userEvent.click(screen.getByText("+ Bæta við"));
    await userEvent.type(screen.getByPlaceholderText("IP-tala, t.d. 192.168.1.10"), "172.16.0.1");
    await userEvent.type(screen.getByPlaceholderText("Lýsing (valkvætt)"), "Prófunarnet");
    await userEvent.click(screen.getByText("Vista"));
    expect(addIpEntry).toHaveBeenCalledWith("172.16.0.1", "Prófunarnet");
  });

  it("does not call addIpEntry when IP field is empty", async () => {
    renderPanel();
    await userEvent.click(screen.getByText("+ Bæta við"));
    await userEvent.click(screen.getByText("Vista"));
    expect(addIpEntry).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText("IP-tala, t.d. 192.168.1.10")).toBeInTheDocument();
  });

  it("calls removeIpEntry with the correct id", async () => {
    renderPanel();
    const removeButtons = screen.getAllByText("Fjarlægja");
    await userEvent.click(removeButtons[0]!);
    expect(removeIpEntry).toHaveBeenCalledWith("1");
  });

  it("does not add an entry when IP is only whitespace", async () => {
    renderPanel();
    await userEvent.click(screen.getByText("+ Bæta við"));
    await userEvent.type(screen.getByPlaceholderText("IP-tala, t.d. 192.168.1.10"), "   ");
    await userEvent.click(screen.getByText("Vista"));
    expect(addIpEntry).not.toHaveBeenCalled();
  });

  it("does not add an entry when only the label is filled in", async () => {
    renderPanel();
    await userEvent.click(screen.getByText("+ Bæta við"));
    await userEvent.type(screen.getByPlaceholderText("Lýsing (valkvætt)"), "Skrifstofa");
    await userEvent.click(screen.getByText("Vista"));
    expect(addIpEntry).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText("IP-tala, t.d. 192.168.1.10")).toBeInTheDocument();
  });

  it("calls removeIpEntry only for the clicked entry", async () => {
    renderPanel();
    const removeButtons = screen.getAllByText("Fjarlægja");
    await userEvent.click(removeButtons[0]!);
    expect(removeIpEntry).toHaveBeenCalledTimes(1);
    expect(removeIpEntry).toHaveBeenCalledWith("1");
  });
});
