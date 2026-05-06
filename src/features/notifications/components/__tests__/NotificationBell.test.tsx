import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationBell } from "../NotificationBell";

const UNREAD = { id: "1", title: "Nýr reikningur", message: "Reikningur #100 tilbúinn.", read: false, createdAt: "2026-01-01" };
const READ = { id: "2", title: "Uppfærsla", message: "Kerfið hefur verið uppfært.", read: true, createdAt: "2026-01-02" };

const { mockUseNotifications, mockMarkAsRead, mockMarkAllAsRead, mockDeleteNotification } = vi.hoisted(() => ({
  mockUseNotifications: vi.fn(() => ({ data: [UNREAD, READ] })),
  mockMarkAsRead: vi.fn(),
  mockMarkAllAsRead: vi.fn(),
  mockDeleteNotification: vi.fn(),
}));

vi.mock("@/features/notifications/api/notifications.queries", () => ({
  useNotifications: () => mockUseNotifications(),
  useMarkAsRead: () => ({ mutate: mockMarkAsRead }),
  useMarkAllAsRead: () => ({ mutate: mockMarkAllAsRead }),
  useDeleteNotification: () => ({ mutate: mockDeleteNotification }),
}));

function renderBell() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <NotificationBell />
    </QueryClientProvider>,
  );
}

async function openBell() {
  // Bell is always the first button in the component
  await userEvent.click(screen.getAllByRole("button")[0]!);
}

beforeEach(() => {
  mockUseNotifications.mockReturnValue({ data: [UNREAD, READ] });
  vi.clearAllMocks();
});

describe("NotificationBell — badge", () => {
  it("shows the unread count badge when there are unread notifications", () => {
    renderBell();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("does not show a badge when all notifications are read", () => {
    mockUseNotifications.mockReturnValue({ data: [{ ...UNREAD, read: true }, READ] });
    renderBell();
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("does not show a badge when there are no notifications", () => {
    mockUseNotifications.mockReturnValue({ data: [] });
    renderBell();
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
  });

  it("caps the badge at 9+ when there are more than 9 unread", () => {
    const manyUnread = Array.from({ length: 10 }, (_, i) => ({
      ...UNREAD,
      id: String(i),
    }));
    mockUseNotifications.mockReturnValue({ data: manyUnread });
    renderBell();
    expect(screen.getByText("9+")).toBeInTheDocument();
  });
});

describe("NotificationBell — dropdown content", () => {
  it("shows empty state when there are no notifications", async () => {
    mockUseNotifications.mockReturnValue({ data: [] });
    renderBell();
    await openBell();
    expect(screen.getByText("Engar tilkynningar")).toBeInTheDocument();
  });

  it("shows unread count in the dropdown header", async () => {
    renderBell();
    await openBell();
    expect(screen.getByText("1 ólesið")).toBeInTheDocument();
  });

  it("renders notification titles", async () => {
    renderBell();
    await openBell();
    expect(screen.getByText("Nýr reikningur")).toBeInTheDocument();
    expect(screen.getByText("Uppfærsla")).toBeInTheDocument();
  });

  it("renders notification messages", async () => {
    renderBell();
    await openBell();
    expect(screen.getByText("Reikningur #100 tilbúinn.")).toBeInTheDocument();
    expect(screen.getByText("Kerfið hefur verið uppfært.")).toBeInTheDocument();
  });

  it("shows Merkja allt lesið when there are unread notifications", async () => {
    renderBell();
    await openBell();
    expect(screen.getByText("Merkja allt lesið")).toBeInTheDocument();
  });

  it("shows ✓ Allt lesið when all notifications are read", async () => {
    mockUseNotifications.mockReturnValue({ data: [{ ...UNREAD, read: true }, READ] });
    renderBell();
    await openBell();
    expect(screen.getByText("✓ Allt lesið")).toBeInTheDocument();
  });
});

describe("NotificationBell — sorting", () => {
  it("shows unread notifications before read ones", async () => {
    mockUseNotifications.mockReturnValue({ data: [READ, UNREAD] });
    renderBell();
    await openBell();
    const titles = screen.getAllByText(/Nýr reikningur|Uppfærsla/);
    expect(titles[0]!.textContent).toBe("Nýr reikningur");
    expect(titles[1]!.textContent).toBe("Uppfærsla");
  });
});

describe("NotificationBell — interactions", () => {
  it("calls markAsRead with the correct id when an unread notification is clicked", async () => {
    renderBell();
    await openBell();
    await userEvent.click(screen.getByText("Nýr reikningur"));
    expect(mockMarkAsRead).toHaveBeenCalledWith("1");
  });

  it("does not call markAsRead when a read notification is clicked", async () => {
    renderBell();
    await openBell();
    await userEvent.click(screen.getByText("Uppfærsla"));
    expect(mockMarkAsRead).not.toHaveBeenCalled();
  });

  it("calls markAllAsRead when Merkja allt lesið is clicked", async () => {
    renderBell();
    await openBell();
    await userEvent.click(screen.getByText("Merkja allt lesið"));
    expect(mockMarkAllAsRead).toHaveBeenCalledTimes(1);
  });

  it("calls deleteNotification with the correct id when the delete button is clicked", async () => {
    renderBell();
    await openBell();
    // DOM order: [0]=bell, [1]=unread-content, [2]=unread-delete, [3]=read-content, [4]=read-delete, [5]=footer
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[2]!);
    expect(mockDeleteNotification).toHaveBeenCalledWith("1");
  });
});
