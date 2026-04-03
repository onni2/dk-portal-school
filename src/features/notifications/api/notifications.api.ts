import type { Notification } from "../types/notification.types";

const BASE = import.meta.env.VITE_MOCK_API_URL;
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("dk-auth-token") ?? ""}`,
});

export async function getNotifications(): Promise<Notification[]> {
  const res = await fetch(`${BASE}/notifications`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function markAsRead(id: string): Promise<void> {
  await fetch(`${BASE}/notifications/${id}/read`, { method: "PATCH", headers: headers() });
}

export async function markAllAsRead(): Promise<void> {
  await fetch(`${BASE}/notifications/read-all`, { method: "PATCH", headers: headers() });
}

export async function deleteNotification(id: string): Promise<void> {
  await fetch(`${BASE}/notifications/${id}`, { method: "DELETE", headers: headers() });
}
