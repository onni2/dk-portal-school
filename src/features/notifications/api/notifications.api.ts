/**
 * Notifications API: fetch, mark-as-read, mark-all-as-read, and delete.
 * Uses the mock backend directly (not mockClient) to avoid headers() being re-created on every call.
 * Uses: ../types/notification.types
 * Exports: getNotifications, markAsRead, markAllAsRead, deleteNotification
 */
import type { Notification } from "../types/notification.types";

const BASE = import.meta.env.VITE_MOCK_API_URL;
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("dk-auth-token") ?? ""}`,
});

/** Fetches all notifications for the current user. */
export async function getNotifications(): Promise<Notification[]> {
  const res = await fetch(`${BASE}/notifications`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

/** Marks a single notification as read. */
export async function markAsRead(id: string): Promise<void> {
  await fetch(`${BASE}/notifications/${id}/read`, { method: "PATCH", headers: headers() });
}

/** Marks all notifications as read in a single request. */
export async function markAllAsRead(): Promise<void> {
  await fetch(`${BASE}/notifications/read-all`, { method: "PATCH", headers: headers() });
}

/** Permanently deletes a notification. */
export async function deleteNotification(id: string): Promise<void> {
  await fetch(`${BASE}/notifications/${id}`, { method: "DELETE", headers: headers() });
}
