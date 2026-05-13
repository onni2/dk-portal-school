/**
 * React Query hooks for notifications: fetch (polled every 30 s), mark-as-read, mark-all-as-read, and delete.
 * Each mutation invalidates the notifications query on success.
 * Uses: ./notifications.api
 * Exports: useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "./notifications.api";

/** Polls notifications every 30 seconds. */
export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 30000,
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}